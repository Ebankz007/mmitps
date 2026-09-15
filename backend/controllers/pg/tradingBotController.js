/**
 * TradingBotController — PostgreSQL edition.
 * Mirrors the Mongo tradingBotController. req.user.id = UUID string.
 */
const TradingBotService = require('../../services/pg/TradingBotService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

exports.createBot = catchAsync(async (req, res) => {
  const bot = await TradingBotService.createBot(req.user.id, req.body);
  res.status(201).json(new ApiResponse(true, bot, 'Trading bot created successfully'));
});

exports.getMyBots = catchAsync(async (req, res) => {
  const bots = await TradingBotService.getUserBots(req.user.id);
  res.status(200).json(new ApiResponse(true, bots, 'Bots retrieved'));
});

exports.updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const bot = await TradingBotService.updateStatus(id, req.user.id, status);
  res.status(200).json(new ApiResponse(true, bot, `Bot status updated to ${status}`));
});

module.exports = exports;