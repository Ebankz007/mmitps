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

/** Create a wallet row on the given client (used inside a transaction) */
async function createWallet(client, userId) {
  const ins = await client.query(
    `INSERT INTO wallets (user_id, balances, is_active, settings)
     VALUES ($1, $2, true, '{"defaultCurrency":"USD","autoConvert":false}')
     RETURNING *`,
    [userId, JSON.stringify([{ currency: 'USD', amount: 0, frozen: 0 }])]
  );
  return ins.rows[0];
}

/** Map a raw transactions row to the camelCase shape controllers expect */
function toCamelTx(row) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    category: row.category,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    amountUSD: row.amount_usd != null ? Number(row.amount_usd) : null,
    exchangeRate: row.exchange_rate != null ? Number(row.exchange_rate) : null,
    fee: row.fee != null ? Number(row.fee) : 0,
    feeType: row.fee_type,
    feeCurrency: row.fee_currency,
    netAmount: row.net_amount != null ? Number(row.net_amount) : null,
    paymentMethod: row.payment_method,
    paymentProvider: row.payment_provider,
    paymentDetails: row.payment_details,
    crypto: row.crypto,
    bank: row.bank,
    reference: row.reference,
    externalReference: row.external_reference,
    relatedUserId: row.related_user_id,
    relatedTransactionId: row.related_transaction_id,
    mlmCommissionId: row.mlm_commission_id,
    balanceBefore: row.balance_before != null ? Number(row.balance_before) : null,
    balanceAfter: row.balance_after != null ? Number(row.balance_after) : null,
    description: row.description,
    notes: row.notes,
    metadata: row.metadata,
    processedAt: row.processed_at,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

  /** Transfer funds between users — single atomic transaction.
   *  Locks BOTH wallet rows FOR UPDATE, applies balance changes and both
   *  transaction records on one client, so a crash or concurrent request
   *  can never split the operation (money cannot vanish between commits).
   */
  async transfer(senderId, recipientEmail, amount, currency) {
    if (amount <= 0) throw new ApiError(400, 'Invalid amount');
    currency = currency.toUpperCase();

    const recipient = await UserRepository.findByEmail(recipientEmail);
    if (!recipient) throw new ApiError(404, 'Recipient not found');
    if (recipient.id === senderId) {
      throw new ApiError(400, 'Cannot transfer to yourself');
    }

    const { pool } = require('../../../db');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock sender wallet (find or create)
      const senderRes = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [senderId]
      );
      const senderWallet = senderRes.rows[0] || (await createWallet(client, senderId));

      const senderBalances = senderWallet.balances || [];
      const senderEntry = senderBalances.find((b) => b.currency === currency);
      if (!senderEntry || senderEntry.amount < amount) {
        throw new ApiError(400, 'Insufficient funds');
      }

      // Lock recipient wallet (find or create)
      const recipRes = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [recipient.id]
      );
      const recipWallet = recipRes.rows[0] || (await createWallet(client, recipient.id));

      const recipBalances = recipWallet.balances || [];
      let recipEntry = recipBalances.find((b) => b.currency === currency);
      if (!recipEntry) {
        recipEntry = { currency, amount: 0, frozen: 0 };
        recipBalances.push(recipEntry);
      }

      const senderBefore = senderEntry.amount;
      const recipBefore = recipEntry.amount;

      // Apply balance changes
      senderEntry.amount -= amount;
      recipEntry.amount += amount;

      await client.query(
        'UPDATE wallets SET balances = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(senderBalances), senderWallet.id]
      );
      await client.query(
        'UPDATE wallets SET balances = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(recipBalances), recipWallet.id]
      );

      // Record both sides
      const ref = `TRF-${Date.now()}`;
      const now = new Date();

      const senderTxRes = await client.query(
        `INSERT INTO transactions
           (user_id, type, category, status, amount, currency, reference,
            related_user_id, description, balance_before, balance_after, completed_at)
         VALUES ($1, 'transfer_out', 'wallet', 'completed', $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [senderId, amount, currency, `${ref}-OUT`, recipient.id,
         `Transfer to ${recipientEmail}`, senderBefore, senderEntry.amount, now]
      );

      await client.query(
        `INSERT INTO transactions
           (user_id, type, category, status, amount, currency, reference,
            related_user_id, description, balance_before, balance_after, completed_at)
         VALUES ($1, 'transfer_in', 'wallet', 'completed', $2, $3, $4, $5, $6, $7, $8, $9)`,
        [recipient.id, amount, currency, `${ref}-IN`, senderId,
         'Transfer from user', recipBefore, recipEntry.amount, now]
      );

      await client.query('COMMIT');

      // Re-read through the repository for the camelCase contract
      const tx = await TransactionRepository.findByReference(`${ref}-OUT`);
      return tx || toCamelTx(senderTxRes.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new WalletService();