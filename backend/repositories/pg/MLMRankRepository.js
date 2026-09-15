/**
 * MLMRankRepository — PostgreSQL edition.
 * Mirrors the Mongo mlm/RankRepository method-for-method.
 */
const BaseRepository = require('./BaseRepository');
const { mlmRanks } = require('../../../db/schema/mlm');

class MLMRankRepository extends BaseRepository {
  constructor() {
    super(mlmRanks);
  }

  async getRankHierarchy() {
    return this.findAll({ isActive: true }, { sort: 'level' });
  }

  async findByName(name) {
    return this.findOne({ name, isActive: true });
  }

  async findByLevel(level) {
    return this.findOne({ level, isActive: true });
  }

  async getNextRank(currentLevel) {
    return this.findOne({ level: { $gt: currentLevel }, isActive: true }, { sort: 'level' });
  }

  async getPreviousRank(currentLevel) {
    return this.findOne({ level: { $lt: currentLevel }, isActive: true }, { sort: '-level' });
  }

  async getRankRequirements(rankName) {
    const rank = await this.findByName(rankName);
    return rank ? rank.requirements : null;
  }

  async getRankBenefits(rankName) {
    const rank = await this.findByName(rankName);
    return rank ? rank.benefits : null;
  }

  async rankExists(name) {
    return (await this.count({ name, isActive: true })) > 0;
  }

  async getAllRanksWithDetails() {
    return this.findAll({ isActive: true }, { sort: 'level', select: 'name,level,requirements,benefits,badge,color' });
  }
}

module.exports = new MLMRankRepository();