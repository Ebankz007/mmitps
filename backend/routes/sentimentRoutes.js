const express = require('express');
const router = express.Router();
const sentimentController = require('../controllers/pg/SentimentController');
const { protect } = require('../middleware/pg/auth');

/**
 * @route   GET /api/v1/sentiment/overview/market
 * @desc    Get broad market sentiment overview
 * @access  Private
 * NOTE: Must be declared BEFORE /:symbol to prevent Express matching "overview" as a symbol param
 */
router.get('/overview/market', protect, sentimentController.getMarketOverview);

/**
 * @route   GET /api/v1/sentiment/:symbol
 * @desc    Get AI sentiment analysis for a symbol
 * @access  Private
 */
router.get('/:symbol', protect, sentimentController.getSentiment);

module.exports = router;