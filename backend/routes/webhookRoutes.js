const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/paystack', webhookController.handlePaystackWebhook);
router.post('/flutterwave', webhookController.handleFlutterwaveWebhook);
router.post('/korapay', webhookController.handleKorapayWebhook);
router.post('/cellulant', webhookController.handleCellulantWebhook);
router.post('/coinpayments', express.raw({ type: 'application/x-www-form-urlencoded' }), webhookController.handleCoinpaymentsWebhook);
router.post('/mux', express.raw({ type: 'application/json' }), webhookController.handleMuxWebhook);

module.exports = router;
