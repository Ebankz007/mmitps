const VPSService = require('../services/trading/VPSService');
const LiveStreamService = require('../services/trading/LiveStreamService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getVPSStatus = catchAsync(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const status = await VPSService.getVPSStatus(userId);
    res.status(200).json(new ApiResponse(true, status));
});

exports.purchaseVPS = catchAsync(async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.id || req.user._id;
    const result = await VPSService.purchaseVPS(userId, planId);
    res.status(200).json(new ApiResponse(true, result, 'VPS purchase initiated'));
});

exports.getLiveStreams = catchAsync(async (req, res) => {
    const streams = await LiveStreamService.getActiveStreams();
    res.status(200).json(new ApiResponse(true, streams));
});
