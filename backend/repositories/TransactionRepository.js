const BaseRepository = require('./BaseRepository');
const Transaction = require('../models/Financial/Transaction');

class TransactionRepository extends BaseRepository {
    constructor() {
        super(Transaction);
    }

    /**
     * Find transactions by user
     * @param {String} userId 
     * @param {Object} options 
     * @returns {Promise<Array>}
     */
    async findByUserId(userId, options = {}) {
        return this.findAll({ user: userId }, options);
    }

    async findByReference(reference) {
        return this.findOne({ reference });
    }
}

module.exports = new TransactionRepository();
