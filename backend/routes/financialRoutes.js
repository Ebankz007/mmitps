/**
 * Financial routes — PostgreSQL edition.
 * Wallet / transactions / coupons now run on the pg stack (pg protect + pg controllers).
 * Payouts moved to routes/payoutRoutes.js (still MongoDB-backed).
 */
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/pg/walletController');
const transactionController = require('../controllers/pg/transactionController');
const couponController = require('../controllers/pg/couponController');
const { protect } = require('../middleware/pg/auth');

router.use(protect);

// Wallet Routes
router.get('/wallet/balance', walletController.getBalance);
router.post('/wallet/deposit', walletController.deposit);
router.post('/wallet/withdraw', walletController.withdraw);
router.post('/wallet/transfer', walletController.transfer);
router.get('/payment-methods', walletController.getActivePaymentMethods);

// Coupon Routes
router.get('/coupons/active', couponController.getCoupons);
router.post('/coupons/validate', couponController.validateCoupon);
router.post('/coupons/redeem', couponController.redeemCoupon);

// Transaction Routes
router.get('/transactions', transactionController.getHistory);
router.get('/transactions/:id', transactionController.getTransaction);

// Public/User Routes (Supported currencies config)
router.get('/currencies', walletController.getSupportedCurrencies);

module.exports = router;