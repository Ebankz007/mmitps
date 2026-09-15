const express = require('express');
const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllArticles,
    getArticleBySlug,
    getAdminArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    searchArticles
} = require('../controllers/pg/helpCenterController');
const { protect, authorize } = require('../middleware/pg/auth');

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────────────────

router.get('/categories', getAllCategories);
router.get('/articles', getAllArticles);
router.get('/articles/search', searchArticles);
router.get('/articles/s/:slug', getArticleBySlug);

// ─── Admin Routes (Protected) ───────────────────────────────────────────────

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.route('/admin/categories')
    .post(createCategory);

router.route('/admin/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);

router.route('/admin/articles')
    .get(getAllArticles)
    .post(createArticle);

router.route('/admin/articles/:id')
    .get(getAdminArticleById)
    .put(updateArticle)
    .delete(deleteArticle);

module.exports = router;
