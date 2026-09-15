const WalletRepository = require('../../repositories/WalletRepository');
const TransactionRepository = require('../../repositories/TransactionRepository');
const UserRepository = require('../../repositories/UserRepository');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');

class WalletService {
    /**
     * Get or create wallet for user
     * @param {String} userId 
     * @returns {Promise<Document>}
     */
    async getWallet(userId) {
        return WalletRepository.findByUserId(userId);
    }

    /**
     * Get specific currency balance
     * @param {String} userId 
     * @param {String} currency 
     * @returns {Promise<Number>}
     */
    async getBalance(userId, currency) {
        const wallet = await this.getWallet(userId);
        if (!wallet) return 0;
        
        // If it's a mongoose document, use the method. If it's a lean object, find manually.
        if (typeof wallet.getBalance === 'function') {
            return wallet.getBalance(currency);
        }

        const balanceObj = wallet.balances.find(b => b.currency === currency.toUpperCase());
        return balanceObj ? balanceObj.amount : 0;
    }

    /**
     * Process a deposit (Simulated for MVP, usually triggered by webhook)
     * @param {String} userId 
     * @param {Number} amount 
     * @param {String} currency 
     * @param {String} method 
     * @returns {Promise<Object>} { transaction, wallet }
     */
    async deposit(userId, amount, currency, method = 'manual', reference = null) {
        if (amount <= 0) throw new ApiError(400, 'Amount must be positive');

        currency = currency.toUpperCase();
        // Start session for atomicity if on Replica Set, otherwise standard await
        // const session = await mongoose.startSession();
        // session.startTransaction();

        try {
            // Ensure wallet exists
            await this.getWallet(userId);

            // 1. Create Transaction
            const transaction = await TransactionRepository.create({
                user: userId,
                type: 'deposit',
                amount: amount,
                currency: currency,
                status: 'completed',
                paymentMethod: method,
                reference: reference || `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                description: `Deposit of ${amount} ${currency}`
            });

            // 2. Update Wallet
            const wallet = await WalletRepository.updateBalance(userId, currency, amount);

            // await session.commitTransaction();
            return { transaction, wallet };
        } catch (error) {
            // await session.abortTransaction();
            throw error;
        } finally {
            // session.endSession();
        }
    }

    /**
     * Process a withdrawal request
     * @param {String} userId 
     * @param {Number} amount 
     * @param {String} currency 
     * @param {Object} details 
     * @returns {Promise<Object>}
     */
    async withdraw(userId, amount, currency, details) {
        if (amount <= 0) throw new ApiError(400, 'Invalid amount');
        currency = currency.toUpperCase();

        const wallet = await this.getWallet(userId);
        if (!wallet.hasSufficientFunds(amount, currency)) {
            throw new ApiError(400, 'Insufficient funds');
        }

        // Freeze funds
        await WalletRepository.freezeFunds(userId, currency, amount);

        // Create Transaction
        const transaction = await TransactionRepository.create({
            user: userId,
            type: 'withdrawal',
            amount: amount,
            currency: currency,
            status: 'pending',
            paymentMethod: 'manual', // or specific method
            paymentDetails: details,
            reference: `WTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            description: `Withdrawal request of ${amount} ${currency}`
        });

        return transaction;
    }

    /**
     * Transfer funds between users
     * @param {String} senderId 
     * @param {String} recipientEmail 
     * @param {Number} amount 
     * @param {String} currency 
     * @returns {Promise<Object>}
     */
    async transfer(senderId, recipientEmail, amount, currency) {
        if (amount <= 0) throw new ApiError(400, 'Invalid amount');
        currency = currency.toUpperCase();

        const senderWallet = await this.getWallet(senderId);
        if (!senderWallet.hasSufficientFunds(amount, currency)) {
            throw new ApiError(400, 'Insufficient funds');
        }

        const recipient = await UserRepository.findByEmail(recipientEmail);
        if (!recipient) throw new ApiError(404, 'Recipient not found');

        // Deduct from Sender
        await WalletRepository.updateBalance(senderId, currency, -amount);

        // Add to Recipient
        // Ensure recipient wallet exists
        await this.getWallet(recipient._id);
        await WalletRepository.updateBalance(recipient._id, currency, amount);

        const ref = `TRF-${Date.now()}`;

        // Create Transactions
        const senderTx = await TransactionRepository.create({
            user: senderId,
            type: 'transfer_out',
            amount: amount,
            currency: currency,
            status: 'completed',
            relatedUser: recipient._id,
            reference: `${ref}-OUT`,
            description: `Transfer to ${recipientEmail}`
        });

        await TransactionRepository.create({
            user: recipient._id,
            type: 'transfer_in',
            amount: amount,
            currency: currency,
            status: 'completed',
            relatedUser: senderId,
            reference: `${ref}-IN`,
            description: `Transfer from user`
        });

        return senderTx;
    }
}

module.exports = new WalletService();
