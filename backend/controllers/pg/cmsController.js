/**
 * cmsController — PostgreSQL edition (content blocks).
 * Mirrors the Mongo controllers/cmsController.
 */
const ContentBlockRepository = require('../../repositories/pg/ContentBlockRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getBlocks = catchAsync(async (req, res) => {
  const blocks = await ContentBlockRepository.findAll({}, { sort: 'createdAt' });
  res.status(200).json(new ApiResponse(true, blocks, 'Blocks retrieved'));
});

exports.getBlock = catchAsync(async (req, res) => {
  const block = await ContentBlockRepository.findBySlug(req.params.slug);
  if (!block) throw new ApiError(404, 'Block not found');
  res.status(200).json(new ApiResponse(true, block, 'Block retrieved'));
});

exports.createBlock = catchAsync(async (req, res) => {
  const block = await ContentBlockRepository.create(req.body);
  res.status(201).json(new ApiResponse(true, block, 'Block created'));
});

exports.updateBlock = catchAsync(async (req, res) => {
  const block = await ContentBlockRepository.update(req.params.id, req.body);
  if (!block) throw new ApiError(404, 'Block not found');
  res.status(200).json(new ApiResponse(true, block, 'Block updated'));
});

exports.deleteBlock = catchAsync(async (req, res) => {
  const deleted = await ContentBlockRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Block not found');
  res.status(200).json(new ApiResponse(true, null, 'Block deleted'));
});