// backend/repositories/pg/SiteContentRepository.js — site_contents (CMS)
const BaseRepository = require('./BaseRepository');
const { siteContents } = require('../../../db/schema/core');

class SiteContentRepository extends BaseRepository {
  constructor() {
    super(siteContents);
  }

  /** All active sections for a page, ordered by sortOrder. */
  async findByPage(page) {
    return this.findAll({ page, isActive: true }, { sort: 'sortOrder' });
  }

  /** Single section by slug (admin view — includes inactive). */
  async findBySlug(slug) {
    return this.findOne({ slug });
  }

  /** Upsert by slug (create or update). */
  async upsertBySlug(slug, data) {
    const existing = await this.findBySlug(slug);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create({ ...data, slug });
  }

  /** Bulk upsert sections for a page. */
  async bulkUpsert(page, sections) {
    const results = [];
    for (const section of sections) {
      results.push(await this.upsertBySlug(section.slug, { ...section, page }));
    }
    return results;
  }
}

module.exports = new SiteContentRepository();