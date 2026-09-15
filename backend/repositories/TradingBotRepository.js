const BaseRepository = require('./BaseRepository');
const TradingBot = require('../models/Trading/TradingBot');

class TradingBotRepository extends BaseRepository {
    constructor() {
        super(TradingBot);
    }

    /**
     * Get active bots for processing
     */
    async getActiveBots() {
        return this.model.find({ status: 'active' }).populate('user');
    }

    /**
     * Get user's bots
     */
    async findByUser(userId) {
        return this.model.find({ user: userId }).sort({ createdAt: -1 });
    }

    /**
     * Find bot by ID and ensure it belongs to user
     */
    async findByIdAndUser(id, userId) {
        return this.model.findOne({ _id: id, user: userId });
    }
}

module.exports = new TradingBotRepository();
