const AnalyticsService = require('../services/admin/AnalyticsService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getOverview = catchAsync(async (req, res) => {
    const stats = await AnalyticsService.getOverview();
    res.status(200).json(new ApiResponse(true, stats, 'Analytics overview retrieved'));
});

exports.getUserStats = catchAsync(async (req, res) => {
    const stats = await AnalyticsService.getUserStats();
    res.status(200).json(new ApiResponse(true, stats, 'User analytics retrieved'));
});

exports.getTradingStats = catchAsync(async (req, res) => {
    const stats = await AnalyticsService.getTradingStats();
    res.status(200).json(new ApiResponse(true, stats, 'Trading analytics retrieved'));
});
