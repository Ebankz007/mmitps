const BaseRepository = require('../BaseRepository');
const MLMRankHistory = require('../../models/MLM/RankHistory');

class RankHistoryRepository extends BaseRepository {
    constructor() {
        super(MLMRankHistory);
    }

    /**
     * Get user's rank history sorted by achievement date (most recent first)
     */
    async findByUser(userId, options = {}) {
        const defaultOptions = { sort: '-achievedAt', ...options };
        return this.findAll({ user: userId }, defaultOptions);
    }

    /**
     * Get user's latest rank achievement
     */
    async getLatestRank(userId) {
        const history = await this.findOne(
            { user: userId },
            { sort: '-achievedAt' }
        );
        return history ? history.newRank : null;
    }

    /**
     * Get user's rank achievements with details
     */
    async getRankAchievements(userId) {
        return this.findAll(
            { user: userId },
            {
                sort: '-achievedAt',
                populate: 'bonusTransaction'
            }
        );
    }

    /**
     * Check if user has achieved a specific rank
     */
    async hasAchievedRank(userId, rankName) {
        const count = await this.count({ user: userId, newRank: rankName });
        return count > 0;
    }

    /**
     * Get rank achievement date
     */
    async getRankAchievementDate(userId, rankName) {
        const history = await this.findOne(
            { user: userId, newRank: rankName },
            { sort: 'achievedAt' }
        );
        return history ? history.achievedAt : null;
    }

    /**
     * Get total bonus awarded from rank advancements
     */
    async getTotalRankBonuses(userId) {
        const history = await this.findAll({ user: userId });
        return history.reduce((total, record) => total + (record.bonusAwarded || 0), 0);
    }

    /**
     * Get rank progression timeline
     */
    async getRankProgression(userId) {
        return this.findAll(
            { user: userId },
            {
                sort: 'achievedAt',
                select: 'previousRank newRank achievedAt qualificationSnapshot bonusAwarded'
            }
        );
    }

    /**
     * Create rank history record
     */
    async createRankHistory(data) {
        return this.create(data);
    }

    /**
     * Get users who achieved a specific rank in a date range
     */
    async getUsersByRankAndDateRange(rankName, startDate, endDate) {
        return this.findAll({
            newRank: rankName,
            achievedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }, { populate: 'user' });
    }

    /**
     * Get rank statistics for a period
     */
    async getRankStatistics(startDate, endDate) {
        const history = await this.findAll({
            achievedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        const stats = {};
        history.forEach(record => {
            if (!stats[record.newRank]) {
                stats[record.newRank] = {
                    count: 0,
                    totalBonus: 0
                };
            }
            stats[record.newRank].count++;
            stats[record.newRank].totalBonus += record.bonusAwarded || 0;
        });

        return stats;
    }
}

module.exports = new RankHistoryRepository();
