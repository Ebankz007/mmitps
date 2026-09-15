/**
 * WalletService — PostgreSQL edition.
 * Mirrors the Mongo WalletService interface (getWallet/getBalance/deposit/withdraw/transfer)
 * so controllers are drop-in. Field mapping: user → userId, relatedUser → relatedUserId,
 * _id → id. Balances are plain objects (no Mongoose document methods).
 */
const WalletRepository = require('../../repositories/pg/WalletRepository');
const TransactionRepository = require('../../repositories/pg/TransactionRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');

class WalletService {
  /** Get or create wallet for user */
  async getWallet(userId) {
    return WalletRepository.findByUserId(userId);
  }

  /** Get specific currency balance */
  async getBalance(userId, currency) {
    const wallet = await this.getWallet(userId);
    if (!wallet) return 0;
    const balanceObj = (wallet.balances || []).find((b) => b.currency === currency.toUpperCase());
    return balanceObj ? balanceObj.amount : 0;
  }

  /** Process a deposit (simulated for MVP, usually triggered by webhook) */
  async deposit(userId, amount, currency, method = 'manual', reference = null) {
    if (amount <= 0) throw new ApiError(400, 'Amount must be positive');
    currency = currency.toUpperCase();

    // Ensure wallet exists
    await this.getWallet(userId);

    // 1. Create Transaction
    const transaction = await TransactionRepository.create({
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'completed',
      paymentMethod: method,
      reference: reference || `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: `Deposit of ${amount} ${currency}`,
      completedAt: new Date(),
    });

    // 2. Update Wallet
    const wallet = await WalletRepository.updateBalance(userId, currency, amount);

    return { transaction, wallet };
  }

  /** Process a withdrawal request */
  async withdraw(userId, amount, currency, details) {
    if (amount <= 0) throw new ApiError(400, 'Invalid amount');
    currency = currency.toUpperCase();

    const wallet = await this.getWallet(userId);
    const bal = (wallet.balances || []).find((b) => b.currency === currency);
    if (!bal || bal.amount < amount) {
      throw new ApiError(400, 'Insufficient funds');
    }

    // Freeze funds
    await WalletRepository.freezeFunds(userId, currency, amount);

    // Create Transaction
    const transaction = await TransactionRepository.create({
      userId,
      type: 'withdrawal',
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'manual',
      paymentDetails: details,
      reference: `WTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: `Withdrawal request of ${amount} ${currency}`,
    });

    return transaction;
  }

  /** Transfer funds between users */
  async transfer(senderId, recipientEmail, amount, currency) {
    if (amount <= 0) throw new ApiError(400, 'Invalid amount');
    currency = currency.toUpperCase();

    const senderWallet = await this.getWallet(senderId);
    const bal = (senderWallet.balances || []).find((b) => b.currency === currency);
    if (!bal || bal.amount < amount) {
      throw new ApiError(400, 'Insufficient funds');
    }

    const recipient = await UserRepository.findByEmail(recipientEmail);
    if (!recipient) throw new ApiError(404, 'Recipient not found');

    // Deduct from Sender
    await WalletRepository.updateBalance(senderId, currency, -amount);

    // Add to Recipient (ensure wallet exists)
    await this.getWallet(recipient.id);
    await WalletRepository.updateBalance(recipient.id, currency, amount);

    const ref = `TRF-${Date.now()}`;

    // Create Transactions
    const senderTx = await TransactionRepository.create({
      userId: senderId,
      type: 'transfer_out',
      amount,
      currency,
      status: 'completed',
      relatedUserId: recipient.id,
      reference: `${ref}-OUT`,
      description: `Transfer to ${recipientEmail}`,
      completedAt: new Date(),
    });

    await TransactionRepository.create({
      userId: recipient.id,
      type: 'transfer_in',
      amount,
      currency,
      status: 'completed',
      relatedUserId: senderId,
      reference: `${ref}-IN`,
      description: 'Transfer from user',
      completedAt: new Date(),
    });

    return senderTx;
  }
}

module.exports = new WalletService();