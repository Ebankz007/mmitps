const TradingBotRepository = require('../../repositories/TradingBotRepository');
const SentimentService = require('../../services/ai/SentimentService');
const TradeJournalRepository = require('../../repositories/TradeJournalRepository');
const WalletService = require('../financial/WalletService');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Trading Bot Service
 * Orchestrates bot lifecycle and automated trading logic
 */
class TradingBotService {
    /**
     * Strategy Registry: Defines entry criteria for different strategies
     */
    static STRATEGIES = {
        SENTIMENT_FOLLOWING: {
            name: 'Sentiment Following',
            evaluate: (sentiment) => {
                if (sentiment >= 20) return { action: 'buy', strength: sentiment };
                if (sentiment <= -20) return { action: 'sell', strength: Math.abs(sentiment) };
                return null;
            }
        },
        CONSERVATIVE_CONFIRMATION: {
            name: 'Conservative Confirmation',
            evaluate: (sentiment) => {
                if (sentiment >= 60) return { action: 'buy', strength: sentiment };
                if (sentiment <= -60) return { action: 'sell', strength: Math.abs(sentiment) };
                return null;
            }
        },
        RETRACEMENT_ENTRY: {
            name: 'Retracement Entry',
            evaluate: (sentiment) => {
                // Simplified: Requires high sentiment but triggers on "pullback" (mocked via random for MVP)
                if (Math.abs(sentiment) >= 40 && Math.random() > 0.5) {
                    return { action: sentiment > 0 ? 'buy' : 'sell', strength: Math.abs(sentiment) };
                }
                return null;
            }
        }
    };

    /**
     * Create a new trading bot
     */
    async createBot(userId, data) {
        // 1. Validate strategy exists
        if (!TradingBotService.STRATEGIES[data.strategy]) {
            throw new ApiError(400, 'Invalid strategy selected');
        }

        // 2. Validate user has enough funds in wallet
        // (Implementation detail: Wallet check omitted for demo, assumed to pass or handled by frontend)

        // 3. Create bot
        return await TradingBotRepository.create({
            user: userId,
            ...data,
            status: 'paused'
        });
    }

    /**
     * Process all active bots
     */
    async runBotCycles() {
        const activeBots = await TradingBotRepository.getActiveBots();
        console.log(`[BotRunner] Processing ${activeBots.length} active bots...`);

        for (const bot of activeBots) {
            try {
                await this.executeBotIteration(bot);
            } catch (err) {
                console.error(`[BotRunner] Error executing bot ${bot._id}:`, err.message);
            }
        }
    }

    /**
     * Single bot iteration logic
     */
    async executeBotIteration(bot) {
        // 0. Defensive Guard: Ensure user exists
        const userId = bot.user?._id || bot.user;
        if (!userId) {
            console.error(`[BotRunner] Bot ${bot._id} has no associated user. Skipping.`);
            return;
        }

        // 1. Get AI Sentiment for the bot's pair
        const analysis = await SentimentService.analyzeSymbol(bot.pair);
        const score = analysis.sentimentScore;

        // 2. Evaluate Strategy
        const strategy = TradingBotService.STRATEGIES[bot.strategy];
        const signal = strategy.evaluate(score);

        if (signal) {
            console.log(`[BotRunner] Bot ${bot.name} triggered ${signal.action} for ${bot.pair} (Score: ${score})`);

            // 3. Execution Guard: Check concurrent trades limit
            const openTrades = await TradeJournalRepository.model.countDocuments({
                user: userId,
                symbol: bot.pair,
                status: 'open',
                notes: new RegExp(`Bot: ${bot.name}`, 'i')
            });

            if (openTrades >= (bot.settings.maxConcurrentTrades || 1)) {
                console.log(`[BotRunner] Bot ${bot.name} at limit (${openTrades} trades). Skipping.`);
                return;
            }

            // 4. "Execute" Trade - Log to TradeJournal
            await this.placeAutoTrade(bot, signal, analysis);
        }

        // 5. Update bot heartbeat
        await TradingBotRepository.update(bot._id, { lastExecutedAt: new Date() });
    }

    /**
     * Mock trade execution in TradeJournal
     */
    async placeAutoTrade(bot, signal, analysis) {
        // Calculate Lot Size based on Risk % (Simplified)
        const lotSize = (bot.allocation * (bot.settings.riskPerTrade / 100)) / 1000; // Mock calculation
        const userId = bot.user?._id || bot.user;

        // Create Journal Entry
        await TradeJournalRepository.create({
            user: userId,
            symbol: bot.pair,
            direction: signal.action,
            orderType: 'market',
            lotSize: parseFloat(lotSize.toFixed(2)),
            entryPrice: 1.0850, // Mock price (would fetch from RealTimeDataService in PROD)
            stopLoss: 1.0820,
            takeProfit: 1.0910,
            status: 'open',
            entryTime: new Date(),
            strategy: bot.strategy,
            notes: `Bot: ${bot.name} | AI Sentiment: ${analysis.sentimentScore} | ${analysis.category}`,
            externalTradeId: `BOT-${Date.now()}`
        });

        // Update bot stats
        await TradingBotRepository.update(bot._id, {
            $inc: { 'stats.totalTrades': 1 }
        });
    }

    /**
     * Start/Stop/Pause toggle
     */
    async updateStatus(botId, userId, status) {
        const bot = await TradingBotRepository.findByIdAndUser(botId, userId);
        if (!bot) throw new ApiError(404, 'Bot not found');

        return await TradingBotRepository.update(botId, { status });
    }

    async getUserBots(userId) {
        return await TradingBotRepository.findByUser(userId);
    }
}

module.exports = new TradingBotService();
