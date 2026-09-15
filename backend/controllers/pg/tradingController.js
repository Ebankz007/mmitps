/**
 * TradingController — PostgreSQL edition.
 * Signals + Copy Trading. Mirrors the Mongo tradingController.
 * req.user comes from middleware/pg/auth.js (camelCase, id = UUID string).
 */
const SignalService = require('../../services/pg/SignalService');
const TradingService = require('../../services/pg/TradingService');
const SettlementService = require('../../services/pg/SettlementService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

// Signal Management
exports.createSignal = catchAsync(async (req, res) => {
  const signal = await SignalService.createSignal(req.user.id, req.body);
  res.status(201).json(new ApiResponse(true, signal, 'Signal created successfully'));
});

exports.getActiveSignals = catchAsync(async (req, res) => {
  const signals = await SignalService.getActiveSignals();
  res.status(200).json(new ApiResponse(true, signals, 'Active signals retrieved'));
});

exports.closeSignal = catchAsync(async (req, res) => {
  const signal = await SignalService.closeSignal(req.params.id, req.user.id, req.body);
  res.status(200).json(new ApiResponse(true, signal, 'Signal closed successfully'));
});

// Copy Trading
exports.followProvider = catchAsync(async (req, res) => {
  const { providerId, amount } = req.body;
  const subscription = await TradingService.followProvider(req.user.id, providerId, amount);
  res.status(200).json(new ApiResponse(true, subscription, 'Now following provider'));
});

exports.getMySubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await TradingService.getFollowerSubscriptions(req.user.id);
  res.status(200).json(new ApiResponse(true, subscriptions, 'Subscriptions retrieved'));
});

exports.getProviderFollowers = catchAsync(async (req, res) => {
  const followers = await TradingService.getProviderFollowers(req.user.id);
  res.status(200).json(new ApiResponse(true, followers, 'Followers retrieved'));
});

exports.settleCommission = catchAsync(async (req, res) => {
  const { subscriptionId } = req.params;
  const result = await SettlementService.settleCommission(subscriptionId, req.user.id);
  res.status(200).json(new ApiResponse(true, result, 'Commission settled successfully via internal wallet'));
});

exports.confirmSettlementReceipt = catchAsync(async (req, res) => {
  const { subscriptionId } = req.params;
  const result = await SettlementService.confirmReceipt(subscriptionId, req.user.id);
  res.status(200).json(new ApiResponse(true, result, 'Settlement confirmed. Account reactivated'));
});

// ─── AI Analysis & Risk (mock services on PG ApiServiceManager) ──────────────

exports.analyzeSymbol = catchAsync(async (req, res) => {
  const AIAnalystService = require('../../services/trading/AIAnalystService');
  const { symbol } = req.params;
  const analysis = await AIAnalystService.getMarketAnalysis(symbol);
  res.status(200).json(new ApiResponse(true, analysis, `AI Analysis for ${symbol} retrieved`));
});

exports.getRiskAdvice = catchAsync(async (req, res) => {
  const AIAnalystService = require('../../services/trading/AIAnalystService');
  const advice = await AIAnalystService.getTradeControl(req.user.id);
  res.status(200).json(new ApiResponse(true, advice, 'AI Risk advice retrieved'));
});

module.exports = exports;