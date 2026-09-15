const SignalRepository = require('../../repositories/SignalRepository');
const CopySubscriptionRepository = require('../../repositories/CopySubscriptionRepository');
const SettlementService = require('./SettlementService');
const CopyTrade = require('../../models/Trading/CopyTrade');
const ApiError = require('../../utils/ApiError');

class SignalService {
    async createSignal(userId, data) {
        data.provider = userId;
        return SignalRepository.create(data);
    }

    async getActiveSignals() {
        return SignalRepository.findActive();
    }

    async getProviderSignals(providerId) {
        return SignalRepository.findByProvider(providerId);
    }

    async closeSignal(signalId, providerId, resultData) {
        const signal = await SignalRepository.findById(signalId);
        if (!signal) throw new ApiError(404, 'Signal not found');
        if (signal.provider.toString() !== providerId.toString()) {
            throw new ApiError(403, 'Not authorized to close this signal');
        }

        const updatedSignal = await SignalRepository.update(signalId, {
            status: 'closed',
            ...resultData
        });

        // --- NEW: Settlement & PnL Tracking ---
        try {
            // 1. Find all copy trades associated with this signal
            const copyTrades = await CopyTrade.find({
                symbol: updatedSignal.symbol,
                status: 'executed',
                provider: providerId
                // We assume the signal and its copies are linked by symbol/provider/providerEntryPrice
                // or a direct link if we add it. 
            });

            for (const trade of copyTrades) {
                // Calculate Follower PnL
                // PnL = (Exit - Entry) * LotSize * contractSize (simplifying to unit profit)
                const exitPrice = resultData.exitPrice || updatedSignal.exitPrice;
                if (exitPrice && trade.providerEntryPrice) {
                    const priceDiff = updatedSignal.action === 'buy' ? (exitPrice - trade.providerEntryPrice) : (trade.providerEntryPrice - exitPrice);
                    // Use a mock multiplier for pips to USD if needed, or assume exitPrice/entryPrice delta is the profit per unit
                    const calculatedPnL = priceDiff * (trade.copiedLotSize * 100000); // 100k for standard lot
                    
                    trade.status = 'closed';
                    trade.followerProfitLoss = calculatedPnL;
                    trade.closedAt = new Date();
                    await trade.save();

                    // Find subscription to update stats
                    const sub = await CopySubscriptionRepository.model.findOne({
                        follower: trade.follower,
                        provider: trade.provider,
                        status: 'active'
                    });

                    if (sub) {
                        await SettlementService.processTradePnL(sub._id, calculatedPnL);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to process settlement for closed signal:', err);
        }

        return updatedSignal;
    }
}

module.exports = new SignalService();
