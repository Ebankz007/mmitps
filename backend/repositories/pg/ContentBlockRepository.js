// backend/repositories/pg/ContentBlockRepository.js — content_blocks (CMS)
const BaseRepository = require('./BaseRepository');
const { contentBlocks } = require('../../../db/schema/core');

class ContentBlockRepository extends BaseRepository {
  constructor() {
    super(contentBlocks);
  }

  async findBySlug(slug) {
    return this.findOne({ slug });
  }
}

module.exports = new ContentBlockRepository();