/**
 * TradingBotRepository — PostgreSQL edition.
 * Mirrors the Mongo repo (getActiveBots, findByUser, findByIdAndUser).
 */
const BaseRepository = require('./BaseRepository');
const { tradingBots } = require('../../../db/schema/trading');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class TradingBotRepository extends BaseRepository {
  constructor() {
    super(tradingBots, {
      relations: {
        user: { table: users, on: eq(tradingBots.userId, users.id) },
      },
    });
  }

  /** Active bots for the bot engine to process */
  async getActiveBots() {
    return this.findAll({ status: 'active' }, { populate: 'user' });
  }

  async findByUser(userId) {
    return this.findAll({ userId }, { sort: '-createdAt' });
  }

  async findByIdAndUser(id, userId) {
    return this.findOne({ id, userId });
  }
}

module.exports = new TradingBotRepository();