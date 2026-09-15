/**
 * TokenPoolRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { tokenPools } = require('../../../db/schema/tokenization');

class TokenPoolRepository extends BaseRepository {
  constructor() {
    super(tokenPools);
  }

  async findActive(options = {}) {
    return this.findAll({ status: 'open' }, { sort: 'createdAt', direction: 'desc', ...options });
  }

  async findByAssetType(assetType, options = {}) {
    return this.findAll({ assetType, status: 'open' }, options);
  }
}

module.exports = new TokenPoolRepository();