const TransactionRepository = require('../../repositories/TransactionRepository');

class TransactionService {
    /**
     * Get transaction history for a user
     * @param {String} userId 
     * @param {Object} query - Pagination and filters
     * @returns {Promise<Array>}
     */
    async getUserTransactions(userId, query) {
        const { page = 1, limit = 10, type, status, startDate, endDate } = query;
        const filters = { user: userId };

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
