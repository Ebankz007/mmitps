/**
 * TradingAccountService — PostgreSQL edition.
 * Mirrors the Mongo tradingAccountController logic. Credentials are encrypted
 * with the shared crypto util (AES-256-CBC, iv:payload format) and stored in
 * passwordEncrypted/apiKeyEncrypted/apiSecretEncrypted. Encrypted columns are
 * excluded from reads by default (TradingAccountRepository.defaultExclude).
 */
const TradingAccountRepository = require('../../repositories/pg/TradingAccountRepository');
const { encrypt } = require('../../utils/crypto');
const ApiError = require('../../utils/ApiError');

class TradingAccountService {
  async connectAccount(userId, body) {
    const { platform, accountNumber, password, apiKey, apiSecret, server, broker, accountName } = body;
    if (!platform || !accountNumber) {
      throw new ApiError(400, 'Platform and account number are required');
    }

    // Check if account already exists for this user/platform
    const existing = await TradingAccountRepository.findByUserAndPlatform(userId, platform);
    if (existing && existing.accountNumber === accountNumber) {
      throw new ApiError(400, 'Account already connected');
    }

    const accountData = {
      userId,
      platform,
      accountNumber,
      server,
      broker,
      accountName: accountName || `${platform.toUpperCase()} Account`,
      status: 'connected', // Mocking successful connection for now
    };

    if (password) accountData.passwordEncrypted = encrypt(password);
    if (apiKey) accountData.apiKeyEncrypted = encrypt(apiKey);
    if (apiSecret) accountData.apiSecretEncrypted = encrypt(apiSecret);

    return TradingAccountRepository.create(accountData);
  }

  async getMyAccounts(userId) {
    return TradingAccountRepository.findByUserId(userId);
  }

  async disconnectAccount(userId, accountId) {
    const account = await TradingAccountRepository.findByIdAndUser(accountId, userId);
    if (!account) {
      throw new ApiError(404, 'Account not found or unauthorized');
    }
    await TradingAccountRepository.markDisconnected(accountId);
    return { success: true };
  }

  async syncAccountStats(userId, accountId) {
    const account = await TradingAccountRepository.findByIdAndUser(accountId, userId);
    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    // Mocking an "Online Sync" from the broker/platform
    // In a real scenario, this would call an external API or use a socket
    const mockPnL = (Math.random() * 200) - 50; // Random gain/loss

    const prevStats = account.stats || {};
    const stats = {
      balance: (prevStats.balance || 5000) + mockPnL,
      equity: (prevStats.equity || 5000) + mockPnL - 10, // spread/commissions
      dayPnL: mockPnL,
      totalPnL: (prevStats.totalPnL || 0) + mockPnL,
      lastSyncedAt: new Date(),
    };

    await TradingAccountRepository.update(accountId, { stats });
    return stats;
  }
}

module.exports = new TradingAccountService();