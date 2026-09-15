const CopySubscriptionRepository = require('../../repositories/CopySubscriptionRepository');
const WalletService = require('../financial/WalletService');
const ApiError = require('../../utils/ApiError');

class TradingService {
    async followProvider(followerId, providerId, allocationAmount, options = {}) {
        // 1. Resolve Admin bypass and C-Book status
        const User = require('../../models/User');
        const user = await User.findById(followerId);
        const isAdmin = user && user.role === 'admin';
        const isCBook = isAdmin && options.isCBook;

        // 2. Enforce Follower Limit (5 accounts) for standard users
        if (!isAdmin) {
            const activeSubs = await CopySubscriptionRepository.model.countDocuments({ 
                follower: followerId,
                status: 'active'
            });
            if (activeSubs >= 5) {
                throw new ApiError(400, 'Follower limit reached. You can only follow a maximum of 5 master accounts.');
            }
        }

        // 3. Check if this specific account is already following this provider
        const query = { 
            follower: followerId, 
            provider: providerId 
        };
        if (options.followerAccountId) {
            query.followerAccount = options.followerAccountId;
        }

        const existing = await CopySubscriptionRepository.model.findOne(query);
        if (existing) throw new ApiError(400, 'This account is already following this provider');

        // 4. Process payment/allocation from wallet (Skipped for C-Book)
        if (!isCBook) {
            await WalletService.withdraw(followerId, allocationAmount, 'USD', {
                bank: 'System',
                account: 'CopyTradingAllocation'
            });
        } else {
            logger.info(`Admin ${followerId} creating C-Book subscription to ${providerId}`);
        }

        // 5. Create subscription
        return CopySubscriptionRepository.create({
            follower: followerId,
            provider: providerId,
            followerAccount: options.followerAccountId,
            isCBook: isCBook,
            allocationAmount: isCBook ? 0 : allocationAmount,
            status: 'active',
            lotSizeStrategy: options.lotSizeStrategy || 'SIGNAL',
            lotSizeValue: options.lotSizeValue || 1,
            minLotSize: options.minLotSize || 0,
            subscribedAt: new Date()
        });
    }

    async unfollowProvider(followerId, providerId) {
        const subscription = await CopySubscriptionRepository.findSubscription(followerId, providerId);
        if (!subscription) throw new ApiError(404, 'Subscription not found');

        // Update status to expired/stopped
        return CopySubscriptionRepository.update(subscription._id, {
            status: 'expired'
        });
    }

    async getFollowerSubscriptions(followerId) {
        return CopySubscriptionRepository.findByFollower(followerId);
    }

    async getProviderFollowers(providerId) {
        return CopySubscriptionRepository.findByProvider(providerId);
    }
}

module.exports = new TradingService();
