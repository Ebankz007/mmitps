/**
 * SettlementService — PostgreSQL edition.
 * Mirrors the Mongo SettlementService (processTradePnL/settleCommission/confirmReceipt).
 * Uses pg WalletService + pg CopySubscriptionRepository + pg UserRepository.
 * Provider resolution: copy_subscriptions.providerId references users directly
 * (PG schema), so no TradingAccount indirection is needed.
 */
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const WalletService = require('./WalletService');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class SettlementService {
  constructor() {
    this.ADMIN_EMAIL = 'admin@mmitps.com';
    this.ADMIN_CUT_PERCENT = 10; // 10% of profit from master's side
  }

  /**
   * Update accrued PnL and commissions for a subscription after a trade closes
   * @param {string} subscriptionId
   * @param {number} pnl - Resolved PnL in USD
   */
  async processTradePnL(subscriptionId, pnl) {
    try {
      const subscription = await CopySubscriptionRepository.findById(subscriptionId);
      if (!subscription || subscription.isCBook) return;

      const accruedPnL = (subscription.accruedPnL || 0) + pnl;
      const update = { accruedPnL };

      // Only calculate positive commissions (Profit Sharing)
      if (pnl > 0) {
        // PG copy_subscriptions has no performanceFee column (it lives in the
        // provider's providerProfile jsonb) — default to the platform standard 20%.
        const performanceFeePercent = 20;
        const totalCommission = (pnl * performanceFeePercent) / 100;
        update.pendingCommission = (subscription.pendingCommission || 0) + totalCommission;

        // If there's pending commission, ensure we are in a pending settlement state
        if (subscription.settlementStatus === 'none') {
          update.settlementStatus = 'pending';
          // Set default deadline of 72 hours from first profit if not set
          if (!subscription.settlementDeadline) {
            update.settlementDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000);
          }
        }
      }

      await CopySubscriptionRepository.update(subscriptionId, update);
      logger.info(`Updated settlement stats for subscription ${subscriptionId}: PnL=${pnl}, Pending=${update.pendingCommission || 0}`);
    } catch (error) {
      logger.error(`Error processing trade PnL for subscription ${subscriptionId}:`, error);
    }
  }

  /**
   * Manually initiate settlement payment from follower to master & admin
   * @param {string} subscriptionId
   * @param {string} followerId
   */
  async settleCommission(subscriptionId, followerId) {
    const subscription = await CopySubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, 'Subscription not found');
    if (subscription.followerId !== followerId) {
      throw new ApiError(403, 'Unauthorized settlement');
    }

    if (subscription.pendingCommission <= 0) {
      throw new ApiError(400, 'No pending commission to settle');
    }

    const amount = subscription.pendingCommission;
    const currency = 'USD'; // Default

    // 1. Calculate split (Master gets 90%, Admin gets 10%)
    const adminAmount = (amount * this.ADMIN_CUT_PERCENT) / 100;
    const masterAmount = amount - adminAmount;

    // 2. Resolve Master's email (providerId references users directly in PG)
    const provider = await UserRepository.findById(subscription.providerId);
    if (!provider) {
      throw new ApiError(500, 'Provider user not found for settlement');
    }
    const masterEmail = provider.email;

    // 3. Execute Transfers via pg WalletService
    await WalletService.transfer(followerId, masterEmail, masterAmount, currency);
    await WalletService.transfer(followerId, this.ADMIN_EMAIL, adminAmount, currency);

    // 4. Update status to 'paid'
    await CopySubscriptionRepository.update(subscriptionId, { settlementStatus: 'paid' });

    logger.info(`Follower ${followerId} paid ${amount} commission for sub ${subscriptionId}`);
    return { success: true, amount, masterAmount, adminAmount };
  }

  /**
   * Master confirms receipt of funds
   * @param {string} subscriptionId
   * @param {string} masterUserId
   */
  async confirmReceipt(subscriptionId, masterUserId) {
    const subscription = await CopySubscriptionRepository.findById(subscriptionId);
    if (!subscription) throw new ApiError(404, 'Subscription not found');

    // Authorization check — providerId references the master user directly in PG
    if (subscription.providerId !== masterUserId) {
      throw new ApiError(403, 'Only the master trader can confirm receipts');
    }

    if (subscription.settlementStatus !== 'paid') {
      throw new ApiError(400, 'Settlement is not in "paid" status yet');
    }

    // Reset for next period
    await CopySubscriptionRepository.update(subscriptionId, {
      settlementStatus: 'none',
      pendingCommission: 0,
      accruedPnL: 0,
      settlementDeadline: null,
      lastSettlementAt: new Date(),
      isSuspended: false, // Reactivate
      status: 'active',
    });

    logger.info(`Master ${masterUserId} confirmed settlement for sub ${subscriptionId}. Account reactivated.`);
    return { success: true };
  }

  /**
   * Background check for overdue settlements (72h logic)
   */
  async checkOverdueSettlements() {
    const now = new Date();
    const overdueSubs = await CopySubscriptionRepository.findAll({
      settlementStatus: { $in: ['pending', 'paid'] },
      isSuspended: false,
    });

    for (const sub of overdueSubs) {
      if (sub.settlementDeadline && sub.settlementDeadline < now) {
        await CopySubscriptionRepository.update(sub.id, {
          isSuspended: true,
          suspensionReason: 'Overdue settlement (exceeded 72h window)',
          status: 'paused',
        });
        logger.warn(`Subscription ${sub.id} suspended due to overdue settlement`);
      }
    }
  }
}

module.exports = new SettlementService();