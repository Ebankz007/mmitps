/**
 * AnalysisRepository — PostgreSQL edition.
 * Mirrors the Mongo repo (findActive, findByPair with author populate).
 */
const BaseRepository = require('./BaseRepository');
const { analyses } = require('../../../db/schema/trading');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class AnalysisRepository extends BaseRepository {
  constructor() {
    super(analyses, {
      relations: {
        author: { table: users, on: eq(analyses.authorId, users.id) },
      },
    });
  }

  async findActive(options = {}) {
    return this.findAll({}, { sort: '-createdAt', populate: 'author', ...options });
  }

  async findByPair(pair, options = {}) {
    return this.findAll({ pair }, { sort: '-createdAt', populate: 'author', ...options });
  }

  /** Increment view counter */
  async incrementViews(id) {
    const current = await this.findById(id);
    if (!current) return null;
    return this.update(id, { viewCount: (current.viewCount || 0) + 1 });
  }
}

module.exports = new AnalysisRepository();