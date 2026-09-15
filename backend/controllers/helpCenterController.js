const HelpCategory = require('../models/CMS/HelpCategory');
const HelpArticle = require('../models/CMS/HelpArticle');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// ─── Categories ─────────────────────────────────────────────────────────────

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await HelpCategory.find({ isActive: true }).sort('order');
    res.status(200).json({ success: true, data: categories });
});

exports.createCategory = catchAsync(async (req, res, next) => {
    const category = await HelpCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await HelpCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!category) return next(new ApiError('Category not found', 404));
    res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    // Check if category has articles
    const articlesCount = await HelpArticle.countDocuments({ category: req.params.id });
    if (articlesCount > 0) {
        return next(new ApiError('Cannot delete category with associated articles', 400));
    }
    const category = await HelpCategory.findByIdAndDelete(req.params.id);
    if (!category) return next(new ApiError('Category not found', 404));
    res.status(204).json({ success: true, data: null });
});

// ─── Articles ───────────────────────────────────────────────────────────────

exports.getAllArticles = catchAsync(async (req, res, next) => {
    const filter = req.query.category ? { category: req.query.category } : {};
    if (req.query.status) filter.status = req.query.status;
    
    const articles = await HelpArticle.find(filter)
        .populate('category', 'name icon')
        .sort('order -createdAt');
    res.status(200).json({ success: true, data: articles });
});

exports.getArticleBySlug = catchAsync(async (req, res, next) => {
    const article = await HelpArticle.findOneAndUpdate(
        { slug: req.params.slug, status: 'published' },
        { $inc: { viewCount: 1 } },
        { new: true }
    ).populate('category', 'name icon');

    if (!article) return next(new ApiError('Article not found', 404));
    res.status(200).json({ success: true, data: article });
});

exports.getAdminArticleById = catchAsync(async (req, res, next) => {
    const article = await HelpArticle.findById(req.params.id).populate('category');
    if (!article) return next(new ApiError('Article not found', 404));
    res.status(200).json({ success: true, data: article });
});

exports.createArticle = catchAsync(async (req, res, next) => {
    const article = await HelpArticle.create(req.body);
    res.status(201).json({ success: true, data: article });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
    const article = await HelpArticle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!article) return next(new ApiError('Article not found', 404));
    res.status(200).json({ success: true, data: article });
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
    const article = await HelpArticle.findByIdAndDelete(req.params.id);
    if (!article) return next(new ApiError('Article not found', 404));
    res.status(204).json({ success: true, data: null });
});

exports.searchArticles = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, data: [] });

    const articles = await HelpArticle.find(
        { $text: { $search: q }, status: 'published' },
        { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .populate('category', 'name icon')
    .limit(10);

    res.status(200).json({ success: true, data: articles });
});
