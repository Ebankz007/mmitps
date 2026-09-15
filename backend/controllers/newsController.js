const NewsService = require('../services/trading/NewsService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.createArticle = catchAsync(async (req, res) => {
    const article = await NewsService.createArticle(req.body, req.user._id);
    res.status(201).json(new ApiResponse(true, article, 'Article created successfully'));
});

exports.publishArticle = catchAsync(async (req, res) => {
    const article = await NewsService.publishArticle(req.params.id);
    res.status(200).json(new ApiResponse(true, article, 'Article published successfully'));
});

exports.getLatestNews = catchAsync(async (req, res) => {
    const news = await NewsService.getLatestNews(req.query);
    res.status(200).json(new ApiResponse(true, news, 'Latest news retrieved'));
});

exports.getArticle = catchAsync(async (req, res) => {
    const article = await NewsService.getArticle(req.params.slug);
    res.status(200).json(new ApiResponse(true, article, 'Article details retrieved'));
});
