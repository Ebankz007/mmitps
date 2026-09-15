const CopySubscriptionRepository = require('../../repositories/CopySubscriptionRepository');
const WalletService = require('../financial/WalletService');
const UserRepository = require('../../repositories/UserRepository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

class SettlementService {
    constructor() {
        this.ADMIN_EMAIL = 'admin@mmitps.com';
        this.ADMIN_CUT_PERCENT = 10; // 10% of profit from master's side
    }

    /**
     * Update accrued PnL and commissions for a subscription after a trade closes
     * @param {string} subscriptionId 
     * @param {number} pnl - Resolved PnL in USD
     */
    async processTradePnL(subscriptionId, pnl) {
        try {
            const subscription = await CopySubscriptionRepository.findById(subscriptionId);
            if (!subscription || subscription.isCBook) return;

            subscription.accruedPnL += pnl;

            // Only calculate positive commissions (Profit Sharing)
            if (pnl > 0) {
                const performanceFeePercent = subscription.performanceFee || 20;
                const totalCommission = (pnl * performanceFeePercent) / 100;
                subscription.pendingCommission += totalCommission;
                
                // If there's pending commission, ensure we are in a pending settlement state
                if (subscription.settlementStatus === 'none') {
                    subscription.settlementStatus = 'pending';
                    // Set default deadline of 72 hours from first profit if not set
                    if (!subscription.settlementDeadline) {
                        subscription.settlementDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000);
                    }
                }
            }

            await subscription.save();
            logger.info(`Updated settlement stats for subscription ${subscriptionId}: PnL=${pnl}, Pending=${subscription.pendingCommission}`);
        } catch (error) {
            logger.error(`Error processing trade PnL for subscription ${subscriptionId}:`, error);
        }
    }

    /**
     * Manually initiate settlement payment from follower to master & admin
     * @param {string} subscriptionId 
     * @param {string} followerId 
     */
    async settleCommission(subscriptionId, followerId) {
        const subscription = await CopySubscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new ApiError(404, 'Subscription not found');
        if (subscription.follower.toString() !== followerId.toString()) {
            throw new ApiError(403, 'Unauthorized settlement');
        }

        if (subscription.pendingCommission <= 0) {
            throw new ApiError(400, 'No pending commission to settle');
        }

        const amount = subscription.pendingCommission;
        const currency = 'USD'; // Default

        // 1. Calculate split (Master gets 90%, Admin gets 10%)
        const adminAmount = (amount * this.ADMIN_CUT_PERCENT) / 100;
        const masterAmount = amount - adminAmount;

        // 2. Resolve Master's email
        const providerAccount = await mongoose.model('TradingAccount').findById(subscription.provider).populate('user');
        if (!providerAccount || !providerAccount.user) {
            throw new ApiError(500, 'Provider user not found for settlement');
        }
        const masterEmail = providerAccount.user.email;

        // 3. Execute Transfers via WalletService
        // Transfer to Master
        await WalletService.transfer(followerId, masterEmail, masterAmount, currency);
        
        // Transfer to Admin
        await WalletService.transfer(followerId, this.ADMIN_EMAIL, adminAmount, currency);

        // 4. Update status to 'paid'
        subscription.settlementStatus = 'paid';
        await subscription.save();

        logger.info(`Follower ${followerId} paid ${amount} commission for sub ${subscriptionId}`);
        return { success: true, amount, masterAmount, adminAmount };
    }

    /**
     * Master confirms receipt of funds
     * @param {string} subscriptionId 
     * @param {string} masterUserId 
     */
    async confirmReceipt(subscriptionId, masterUserId) {
        const subscription = await CopySubscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new ApiError(404, 'Subscription not found');

        // Authorization check
        const providerAccount = await mongoose.model('TradingAccount').findById(subscription.provider);
        if (providerAccount.user.toString() !== masterUserId.toString()) {
            throw new ApiError(403, 'Only the master trader can confirm receipts');
        }

        if (subscription.settlementStatus !== 'paid') {
            throw new ApiError(400, 'Settlement is not in "paid" status yet');
        }

        // Reset for next period
        subscription.settlementStatus = 'none';
        subscription.pendingCommission = 0;
        subscription.accruedPnL = 0;
        subscription.settlementDeadline = null;
        subscription.lastSettlementAt = new Date();
        subscription.isSuspended = false; // Reactivate
        subscription.status = 'active';

        await subscription.save();
        logger.info(`Master ${masterUserId} confirmed settlement for sub ${subscriptionId}. Account reactivated.`);
        return { success: true };
    }

    /**
     * Background check for overdue settlements (72h logic)
     */
    async checkOverdueSettlements() {
        const now = new Date();
        const overdueSubs = await mongoose.model('CopySubscription').find({
            settlementStatus: { $in: ['pending', 'paid'] },
            settlementDeadline: { $lt: now },
            isSuspended: false
        });

        for (const sub of overdueSubs) {
            sub.isSuspended = true;
            sub.suspensionReason = 'Overdue settlement (exceeded 72h window)';
            sub.status = 'paused';
            await sub.save();
            logger.warn(`Subscription ${sub._id} suspended due to overdue settlement`);
        }
    }
}

module.exports = new SettlementService();
