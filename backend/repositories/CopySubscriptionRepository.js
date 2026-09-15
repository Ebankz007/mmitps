const BaseRepository = require('./BaseRepository');
const CopySubscription = require('../models/Trading/CopySubscription');

class CopySubscriptionRepository extends BaseRepository {
    constructor() {
        super(CopySubscription);
    }

    async findByFollower(followerId) {
        return this.model.find({ follower: followerId }).populate('provider', 'firstName lastName username');
    }

    async findByProvider(providerId) {
        return this.model.find({ provider: providerId }).populate('follower', 'firstName lastName email');
    }

    async findSubscription(followerId, providerId) {
        return this.model.findOne({ follower: followerId, provider: providerId });
    }
}

module.exports = new CopySubscriptionRepository();
