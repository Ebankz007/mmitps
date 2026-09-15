/**
 * SignalRepository — PostgreSQL edition.
 * Mirrors the Mongo repo (findActive with provider populate, findByProvider).
 */
const BaseRepository = require('./BaseRepository');
const { tradingSignals } = require('../../../db/schema/trading');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class SignalRepository extends BaseRepository {
  constructor() {
    super(tradingSignals, {
      relations: {
        provider: { table: users, on: eq(tradingSignals.providerId, users.id) },
      },
    });
  }

  async findActive(options = {}) {
    return this.findAll({ status: 'active' }, { sort: '-createdAt', populate: 'provider', ...options });
  }

  async findByProvider(providerId, options = {}) {
    return this.findAll({ providerId }, { sort: '-createdAt', ...options });
  }
}

module.exports = new SignalRepository();