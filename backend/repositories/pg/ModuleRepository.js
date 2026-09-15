/**
 * ModuleRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { modules } = require('../../../db/schema/financial');

class ModuleRepository extends BaseRepository {
  constructor() {
    super(modules);
  }

  async findByCode(code) {
    return this.findOne({ code });
  }

  async findActive(options = {}) {
    return this.findAll({ isActive: true }, { sort: 'code', ...options });
  }
}

module.exports = new ModuleRepository();