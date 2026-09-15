/**
 * TradingService — PostgreSQL edition.
 * Mirrors the Mongo TradingService (followProvider/unfollowProvider/
 * getFollowerSubscriptions/getProviderFollowers). Uses pg WalletService +
 * pg CopySubscriptionRepository + pg UserRepository.
 */
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const TradingAccountRepository = require('../../repositories/pg/TradingAccountRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const WalletService = require('./WalletService');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class TradingService {
  async followProvider(followerId, providerId, allocationAmount, options = {}) {
    // 1. Resolve Admin bypass and C-Book status
    const user = await UserRepository.findById(followerId);
    const isAdmin = user && user.role === 'admin';
    const isCBook = isAdmin && options.isCBook;

    // 2. Resolve follower trading account (PG schema: followerAccountId NOT NULL FK)
    let followerAccountId = options.followerAccountId;
    if (!followerAccountId) {
      const accounts = await TradingAccountRepository.findByUserId(followerId);
      if (!accounts || accounts.length === 0) {
        throw new ApiError(400, 'Connect a trading account before following a provider');
      }
      followerAccountId = accounts[0].id;
    }

    // 3. Enforce Follower Limit (5 accounts) for standard users
    if (!isAdmin) {
      const activeSubs = await CopySubscriptionRepository.count({
        followerId,
        status: 'active',
      });
      if (activeSubs >= 5) {
        throw new ApiError(400, 'Follower limit reached. You can only follow a maximum of 5 master accounts.');
      }
    }

    // 4. Check if this specific account is already following this provider
    const query = { followerId, providerId };
    if (followerAccountId) {
      query.followerAccountId = followerAccountId;
    }

    const existing = await CopySubscriptionRepository.findOne(query);
    if (existing) throw new ApiError(400, 'This account is already following this provider');

    // 5. Process payment/allocation from wallet (Skipped for C-Book)
    if (!isCBook) {
      await WalletService.withdraw(followerId, allocationAmount, 'USD', {
        bank: 'System',
        account: 'CopyTradingAllocation',
      });
    } else {
      logger.info(`Admin ${followerId} creating C-Book subscription to ${providerId}`);
    }

    // 6. Create subscription
    return CopySubscriptionRepository.create({
      followerId,
      providerId,
      followerAccountId,
      isCBook: isCBook,
      allocationAmount: isCBook ? 0 : allocationAmount,
      status: 'active',
      lotSizeStrategy: options.lotSizeStrategy || 'SIGNAL',
      lotSizeValue: options.lotSizeValue || 1,
      minLotSize: options.minLotSize || 0,
      subscribedAt: new Date(),
    });
  }

  async unfollowProvider(followerId, providerId) {
    const subscription = await CopySubscriptionRepository.findSubscription(followerId, providerId);
    if (!subscription) throw new ApiError(404, 'Subscription not found');

    // Update status to expired/stopped
    return CopySubscriptionRepository.update(subscription.id, {
      status: 'expired',
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