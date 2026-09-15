// backend/repositories/pg/MenuRepository.js — menus (CMS, recursive items as JSONB)
const BaseRepository = require('./BaseRepository');
const { menus } = require('../../../db/schema/cms');

class MenuRepository extends BaseRepository {
  constructor() {
    super(menus);
  }

  async findByLocation(location) {
    return this.findOne({ location });
  }

  /** Upsert by location (one menu per location — unique constraint). */
  async upsertByLocation(location, data) {
    const existing = await this.findByLocation(location);
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create({ ...data, location });
  }
}

module.exports = new MenuRepository();