/**
 * TokenPoolService — PostgreSQL edition.
 */
const TokenPoolRepository = require('../../repositories/pg/TokenPoolRepository');
const ApiError = require('../../utils/ApiError');

class TokenPoolService {
  async createPool(data) {
    return TokenPoolRepository.create(data);
  }

  async getPool(id) {
    const pool = await TokenPoolRepository.findById(id);
    if (!pool) throw new ApiError(404, 'Token Pool not found');
    return pool;
  }

  async getActivePools() {
    return TokenPoolRepository.findActive();
  }

  async getPoolsByCategory(category) {
    return TokenPoolRepository.findByAssetType(category);
  }

  async updatePool(id, data) {
    return TokenPoolRepository.update(id, data);
  }
}

module.exports = new TokenPoolService();