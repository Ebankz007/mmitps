const BaseRepository = require('./BaseRepository');
const { subscriptions, plans } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class SubscriptionRepository extends BaseRepository {
  constructor() {
    super(subscriptions, {
      relations: {
        plan: { table: plans, on: eq(subscriptions.planId, plans.id) },
      },
    });
  }

  /** Find subscription by user (populated with plan). */
  async findByUser(userId) {
    return this.findOne({ userId }, { populate: 'plan' });
  }

  /** Find active/trialing subscriptions for a user (populated with plan). */
  async findActiveByUser(userId) {
    return this.findAll(
      { userId, status: { $in: ['active', 'trialing'] } },
      { populate: 'plan' }
    );
  }
}

module.exports = new SubscriptionRepository();