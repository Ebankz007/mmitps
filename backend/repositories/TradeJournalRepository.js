const BaseRepository = require('./BaseRepository');
const TradeJournal = require('../models/Trading/TradeJournal');

class TradeJournalRepository extends BaseRepository {
    constructor() {
        super(TradeJournal);
    }

    async findByUser(userId) {
        return this.model.find({ user: userId }).sort({ entryTime: -1 });
    }

    async findByStatus(userId, status) {
        return this.model.find({ user: userId, status }).sort({ entryTime: -1 });
    }

    async getStats(userId) {
        return this.model.aggregate([
            { $match: { user: userId, status: 'closed' } },
            {
                $group: {
                    _id: null,
                    totalProfitLoss: { $sum: '$netProfitLoss' },
                    totalTrades: { $sum: 1 },
                    winCount: {
                        $sum: { $cond: [{ $gt: ['$netProfitLoss', 0] }, 1, 0] }
                    },
                    totalDuration: { $sum: '$duration' },
                    largestWin: { $max: '$netProfitLoss' },
                    largestLoss: { $min: '$netProfitLoss' }
                }
            }
        ]);
    }
}

module.exports = new TradeJournalRepository();
