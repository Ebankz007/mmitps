const TradingBotService = require('../services/trading/TradingBotService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Handle creation of a new bot
 */
exports.createBot = async (req, res, next) => {
    console.log('[BotController] createBot called for user:', req.user?._id);
    try {
        const bot = await TradingBotService.createBot(req.user._id, req.body);
        res.status(201).json(new ApiResponse(true, bot, 'Trading bot created successfully'));
    } catch (error) {
        next(error);
    }
};

/**
 * List all bots for a user
 */
exports.getMyBots = async (req, res, next) => {
    try {
        const bots = await TradingBotService.getUserBots(req.user._id);
        res.status(200).json(new ApiResponse(true, bots, 'Bots retrieved'));
    } catch (error) {
        next(error);
    }
};

/**
 * Update bot status (Start/Stop/Pause)
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const bot = await TradingBotService.updateStatus(id, req.user._id, status);
        res.status(200).json(new ApiResponse(true, bot, `Bot status updated to ${status}`));
    } catch (error) {
        next(error);
    }
};
