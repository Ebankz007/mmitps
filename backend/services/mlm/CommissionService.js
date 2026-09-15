const CommissionRepository = require('../../repositories/CommissionRepository');
const GenealogyRepository = require('../../repositories/GenealogyRepository');
const WalletService = require('../financial/WalletService');
const ApiError = require('../../utils/ApiError');

class CommissionService {

    /**
     * Calculate direct referral commission based on sponsor's tier percentage
     */
    async calculateDirectReferral(sponsorId, amount, type = 'subscription', purchasedTierLevel = 0) {
        const User = require('../../models/User');
        const sponsor = await User.findById(sponsorId).populate('preferences.tier');
        if (!sponsor) return 0;

        let commissionPercentage = 0.05; // Base fallback
        let sponsorLevel = 0;

        if (sponsor.preferences?.tier?.commissions?.directReferralPercent) {
            commissionPercentage = sponsor.preferences.tier.commissions.directReferralPercent / 100;
            sponsorLevel = sponsor.preferences.tier.level;
        }

        const commissionAmount = amount * commissionPercentage;
        if (commissionAmount <= 0) return 0;

        let status = 'paid';
        let unlocksAtTierLevel = null;

        if (purchasedTierLevel > sponsorLevel) {
            status = 'locked';
            unlocksAtTierLevel = purchasedTierLevel;
        } else {
            // Only deposit instantly if not strictly locked
            await WalletService.deposit(sponsorId, commissionAmount, 'USD', 'internal', `REF-${Date.now()}`);
        }

        await CommissionRepository.create({
            user: sponsorId,
            type: 'direct_referral',
            amount: commissionAmount,
            status: status,
            unlocksAtTierLevel: unlocksAtTierLevel,
            description: `Direct referral bonus for ${type} (${commissionPercentage * 100}%)`
        });

        return commissionAmount;
    }

    /**
     * Calculate multi-level referral commission (5 levels deep, 10% each)
     * @param {String} userId - The newly registered or subscribed user ID
     * @param {Number} amount - The fee amount
     * @param {String} type - The type of fee ('registration' or 'subscription')
     */
    async calculateMultiLevelReferral(userId, amount, type = 'registration') {
        if (!amount || amount <= 0) return;

        const GenealogyRepository = require('../../repositories/GenealogyRepository');
        const User = require('../../models/User');
        
        let currentUserId = userId;
        const commissionPercent = 0.10; // 10% per level
        const maxLevels = 5;

        for (let level = 1; level <= maxLevels; level++) {
            // Find the genealogy node of the current user to get their sponsor
            const node = await GenealogyRepository.findByUserId(currentUserId);
            if (!node || !node.sponsor) break;

            const sponsorId = node.sponsor;
            const commissionAmount = amount * commissionPercent;

            if (commissionAmount > 0) {
                // Deposit into sponsor's wallet
                await WalletService.deposit(
                    sponsorId, 
                    commissionAmount, 
                    'USD', 
                    'referral_commission', 
                    `LEVEL-${level}-${type.toUpperCase()}-REF-${userId}`
                );

                // Create commission record
                await CommissionRepository.create({
                    user: sponsorId,
                    sourceUser: userId,
                    type: 'direct_referral', // Or create a new type 'level_referral'
                    amount: commissionAmount,
                    status: 'paid',
                    generation: level,
                    description: `Level ${level} referral commission from ${type} (${commissionPercent * 100}%)`
                });
            }

            // Move up the chain
            currentUserId = sponsorId;
        }
    }

    /**
     * Calculate binary match commission for a user
     * Matches weaker leg volume and pays commission on matched amount based on sponsor tier %
     * @param {String} userId 
     * @param {Object} period - { startDate, endDate }
     * @param {Number} targetTierLevel - if the volume comes from an action that requires a high tier
     */
    async calculateBinaryMatch(userId, period = null, targetTierLevel = 0) {
        const node = await GenealogyRepository.findByUserId(userId);
        if (!node) throw new ApiError(404, 'User not found in genealogy tree');

        const User = require('../../models/User');
        const sponsor = await User.findById(userId).populate('preferences.tier');
        let commissionPercentage = 0.05;
        let sponsorLevel = 0;

        if (sponsor.preferences?.tier?.commissions?.binaryMatchPercent) {
            commissionPercentage = sponsor.preferences.tier.commissions.binaryMatchPercent / 100;
            sponsorLevel = sponsor.preferences.tier.level;
        }

        // Use period-specific volumes if period provided
        const leftVolume = period ? node.leftLegVolumeThisPeriod : node.leftLegVolume;
        const rightVolume = period ? node.rightLegVolumeThisPeriod : node.rightLegVolume;

        // Calculate matched volume (weaker leg)
        const matchedVolume = Math.min(leftVolume, rightVolume);
        const carryForward = Math.abs(leftVolume - rightVolume);

        // Commission rate: based on Sponsor Tier
        const commissionAmount = matchedVolume * commissionPercentage;

        if (commissionAmount > 0) {
            let status = 'pending';
            let unlocksAtTierLevel = null;

            if (targetTierLevel > sponsorLevel) {
                status = 'locked';
                unlocksAtTierLevel = targetTierLevel;
            }

            // Create commission record
            const commission = await CommissionRepository.create({
                user: userId,
                type: 'binary_match',
                amount: commissionAmount,
                status: status,
                unlocksAtTierLevel: unlocksAtTierLevel,
                volumeLeft: leftVolume,
                volumeRight: rightVolume,
                volumeMatched: matchedVolume,
                carryForward: carryForward,
                rank: node.rank,
                period: period ? {
                    type: 'weekly',
                    startDate: period.startDate,
                    endDate: period.endDate
                } : undefined,
                description: `Binary match commission for ${matchedVolume} matched volume (${commissionPercentage * 100}%)`
            });

            if (status !== 'locked') {
                // If the system immediately disperses binary points into wallet, do it here. 
                // Normally handled in a weekly chron, so we leave it as 'pending'
            } else {
                // If it is locked, it bypasses the standard weekly chron because it's firmly locked
                // until tier upgrade.
            }

            return commission;
        }

        return null;
    }

