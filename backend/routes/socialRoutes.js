const express = require('express');
const router = express.Router();
const socialTradingController = require('../controllers/pg/socialTradingController');
const { protect } = require('../middleware/pg/auth');

// Public routes
router.get('/leaderboard', socialTradingController.getLeaderboard);
router.get('/traders/:id', socialTradingController.getTraderProfile);
router.get('/traders/:id/performance', socialTradingController.getTraderPerformance);
router.get('/traders/:id/signals', socialTradingController.getTraderSignals);

// Protected routes (require authentication)
router.post('/follow/:id', protect, socialTradingController.followTrader);
router.delete('/follow/:id', protect, socialTradingController.unfollowTrader);
router.post('/copy/:id', protect, socialTradingController.copyTrader);
router.delete('/copy/:id', protect, socialTradingController.stopCopying);
router.put('/profile/handles', protect, socialTradingController.updateSocialHandles);
router.post('/register-as-provider', protect, socialTradingController.registerAsProvider);

router.post('/signals', protect, socialTradingController.publishSignal);
router.get('/signals/feed', protect, socialTradingController.getSignalFeed);
router.put('/signals/:id/close', protect, socialTradingController.closeSignal);

module.exports = router;
