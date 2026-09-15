const express = require('express');
const {
    getBlocks,
    getBlock,
    createBlock,
    updateBlock,
    deleteBlock
} = require('../controllers/pg/cmsController');
const { getPageContext, getBatchContext } = require('../controllers/UniversalPageController');
const { protect, authorize } = require('../middleware/pg/auth');

const router = express.Router();

router
    .route('/')
    .get(getBlocks)
    .post(protect, authorize('admin'), createBlock);

router
    .route('/:slug') // Note: This conflicts if ID is passed.
    // Ideally we separate /id/:id and /slug/:slug or detect.
    // But since slug is string and ID is objectID...
    // Let's use /:id for update/delete and /slug/:slug for fetching?
    // Or just use ID for admin ops and Slug for public.
    // The controller uses findOne({slug}) for getBlock.
    // Code below uses :id for update/delete.

    .get(getBlock); // Get by slug

router
    .route('/:id')
    .put(protect, authorize('admin'), updateBlock)
    .delete(protect, authorize('admin'), deleteBlock);

// Universal Page Context
router.get('/page-context/:pageId', protect, getPageContext);
router.post('/page-context/batch', protect, getBatchContext);

module.exports = router;
