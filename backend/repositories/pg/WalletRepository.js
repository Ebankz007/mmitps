/**
 * WalletRepository — PostgreSQL edition.
 * Balance operations use SELECT ... FOR UPDATE + JSONB array manipulation
 * within a transaction. This replaces Mongo's atomic $inc on nested subdocs.
 */
const { pool } = require('../../../db');
const { wallets } = require('../../../db/schema/financial');
const { eq } = require('drizzle-orm');
const ApiError = require('../../utils/ApiError');

function toCamel(row) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id,
    balances: row.balances,
    isActive: row.is_active,
    settings: row.settings,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class WalletRepository {
  /** Find wallet by user ID, create if not exists (within a lock if within tx) */
  async findByUserId(userId) {
    const { db } = require('../../../db');
    const rows = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    if (rows.length) return toCamel(rows[0]);

    // Create wallet with initial USD balance
    const created = await db.insert(wallets).values({
      userId,
      balances: [{ currency: 'USD', amount: 0, frozen: 0 }],
      isActive: true,
      settings: { defaultCurrency: 'USD', autoConvert: false },
    }).returning();
    return toCamel(created[0]);
  }

  /** Find-or-create + update balance (atomic via FOR UPDATE) */
  async updateBalance(userId, currency, amount) {
    currency = currency.toUpperCase();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Lock the wallet row (find or create)
      const { rows } = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      let wallet;
      if (rows.length) {
        wallet = rows[0];
      } else {
        const ins = await client.query(
          `INSERT INTO wallets (user_id, balances, is_active, settings)
           VALUES ($1, $2, true, '{"defaultCurrency":"USD","autoConvert":false}')
           RETURNING *`,
          [userId, JSON.stringify([{ currency: 'USD', amount: 0, frozen: 0 }])]
        );
        wallet = ins.rows[0];
      }

      const balances = wallet.balances || [];
      const idx = balances.findIndex((b) => b.currency === currency);

      if (idx >= 0) {
        balances[idx].amount += amount;
        if (balances[idx].amount < 0) {
          throw new ApiError(400, `Insufficient ${currency} balance`);
        }
      } else if (amount > 0) {
        balances.push({ currency, amount, frozen: 0 });
      } else {
        throw new ApiError(400, `Insufficient funds or no ${currency} balance`);
      }

      await client.query(
        'UPDATE wallets SET balances = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(balances), wallet.id]
      );
      await client.query('COMMIT');

      // Re-read to get the final state with camelCase transform
      const result = await this.findByUserId(userId);
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /** Freeze funds: move amount from available to frozen */
  async freezeFunds(userId, currency, amount) {
    currency = currency.toUpperCase();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      if (!rows.length) throw ApiError.notFound('Wallet not found');

      const balances = rows[0].balances || [];
      const entry = balances.find((b) => b.currency === currency);
      if (!entry || entry.amount < amount) {
        throw new ApiError(400, `Insufficient available ${currency}`);
      }
      entry.amount -= amount;
      entry.frozen = (entry.frozen || 0) + amount;

      await client.query(
        'UPDATE wallets SET balances = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(balances), rows[0].id]
      );
      await client.query('COMMIT');
      return this.findByUserId(userId);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /** Unfreeze funds: move amount from frozen back to available */
  async unfreezeFunds(userId, currency, amount) {
    currency = currency.toUpperCase();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      if (!rows.length) throw ApiError.notFound('Wallet not found');

      const balances = rows[0].balances || [];
      const entry = balances.find((b) => b.currency === currency);
      if (!entry || (entry.frozen || 0) < amount) {
        throw new ApiError(400, `Insufficient frozen ${currency}`);
      }
      entry.amount += amount;
      entry.frozen -= amount;

      await client.query(
        'UPDATE wallets SET balances = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(balances), rows[0].id]
      );
      await client.query('COMMIT');
      return this.findByUserId(userId);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new WalletRepository();