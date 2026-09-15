/**
 * PayoutController — PostgreSQL edition.
 */
const PendingWithdrawalRepository = require('../../repositories/pg/PendingWithdrawalRepository');
const WalletService = require('../../services/pg/WalletService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/**
 * Request a payout (withdrawal)
 */
exports.requestPayout = catchAsync(async (req, res) => {
    const { amount, currency, paymentMethod, destination } = req.body;

    // Check balance before creating request
    const balance = await WalletService.getBalance(req.user.id, currency);
    if (balance < amount) {
        throw ApiError.badRequest(`Insufficient ${currency} balance`);
    }

    const payout = await PendingWithdrawalRepository.create({
        userId: req.user.id,
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
    const payouts = await PendingWithdrawalRepository.findByUserId(req.user.id, {
        sort: 'createdAt',
        direction: 'desc'
    });
    res.status(200).json(new ApiResponse(true, payouts, 'Payout history retrieved'));
});

/**
 * Cancel a pending payout
 */
exports.cancelPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payout = await PendingWithdrawalRepository.findOne({
        id,
        userId: req.user.id,
        status: 'pending_approval'
    });

    if (!payout) {
        throw ApiError.notFound('Pending payout not found or already processed');
    }

    const cancelled = await PendingWithdrawalRepository.markCancelled(id);
    res.status(200).json(new ApiResponse(true, cancelled, 'Payout request cancelled'));
});