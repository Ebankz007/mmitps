const express = require('express');
const bonusController = require('../controllers/pg/bonusController');
const { protect } = require('../middleware/pg/auth');

const router = express.Router();

router.use(protect);

router.get('/active', bonusController.getActiveBonuses);
router.get('/my-claims', bonusController.getMyClaims);
router.post('/:id/claim', bonusController.claimBonus);

module.exports = router;