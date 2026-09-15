/**
 * TradeJournalService — PostgreSQL edition.
 * Mirrors the Mongo TradeJournalService interface (getMyJournal/getJournalStats/
 * addTrade/updateTrade). Field mapping: user → userId.
 */
const TradeJournalRepository = require('../../repositories/pg/TradeJournalRepository');
const ApiError = require('../../utils/ApiError');

class TradeJournalService {
  async getMyJournal(userId) {
    return TradeJournalRepository.findByUser(userId);
  }

  async getJournalStats(userId) {
    const stats = await TradeJournalRepository.getStats(userId);
    return stats || {
      totalProfitLoss: 0,
      totalTrades: 0,
      winCount: 0,
      totalDuration: 0,
      largestWin: 0,
      largestLoss: 0,
      winRate: 0,
      avgProfitLoss: 0,
    };
  }

  async addTrade(userId, tradeData) {
    return TradeJournalRepository.create({
      ...tradeData,
      userId,
    });
  }

  async updateTrade(userId, tradeId, updateData) {
    const trade = await TradeJournalRepository.findById(tradeId);
    if (!trade || trade.userId !== userId) {
      throw new ApiError(404, 'Trade not found or unauthorized');
    }
    return TradeJournalRepository.update(tradeId, updateData);
  }
}

module.exports = new TradeJournalService();