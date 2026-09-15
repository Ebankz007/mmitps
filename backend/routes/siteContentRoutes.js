const express = require('express');
const {
    getPageContent,
    getAllContent,
    getBySlug,
    createContent,
    updateContent,
    deleteContent,
    upsertBySlug,
    bulkUpsert
} = require('../controllers/pg/siteContentController');
const { protect, authorize } = require('../middleware/pg/auth');

const router = express.Router();

// Public: get all active sections for a page
router.get('/page/:page', getPageContent);

// Public: get single section by slug
router.get('/slug/:slug', getBySlug);

// Admin: get all content (including inactive)
router.get('/', protect, authorize('admin'), getAllContent);

// Admin: create new section
router.post('/', protect, authorize('admin'), createContent);

// Admin: bulk upsert sections for a page
router.post('/bulk/:page', protect, authorize('admin'), bulkUpsert);

// Admin: upsert by slug
router.put('/slug/:slug', protect, authorize('admin'), upsertBySlug);

// Admin: update by ID
router.put('/:id', protect, authorize('admin'), updateContent);

// Admin: delete by ID
router.delete('/:id', protect, authorize('admin'), deleteContent);

module.exports = router;
