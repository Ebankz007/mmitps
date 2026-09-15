/**
 * BonusActivityRepository + BonusClaimRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { bonusActivities, bonusClaims } = require('../../../db/schema/financial');
const { eq } = require('drizzle-orm');

class BonusActivityRepository extends BaseRepository {
  constructor() {
    super(bonusActivities);
  }

  async findActive(options = {}) {
    return this.findAll({ isActive: true }, options);
  }

  async findByCriteria(criteria, options = {}) {
    return this.findAll({ criteria, isActive: true }, options);
  }

  /** Increment claim counter (guards against exceeding maxClaims) */
  async incrementClaims(id) {
    const current = await this.findById(id);
    if (!current) return null;
    if (current.maxClaims > 0 && current.currentClaims >= current.maxClaims) {
      const error = new Error('Bonus claim limit reached');
      error.statusCode = 400;
      throw error;
    }
    return this.update(id, { currentClaims: (current.currentClaims || 0) + 1 });
  }
}

class BonusClaimRepository extends BaseRepository {
  constructor() {
    super(bonusClaims, {
      relations: {
        bonusActivity: { table: bonusActivities, on: eq(bonusClaims.bonusActivityId, bonusActivities.id) },
      },
    });
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findByActivity(bonusActivityId, options = {}) {
    return this.findAll({ bonusActivityId }, options);
  }

  async findClaimed(userId, bonusActivityId) {
    return this.findOne({ userId, bonusActivityId });
  }

  async approve(id, processedBy, note = '') {
    return this.update(id, { status: 'approved', processedAt: new Date(), processedBy, rejectionReason: '' });
  }

  async reject(id, processedBy, reason = '') {
    return this.update(id, { status: 'rejected', processedAt: new Date(), processedBy, rejectionReason: reason });
  }
}

module.exports = {
  BonusActivityRepository: new BonusActivityRepository(),
  BonusClaimRepository: new BonusClaimRepository(),
};