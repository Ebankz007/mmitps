/**
 * TransactionRepository — PostgreSQL edition.
 * Same interface as the Mongo version (findByUserId, findByReference) plus
 * status-transition helpers used by withdrawal/payment flows.
 */
const BaseRepository = require('./BaseRepository');
const { transactions } = require('../../../db/schema/financial');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class TransactionRepository extends BaseRepository {
  constructor() {
    super(transactions, {
      relations: {
        user: { table: users, on: eq(transactions.userId, users.id) },
      },
    });
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findByReference(reference) {
    return this.findOne({ reference });
  }

  /** Active (non-terminal) transactions for a user */
  async findActiveByUser(userId, options = {}) {
    return this.findAll({ userId, status: { $in: ['pending', 'processing'] } }, options);
  }

  /** Mark a transaction completed */
  async markCompleted(id, extra = {}) {
    return this.update(id, { status: 'completed', completedAt: new Date(), ...extra });
  }

  /** Mark a transaction failed */
  async markFailed(id, extra = {}) {
    return this.update(id, { status: 'failed', failedAt: new Date(), ...extra });
  }

  /** Mark a transaction cancelled */
  async markCancelled(id, extra = {}) {
    return this.update(id, { status: 'cancelled', cancelledAt: new Date(), ...extra });
  }

  /** Balance snapshot for a user (latest first) */
  async balanceHistory(userId, limit = 20) {
    return this.findAll({ userId }, { sort: '-createdAt', limit });
  }
}

module.exports = new TransactionRepository();