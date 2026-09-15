/**
 * Trading misc routes — PostgreSQL edition.
 * AI analysis, risk control, VPS & live-streams run on pg auth + pg tradingController
 * (AIAnalystService is mock/API-based on the PG ApiServiceManager; VPS/LiveStream are
 * pure mock services with no DB).
 * Mounted at /api/v1/trading alongside tradingRoutes.js — paths are disjoint.
 */
const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/pg/tradingController');
const miscController = require('../controllers/miscController');
const { protect } = require('../middleware/pg/auth');

router.use(protect);

// AI & Analysis
router.get('/analysis/:symbol', tradingController.analyzeSymbol);
router.get('/risk-control', tradingController.getRiskAdvice);

// VPS & Live Stream
router.get('/vps/status', miscController.getVPSStatus);
router.post('/vps/purchase', miscController.purchaseVPS);
router.get('/live-streams', miscController.getLiveStreams);

module.exports = router;