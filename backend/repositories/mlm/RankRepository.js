const BaseRepository = require('../BaseRepository');
const MLMRank = require('../../models/MLM/Rank');

class RankRepository extends BaseRepository {
    constructor() {
        super(MLMRank);
    }

    /**
     * Get all ranks sorted by level (ascending)
     */
    async getRankHierarchy() {
        return this.findAll({ isActive: true }, { sort: 'level' });
    }

    /**
     * Find rank by name
     */
    async findByName(name) {
        return this.findOne({ name, isActive: true });
    }

    /**
     * Find rank by level
     */
    async findByLevel(level) {
        return this.findOne({ level, isActive: true });
    }

    /**
     * Get next rank in hierarchy
     */
    async getNextRank(currentLevel) {
        return this.findOne(
            { level: { $gt: currentLevel }, isActive: true },
            { sort: 'level' }
        );
    }

    /**
     * Get previous rank in hierarchy
     */
    async getPreviousRank(currentLevel) {
        return this.findOne(
            { level: { $lt: currentLevel }, isActive: true },
            { sort: '-level' }
        );
    }

    /**
     * Get rank requirements for a specific rank
     */
    async getRankRequirements(rankName) {
        const rank = await this.findByName(rankName);
        return rank ? rank.requirements : null;
    }

    /**
     * Get rank benefits for a specific rank
     */
    async getRankBenefits(rankName) {
        const rank = await this.findByName(rankName);
        return rank ? rank.benefits : null;
    }

    /**
     * Check if rank exists
     */
    async rankExists(name) {
        const count = await this.count({ name, isActive: true });
        return count > 0;
    }

    /**
     * Get all active ranks with their requirements and benefits
     */
    async getAllRanksWithDetails() {
        return this.findAll(
            { isActive: true },
            { sort: 'level', select: 'name level requirements benefits badge color' }
        );
    }
}

module.exports = new RankRepository();
