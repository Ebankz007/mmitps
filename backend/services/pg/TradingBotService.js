/**
 * TradingBotService — PostgreSQL edition.
 * Mirrors the Mongo TradingBotService (createBot/getUserBots/updateStatus).
 */
const TradingBotRepository = require('../../repositories/pg/TradingBotRepository');
const ApiError = require('../../utils/ApiError');

class TradingBotService {
  async createBot(userId, botData) {
    return TradingBotRepository.create({
      ...botData,
      userId,
      status: botData.status || 'paused',
    });
  }

  async getUserBots(userId) {
    return TradingBotRepository.findByUser(userId);
  }

  async updateStatus(id, userId, status) {
    if (!['active', 'paused', 'stopped'].includes(status)) {
      throw new ApiError(400, 'Invalid bot status');
    }
    const bot = await TradingBotRepository.findByIdAndUser(id, userId);
    if (!bot) throw new ApiError(404, 'Bot not found or unauthorized');
    return TradingBotRepository.update(id, { status });
  }
}

module.exports = new TradingBotService();