const express = require('express');
const router = express.Router();
const macroController = require('../controllers/pg/macroController');
const COTService = require('../services/trading/COTService');
const { protect, authorize } = require('../middleware/pg/auth');

router.use(protect);

router.get('/country/:country', macroController.getCountryMacro);
router.get('/strength', macroController.getStrengthScores);
router.get('/strength/matrix', macroController.getStrengthMatrix);

// COT Global Data routes
router.get('/cot/global-matrix', async (req, res) => {
    try { const data = await COTService.getGlobalMatrix(); res.json({ success: true, data }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.get('/cot/historical-index', async (req, res) => {
    try { const data = await COTService.getCOTHistoricalIndex(); res.json({ success: true, data }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin-only data sync
router.post('/sync', authorize('admin'), macroController.syncData);

module.exports = router;