/**
 * MLM routes — PostgreSQL edition.
 * Binary tree, commissions, and rank management run on the pg stack.
 */
const express = require('express');
const router = express.Router();
const mlmController = require('../controllers/pg/mlmController');
const { protect, authorize } = require('../middleware/pg/auth');

router.use(protect);

router.get('/binary', mlmController.getBinaryTree);
router.get('/sponsor', mlmController.getSponsorTree);
router.get('/leg-settings', mlmController.getLegSettings);
router.post('/leg-settings', mlmController.updateLegSettings);
router.get('/commissions', mlmController.getCommissions);
router.post('/root', authorize('admin', 'super_admin'), mlmController.createRoot);

// Admin only routes for manual placement
router.get('/eligible-users', authorize('admin', 'super_admin'), mlmController.getEligibleUsers);
router.get('/commissions/report', authorize('admin', 'super_admin'), mlmController.getCommissionsReport);
router.post('/placement', authorize('admin', 'super_admin'), mlmController.placeUser);

// Rank management routes
router.get('/ranks', mlmController.getAllRanks);
router.post('/ranks/evaluate', mlmController.evaluateMyRank);
router.get('/ranks/progress', mlmController.getMyRankProgress);
router.get('/ranks/:name', mlmController.getRankDetails);
router.get('/rank-history', mlmController.getMyRankHistory);

// Admin rank routes
router.post('/ranks/evaluate-all', authorize('admin', 'super_admin'), mlmController.evaluateAllRanks);
router.get('/rank-history/:userId', authorize('admin', 'super_admin'), mlmController.getUserRankHistory);

module.exports = router;