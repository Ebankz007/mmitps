const AnalysisService = require('../services/trading/AnalysisService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.createAnalysis = catchAsync(async (req, res) => {
    const analysis = await AnalysisService.createAnalysis(req.user._id, req.body);
    res.status(201).json(new ApiResponse(true, analysis, 'Analysis created successfully'));
});

exports.getActiveAnalysis = catchAsync(async (req, res) => {
    const analysis = await AnalysisService.getActiveAnalysis();
    res.status(200).json(new ApiResponse(true, analysis, 'Active analysis retrieved'));
});

exports.getAnalysisByPair = catchAsync(async (req, res) => {
    const analysis = await AnalysisService.getAnalysisByPair(req.params.pair);
    res.status(200).json(new ApiResponse(true, analysis, 'Analysis for pair retrieved'));
});

exports.deleteAnalysis = catchAsync(async (req, res) => {
    await AnalysisService.deleteAnalysis(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(true, null, 'Analysis deleted successfully'));
});
