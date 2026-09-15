const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/pg/subscriptionController');
const { protect } = require('../middleware/pg/auth');

router.get('/plans', subscriptionController.getAvailablePlans);

router.use(protect);

router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/subscribe', subscriptionController.subscribe);
router.post('/cancel', subscriptionController.cancelSubscription);

module.exports = router;