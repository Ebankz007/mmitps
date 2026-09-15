/**
 * adminCMSController — PostgreSQL edition.
 * Mirrors the Mongo controllers/adminCMSController (menus, pages, media,
 * site status, annealing, maintenance, news, blocks).
 */
const MenuRepository = require('../../repositories/pg/MenuRepository');
const PageRepository = require('../../repositories/pg/PageRepository');
const MediaRepository = require('../../repositories/pg/MediaRepository');
const SiteStatusRepository = require('../../repositories/pg/SiteStatusRepository');
const AnnealingService = require('../../services/pg/AnnealingService');
const NewsRepository = require('../../repositories/pg/NewsRepository');
const ContentBlockRepository = require('../../repositories/pg/ContentBlockRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

// ─── Menus ─────────────────────────────────────────────────────────────────

exports.getMenus = catchAsync(async (req, res) => {
  const menus = await MenuRepository.findAll({});
  res.status(200).json(new ApiResponse(true, menus, 'Menus retrieved'));
});

exports.upsertMenu = catchAsync(async (req, res) => {
  const { location, ...data } = req.body;
  const menu = await MenuRepository.upsertByLocation(location, data);
  res.status(200).json(new ApiResponse(true, menu, 'Menu upserted'));
});

// ─── Pages ─────────────────────────────────────────────────────────────────

exports.getPages = catchAsync(async (req, res) => {
  const pages = await PageRepository.findAll({}, { sort: 'createdAt' });
  res.status(200).json(new ApiResponse(true, pages, 'Pages retrieved'));
});

exports.getPage = catchAsync(async (req, res) => {
  const page = await PageRepository.findById(req.params.id);
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(true, page, 'Page retrieved'));
});

exports.createPage = catchAsync(async (req, res) => {
  const page = await PageRepository.create(req.body);
  res.status(201).json(new ApiResponse(true, page, 'Page created'));
});

exports.updatePage = catchAsync(async (req, res) => {
  const page = await PageRepository.update(req.params.id, req.body);
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(true, page, 'Page updated'));
});

exports.deletePage = catchAsync(async (req, res) => {
  const deleted = await PageRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(true, null, 'Page deleted'));
});

// ─── Media ─────────────────────────────────────────────────────────────────

exports.getMedia = catchAsync(async (req, res) => {
  const media = await MediaRepository.findAll({}, { sort: '-createdAt' });
  res.status(200).json(new ApiResponse(true, media, 'Media retrieved'));
});

exports.getMediaById = catchAsync(async (req, res) => {
  const media = await MediaRepository.findById(req.params.id);
  if (!media) throw new ApiError(404, 'Media not found');
  res.status(200).json(new ApiResponse(true, media, 'Media retrieved'));
});

exports.uploadMedia = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const media = await MediaRepository.create({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/cms/${req.file.filename}`,
    url: `/uploads/cms/${req.file.filename}`,
    uploadedById: req.user.id,
  });
  res.status(201).json(new ApiResponse(true, media, 'Media uploaded'));
});

exports.updateMedia = catchAsync(async (req, res) => {
  const media = await MediaRepository.update(req.params.id, req.body);
  if (!media) throw new ApiError(404, 'Media not found');
  res.status(200).json(new ApiResponse(true, media, 'Media updated'));
});

exports.deleteMedia = catchAsync(async (req, res) => {
  const deleted = await MediaRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Media not found');
  res.status(200).json(new ApiResponse(true, null, 'Media deleted'));
});

// ─── Site Status & Annealing ───────────────────────────────────────────────

exports.getSiteStatus = catchAsync(async (req, res) => {
  const status = await SiteStatusRepository.getOrCreate();
  res.status(200).json(new ApiResponse(true, status, 'Site status retrieved'));
});

exports.triggerAnnealing = catchAsync(async (req, res) => {
  const status = await AnnealingService.runFullAnnealing();
  res.status(200).json(new ApiResponse(true, status, 'Annealing complete'));
});

exports.toggleMaintenance = catchAsync(async (req, res) => {
  const { enabled, message } = req.body;
  const status = await SiteStatusRepository.getOrCreate();
  const updated = await SiteStatusRepository.update(status.id, {
    isMaintenanceMode: enabled !== undefined ? enabled : !status.isMaintenanceMode,
    maintenanceMessage: message || status.maintenanceMessage,
  });
  res.status(200).json(new ApiResponse(true, updated, 'Maintenance mode updated'));
});

// ─── News & Blocks (admin list views) ──────────────────────────────────────

exports.getNewsArticles = catchAsync(async (req, res) => {
  const articles = await NewsRepository.findAll({}, { populate: 'author', sort: '-createdAt' });
  res.status(200).json(new ApiResponse(true, articles, 'News articles retrieved'));
});

exports.getContentBlocks = catchAsync(async (req, res) => {
  const blocks = await ContentBlockRepository.findAll({}, { sort: 'createdAt' });
  res.status(200).json(new ApiResponse(true, blocks, 'Content blocks retrieved'));
});