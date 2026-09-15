/**
 * TradeJournalRepository — PostgreSQL edition.
 * Mirrors the Mongo repo (findByUser, findByStatus, getStats).
 * getStats uses a SQL aggregation over closed trades (replaces Mongo $group).
 */
const BaseRepository = require('./BaseRepository');
const { tradeJournals } = require('../../../db/schema/trading');
const { pool } = require('../../../db');

class TradeJournalRepository extends BaseRepository {
  constructor() {
    super(tradeJournals);
  }

  async findByUser(userId) {
    return this.findAll({ userId }, { sort: '-entryTime' });
  }

  async findByStatus(userId, status) {
    return this.findAll({ userId, status }, { sort: '-entryTime' });
  }

  /** Aggregated stats over closed trades — mirrors Mongo $group pipeline */
  async getStats(userId) {
    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(net_profit_loss), 0)::float AS "totalProfitLoss",
         COUNT(*)::int AS "totalTrades",
         COUNT(*) FILTER (WHERE net_profit_loss > 0)::int AS "winCount",
         COALESCE(SUM(duration), 0)::int AS "totalDuration",
         COALESCE(MAX(net_profit_loss), 0)::float AS "largestWin",
         COALESCE(MIN(net_profit_loss), 0)::float AS "largestLoss"
       FROM trade_journals
       WHERE user_id = $1 AND status = 'closed'`,
      [userId]
    );
    const s = rows[0];
    return {
      ...s,
      winRate: s.totalTrades > 0 ? Number(((s.winCount / s.totalTrades) * 100).toFixed(2)) : 0,
      avgProfitLoss: s.totalTrades > 0 ? Number((s.totalProfitLoss / s.totalTrades).toFixed(4)) : 0,
    };
  }

  /** Close an open trade (computes duration in seconds) */
  async closeTrade(id, { exitPrice, profitLoss, profitLossPips, profitLossPercent, exitTime, notes } = {}) {
    const current = await this.findById(id);
    if (!current) return null;
    const duration = current.entryTime ? Math.round((new Date(exitTime || Date.now()) - new Date(current.entryTime)) / 1000) : null;
    return this.update(id, {
      status: 'closed',
      exitPrice,
      profitLoss,
      profitLossPips,
      profitLossPercent,
      netProfitLoss: profitLoss != null && current.commission != null
        ? Number((profitLoss - current.commission - (current.swap || 0)).toFixed(4))
        : undefined,
      exitTime: exitTime || new Date(),
      duration,
      notes,
    });
  }
}

module.exports = new TradeJournalRepository();