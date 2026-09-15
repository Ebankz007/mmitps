const BaseRepository = require('./BaseRepository');
const AMLCheck = require('../models/KYC/AMLCheck');

class AMLRepository extends BaseRepository {
    constructor() {
        super(AMLCheck);
    }

    async findByUser(userId) {
        return this.model.find({ user: userId }).sort({ createdAt: -1 });
    }

    async findPendingReviews() {
        return this.model.find({ reviewRequired: true, status: { $ne: 'clear' }, action: { $exists: false } })
            .populate('user', 'username email')
            .sort({ createdAt: 1 });
    }
}

module.exports = new AMLRepository();
