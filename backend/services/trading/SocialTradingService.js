const SocialTrading = require('../../models/SocialTrading');
const Signal = require('../../models/Signal');
const SocialFollow = require('../../models/SocialFollow');
const CopySubscriptionRepository = require('../../repositories/CopySubscriptionRepository');
const CopyExecutionService = require('./CopyExecutionService');

class SocialTradingService {
    /**
     * Get top traders for leaderboard
     */
    async getTopTraders(limit = 50, sortBy = 'winRate') {
        const sortOptions = {
            winRate: { winRate: -1 },
            netProfit: { netProfit: -1 },
            followers: { followers: -1 },
            reputation: { reputation: -1 },
            profitFactor: { profitFactor: -1 }
        };

        const sort = sortOptions[sortBy] || sortOptions.winRate;

        return await SocialTrading.find({ status: 'active' })
            .sort(sort)
            .limit(limit)
            .select('-__v');
    }

    /**
     * Get trader profile by user ID
     */
    async getTraderProfile(userId) {
        return await SocialTrading.findOne({ userId })
            .populate('userId', 'name email');
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
        const signals = await Signal.find({
            traderId: userId,
            status: 'closed',
            closeTime: { $gte: startDate, $lte: endDate }
        }).sort({ closeTime: 1 });

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
        if (!signals.length) {
            return {
                totalTrades: 0,
                winRate: 0,
                totalProfit: 0,
                averageReturn: 0
            };
        }

        const winning = signals.filter(s => s.profit > 0);
        const totalProfit = signals.reduce((sum, s) => sum + s.profit, 0);

        return {
            totalTrades: signals.length,
            winningTrades: winning.length,
            losingTrades: signals.length - winning.length,
            winRate: (winning.length / signals.length) * 100,
            totalProfit,
            averageReturn: totalProfit / signals.length,
            bestTrade: Math.max(...signals.map(s => s.profit)),
            worstTrade: Math.min(...signals.map(s => s.profit))
        };
    }

    /**
     * Follow a trader
     */
    async followTrader(followerId, traderId) {
        // Check if already following
        const existing = await SocialFollow.findOne({ followerId, traderId });
        if (existing) {
            throw new Error('Already following this trader');
        }

        // Create follow relationship
        const follow = await SocialFollow.create({ followerId, traderId });

        // Update follower count
        await SocialTrading.findOneAndUpdate(
            { userId: traderId },
            { $inc: { followers: 1 } }
        );

        await SocialTrading.findOneAndUpdate(
            { userId: followerId },
            { $inc: { following: 1 } }
        );

        return follow;
    }

    /**
     * Unfollow a trader
     */
    async unfollowTrader(followerId, traderId) {
        const follow = await SocialFollow.findOneAndDelete({ followerId, traderId });

        if (!follow) {
            throw new Error('Not following this trader');
        }

        // Update follower count
        await SocialTrading.findOneAndUpdate(
            { userId: traderId },
            { $inc: { followers: -1 } }
        );

        await SocialTrading.findOneAndUpdate(
            { userId: followerId },
            { $inc: { following: -1 } }
        );

        // If was copying, update copier count
        if (follow.isCopying) {
            await SocialTrading.findOneAndUpdate(
                { userId: traderId },
                { $inc: { copiers: -1 } }
            );
        }

        return { success: true };
    }

    /**
     * Start copying a trader
     */
    async copyTrader(copierId, traderId, settings = {}) {
        const follow = await SocialFollow.findOne({ followerId: copierId, traderId });

        if (!follow) {
            throw new Error('Must follow trader before copying');
        }

        // We use CopySubscription for the actual financial relationship
        let subscription = await CopySubscriptionRepository.findSubscription(copierId, traderId);

        if (subscription && subscription.status === 'active') {
            throw new Error('Already copying this trader');
        }

        const subscriptionData = {
            follower: copierId,
            provider: traderId,
            status: 'active',
            allocationAmount: settings.allocationAmount || 1000,
            riskMultiplier: settings.riskPercentage || 1, // mapping riskPercentage to multiplier for compatibility
            maxDrawdown: settings.stopCopyOnDrawdown || 20,
            maxPositions: settings.maxPositions || 5,
            allowedSymbols: settings.allowedSymbols || [],
            excludedSymbols: settings.excludedSymbols || [],
            subscribedAt: new Date()
        };

        if (subscription) {
            subscription = await CopySubscriptionRepository.update(subscription._id, subscriptionData);
        } else {
            subscription = await CopySubscriptionRepository.create(subscriptionData);
        }

        // Update social follow state (optional, for UI indicator)
        follow.isCopying = true;
        follow.copyStartedAt = new Date();
        await follow.save();

        // Update copier count on the trader's profile (Skip for C-Book)
        if (!settings.isCBook) {
            await SocialTrading.findOneAndUpdate(
                { userId: traderId },
                { $inc: { copiers: 1 } }
            );
        }

        return subscription;
    }

    /**
     * Stop copying a trader
     */
    async stopCopying(copierId, traderId) {
        const follow = await SocialFollow.findOne({ followerId: copierId, traderId });

        if (!follow || !follow.isCopying) {
            throw new Error('Not copying this trader');
        }

        follow.isCopying = false;
        follow.copySettings.enabled = false;
        await follow.save();

        // Update copier count
        await SocialTrading.findOneAndUpdate(
            { userId: traderId },
            { $inc: { copiers: -1 } }
        );

        return { success: true };
    }

    /**
     * Publish a trading signal
     */
    async publishSignal(traderId, signalData) {
        const signal = await Signal.create({
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
        await SocialTrading.findOneAndUpdate(
            { userId: traderId },
            { lastSignalDate: new Date() }
        );

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

        return await Signal.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    /**
     * Get signals from followed traders
     */
    async getFollowedSignals(userId, limit = 50) {
        // Get followed traders
        const follows = await SocialFollow.find({ followerId: userId })
            .select('traderId');

        const traderIds = follows.map(f => f.traderId);

        // Get recent signals from followed traders
        return await Signal.find({
            traderId: { $in: traderIds },
            status: { $in: ['pending', 'open'] }
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('traderId', 'name');
    }

    /**
     * Calculate and update performance metrics for a trader
     */
    async calculatePerformanceMetrics(userId) {
        const signals = await Signal.find({
            traderId: userId,
            status: 'closed'
        });

        if (!signals.length) {
            return null;
        }

        const winning = signals.filter(s => s.profit > 0);
        const losing = signals.filter(s => s.profit < 0);

        const totalProfit = winning.reduce((sum, s) => sum + s.profit, 0);
        const totalLoss = Math.abs(losing.reduce((sum, s) => sum + s.profit, 0));

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
            bestTrade: Math.max(...signals.map(s => s.profit)),
            worstTrade: Math.min(...signals.map(s => s.profit)),
            lastTradeDate: signals[signals.length - 1].closeTime
        };

        // Update trader profile
        await SocialTrading.findOneAndUpdate(
            { userId },
            metrics
        );

        return metrics;
    }

    /**
     * Update social handles for a trader
     */
    async updateSocialHandles(userId, handles) {
        return await SocialTrading.findOneAndUpdate(
            { userId },
            { socialHandles: handles },
            { new: true, runValidators: true }
        );
    }

    /**
     * Update leaderboard (run periodically)
     */
    async updateLeaderboard() {
        const traders = await SocialTrading.find({ status: 'active' });

        for (const trader of traders) {
            await this.calculatePerformanceMetrics(trader.userId);
        }

        return { success: true, updated: traders.length };
    }
}

module.exports = new SocialTradingService();
