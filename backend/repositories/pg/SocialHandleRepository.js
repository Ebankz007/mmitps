/**
 * SocialHandleRepository — PostgreSQL edition (social_handles).
 */
const BaseRepository = require('./BaseRepository');
const { socialHandles } = require('../../../db/schema/core');

class SocialHandleRepository extends BaseRepository {
  constructor() {
    super(socialHandles);
  }

  async findByCategory(category, options = {}) {
    return this.findAll({ category }, { sort: 'order', direction: 'asc', ...options });
  }
}

module.exports = new SocialHandleRepository();