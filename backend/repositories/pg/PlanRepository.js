const BaseRepository = require('./BaseRepository');
const { plans } = require('../../../db/schema/core');

class PlanRepository extends BaseRepository {
  constructor() {
    super(plans);
  }

  /** Find plan by code. */
  async findByCode(code) {
    return this.findOne({ code });
  }

  /** Find all active plans. */
  async findActive() {
    return this.findAll({ isActive: true });
  }
}

module.exports = new PlanRepository();