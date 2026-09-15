const BaseRepository = require('./BaseRepository');
const Investment = require('../models/Tokenization/Investment');

class InvestmentRepository extends BaseRepository {
    constructor() {
        super(Investment);
    }

    async findByUser(userId) {
        return this.model.find({ user: userId }).populate('pool');
    }

    async findByPool(poolId) {
        return this.model.find({ pool: poolId }).populate('user', 'firstName lastName email');
    }
}

module.exports = new InvestmentRepository();
