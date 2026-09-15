/**
 * CryptoWalletRepository — PostgreSQL edition.
 * privateKeyEncrypted is excluded by default (matches Mongo select:false).
 */
const BaseRepository = require('./BaseRepository');
const { cryptoWallets } = require('../../../db/schema/financial');

class CryptoWalletRepository extends BaseRepository {
  constructor() {
    super(cryptoWallets, { defaultExclude: ['private_key_encrypted'] });
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findByAddress(address) {
    return this.findOne({ address });
  }

  async findDefault(userId) {
    return this.findOne({ userId, isDefault: true });
  }

  async findByUserAndChain(userId, chain) {
    return this.findOne({ userId, chain });
  }
}

module.exports = new CryptoWalletRepository();