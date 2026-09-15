/**
 * CopyTradeRepository — PostgreSQL edition.
 * No dedicated Mongo repo existed (CopyTrade model used via services) — basic
 * CRUD + follower/provider lookups. Mirrors the copy_trades table.
 */
const BaseRepository = require('./BaseRepository');
const { copyTrades } = require('../../../db/schema/trading');

class CopyTradeRepository extends BaseRepository {
  constructor() {
    super(copyTrades);
  }

  async findByFollower(followerId, options = {}) {
    return this.findAll({ followerId }, { sort: '-executedAt', ...options });
  }

  async findByProvider(providerId, options = {}) {
    return this.findAll({ providerId }, { sort: '-executedAt', ...options });
  }

  async findActiveByFollower(followerId) {
    return this.findAll({ followerId, status: { $in: ['pending', 'executed'] } }, { sort: '-executedAt' });
  }

  async markExecuted(id, { followerTradeId, copiedLotSize, followerEntryPrice, slippage } = {}) {
    return this.update(id, {
      status: 'executed',
      followerTradeId,
      copiedLotSize,
      followerEntryPrice,
      slippage,
      executedAt: new Date(),
    });
  }

  async markFailed(id, reason) {
    return this.update(id, { status: 'failed', failureReason: reason });
  }

  async close(id, { followerProfitLoss, providerProfitLoss, closedAt } = {}) {
    return this.update(id, {
      status: 'closed',
      followerProfitLoss,
      providerProfitLoss,
      closedAt: closedAt || new Date(),
    });
  }
}

module.exports = new CopyTradeRepository();