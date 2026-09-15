/**
 * siteContentController — PostgreSQL edition.
 * Mirrors the Mongo controllers/siteContentController.
 */
const SiteContentRepository = require('../../repositories/pg/SiteContentRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getPageContent = catchAsync(async (req, res) => {
  const sections = await SiteContentRepository.findByPage(req.params.page);
  res.status(200).json(new ApiResponse(true, sections, 'Page content retrieved'));
});

exports.getAllContent = catchAsync(async (req, res) => {
  const content = await SiteContentRepository.findAll({}, { sort: 'sortOrder' });
  res.status(200).json(new ApiResponse(true, content, 'Content retrieved'));
});

exports.getBySlug = catchAsync(async (req, res) => {
  const section = await SiteContentRepository.findBySlug(req.params.slug);
  if (!section) throw new ApiError(404, 'Content not found');
  res.status(200).json(new ApiResponse(true, section, 'Content retrieved'));
});

exports.createContent = catchAsync(async (req, res) => {
  const section = await SiteContentRepository.create(req.body);
  res.status(201).json(new ApiResponse(true, section, 'Content created'));
});

exports.updateContent = catchAsync(async (req, res) => {
  const section = await SiteContentRepository.update(req.params.id, req.body);
  if (!section) throw new ApiError(404, 'Content not found');
  res.status(200).json(new ApiResponse(true, section, 'Content updated'));
});

exports.deleteContent = catchAsync(async (req, res) => {
  const deleted = await SiteContentRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Content not found');
  res.status(200).json(new ApiResponse(true, null, 'Content deleted'));
});

exports.upsertBySlug = catchAsync(async (req, res) => {
  const section = await SiteContentRepository.upsertBySlug(req.params.slug, req.body);
  res.status(200).json(new ApiResponse(true, section, 'Content upserted'));
});

exports.bulkUpsert = catchAsync(async (req, res) => {
  const results = await SiteContentRepository.bulkUpsert(req.params.page, req.body);
  res.status(200).json(new ApiResponse(true, results, 'Bulk content upserted'));
});