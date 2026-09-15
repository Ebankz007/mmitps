/**
 * newsController — PostgreSQL edition.
 * Mirrors the Mongo controllers/newsController.
 */
const NewsService = require('../../services/pg/NewsService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

exports.getLatestNews = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const articles = await NewsService.getLatest(limit);
  res.status(200).json(new ApiResponse(true, articles, 'News retrieved'));
});

exports.getArticle = catchAsync(async (req, res) => {
  const article = await NewsService.getBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(true, article, 'Article retrieved'));
});

exports.createArticle = catchAsync(async (req, res) => {
  const article = await NewsService.createArticle(req.body, req.user.id);
  res.status(201).json(new ApiResponse(true, article, 'Article created'));
});

exports.publishArticle = catchAsync(async (req, res) => {
  const article = await NewsService.publishArticle(req.params.id);
  res.status(200).json(new ApiResponse(true, article, 'Article published'));
});