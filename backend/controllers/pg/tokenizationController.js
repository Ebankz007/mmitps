/**
 * TokenizationController — PostgreSQL edition.
 */
const TokenPoolService = require('../../services/pg/TokenPoolService');
const InvestmentService = require('../../services/pg/InvestmentService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

// Pool Management
exports.createPool = catchAsync(async (req, res) => {
    const pool = await TokenPoolService.createPool(req.body);
    res.status(201).json(new ApiResponse(true, pool, 'Token Pool created'));
});

exports.getActivePools = catchAsync(async (req, res) => {
    const pools = await TokenPoolService.getActivePools();
    res.status(200).json(new ApiResponse(true, pools, 'Active pools retrieved'));
});

exports.getPool = catchAsync(async (req, res) => {
    const pool = await TokenPoolService.getPool(req.params.id);
    res.status(200).json(new ApiResponse(true, pool, 'Pool details retrieved'));
});

// Investments
exports.invest = catchAsync(async (req, res) => {
    const { poolId, amount } = req.body;
    const investment = await InvestmentService.invest(req.user.id, poolId, amount);
    res.status(200).json(new ApiResponse(true, investment, 'Investment successful'));
});

exports.getMyInvestments = catchAsync(async (req, res) => {
    const investments = await InvestmentService.getUserInvestments(req.user.id);
    res.status(200).json(new ApiResponse(true, investments, 'User investments retrieved'));
});

exports.getPoolsByCategory = catchAsync(async (req, res) => {
    const { category } = req.params;
    const pools = await TokenPoolService.getPoolsByCategory(category);
    res.status(200).json(new ApiResponse(true, pools, `Active ${category} pools retrieved`));
});