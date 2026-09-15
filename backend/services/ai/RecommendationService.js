const TradeJournalRepository = require('../../repositories/TradeJournalRepository');
const TradingBotRepository = require('../../repositories/TradingBotRepository');
const SentimentService = require('./SentimentService');
const logger = require('../../utils/logger');

/**
 * Recommendation Service
 * Analyzes user history and correlates it with real-time sentiment
 */
class RecommendationService {
    /**
     * Generate personalized insights for a user
     */
    async getInsights(userId) {
        try {
            const performance = await this.analyzeUserPerformance(userId);
            if (!performance || performance.totalTrades === 0) {
                return { recommendations: [], debug: { performance, message: 'No trades found' } };
            }
            const marketStatus = await SentimentService.getMarketOverview();

            const recommendations = [];

            // 1. Analyze Success Pattern Correlation
            for (const asset of marketStatus) {
                const userAssetStats = performance.symbols[asset.symbol];
                if (userAssetStats && userAssetStats.winRate > 60) {
                    // User is good at this asset. Check if sentiment matches their bias.
                    if (asset.sentimentScore > 40) {
                        recommendations.push({
                            type: 'MATCHING_OPPORTUNITY',
                            title: `High Probability Setup: ${asset.symbol}`,
                            message: `You have a ${userAssetStats.winRate.toFixed(0)}% win rate on ${asset.symbol}. Currently, AI sentiment shows 🚀 ${asset.category} (${asset.sentimentScore}). This matches your winning profile.`,
                            priority: 'high',
                            asset: asset.symbol
                        });
                    }
                }
            }

            // 2. Bot Performance Review
            const userBots = await TradingBotRepository.findByUser(userId);
            for (const bot of userBots) {
                if (bot.stats.totalTrades > 5 && bot.stats.winRate < 40) {
                    recommendations.push({
                        type: 'BOT_OPTIMIZATION',
                        title: `Optimization Needed: ${bot.name}`,
                        message: `Bot ${bot.name} currently has a ${bot.stats.winRate}% win rate. Suggest switching to CONSERVATIVE_CONFIRMATION strategy to reduce risk.`,
                        priority: 'medium',
                        botId: bot._id
                    });
                }
            }

            // 3. Diversification Advice
            if (Object.keys(performance.symbols).length < 2) {
                recommendations.push({
                    type: 'EDUCATION',
                    title: 'Expand Your Portfolio',
                    message: "You've only traded one symbol. Consider exploring other pairs with high AI Sentiment scores to diversify risk.",
                    priority: 'low'
                });
            }

            return recommendations;
        } catch (error) {
            logger.error('Error generating recommendations:', error);
            return [];
        }
    }

    /**
     * Calculate user winning patterns
     */
    async analyzeUserPerformance(userId) {
        const trades = await TradeJournalRepository.findByUser(userId);

        const stats = {
            totalTrades: trades.length,
            symbols: {}
        };

        trades.forEach(trade => {
            const sym = trade.symbol.toUpperCase();
            if (!stats.symbols[sym]) {
                stats.symbols[sym] = { wins: 0, losses: 0, total: 0 };
            }

            stats.symbols[sym].total++;
            if (trade.netProfitLoss > 0) {
                stats.symbols[sym].wins++;
            } else {
                stats.symbols[sym].losses++;
            }
        });

        // Calculate Win Rates
        Object.keys(stats.symbols).forEach(symbol => {
            const s = stats.symbols[symbol];
            s.winRate = s.total > 0 ? (s.wins / s.total) * 100 : 0;
        });

        return stats;
    }
}

module.exports = new RecommendationService();