    /**
     * Calculate matching bonus from downline commissions
     * Pays percentage of direct downline's commissions based on rank
     * @param {String} userId 
     * @param {Object} period - { startDate, endDate }
     */
    async calculateMatchingBonus(userId, period = null) {
        const node = await GenealogyRepository.findByUserId(userId);
        if (!node) throw new ApiError(404, 'User not found in genealogy tree');

        // Get matching bonus percentage based on rank
        const matchingRates = {
            'Starter': 0,
            'Bronze': 0.05,
            'Silver': 0.10,
            'Gold': 0.15,
            'Platinum': 0.20,
            'Diamond': 0.25
        };

        const matchingRate = matchingRates[node.rank] || 0;
        if (matchingRate === 0) return null;

        // Get direct downline (children in binary tree)
        const children = await GenealogyRepository.getChildren(node._id);
        if (children.length === 0) return null;

        // Calculate total downline commissions for the period
        let totalDownlineCommissions = 0;
        const query = {
            user: { $in: children.map(c => c.user) },
            status: { $in: ['pending', 'approved', 'paid'] }
        };

        if (period) {
            query['period.startDate'] = { $gte: period.startDate };
            query['period.endDate'] = { $lte: period.endDate };
        }

        const downlineCommissions = await CommissionRepository.findAll(query);
        totalDownlineCommissions = downlineCommissions.reduce((sum, comm) => sum + comm.amount, 0);

        // Calculate matching bonus
        const bonusAmount = totalDownlineCommissions * matchingRate;

        if (bonusAmount > 0) {
            const commission = await CommissionRepository.create({
                user: userId,
                type: 'matching_bonus',
                amount: bonusAmount,
                status: 'pending',
                rank: node.rank,
                generation: 1, // Direct downline
                period: period ? {
                    type: 'weekly',
                    startDate: period.startDate,
                    endDate: period.endDate
                } : undefined,
                description: `Matching bonus (${matchingRate * 100}%) on downline commissions`
            });

            return commission;
        }

        return null;
    }

    /**
     * Get all commissions for a user within a date range
     * @param {String} userId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getCommissionsByPeriod(userId, startDate, endDate) {
        const query = {
            user: userId,
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        return CommissionRepository.findAll(query, { sort: '-createdAt' });
    }

    /**
     * Get commission summary for a user (grouped by type)
     * @param {String} userId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getUserCommissionSummary(userId, startDate, endDate) {
        const commissions = await this.getCommissionsByPeriod(userId, startDate, endDate);

        const summary = {
            binary_match: 0,
            direct_referral: 0,
            matching_bonus: 0,
            total: 0,
            details: []
        };

        commissions.forEach(comm => {
            if (comm.type === 'binary_match') {
                summary.binary_match += comm.amount;
            } else if (comm.type === 'direct_referral') {
                summary.direct_referral += comm.amount;
            } else if (comm.type === 'matching_bonus') {
                summary.matching_bonus += comm.amount;
            }
            if (comm.status === 'locked') {
                if (!summary.locked) summary.locked = 0;
                summary.locked += comm.amount;
            } else {
                summary.total += comm.amount;
            }

            summary.details.push({
                type: comm.type,
                amount: comm.amount,
                status: comm.status,
                date: comm.createdAt,
                description: comm.description
            });
        });

        return summary;
    }

    /**
     * Get commission report for all users in a period
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getCommissionsReport(startDate, endDate) {
        // Get all users in genealogy
        const nodes = await GenealogyRepository.findAll({});

        const report = [];

        for (const node of nodes) {
            const userId = node.user._id || node.user;
            const username = node.user.username || 'unknown';

            const summary = await this.getUserCommissionSummary(userId, startDate, endDate);

            report.push({
                userId: userId,
                username: username,
                rank: node.rank,
                commissions: {
                    binary_match: summary.binary_match,
                    direct_referral: summary.direct_referral,
                    matching_bonus: summary.matching_bonus,
                    total: summary.total
                },
                details: summary.details
            });
        }

        return report;
    }
}

module.exports = new CommissionService();
