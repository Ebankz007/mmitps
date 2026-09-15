/**
 * TierRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { tiers } = require('../../../db/schema/financial');

class TierRepository extends BaseRepository {
  constructor() {
    super(tiers);
  }

  async findByCode(code) {
    return this.findOne({ code });
  }

  async findActive() {
    return this.findAll({ isActive: true }, { sort: 'level' });
  }

  async findByLevel(level) {
    return this.findOne({ level });
  }
}

module.exports = new TierRepository();