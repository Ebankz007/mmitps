/**
 * SocialTradingRepository — PostgreSQL edition (social_tradings).
 */
const BaseRepository = require('./BaseRepository');
const { socialTradings } = require('../../../db/schema/core');

class SocialTradingRepository extends BaseRepository {
  constructor() {
    super(socialTradings);
  }

  async findByUserId(userId) {
    return this.findOne({ userId });
  }

  async findActive(options = {}) {
    return this.findAll({ status: 'active' }, options);
  }

  async findTop(limit = 50, sortBy = 'winRate') {
    return this.findAll({ status: 'active' }, { sort: sortBy, direction: 'desc', limit });
  }

  async incrementFollowers(userId, delta = 1) {
    const trader = await this.findByUserId(userId);
    if (!trader) return null;
    return this.update(trader.id, { followers: Math.max(0, (trader.followers || 0) + delta) });
  }

  async incrementFollowing(userId, delta = 1) {
    const trader = await this.findByUserId(userId);
    if (!trader) return null;
    return this.update(trader.id, { following: Math.max(0, (trader.following || 0) + delta) });
  }

  async incrementCopiers(userId, delta = 1) {
    const trader = await this.findByUserId(userId);
    if (!trader) return null;
    return this.update(trader.id, { copiers: Math.max(0, (trader.copiers || 0) + delta) });
  }
}

module.exports = new SocialTradingRepository();