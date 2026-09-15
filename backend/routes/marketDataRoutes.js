const express = require('express');
const router = express.Router();
const {
    getQuotes,
    getHistory,
    getCalendar
} = require('../controllers/marketDataController');

// GET /api/v1/market-data/quotes
router.get('/quotes', getQuotes);

// GET /api/v1/market-data/history
router.get('/history', getHistory);

// GET /api/v1/market-data/calendar
router.get('/calendar', getCalendar);

module.exports = router;
