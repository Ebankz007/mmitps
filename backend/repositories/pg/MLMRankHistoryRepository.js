/**
 * MLMRankHistoryRepository — PostgreSQL edition.
 * Mirrors the Mongo mlm/RankHistoryRepository method-for-method.
 */
const BaseRepository = require('./BaseRepository');
const { mlmRankHistories } = require('../../../db/schema/mlm');
const { eq, and, gte, lte, sum } = require('drizzle-orm');

class MLMRankHistoryRepository extends BaseRepository {
  constructor() {
    super(mlmRankHistories);
  }

  async findByUser(userId, options = {}) {
    const defaultOptions = { sort: '-achievedAt', ...options };
    return this.findAll({ userId }, defaultOptions);
  }

  async getLatestRank(userId) {
    const history = await this.findOne({ userId }, { sort: '-achievedAt' });
    return history ? history.newRank : null;
  }

  async getRankAchievements(userId) {
    return this.findAll({ userId }, { sort: '-achievedAt' });
  }

  async hasAchievedRank(userId, rankName) {
    return (await this.count({ userId, newRank: rankName })) > 0;
  }

  async getRankAchievementDate(userId, rankName) {
    const history = await this.findOne({ userId, newRank: rankName }, { sort: 'achievedAt' });
    return history ? history.achievedAt : null;
  }

  async getTotalRankBonuses(userId) {
    const rows = await this.db
      .select({ total: sum(mlmRankHistories.bonusAwarded) })
      .from(mlmRankHistories)
      .where(eq(mlmRankHistories.userId, userId));
    return rows[0]?.total != null ? Number(rows[0].total) : 0;
  }

  async getRankProgression(userId) {
    return this.findAll(
      { userId },
      { sort: 'achievedAt', select: 'previousRank,newRank,achievedAt,qualificationSnapshot,bonusAwarded' }
    );
  }

  async createRankHistory(data) {
    return this.create(data);
  }

  async getUsersByRankAndDateRange(rankName, startDate, endDate) {
    return this.findAll({
      newRank: rankName,
      achievedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
  }

  async getRankStatistics(startDate, endDate) {
    const history = await this.findAll({
      achievedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    const stats = {};
    for (const record of history) {
      if (!stats[record.newRank]) stats[record.newRank] = { count: 0, totalBonus: 0 };
      stats[record.newRank].count++;
      stats[record.newRank].totalBonus += record.bonusAwarded || 0;
    }
    return stats;
  }
}

module.exports = new MLMRankHistoryRepository();