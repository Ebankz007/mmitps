const TradeJournalRepository = require('../../repositories/TradeJournalRepository');
const BaseService = require('../BaseService');

class TradeJournalService extends BaseService {
    constructor() {
        super(TradeJournalRepository);
    }

    async getMyJournal(userId) {
        return TradeJournalRepository.findByUser(userId);
    }

    async getJournalStats(userId) {
        const stats = await TradeJournalRepository.getStats(userId);
        return stats[0] || {
            totalProfitLoss: 0,
            totalTrades: 0,
            winCount: 0,
            totalDuration: 0,
            largestWin: 0,
            largestLoss: 0
        };
    }

    async addTrade(userId, tradeData) {
        return this.create({
            ...tradeData,
            user: userId
        });
    }

    async updateTrade(userId, tradeId, updateData) {
        const trade = await this.findById(tradeId);
        if (!trade || trade.user.toString() !== userId.toString()) {
            throw new Error('Trade not found or unauthorized');
        }
        return this.update(tradeId, updateData);
    }
}

module.exports = new TradeJournalService();
