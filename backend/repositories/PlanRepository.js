const BaseRepository = require('./BaseRepository');
const Plan = require('../models/Plan');

class PlanRepository extends BaseRepository {
    constructor() {
        super(Plan);
    }

    async findByCode(code) {
        return this.model.findOne({ code }).lean();
    }

    async findActive() {
        return this.model.find({ isActive: true }).lean();
    }
}

module.exports = new PlanRepository();
