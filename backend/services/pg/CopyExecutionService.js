/**
 * CopyExecutionService — PostgreSQL edition.
 * Executes copy trades for followers when a provider publishes a signal.
 */
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const TradeJournalRepository = require('../../repositories/pg/TradeJournalRepository');
const CopyTradeRepository = require('../../repositories/pg/CopyTradeRepository');
const logger = require('../../utils/logger');

class CopyExecutionService {
  /**
   * Executes copy trades for all active subscribers of a provider
   * @param {string} providerId - The ID of the trader who published the signal
   * @param {Object} signal - The published signal object
   */
  async synchronizeSignal(providerId, signal) {
    try {
      // 1. Find all active copy subscriptions for this provider
      const subscriptions = await CopySubscriptionRepository.findByProvider(providerId);
      const activeSubscriptions = (subscriptions || []).filter(sub =>
        sub.status === 'active' && sub.isSuspended === false
      );

      if (activeSubscriptions.length === 0) {
        logger.debug(`No active copy subscriptions for provider ${providerId}`);
        return;
      }

      const standardSubs = activeSubscriptions.filter(s => !s.isCBook);
      const cbookSubs = activeSubscriptions.filter(s => s.isCBook);

      if (standardSubs.length > 0) {
        logger.info(`Synchronizing signal ${signal.id} to ${standardSubs.length} standard followers`);
      }
      if (cbookSubs.length > 0) {
        logger.debug(`Synchronizing signal ${signal.id} to ${cbookSubs.length} C-Book accounts (silent)`);
      }

      // 2. Map the signal to each follower's account
      const copyResults = await Promise.all(activeSubscriptions.map(sub =>
        this.executeFollowerTrade(sub, signal)
      ));

      return copyResults;
    } catch (error) {
      logger.error(`Failed to synchronize signal ${signal.id}:`, error);
      throw error;
    }
  }

  /**
   * Executes a single instance of a copied trade for one follower
   * @param {Object} subscription - The CopySubscription object
   * @param {Object} signal - The original signal
   */
  async executeFollowerTrade(subscription, signal) {
    try {
      // 0. Filter Checks
      // Symbol Filtering
      if (subscription.allowedSymbols?.length > 0 && !subscription.allowedSymbols.includes(signal.symbol)) {
        logger.debug(`Signal ${signal.symbol} not in allowed list for follower ${subscription.followerId}`);
        return { followerId: subscription.followerId, success: false, reason: 'symbol_not_allowed' };
      }

      if (subscription.excludedSymbols?.includes(signal.symbol)) {
        logger.debug(`Signal ${signal.symbol} is excluded for follower ${subscription.followerId}`);
        return { followerId: subscription.followerId, success: false, reason: 'symbol_excluded' };
      }

      // Max Positions Check
      const activePositions = await TradeJournalRepository.findAll({
        userId: subscription.followerId,
        status: 'open',
        strategy: 'CopyTrading'
      });

      if (activePositions.length >= (subscription.maxPositions || 5)) {
        logger.warn(`Follower ${subscription.followerId} reached max copy positions (${activePositions.length})`);
        return { followerId: subscription.followerId, success: false, reason: 'max_positions_reached' };
      }

      // Calculate follower's lot size based on risk multiplier
      const calculatedLot = (subscription.riskMultiplier || 1) * 0.01;

      // 1. Create the CopyTrade record
      const copyRecord = await CopyTradeRepository.create({
        followerId: subscription.followerId,
        providerId: subscription.providerId,
        symbol: signal.symbol,
        direction: signal.action,
        providerLotSize: signal.lotSize || 0.01,
        copiedLotSize: calculatedLot,
        providerEntryPrice: signal.entryPrice,
        status: 'executed',
        executedAt: new Date()
      });

      // 2. Create the TradeJournal entry for the follower so it appears on their dashboard
      const followerTrade = await TradeJournalRepository.create({
        userId: subscription.followerId,
        symbol: signal.symbol,
        direction: signal.action,
        orderType: 'market',
        lotSize: calculatedLot,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        status: 'open',
        entryTime: new Date(),
        strategy: signal.strategy || 'CopyTrading',
        notes: `Copied from provider: ${subscription.providerId}`,
        externalTradeId: `COPY-${copyRecord.id}`
      });

      // 3. Link the journal entry back to the copy record
      await CopyTradeRepository.update(copyRecord.id, { followerTradeId: followerTrade.id });

      return { followerId: subscription.followerId, success: true, tradeId: followerTrade.id };
    } catch (error) {
      logger.error(`Error copying trade for follower ${subscription.followerId}:`, error);

      // Log failure to CopyTrade record if possible
      await CopyTradeRepository.create({
        followerId: subscription.followerId,
        providerId: subscription.providerId,
        status: 'failed',
        failureReason: error.message
      });

      return { followerId: subscription.followerId, success: false, error: error.message };
    }
  }
}

module.exports = new CopyExecutionService();