/**
 * Analysis routes — PostgreSQL edition.
 * Public routes (GET) run on pg repos without auth; protected routes use
 * pg protect + pg controller.
 */
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/pg/analysisController');
const { protect, authorize } = require('../middleware/pg/auth');

// Public routes
router.get('/', analysisController.getActiveAnalysis);
router.get('/pair/:pair', analysisController.getAnalysisByPair);

// Protected routes
router.use(protect);
router.post('/', authorize('admin', 'analyst', 'instructor'), analysisController.createAnalysis);
router.delete('/:id', authorize('admin', 'analyst', 'instructor'), analysisController.deleteAnalysis);

module.exports = router;