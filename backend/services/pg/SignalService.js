/**
 * SignalService — PostgreSQL edition.
 * Mirrors the Mongo SignalService (createSignal/getActiveSignals/closeSignal).
 * closeSignal also processes copy-trade settlement (PnL → subscription stats).
 */
const SignalRepository = require('../../repositories/pg/SignalRepository');
const CopyTradeRepository = require('../../repositories/pg/CopyTradeRepository');
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const SettlementService = require('./SettlementService');
const ApiError = require('../../utils/ApiError');

class SignalService {
  async createSignal(userId, data) {
    return SignalRepository.create({
      ...data,
      providerId: userId,
    });
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
    if (signal.providerId !== providerId) {
      throw new ApiError(403, 'Not authorized to close this signal');
    }

    const updatedSignal = await SignalRepository.update(signalId, {
      status: 'closed',
      ...resultData,
    });

    // --- NEW: Settlement & PnL Tracking ---
    try {
      // 1. Find all copy trades associated with this signal
      // NOTE: PG trading_signals uses `pair` (Mongo used `symbol`) — copy trades
      // store `symbol`, so match signal.pair against copy_trades.symbol.
      const copyTrades = await CopyTradeRepository.findAll({
        symbol: updatedSignal.pair,
        status: 'executed',
        providerId,
      });

      for (const trade of copyTrades) {
        // Calculate Follower PnL
        // PnL = (Exit - Entry) * LotSize * contractSize (simplifying to unit profit)
        const exitPrice = resultData.exitPrice || updatedSignal.exitPrice;
        if (exitPrice && trade.providerEntryPrice) {
          const priceDiff = updatedSignal.type === 'buy'
            ? (exitPrice - trade.providerEntryPrice)
            : (trade.providerEntryPrice - exitPrice);
          // Use a mock multiplier for pips to USD if needed, or assume exitPrice/entryPrice delta is the profit per unit
          const calculatedPnL = priceDiff * (trade.copiedLotSize * 100000); // 100k for standard lot

          await CopyTradeRepository.close(trade.id, {
            followerProfitLoss: calculatedPnL,
            closedAt: new Date(),
          });

          // Find subscription to update stats
          const sub = await CopySubscriptionRepository.findOne({
            followerId: trade.followerId,
            providerId: trade.providerId,
            status: 'active',
          });

          if (sub) {
            await SettlementService.processTradePnL(sub.id, calculatedPnL);
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