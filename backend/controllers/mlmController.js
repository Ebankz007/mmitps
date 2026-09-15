const GenealogyService = require('../services/mlm/GenealogyService');
const CommissionService = require('../services/mlm/CommissionService');
const RankService = require('../services/mlm/RankService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getBinaryTree = catchAsync(async (req, res) => {
    const tree = await GenealogyService.getBinaryTree(req.user._id);
    res.status(200).json(new ApiResponse(true, tree, 'Binary tree retrieved'));
});

exports.getSponsorTree = catchAsync(async (req, res) => {
    const tree = await GenealogyService.getSponsorTree(req.user._id);
    res.status(200).json(new ApiResponse(true, tree, 'Sponsor tree retrieved'));
});

exports.createRoot = catchAsync(async (req, res) => {
    const { userId } = req.body;
    const node = await GenealogyService.createRoot(userId);
    res.status(201).json(new ApiResponse(true, node, 'Root node created'));
});

// Admin placement for testing/migration
exports.placeUser = catchAsync(async (req, res) => {
    console.log('Placement Request Body:', JSON.stringify(req.body, null, 2));
    const { userId, sponsorId, strategy, parentId, position, manualParentId, manualPosition } = req.body;

    const node = await GenealogyService.placeUser(
        userId,
        sponsorId,
        strategy,
        manualParentId || parentId,
        manualPosition || position
    );
    res.status(200).json(new ApiResponse(true, node, 'User placed in tree'));
});

exports.getCommissions = catchAsync(async (req, res) => {
    // Stub
    res.status(200).json(new ApiResponse(true, [], 'Commissions retrieved'));
});

/**
 * Get users who are NOT yet in the genealogy tree
 */
exports.getEligibleUsers = catchAsync(async (req, res) => {
    const { search } = req.query;

    // 1. Get all user IDs already in Genealogy
    const Genealogy = require('../models/MLM/TreeNode');
    const User = require('../models/User');

    const usersInTree = await Genealogy.find().distinct('user');

    // 2. Find users NOT in that list
    const query = {
        _id: { $nin: usersInTree },
        role: 'user'
    };

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } }
        ];
    }

    const eligibleUsers = await User.find(query)
        .select('username name email rank')
        .limit(10);

    res.status(200).json(new ApiResponse(true, eligibleUsers, 'Eligible users retrieved'));
});

/**
 * Get commission report for all users in a date range
 */
exports.getCommissionsReport = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
        return res.status(400).json(new ApiResponse(false, null, 'Start date and end date are required'));
    }

    const report = await CommissionService.getCommissionsReport(startDate, endDate);
    res.status(200).json(new ApiResponse(true, report, 'Commission report retrieved'));
});

// ============ RANK MANAGEMENT ============

/**
 * Get all rank configurations
 */
exports.getAllRanks = catchAsync(async (req, res) => {
    const ranks = await RankService.getAllRanks();
    res.status(200).json(new ApiResponse(true, ranks, 'Ranks retrieved'));
});

/**
 * Get specific rank details
 */
exports.getRankDetails = catchAsync(async (req, res) => {
    const { name } = req.params;
    const rank = await RankService.getRankDetails(name);

    if (!rank) {
        return res.status(404).json(new ApiResponse(false, null, 'Rank not found'));
    }

    res.status(200).json(new ApiResponse(true, rank, 'Rank details retrieved'));
});

/**
 * Evaluate current user's rank
 */
exports.evaluateMyRank = catchAsync(async (req, res) => {
    const evaluation = await RankService.evaluateUserRank(req.user._id);
    res.status(200).json(new ApiResponse(true, evaluation, 'Rank evaluation complete'));
});

/**
 * Get current user's rank progress
 */
exports.getMyRankProgress = catchAsync(async (req, res) => {
    const progress = await RankService.getRankProgress(req.user._id);
    res.status(200).json(new ApiResponse(true, progress, 'Rank progress retrieved'));
});

/**
 * Get current user's rank history
 */
exports.getMyRankHistory = catchAsync(async (req, res) => {
    const history = await RankService.getUserRankHistory(req.user._id);
    res.status(200).json(new ApiResponse(true, history, 'Rank history retrieved'));
});

/**
 * Batch evaluate all users (Admin only)
 */
exports.evaluateAllRanks = catchAsync(async (req, res) => {
    const result = await RankService.evaluateAllUsersRanks();
    res.status(200).json(new ApiResponse(true, result, 'Batch rank evaluation complete'));
});

/**
 * Get specific user's rank history (Admin only)
 */
exports.getUserRankHistory = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const history = await RankService.getUserRankHistory(userId);
    res.status(200).json(new ApiResponse(true, history, 'User rank history retrieved'));
});
// ============ PLACEMENT SETTINGS ============

exports.getLegSettings = catchAsync(async (req, res) => {
    const settings = await GenealogyService.getLegSettings(req.user._id);
    res.status(200).json(new ApiResponse(true, settings, 'Leg settings retrieved'));
});

exports.updateLegSettings = catchAsync(async (req, res) => {
    const { preferredPlacement } = req.body;
    const settings = await GenealogyService.updateLegSettings(req.user._id, preferredPlacement);
    res.status(200).json(new ApiResponse(true, settings, 'Leg settings updated'));
});
