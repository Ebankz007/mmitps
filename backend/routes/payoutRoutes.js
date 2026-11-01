/**
 * Payout routes — PostgreSQL edition.
 * Pending withdrawals live in pending_withdrawals; PG users carry UUID ids.
 */
const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/request', payoutController.requestPayout);
router.get('/my', payoutController.getMyPayouts);
router.post('/:id/cancel', payoutController.cancelPayout);

module.exports = router;

