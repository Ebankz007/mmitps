const express = require('express');
const router = express.Router();
const COTService = require('../services/trading/COTService');
const FundamentalService = require('../services/pg/FundamentalService');
const SeasonalityService = require('../services/trading/SeasonalityService');
const ContractCalendarService = require('../services/trading/ContractCalendarService');
const ContractHeatMapService = require('../services/trading/ContractHeatMapService');
const ContractDataService = require('../services/trading/ContractDataService');
const StrategyService = require('../services/trading/StrategyService');
const { protect } = require('../middleware/pg/auth');
const ApiResponse = require('../utils/ApiResponse');

router.get('/cot/:asset', protect, async (req, res) => {
    try {
        const asset = req.params.asset;
        const report = await COTService.getLatestReport(asset);
        res.json(new ApiResponse(true, report));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/macro/:country', protect, async (req, res) => {
    try {
        const country = req.params.country;
        const data = await FundamentalService.getCountryMacro(country);
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/strength', protect, async (req, res) => {
    try {
        const scores = await FundamentalService.getStrengthScores();
        res.json(new ApiResponse(true, scores));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/strength/matrix', protect, async (req, res) => {
    try {
        const matrix = await FundamentalService.getStrengthMatrix();
        res.json(new ApiResponse(true, matrix));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/seasonality/:symbol', protect, async (req, res) => {
    try {
        const symbol = req.params.symbol;
        const data = await SeasonalityService.getSeasonality(symbol);
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/heatmap', protect, async (req, res) => {
    try {
        const data = await SeasonalityService.getHeatmap();
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/seasonality/planner/:year/:month', protect, async (req, res) => {
    try {
        const { year, month } = req.params;
        const data = await SeasonalityService.getPlannerData(year, month);
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/seasonality/proview/:symbol', protect, async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await SeasonalityService.getProViewData(symbol);
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/contracts/calendar/:year/:month', protect, async (req, res) => {
    try {
        const { year, month } = req.params;
        // Use live ContractDataService first; fall back handled internally
        const [calendarData, schedule] = await Promise.all([
            ContractDataService.getExpirationCalendar(year, month),
            ContractCalendarService.getExpirationSchedule(year, month)
        ]);
        const status = await ContractDataService.getDataSourceStatus();
        res.json(new ApiResponse(true, { calendar: calendarData, schedule, meta: status }));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/contracts/stats', protect, async (req, res) => {
    try {
        const [stats, alerts, specs, quotes] = await Promise.all([
            ContractCalendarService.getContractStats(),
            ContractCalendarService.getCriticalAlerts(),
            ContractDataService.getFuturesSpecifications(),
            ContractDataService.getContractQuotes()
        ]);
        const status = await ContractDataService.getDataSourceStatus();
        res.json(new ApiResponse(true, { stats, alerts, specs, quotes, dataSource: status }));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/contracts/planner/watchlist', protect, async (req, res) => {
    try {
        const watchlist = await ContractCalendarService.getPlannerWatchlist();
        res.json(new ApiResponse(true, watchlist));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/contracts/planner/specs', protect, async (req, res) => {
    try {
        // Live specs via ContractDataService (falls back to static if no key)
        const specs = await ContractDataService.getFuturesSpecifications();
        res.json(new ApiResponse(true, specs));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

// ─── NEW: Data Source Status ───────────────────────────────────────────────
router.get('/contracts/data-source', protect, async (req, res) => {
    try {
        const status = await ContractDataService.getDataSourceStatus();
        res.json(new ApiResponse(true, status));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/contracts/heatmap/:type', protect, async (req, res) => {
    try {
        const type = req.params.type;
        let data;
        if (type === 'margin') data = await ContractHeatMapService.getMarginData();
        else if (type === 'liquidity') data = await ContractHeatMapService.getLiquidityData();
        else if (type === 'comparison') data = await ContractHeatMapService.getComparisonData();
        else if (type === 'volatility') data = await ContractHeatMapService.getVolatilityCorrelation();

        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/strategies', protect, async (req, res) => {
    try {
        const data = await StrategyService.getCategorizedStrategies();
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

router.get('/strategies/:id', protect, async (req, res) => {
    try {
        const data = await StrategyService.getStrategyDetails(req.params.id);
        if (!data) return res.status(404).json(new ApiResponse(false, null, 'Strategy not found'));
        res.json(new ApiResponse(true, data));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, null, error.message));
    }
});

module.exports = router;
