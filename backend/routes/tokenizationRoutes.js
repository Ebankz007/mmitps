const express = require('express');
const router = express.Router();
const tokenizationController = require('../controllers/pg/tokenizationController');
const { protect, authorize } = require('../middleware/pg/auth');

router.use(protect);

// Public/User routes
router.get('/pools', tokenizationController.getActivePools);
router.get('/pools/category/:category', tokenizationController.getPoolsByCategory);
router.get('/pools/:id', tokenizationController.getPool);
router.get('/my-investments', tokenizationController.getMyInvestments);
router.post('/invest', tokenizationController.invest);

// Admin routes
router.post('/pools', authorize('admin', 'super_admin'), tokenizationController.createPool);

module.exports = router;