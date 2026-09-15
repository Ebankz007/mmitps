/**
 * CopySubscriptionRepository — PostgreSQL edition.
 * Mirrors the Mongo repo (findByFollower, findByProvider, findSubscription).
 */
const BaseRepository = require('./BaseRepository');
const { copySubscriptions } = require('../../../db/schema/trading');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class CopySubscriptionRepository extends BaseRepository {
  constructor() {
    super(copySubscriptions, {
      relations: {
        provider: { table: users, on: eq(copySubscriptions.providerId, users.id) },
        follower: { table: users, on: eq(copySubscriptions.followerId, users.id) },
      },
    });
  }

  async findByFollower(followerId, options = {}) {
    return this.findAll({ followerId }, { populate: 'provider', ...options });
  }

  async findByProvider(providerId, options = {}) {
    return this.findAll({ providerId }, { populate: 'follower', ...options });
  }

  async findSubscription(followerId, providerId) {
    return this.findOne({ followerId, providerId });
  }

  async pause(followerId, providerId, reason = '') {
    return this.updateOne({ followerId, providerId }, { status: 'paused', suspensionReason: reason });
  }

  async resume(followerId, providerId) {
    return this.updateOne({ followerId, providerId }, { status: 'active', suspensionReason: '' });
  }
}

module.exports = new CopySubscriptionRepository();