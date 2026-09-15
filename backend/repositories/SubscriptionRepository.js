const BaseRepository = require('./BaseRepository');
const Subscription = require('../models/Subscription');

class SubscriptionRepository extends BaseRepository {
    constructor() {
        super(Subscription);
    }

    async findByUser(userId) {
        return this.model.findOne({ user: userId })
            .populate('plan')
            .lean();
    }

    async findActiveByUser(userId) {
        return this.model.find({
            user: userId,
            status: { $in: ['active', 'trialing'] }
        }).populate('plan').lean();
    }
}

module.exports = new SubscriptionRepository();
