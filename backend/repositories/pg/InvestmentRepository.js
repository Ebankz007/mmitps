/**
 * InvestmentRepository — PostgreSQL edition (investments table, token-pool purchases).
 */
const BaseRepository = require('./BaseRepository');
const { investments } = require('../../../db/schema/tokenization');

class InvestmentRepository extends BaseRepository {
  constructor() {
    super(investments);
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: 'createdAt', direction: 'desc', ...options });
  }

  async findByPool(poolId, options = {}) {
    return this.findAll({ poolId }, options);
  }

  async findActiveByPool(poolId) {
    return this.findAll({ poolId, status: 'active' });
  }
}

module.exports = new InvestmentRepository();