const BaseRepository = require('./BaseRepository');
const Wallet = require('../models/Financial/Wallet');
const ApiError = require('../utils/ApiError');

class WalletRepository extends BaseRepository {
    constructor() {
        super(Wallet);
    }

    /**
     * Find wallet by user ID, create if not exists
     * @param {String} userId 
     * @returns {Promise<Document>}
     */
    async findByUserId(userId) {
        let wallet = await this.model.findOne({ user: userId });
        if (!wallet) {
            wallet = await this.create({ user: userId, balances: [{ currency: 'USD', amount: 0 }] });
        }
        return wallet;
    }

    /**
     * Atomically increment/decrement balance
     * @param {String} userId 
     * @param {String} currency 
     * @param {Number} amount (positive to credit, negative to debit)
     * @param {Object} session (optional mongoose session)
     * @returns {Promise<Document>}
     */
    async updateBalance(userId, currency, amount, session = null) {
        currency = currency.toUpperCase();

        // 1. Try to update existing currency entry
        let result = await this.model.findOneAndUpdate(
            {
                user: userId,
                "balances.currency": currency
            },
            {
                $inc: { "balances.$.amount": amount }
            },
            {
                new: true,
                session,
                runValidators: true
            }
        );

        // 2. If currency doesn't exist in array, push new entry (only if crediting)
        if (!result && amount > 0) {
            result = await this.model.findOneAndUpdate(
                { user: userId },
                {
                    $push: {
                        balances: { currency, amount }
                    }
                },
                { new: true, session }
            );
        } else if (!result && amount < 0) {
            throw new ApiError(400, `Insufficient funds or currency generic error for ${currency}`);
        }

        // Validate non-negative balance (double check, though schema min:0 handles it mostly)
        // Schema validation runs on save/update, so $inc to negative should error out if schema has min:0

        return result;
    }

    async freezeFunds(userId, currency, amount, session = null) {
        return this.model.findOneAndUpdate(
            { user: userId, "balances.currency": currency.toUpperCase() },
            {
                $inc: {
                    "balances.$.amount": -amount,
                    "balances.$.frozen": amount
                }
            },
            { new: true, session, runValidators: true }
        );
    }

    async unfreezeFunds(userId, currency, amount, session = null) {
        return this.model.findOneAndUpdate(
            { user: userId, "balances.currency": currency.toUpperCase() },
            {
                $inc: {
                    "balances.$.amount": amount,
                    "balances.$.frozen": -amount
                }
            },
            { new: true, session, runValidators: true }
        );
    }
}

module.exports = new WalletRepository();
