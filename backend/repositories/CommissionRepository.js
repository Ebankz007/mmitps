const BaseRepository = require('./BaseRepository');
const MLMCommission = require('../models/MLM/Commission');

class CommissionRepository extends BaseRepository {
    constructor() {
        super(MLMCommission);
    }

    async findByUserId(userId, options = {}) {
        return this.findAll({ user: userId }, options);
    }

    async getTotalEarnings(userId) {
        const result = await this.model.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return result.length ? result[0].total : 0;
    }
}

module.exports = new CommissionRepository();
