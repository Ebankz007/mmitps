const FundamentalService = require('../services/trading/FundamentalService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getCountryMacro = catchAsync(async (req, res) => {
    const data = await FundamentalService.getCountryMacro(req.params.country);
    res.status(200).json(new ApiResponse(true, data, `Macro data for ${req.params.country} retrieved`));
});

exports.getStrengthScores = catchAsync(async (req, res) => {
    const scores = await FundamentalService.getStrengthScores();
    res.status(200).json(new ApiResponse(true, scores, 'Currency strength scores retrieved'));
});

exports.getStrengthMatrix = catchAsync(async (req, res) => {
    const matrix = await FundamentalService.getStrengthMatrix();
    res.status(200).json(new ApiResponse(true, matrix, 'Fundamental strength matrix retrieved'));
});

exports.syncData = catchAsync(async (req, res) => {
    const result = await FundamentalService.syncData(req.body);
    res.status(200).json(new ApiResponse(true, result, 'Macro data synced successfully'));
});
