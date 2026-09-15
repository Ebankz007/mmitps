/**
 * TradeJournalController — PostgreSQL edition.
 * Mirrors the Mongo TradeJournalController. req.user.id = UUID string.
 */
const TradeJournalService = require('../../services/pg/TradeJournalService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

exports.getMyJournal = catchAsync(async (req, res) => {
  const journal = await TradeJournalService.getMyJournal(req.user.id);
  res.status(200).json(new ApiResponse(true, journal, 'Trade journal retrieved successfully'));
});

exports.getJournalStats = catchAsync(async (req, res) => {
  const stats = await TradeJournalService.getJournalStats(req.user.id);
  res.status(200).json(new ApiResponse(true, stats, 'Journal statistics retrieved successfully'));
});

exports.addTrade = catchAsync(async (req, res) => {
  const trade = await TradeJournalService.addTrade(req.user.id, req.body);
  res.status(201).json(new ApiResponse(true, trade, 'Trade added to journal'));
});

exports.updateTrade = catchAsync(async (req, res) => {
  const trade = await TradeJournalService.updateTrade(req.user.id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(true, trade, 'Trade updated successfully'));
});

module.exports = exports;