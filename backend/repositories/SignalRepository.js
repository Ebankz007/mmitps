const BaseRepository = require('./BaseRepository');
const Signal = require('../models/Trading/Signal');

class SignalRepository extends BaseRepository {
    constructor() {
        super(Signal);
    }

    async findActive() {
        return this.model.find({ status: 'active' }).populate('provider', 'firstName lastName username').sort('-createdAt');
    }

    async findByProvider(providerId) {
        return this.model.find({ provider: providerId }).sort('-createdAt');
    }
}

module.exports = new SignalRepository();
