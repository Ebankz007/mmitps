const express = require('express');
const router = express.Router();
const menuConfigController = require('../controllers/pg/menuConfigController');
const { protect, authorize } = require('../middleware/pg/auth');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/', menuConfigController.getMenuConfigs);
router.put('/:label', menuConfigController.updateMenuConfig);
router.delete('/:label', menuConfigController.deleteMenuConfig);

module.exports = router;