/**
 * SocialFollowRepository — PostgreSQL edition (social_follows).
 */
const BaseRepository = require('./BaseRepository');
const { socialFollows } = require('../../../db/schema/core');

class SocialFollowRepository extends BaseRepository {
  constructor() {
    super(socialFollows);
  }

  async findByFollower(followerId, options = {}) {
    return this.findAll({ followerId }, options);
  }

  async findPair(followerId, traderId) {
    return this.findOne({ followerId, traderId });
  }

  async findTraderIdsByFollower(followerId) {
    const follows = await this.findByFollower(followerId);
    return follows.map(f => f.traderId);
  }
}

module.exports = new SocialFollowRepository();