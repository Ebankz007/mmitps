/**
 * SocialSignalRepository — PostgreSQL edition (social_signals).
 * The Mongo `Signal` model maps to social_signals (trader-published social trading signals).
 */
const BaseRepository = require('./BaseRepository');
const { socialSignals } = require('../../../db/schema/core');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class SocialSignalRepository extends BaseRepository {
  constructor() {
    super(socialSignals, {
      relations: {
        trader: { table: users, on: eq(socialSignals.traderId, users.id) },
      },
    });
  }

  async findByTrader(traderId, options = {}) {
    return this.findAll({ traderId }, { sort: 'createdAt', direction: 'desc', ...options });
  }

  async findClosedBetween(traderId, startDate, endDate) {
    return this.findAll({
      traderId,
      status: 'closed',
      closeTime: { $gte: startDate, $lte: endDate }
    }, { sort: 'closeTime', direction: 'asc' });
  }
}

module.exports = new SocialSignalRepository();