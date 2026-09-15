const User = require('../models/User');
const Tier = require('../models/Financial/Tier');
const MLMCommission = require('../models/MLM/Commission');
const mongoose = require('mongoose');

class TierService {

    /**
     * Calculates the prorated difference between the user's current tier and desired tier.
     * @param {Object} currentTier 
     * @param {Object} targetTier 
     * @returns {Number} the cost to upgrade (0 if invalid)
     */
    static calculateUpgradeCost(currentTier, targetTier) {
        if (!currentTier || !targetTier) return 0;
        if (targetTier.level <= currentTier.level) return 0; // Can't downgrade or sideways grade via this path

        const diff = targetTier.price - currentTier.price;
        return diff > 0 ? diff : 0;
    }

    /**
     * Retrieves the locked wallet balance and checks if it's sufficient for the target tier upgrade.
     */
    static async checkLockedBalanceUpgradeExigency(userId, targetTierId) {
        const user = await User.findById(userId).populate('preferences.tier');
        const targetTier = await Tier.findById(targetTierId);

        if (!user || !targetTier || !user.preferences.tier) throw new Error("Invalid upgrade parameters");

        const upgradeCost = this.calculateUpgradeCost(user.preferences.tier, targetTier);
        if (upgradeCost <= 0) throw new Error("Invalid target tier level");

        return {
            canUpgradeWithBalance: user.preferences.lockedWalletBalance >= upgradeCost,
            lockedBalance: user.preferences.lockedWalletBalance,
            upgradeCost,
            currentTier: user.preferences.tier,
            targetTier
        };
    }

    /**
     * Consumes locked commissions to upgrade the user if sufficient balance exists.
     * Transactional to prevent partial failures.
     */
    static async upgradeViaLockedBalance(userId, targetTierId) {
        try {
            return await this._upgradeViaLockedBalanceInternal(userId, targetTierId, true);
        } catch (error) {
            // Fallback for local development environments without Replica Set
            if (error.message && error.message.includes('Transaction numbers are only allowed')) {
                return await this._upgradeViaLockedBalanceInternal(userId, targetTierId, false);
            }
            throw error;
        }
    }

    static async _upgradeViaLockedBalanceInternal(userId, targetTierId, useTransaction = true) {
        let session = null;
        if (useTransaction) {
            session = await mongoose.startSession();
            session.startTransaction();
        }

        const opts = useTransaction ? { session } : {};

        try {
            const user = await User.findById(userId).populate('preferences.tier').setOptions(opts);
            const targetTier = await Tier.findById(targetTierId).setOptions(opts);

            if (!user.preferences.tier) throw new Error("User currently has no tier");
            const upgradeCost = this.calculateUpgradeCost(user.preferences.tier, targetTier);
            if (upgradeCost <= 0) throw new Error("Invalid tier upgrade path");

            if (user.preferences.lockedWalletBalance < upgradeCost) {
                throw new Error("Insufficient locked commission balance to upgrade");
            }

            // Find all locked commissions for this user
            const lockedCommissions = await MLMCommission.find({
                user: userId,
                status: 'locked'
            }).sort({ createdAt: 1 }).setOptions(opts);

            let remainingCost = upgradeCost;

            for (const commission of lockedCommissions) {
                if (remainingCost <= 0) break;

                commission.status = 'approved';
                commission.isUsedForUpgrade = true;

                if (commission.amount <= remainingCost) {
                    remainingCost -= commission.amount;
                } else {
                    const remainingCommission = new MLMCommission({
                        user: commission.user,
                        type: commission.type,
                        amount: commission.amount - remainingCost,
                        currency: commission.currency,
                        status: 'locked',
                        unlocksAtTierLevel: commission.unlocksAtTierLevel,
                        description: `Remainder from tier upgrade partial consumption`
                    });
                    await remainingCommission.save(opts);

                    commission.amount = remainingCost;
                    remainingCost = 0;
                }
                await commission.save(opts);
            }

            // Deduct from locked balance
            user.preferences.lockedWalletBalance -= upgradeCost;
            user.preferences.tier = targetTier._id;
            await user.save(opts);

            // Unlock other commissions
            await this.unlockEligibleCommissions(userId, targetTier.level, session);

            if (useTransaction) await session.commitTransaction();
            return { success: true, newTier: targetTier.code };

        } catch (error) {
            if (useTransaction && session) await session.abortTransaction();
            throw error;
        } finally {
            if (session) session.endSession();
        }
    }

    /**
     * Upgrades the user traditionally via cash/crypto payment
     */
    static async upgradeNormally(userId, targetTierId) {
        const targetTier = await Tier.findById(targetTierId);
        const user = await User.findById(userId);

        user.preferences.tier = targetTierId;
        await user.save();

        await this.unlockEligibleCommissions(userId, targetTier.level);
    }

    /**
     * Called automatically after any tier upgrade to free up previously locked money
     */
    static async unlockEligibleCommissions(userId, newTierLevel, parentSession = null) {
        const query = {
            user: userId,
            status: 'locked',
            unlocksAtTierLevel: { $lte: newTierLevel }
        };

        const update = {
            $set: { status: 'approved' }
        };

        const options = parentSession ? { session: parentSession } : {};

        const commissionsToUnlock = await MLMCommission.find(query, null, options);

        if (commissionsToUnlock.length > 0) {
            const totalUnlocked = commissionsToUnlock.reduce((sum, c) => sum + c.amount, 0);

            await MLMCommission.updateMany(query, update, options);

            await User.findByIdAndUpdate(userId, {
                $inc: { 'preferences.lockedWalletBalance': -totalUnlocked }
            }, options);
        }
    }
}

module.exports = TierService;
