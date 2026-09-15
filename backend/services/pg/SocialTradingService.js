/**
 * SocialTradingService — PostgreSQL edition.
 */
const SocialTradingRepository = require('../../repositories/pg/SocialTradingRepository');
const SocialFollowRepository = require('../../repositories/pg/SocialFollowRepository');
const SocialSignalRepository = require('../../repositories/pg/SocialSignalRepository');
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const TradingAccountRepository = require('../../repositories/pg/TradingAccountRepository');
const CopyExecutionService = require('./CopyExecutionService');

class SocialTradingService {
  /**
   * Get top traders for leaderboard
   */
  async getTopTraders(limit = 50, sortBy = 'winRate') {
    const sortable = ['winRate', 'netProfit', 'followers', 'reputation', 'profitFactor'];
    const sort = sortable.includes(sortBy) ? sortBy : 'winRate';
    return SocialTradingRepository.findTop(limit, sort);
  }

  /**
   * Get trader profile by user ID
   */
  async getTraderProfile(userId) {
    return SocialTradingRepository.findByUserId(userId);
  }

  /**
   * Get trader performance over a period
   */
  async getTraderPerformance(userId, period = '30d') {
    const trader = await this.getTraderProfile(userId);
    if (!trader) return null;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get signals in period
    const signals = await SocialSignalRepository.findAll({
      traderId: userId,
      status: 'closed',
      closeTime: { $gte: startDate, $lte: endDate }
    }, { sort: 'closeTime', direction: 'asc' });

    return {
      trader,
      signals,
      periodStats: this.calculatePeriodStats(signals)
    };
  }

