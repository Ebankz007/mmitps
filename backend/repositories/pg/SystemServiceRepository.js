/**
 * SystemServiceRepository — PostgreSQL edition (system_services).
 */
const BaseRepository = require('./BaseRepository');
const { systemServices } = require('../../../db/schema/core');

class SystemServiceRepository extends BaseRepository {
  constructor() {
    super(systemServices);
  }

  async findByName(name) {
    return this.findOne({ name });
  }
}

module.exports = new SystemServiceRepository();