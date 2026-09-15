/**
 * TransactionController — PostgreSQL edition.
 * req.user comes from middleware/pg/auth.js (id = UUID string).
 */
const TransactionService = require('../../services/pg/TransactionService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getHistory = catchAsync(async (req, res) => {
  const transactions = await TransactionService.getUserTransactions(req.user.id, req.query);
  res.status(200).json(new ApiResponse(true, transactions, 'Transaction history retrieved'));
});

exports.getTransaction = catchAsync(async (req, res) => {
  const transaction = await TransactionService.getTransactionById(req.params.id);
  if (!transaction || transaction.userId !== req.user.id) {
    throw new ApiError(404, 'Transaction not found');
  }
  res.status(200).json(new ApiResponse(true, transaction, 'Transaction details retrieved'));
});