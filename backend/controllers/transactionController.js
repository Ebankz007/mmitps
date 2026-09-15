const TransactionService = require('../services/financial/TransactionService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getHistory = catchAsync(async (req, res) => {
    const transactions = await TransactionService.getUserTransactions(req.user._id, req.query);
    res.status(200).json(new ApiResponse(true, transactions, 'Transaction history retrieved'));
});

exports.getTransaction = catchAsync(async (req, res) => {
    const transaction = await TransactionService.getTransactionById(req.params.id);
    if (!transaction || transaction.user.toString() !== req.user._id.toString()) {
        throw new ApiError(404, 'Transaction not found');
    }
    res.status(200).json(new ApiResponse(true, transaction, 'Transaction details retrieved'));
});
