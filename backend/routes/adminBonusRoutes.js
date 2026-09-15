const express = require('express');
const adminBonusController = require('../controllers/pg/adminBonusController');
const { protect, restrictTo } = require('../middleware/pg/auth');

const router = express.Router();

// All routes require Admin privileges
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router
    .route('/')
    .get(adminBonusController.getBonuses)
    .post(adminBonusController.createBonus);

router
    .route('/claims')
    .get(adminBonusController.getClaims);

router
    .route('/:id')
    .put(adminBonusController.updateBonus)
    .delete(adminBonusController.deleteBonus);

router
    .route('/claims/:id')
    .put(adminBonusController.processClaim);

module.exports = router;