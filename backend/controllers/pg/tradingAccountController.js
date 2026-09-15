/**
 * TradingAccountController — PostgreSQL edition.
 * Mirrors the Mongo tradingAccountController. req.user.id = UUID string.
 */
const TradingAccountService = require('../../services/pg/TradingAccountService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

// @desc    Connect a trading account
// @route   POST /api/v1/trading/accounts
// @access  Private
exports.connectAccount = catchAsync(async (req, res) => {
  const account = await TradingAccountService.connectAccount(req.user.id, req.body);
  res.status(201).json({ success: true, data: account });
});

// @desc    Get user's connected accounts
// @route   GET /api/v1/trading/accounts
// @access  Private
exports.getMyAccounts = catchAsync(async (req, res) => {
  const accounts = await TradingAccountService.getMyAccounts(req.user.id);
  res.status(200).json({ success: true, count: accounts.length, data: accounts });
});

// @desc    Disconnect/Delete a trading account
// @route   DELETE /api/v1/trading/accounts/:id
// @access  Private
exports.disconnectAccount = catchAsync(async (req, res) => {
  await TradingAccountService.disconnectAccount(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: {} });
});

// @desc    Sync account statistics (Online Dashboard)
// @route   POST /api/v1/trading/accounts/:id/sync
// @access  Private
exports.syncAccountStats = catchAsync(async (req, res) => {
  const stats = await TradingAccountService.syncAccountStats(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: stats });
});

module.exports = exports;