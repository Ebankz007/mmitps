/**
 * Trading routes — PostgreSQL edition.
 * Signals / copy trading / trading accounts run on the pg stack (pg protect +
 * pg controllers). AI analysis, risk control, VPS & live-streams run on
 * routes/tradingMiscRoutes.js (mounted at /api/v1/trading too).
 */
const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');
const tradingAccountController = require('../controllers/tradingAccountController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Signals
router.post('/signals', authorize('admin', 'super_admin', 'instructor', 'provider', 'trader', 'analyst'), tradingController.createSignal);
router.get('/signals/active', tradingController.getActiveSignals);
router.patch('/signals/:id/close', authorize('admin', 'super_admin', 'instructor', 'provider', 'trader', 'analyst'), tradingController.closeSignal);

// Copy Trading
router.post('/copy/follow', tradingController.followProvider);
router.get('/copy/my-subscriptions', tradingController.getMySubscriptions);
router.get('/copy/my-followers', authorize('admin', 'super_admin', 'instructor', 'provider', 'trader', 'analyst'), tradingController.getProviderFollowers);
router.post('/copy/settle/:subscriptionId', tradingController.settleCommission);
router.post('/copy/confirm-receipt/:subscriptionId', authorize('admin', 'super_admin', 'instructor', 'provider', 'trader', 'analyst'), tradingController.confirmSettlementReceipt);

// Trading Accounts
router.post('/accounts', tradingAccountController.connectAccount);
router.get('/accounts', tradingAccountController.getMyAccounts);
router.post('/accounts/:id/sync', tradingAccountController.syncAccountStats);
router.delete('/accounts/:id', tradingAccountController.disconnectAccount);

module.exports = router;

