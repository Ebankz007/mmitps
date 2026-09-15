/**
 * Trading bot routes — PostgreSQL edition.
 */
const express = require('express');
const router = express.Router();
const tradingBotController = require('../controllers/pg/tradingBotController');
const { protect } = require('../middleware/pg/auth');

router.get('/health', (req, res) => res.send('Bot Route OK'));

/**
 * @route   POST /api/v1/bot-system
 * @desc    Create a new trading bot
 */
router.post('/', protect, tradingBotController.createBot);

/**
 * @route   GET /api/v1/bot-system
 * @desc    Get user's bots
 */
router.get('/', protect, tradingBotController.getMyBots);

/**
 * @route   PATCH /api/v1/bot-system/:id/status
 * @desc    Update bot status (active, paused, stopped)
 */
router.patch('/:id/status', protect, tradingBotController.updateStatus);

module.exports = router;