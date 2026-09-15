/**
 * AMLRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { amlChecks } = require('../../../db/schema/kyc');

class AMLRepository extends BaseRepository {
  constructor() {
    super(amlChecks);
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: 'createdAt', direction: 'desc', ...options });
  }
}

module.exports = new AMLRepository();