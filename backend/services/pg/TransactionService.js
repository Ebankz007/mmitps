/**
 * TransactionService — PostgreSQL edition.
 * Mirrors the Mongo TransactionService interface.
 */
const TransactionRepository = require('../../repositories/pg/TransactionRepository');

class TransactionService {
  /** Get transaction history for a user (pagination + filters) */
  async getUserTransactions(userId, query) {
    const { page = 1, limit = 10, type, status, startDate, endDate } = query;
    const filters = { userId };

    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    return TransactionRepository.findAll(filters, { page, limit, sort: '-createdAt' });
  }

  async getTransactionById(id) {
    return TransactionRepository.findById(id);
  }
}

module.exports = new TransactionService();