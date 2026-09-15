const WalletService = require('../services/financial/WalletService');
const { SystemConfig } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const ApiServiceManager = require('../services/ApiServiceManager');

exports.getActivePaymentMethods = catchAsync(async (req, res) => {
    const config = await ApiServiceManager.getConfig();
    const payments = config.payments || {};
    
    // Securely return only the active provider IDs/names. Absolutely no secret keys.
    const activeMethods = [];
    for (const [key, details] of Object.entries(payments)) {
        // Assume active unless explicitly marked inactive.
        if (details.status !== 'inactive') {
            activeMethods.push({
                id: key,
                name: key.charAt(0).toUpperCase() + key.slice(1)
            });
        }
    }

    res.status(200).json(new ApiResponse(true, activeMethods, 'Active payment methods retrieved securely'));
});

exports.getBalance = catchAsync(async (req, res) => {
    const { currency } = req.query;
    if (currency) {
        const balance = await WalletService.getBalance(req.user._id, currency);
        res.status(200).json(new ApiResponse(true, { currency: currency.toUpperCase(), balance }, 'Balance retrieved'));
    } else {
        const wallet = await WalletService.getWallet(req.user._id);
        res.status(200).json(new ApiResponse(true, wallet.balances, 'Balances retrieved'));
    }
});

exports.deposit = catchAsync(async (req, res) => {
    const { amount, currency, method } = req.body;
    const result = await WalletService.deposit(req.user._id, amount, currency, method);
    res.status(200).json(new ApiResponse(true, result, 'Deposit successful'));
});

exports.withdraw = catchAsync(async (req, res) => {
    const { amount, currency, details } = req.body;
    const transaction = await WalletService.withdraw(req.user._id, amount, currency, details);
    res.status(200).json(new ApiResponse(true, transaction, 'Withdrawal request submitted'));
});

exports.transfer = catchAsync(async (req, res) => {
    const { recipientEmail, amount, currency } = req.body;
    const transaction = await WalletService.transfer(req.user._id, recipientEmail, amount, currency);
    res.status(200).json(new ApiResponse(true, transaction, 'Transfer successful'));
});

// Admin Overrides
exports.getSupportedCurrencies = catchAsync(async (req, res) => {
    let config = await mongoose.model('SystemConfig').findOne({ key: 'supportedCurrencies' });
    if (!config) {
        // Create default list
        config = await mongoose.model('SystemConfig').create({
            key: 'supportedCurrencies',
            category: 'financial',
            value: [
                { symbol: 'USD', name: 'US Dollar', type: 'fiat', isActive: true },
                { symbol: 'EUR', name: 'Euro', type: 'fiat', isActive: true },
                { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', isActive: true },
                { symbol: 'ETH', name: 'Ethereum', type: 'crypto', isActive: true },
                { symbol: 'USDT', name: 'Tether (TRC-20)', type: 'crypto', isActive: true },
                { symbol: 'BONUS', name: 'Bonus Credits', type: 'credits', isActive: true }
            ]
        });
    }
    res.status(200).json(new ApiResponse(true, config.value, 'Supported currencies retrieved'));
});

exports.addSupportedCurrency = catchAsync(async (req, res) => {
    const { symbol, name, type, isActive } = req.body;
    let config = await mongoose.model('SystemConfig').findOne({ key: 'supportedCurrencies' });

    if (!config) {
        throw new ApiError(404, 'Supported currencies configuration missing. Fetch it once first to initialize.');
    }

    // Check if exists
    const existingIndex = config.value.findIndex(c => c.symbol === symbol.toUpperCase());
    if (existingIndex > -1) {
        // Update
        config.value[existingIndex] = { symbol: symbol.toUpperCase(), name, type, isActive };
    } else {
        // Add
        config.value.push({ symbol: symbol.toUpperCase(), name, type, isActive });
    }

    config.markModified('value');
    await config.save();
    res.status(200).json(new ApiResponse(true, config.value, 'Currency settings updated'));
});

exports.adminUpdateWallet = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { currency, amount, frozen } = req.body;

    if (!currency) throw new ApiError(400, 'Currency is required');

    // Mongoose raw update to overwrite specific balances explicitly for Admin control
    const Wallet = mongoose.model('Wallet');
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
        wallet = await Wallet.create({ user: userId, balances: [] });
    }

    const balanceIndex = wallet.balances.findIndex(b => b.currency === currency.toUpperCase());
    if (balanceIndex > -1) {
        if (amount !== undefined) wallet.balances[balanceIndex].amount = amount;
        if (frozen !== undefined) wallet.balances[balanceIndex].frozen = frozen;
    } else {
        wallet.balances.push({
            currency: currency.toUpperCase(),
            amount: amount || 0,
            frozen: frozen || 0
        });
    }

    await wallet.save();
    res.status(200).json(new ApiResponse(true, wallet.balances, 'Wallet updated by Admin'));
});

exports.getUserWallets = catchAsync(async (req, res) => {
    const Wallet = mongoose.model('Wallet');
    const wallets = await Wallet.find().populate('user', 'email firstName lastName role').lean();
    res.status(200).json(new ApiResponse(true, wallets, 'All user wallets retrieved'));
});
