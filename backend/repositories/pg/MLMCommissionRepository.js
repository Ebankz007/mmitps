/**
 * MLMCommissionRepository — PostgreSQL edition.
 * Mirrors the Mongo CommissionRepository + adds SQL GROUP BY aggregation.
 */
const BaseRepository = require('./BaseRepository');
const { mlmCommissions } = require('../../../db/schema/mlm');
const { eq, and, sum } = require('drizzle-orm');

class MLMCommissionRepository extends BaseRepository {
  constructor() {
    super(mlmCommissions);
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  /** SUM(amount) WHERE user_id = $1 AND status = 'paid' — replaces the $group pipeline. */
  async getTotalEarnings(userId) {
    const rows = await this.db
      .select({ total: sum(mlmCommissions.amount) })
      .from(mlmCommissions)
      .where(and(eq(mlmCommissions.userId, userId), eq(mlmCommissions.status, 'paid')));
    return rows[0]?.total != null ? Number(rows[0].total) : 0;
  }
}

module.exports = new MLMCommissionRepository();