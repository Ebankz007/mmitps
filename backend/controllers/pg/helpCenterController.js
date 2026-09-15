/**
 * helpCenterController — PostgreSQL edition.
 * Mirrors the Mongo controllers/helpCenterController.
 */
const { HelpCategoryRepository, HelpArticleRepository } = require('../../repositories/pg/HelpCenterRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const sanitizeHtmlContent = require('../../utils/sanitizeHtml');

// ─── Categories ────────────────────────────────────────────────────────────

exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await HelpCategoryRepository.findAll({}, { sort: 'order' });
  res.status(200).json(new ApiResponse(true, categories, 'Categories retrieved'));
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await HelpCategoryRepository.create(req.body);
  res.status(201).json(new ApiResponse(true, category, 'Category created'));
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await HelpCategoryRepository.update(req.params.id, req.body);
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json(new ApiResponse(true, category, 'Category updated'));
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const deleted = await HelpCategoryRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Category not found');
  res.status(200).json(new ApiResponse(true, null, 'Category deleted'));
});

// ─── Articles ──────────────────────────────────────────────────────────────

exports.getAllArticles = catchAsync(async (req, res) => {
  const articles = await HelpArticleRepository.findAll({}, { populate: 'category', sort: 'order' });
  res.status(200).json(new ApiResponse(true, articles, 'Articles retrieved'));
});

exports.getArticleBySlug = catchAsync(async (req, res) => {
  const article = await HelpArticleRepository.findPublishedBySlugAndCount(req.params.slug);
  if (!article) throw new ApiError(404, 'Article not found');
  res.status(200).json(new ApiResponse(true, article, 'Article retrieved'));
});

exports.getAdminArticleById = catchAsync(async (req, res) => {
  const article = await HelpArticleRepository.findById(req.params.id, { populate: 'category' });
  if (!article) throw new ApiError(404, 'Article not found');
  res.status(200).json(new ApiResponse(true, article, 'Article retrieved'));
});

exports.createArticle = catchAsync(async (req, res) => {
  // Sanitize HTML on write — stored content is rendered via dangerouslySetInnerHTML
  if (req.body.content) req.body.content = sanitizeHtmlContent(req.body.content);
  const article = await HelpArticleRepository.create(req.body);
  res.status(201).json(new ApiResponse(true, article, 'Article created'));
});

exports.updateArticle = catchAsync(async (req, res) => {
  if (req.body.content) req.body.content = sanitizeHtmlContent(req.body.content);
  const article = await HelpArticleRepository.update(req.params.id, req.body);
  if (!article) throw new ApiError(404, 'Article not found');
  res.status(200).json(new ApiResponse(true, article, 'Article updated'));
});

exports.deleteArticle = catchAsync(async (req, res) => {
  const deleted = await HelpArticleRepository.delete(req.params.id);
  if (!deleted) throw new ApiError(404, 'Article not found');
  res.status(200).json(new ApiResponse(true, null, 'Article deleted'));
});

exports.searchArticles = catchAsync(async (req, res) => {
  const { q, limit } = req.query;
  if (!q) throw new ApiError(400, 'Search query required');
  const results = await HelpArticleRepository.search(q, parseInt(limit, 10) || 10);
  res.status(200).json(new ApiResponse(true, results, 'Search results'));
});