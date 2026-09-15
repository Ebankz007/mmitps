/**
 * TradingAccountRepository — PostgreSQL edition.
 * Credentials are AES-256-GCM encrypted (passwordEncrypted/apiKeyEncrypted/
 * apiSecretEncrypted) — NEVER plaintext. Encrypted columns excluded from reads
 * unless explicitly requested (+passwordEncrypted etc.).
 */
const BaseRepository = require('./BaseRepository');
const { tradingAccounts } = require('../../../db/schema/trading');

class TradingAccountRepository extends BaseRepository {
  constructor() {
    super(tradingAccounts, {
      defaultExclude: ['password_encrypted', 'api_key_encrypted', 'api_secret_encrypted'],
    });
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findByUserAndPlatform(userId, platform, options = {}) {
    return this.findOne({ userId, platform }, options);
  }

  async findByIdAndUser(id, userId) {
    return this.findOne({ id, userId });
  }

  /** Mark account connected + update sync metadata */
  async markConnected(id, { balance, equity, currency, lastSync } = {}) {
    return this.update(id, {
      status: 'connected',
      balance,
      equity,
      currency,
      lastSync: lastSync || new Date(),
    });
  }

  async markDisconnected(id) {
    return this.update(id, { status: 'disconnected' });
  }

  async markInvalidCredentials(id) {
    return this.update(id, { status: 'invalid_credentials' });
  }
}

module.exports = new TradingAccountRepository();