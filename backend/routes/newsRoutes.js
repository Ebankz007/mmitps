const express = require('express');
const router = express.Router();
const newsController = require('../controllers/pg/newsController');
const { protect, authorize } = require('../middleware/pg/auth');

// Public routes
router.get('/', newsController.getLatestNews);
router.get('/:slug', newsController.getArticle);

// Protected routes
router.use(protect);
router.post('/', authorize('admin', 'instructor'), newsController.createArticle);
router.patch('/:id/publish', authorize('admin', 'instructor'), newsController.publishArticle);

module.exports = router;
