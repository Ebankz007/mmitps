const PendingWithdrawal = require('../models/Financial/PendingWithdrawal');
const WalletService = require('../services/financial/WalletService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Request a payout (withdrawal)
 */
exports.requestPayout = catchAsync(async (req, res) => {
    const { amount, currency, paymentMethod, destination } = req.body;

    // Check balance before creating request
    const balance = await WalletService.getBalance(req.user._id, currency);
    if (balance < amount) {
        throw ApiError.badRequest(`Insufficient ${currency} balance`);
    }

    const payout = await PendingWithdrawal.create({
        user: req.user._id,
        amount,
        currency,
        netAmount: amount, // Minus fees if applicable
        paymentMethod,
        destination,
        status: 'pending_approval'
    });

    res.status(201).json(new ApiResponse(true, payout, 'Payout request submitted successfully'));
});

/**
 * Get payout history for current user
 */
exports.getMyPayouts = catchAsync(async (req, res) => {
    const payouts = await PendingWithdrawal.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(true, payouts, 'Payout history retrieved'));
});

/**
 * Cancel a pending payout
 */
exports.cancelPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payout = await PendingWithdrawal.findOne({ _id: id, user: req.user._id, status: 'pending_approval' });

    if (!payout) {
        throw ApiError.notFound('Pending payout not found or already processed');
    }

    payout.status = 'cancelled';
    await payout.save();

    res.status(200).json(new ApiResponse(true, payout, 'Payout request cancelled'));
});
