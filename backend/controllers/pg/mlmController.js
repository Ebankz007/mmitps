/**
 * mlmController — PostgreSQL edition.
 * Mirrors the Mongo controllers/mlmController. Uses req.user.id (pg protect).
 * getCommissions is implemented (Mongo was a stub returning []).
 */
const GenealogyService = require('../../services/pg/GenealogyService');
const CommissionService = require('../../services/pg/CommissionService');
const RankService = require('../../services/pg/RankService');
const UserRepository = require('../../repositories/pg/UserRepository');
const MLMTreeNodeRepository = require('../../repositories/pg/MLMTreeNodeRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

exports.getBinaryTree = catchAsync(async (req, res) => {
  const tree = await GenealogyService.getBinaryTree(req.user.id);
  res.status(200).json(new ApiResponse(true, tree, 'Binary tree retrieved'));
});

exports.getSponsorTree = catchAsync(async (req, res) => {
  const tree = await GenealogyService.getSponsorTree(req.user.id);
  res.status(200).json(new ApiResponse(true, tree, 'Sponsor tree retrieved'));
});

exports.createRoot = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const node = await GenealogyService.createRoot(userId);
  res.status(201).json(new ApiResponse(true, node, 'Root node created'));
});

exports.placeUser = catchAsync(async (req, res) => {
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
  const { startDate, endDate } = req.query;
  let commissions;
  if (startDate && endDate) {
    commissions = await CommissionService.getCommissionsByPeriod(req.user.id, startDate, endDate);
  } else {
    commissions = await CommissionService.getCommissionsByPeriod(
      req.user.id,
      new Date(0),
      new Date(Date.now() + 86400000)
    );
  }
  res.status(200).json(new ApiResponse(true, commissions, 'Commissions retrieved'));
});

/** Users who are NOT yet in the genealogy tree (admin placement picker). */
exports.getEligibleUsers = catchAsync(async (req, res) => {
  const { search } = req.query;

  const nodes = await MLMTreeNodeRepository.findAll({}, { select: 'userId' });
  const inTree = nodes.map((n) => n.userId);

  const filters = { role: 'user', id: { $nin: inTree } };
  if (search) {
    filters.$or = [
      { username: { $regex: search } },
      { email: { $regex: search } },
    ];
  }

  const eligibleUsers = await UserRepository.findAll(filters, {
    select: 'id,username,email,profile',
    sort: '-createdAt',
    limit: 10,
  });

  res.status(200).json(new ApiResponse(true, eligibleUsers, 'Eligible users retrieved'));
});

exports.getCommissionsReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json(new ApiResponse(false, null, 'Start date and end date are required'));
  }

  const report = await CommissionService.getCommissionsReport(startDate, endDate);
  res.status(200).json(new ApiResponse(true, report, 'Commission report retrieved'));
});

// ============ RANK MANAGEMENT ============

exports.getAllRanks = catchAsync(async (req, res) => {
  const ranks = await RankService.getAllRanks();
  res.status(200).json(new ApiResponse(true, ranks, 'Ranks retrieved'));
});

exports.getRankDetails = catchAsync(async (req, res) => {
  const { name } = req.params;
  const rank = await RankService.getRankDetails(name);

  if (!rank) {
    return res.status(404).json(new ApiResponse(false, null, 'Rank not found'));
  }

  res.status(200).json(new ApiResponse(true, rank, 'Rank details retrieved'));
});

exports.evaluateMyRank = catchAsync(async (req, res) => {
  const evaluation = await RankService.evaluateUserRank(req.user.id);
  res.status(200).json(new ApiResponse(true, evaluation, 'Rank evaluation complete'));
});

exports.getMyRankProgress = catchAsync(async (req, res) => {
  const progress = await RankService.getRankProgress(req.user.id);
  res.status(200).json(new ApiResponse(true, progress, 'Rank progress retrieved'));
});

exports.getMyRankHistory = catchAsync(async (req, res) => {
  const history = await RankService.getUserRankHistory(req.user.id);
  res.status(200).json(new ApiResponse(true, history, 'Rank history retrieved'));
});

exports.evaluateAllRanks = catchAsync(async (req, res) => {
  const result = await RankService.evaluateAllUsersRanks();
  res.status(200).json(new ApiResponse(true, result, 'Batch rank evaluation complete'));
});

exports.getUserRankHistory = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const history = await RankService.getUserRankHistory(userId);
  res.status(200).json(new ApiResponse(true, history, 'User rank history retrieved'));
});

// ============ PLACEMENT SETTINGS ============

exports.getLegSettings = catchAsync(async (req, res) => {
  const settings = await GenealogyService.getLegSettings(req.user.id);
  res.status(200).json(new ApiResponse(true, settings, 'Leg settings retrieved'));
});

exports.updateLegSettings = catchAsync(async (req, res) => {
  const { preferredPlacement } = req.body;
  const settings = await GenealogyService.updateLegSettings(req.user.id, preferredPlacement);
  res.status(200).json(new ApiResponse(true, settings, 'Leg settings updated'));
});