  /**
   * Calculate statistics for a period
   */
  calculatePeriodStats(signals) {
    if (!signals || !signals.length) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageReturn: 0
      };
    }

    const winning = signals.filter(s => s.profit > 0);
    const totalProfit = signals.reduce((sum, s) => sum + (s.profit || 0), 0);

    return {
      totalTrades: signals.length,
      winningTrades: winning.length,
      losingTrades: signals.length - winning.length,
      winRate: (winning.length / signals.length) * 100,
      totalProfit,
      averageReturn: totalProfit / signals.length,
      bestTrade: Math.max(...signals.map(s => s.profit || 0)),
      worstTrade: Math.min(...signals.map(s => s.profit || 0))
    };
  }

  /**
   * Follow a trader
   */
  async followTrader(followerId, traderId) {
    // Check if already following
    const existing = await SocialFollowRepository.findPair(followerId, traderId);
    if (existing) {
      throw new Error('Already following this trader');
    }

    // Create follow relationship
    const follow = await SocialFollowRepository.create({ followerId, traderId });

    // Update follower count
    await SocialTradingRepository.incrementFollowers(traderId, 1);
    await SocialTradingRepository.incrementFollowing(followerId, 1);

    return follow;
  }

  /**
   * Unfollow a trader
   */
  async unfollowTrader(followerId, traderId) {
    const follow = await SocialFollowRepository.findPair(followerId, traderId);
    if (!follow) {
      throw new Error('Not following this trader');
    }

    await SocialFollowRepository.delete(follow.id);

    // Update follower count
    await SocialTradingRepository.incrementFollowers(traderId, -1);
    await SocialTradingRepository.incrementFollowing(followerId, -1);

    // If was copying, update copier count
    if (follow.isCopying) {
      await SocialTradingRepository.incrementCopiers(traderId, -1);
    }

    return { success: true };
  }

  /**
   * Start copying a trader
   */
  async copyTrader(copierId, traderId, settings = {}) {
    const follow = await SocialFollowRepository.findPair(copierId, traderId);

    if (!follow) {
      throw new Error('Must follow trader before copying');
    }

    // We use CopySubscription for the actual financial relationship
    let subscription = await CopySubscriptionRepository.findSubscription(copierId, traderId);

    if (subscription && subscription.status === 'active') {
      throw new Error('Already copying this trader');
    }

    // Resolve the follower's trading account (required FK on copy_subscriptions)
    let followerAccountId = settings.followerAccountId || settings.followerAccount;
    if (!followerAccountId) {
      const accounts = await TradingAccountRepository.findByUserId(copierId);
      followerAccountId = accounts?.[0]?.id;
    }
    if (!followerAccountId) {
      throw new Error('A trading account is required to copy trades');
    }

    const subscriptionData = {
      followerId: copierId,
      providerId: traderId,
      status: 'active',
      allocationAmount: settings.allocationAmount || 1000,
      riskMultiplier: settings.riskPercentage || 1, // mapping riskPercentage to multiplier for compatibility
      maxDrawdown: settings.stopCopyOnDrawdown || 20,
      maxPositions: settings.maxPositions || 5,
      allowedSymbols: settings.allowedSymbols || [],
      excludedSymbols: settings.excludedSymbols || [],
      followerAccountId
    };

    if (subscription) {
      subscription = await CopySubscriptionRepository.update(subscription.id, subscriptionData);
    } else {
      subscription = await CopySubscriptionRepository.create(subscriptionData);
    }

    // Update social follow state (optional, for UI indicator)
    await SocialFollowRepository.update(follow.id, {
      isCopying: true,
      copyStartedAt: new Date()
    });

    // Update copier count on the trader's profile (Skip for C-Book)
    if (!settings.isCBook) {
      await SocialTradingRepository.incrementCopiers(traderId, 1);
    }

    return subscription;
  }

  /**
   * Stop copying a trader
   */
  async stopCopying(copierId, traderId) {
    const follow = await SocialFollowRepository.findPair(copierId, traderId);

    if (!follow || !follow.isCopying) {
      throw new Error('Not copying this trader');
    }

    await SocialFollowRepository.update(follow.id, {
      isCopying: false
    });

    // Update copier count
    await SocialTradingRepository.incrementCopiers(traderId, -1);

    return { success: true };
  }

  /**
   * Publish a trading signal
   */
  async publishSignal(traderId, signalData) {
    const signal = await SocialSignalRepository.create({
      traderId,
      traderName: signalData.traderName,
      symbol: signalData.symbol,
      action: signalData.action,
      entryPrice: signalData.entryPrice,
      stopLoss: signalData.stopLoss,
      takeProfit: signalData.takeProfit,
      lotSize: signalData.lotSize || 0.01,
      timeframe: signalData.timeframe,
      strategy: signalData.strategy,
      confidence: signalData.confidence,
      notes: signalData.notes,
      tags: signalData.tags || []
    });

    // Update trader's last signal date
    const trader = await SocialTradingRepository.findByUserId(traderId);
    if (trader) {
      await SocialTradingRepository.update(trader.id, { lastSignalDate: new Date() });
    }

    // Automate copying for active subscribers
    // This is the core "Real-Time Synchronization" logic
    try {
      await CopyExecutionService.synchronizeSignal(traderId, signal);
    } catch (copyError) {
      console.error('[CopySync Error] Failed to auto-copy signal:', copyError);
      // We don't fail the signal publication if copy fails, just log it
    }

    return signal;
  }

  /**
   * Get trader's signals
   */
  async getTraderSignals(traderId, limit = 20, status = null) {
    const query = { traderId };
    if (status) {
      query.status = status;
    }
    return SocialSignalRepository.findAll(query, { sort: 'createdAt', direction: 'desc', limit });
  }

  /**
   * Get signals from followed traders
   */
  async getFollowedSignals(userId, limit = 50) {
    // Get followed traders
    const traderIds = await SocialFollowRepository.findTraderIdsByFollower(userId);

    if (traderIds.length === 0) {
      return [];
    }

    // Get recent signals from followed traders
    const signals = await SocialSignalRepository.findAll({
      traderId: { $in: traderIds },
      status: { $in: ['pending', 'open'] }
    }, { sort: 'createdAt', direction: 'desc', limit });

    return signals;
  }

  /**
   * Calculate and update performance metrics for a trader
   */
  async calculatePerformanceMetrics(userId) {
    const signals = await SocialSignalRepository.findAll({
      traderId: userId,
      status: 'closed'
    });

    if (!signals.length) {
      return null;
    }

    const winning = signals.filter(s => s.profit > 0);
    const losing = signals.filter(s => s.profit < 0);

    const totalProfit = winning.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalLoss = Math.abs(losing.reduce((sum, s) => sum + (s.profit || 0), 0));

    const metrics = {
      totalTrades: signals.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      winRate: (winning.length / signals.length) * 100,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      averageReturn: (totalProfit - totalLoss) / signals.length,
      bestTrade: Math.max(...signals.map(s => s.profit || 0)),
      worstTrade: Math.min(...signals.map(s => s.profit || 0)),
      lastTradeDate: signals[signals.length - 1].closeTime
    };

    // Update trader profile
    const trader = await SocialTradingRepository.findByUserId(userId);
    if (trader) {
      await SocialTradingRepository.update(trader.id, metrics);
    }

    return metrics;
  }

  /**
   * Update social handles for a trader
   */
  async updateSocialHandles(userId, handles) {
    const trader = await SocialTradingRepository.findByUserId(userId);
    if (!trader) return null;
    return SocialTradingRepository.update(trader.id, { socialHandles: handles });
  }

  /**
   * Update leaderboard (run periodically)
   */
  async updateLeaderboard() {
    const traders = await SocialTradingRepository.findActive();
    let updated = 0;

    for (const trader of traders) {
      const metrics = await this.calculatePerformanceMetrics(trader.userId);
      if (metrics) updated++;
    }

    return { success: true, updated };
  }
}

module.exports = new SocialTradingService();
