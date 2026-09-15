// backend/repositories/pg/PageRepository.js — pages (CMS; content refs → content_blocks)
const BaseRepository = require('./BaseRepository');
const { pages } = require('../../../db/schema/cms');

class PageRepository extends BaseRepository {
  constructor() {
    super(pages);
  }

  async findBySlug(slug) {
    return this.findOne({ slug });
  }
}

module.exports = new PageRepository();