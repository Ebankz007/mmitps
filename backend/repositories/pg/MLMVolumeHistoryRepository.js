/**
 * MLMVolumeHistoryRepository — PostgreSQL edition.
 * No Mongo repo existed (model only); implements the plan's volume-tracking surface.
 */
const BaseRepository = require('./BaseRepository');
const { mlmVolumeHistories } = require('../../../db/schema/mlm');
const { eq, and, gte, lte, sum } = require('drizzle-orm');

class MLMVolumeHistoryRepository extends BaseRepository {
  constructor() {
    super(mlmVolumeHistories);
  }

  async findByUserAndPeriod(userId, periodType, periodStart) {
    return this.findOne({ userId, periodType, periodStart });
  }

  /** Aggregate volume across a period window (SQL SUM replaces in-memory reduce). */
  async getPeriodSummary(userId, startDate, endDate) {
    const rows = await this.db
      .select({
        personalVolume: sum(mlmVolumeHistories.personalVolume),
        leftLegVolume: sum(mlmVolumeHistories.leftLegVolume),
        rightLegVolume: sum(mlmVolumeHistories.rightLegVolume),
        groupVolume: sum(mlmVolumeHistories.groupVolume),
        volumeMatched: sum(mlmVolumeHistories.volumeMatched),
        commissionsEarned: sum(mlmVolumeHistories.commissionsEarned),
      })
      .from(mlmVolumeHistories)
      .where(and(
        eq(mlmVolumeHistories.userId, userId),
        gte(mlmVolumeHistories.periodStart, new Date(startDate)),
        lte(mlmVolumeHistories.periodEnd, new Date(endDate)),
      ));
    const r = rows[0] || {};
    const num = (v) => (v == null ? 0 : Number(v));
    return {
      personalVolume: num(r.personalVolume),
      leftLegVolume: num(r.leftLegVolume),
      rightLegVolume: num(r.rightLegVolume),
      groupVolume: num(r.groupVolume),
      volumeMatched: num(r.volumeMatched),
      commissionsEarned: num(r.commissionsEarned),
    };
  }
}

module.exports = new MLMVolumeHistoryRepository();