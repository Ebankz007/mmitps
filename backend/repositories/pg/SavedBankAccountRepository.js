/**
 * SavedBankAccountRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { savedBankAccounts } = require('../../../db/schema/financial');

class SavedBankAccountRepository extends BaseRepository {
  constructor() {
    super(savedBankAccounts);
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findPrimary(userId) {
    return this.findOne({ userId, isPrimary: true });
  }

  async findVerified(userId) {
    return this.findAll({ userId, isVerified: true });
  }
}

module.exports = new SavedBankAccountRepository();