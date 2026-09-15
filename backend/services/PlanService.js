const PlanRepository = require('../repositories/PlanRepository');
const BaseService = require('./BaseService');
const ApiError = require('../utils/ApiError');

class PlanService extends BaseService {
    constructor() {
        super(PlanRepository);
    }

    async createPlan(data) {
        const existing = await PlanRepository.findByCode(data.code);
        if (existing) {
            throw ApiError.conflict(`Plan with code ${data.code} already exists`);
        }
        return PlanRepository.create(data);
    }

    async getActivePlans() {
        return PlanRepository.findActive();
    }

    // Override generic update to handle specific validation if needed
    async updatePlan(id, data) {
        return PlanRepository.update(id, data);
    }
}

module.exports = new PlanService();
