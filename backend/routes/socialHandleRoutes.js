const express = require('express');
const router = express.Router();
const socialHandleController = require('../controllers/pg/socialHandleController');
const { protect, restrictTo } = require('../middleware/pg/auth');

// Public routes (or any authenticated user can view active handles)
router.get('/', socialHandleController.getHandles);

// Admin-only routes
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/admin', socialHandleController.getAllHandles);
router.get('/broadcast-settings', socialHandleController.getGlobalBroadcastSettings);
router.put('/broadcast-settings', socialHandleController.updateGlobalBroadcastSettings);
router.post('/', socialHandleController.createHandle);
router.patch('/:id', socialHandleController.updateHandle);
router.delete('/:id', socialHandleController.deleteHandle);

module.exports = router;
