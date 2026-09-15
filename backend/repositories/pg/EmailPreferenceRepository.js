// backend/repositories/pg/EmailPreferenceRepository.js — email_preferences (System, singleton)
const BaseRepository = require('./BaseRepository');
const { emailPreferences } = require('../../../db/schema/system');

class EmailPreferenceRepository extends BaseRepository {
  constructor() {
    super(emailPreferences);
  }

  /** Get the singleton preferences row (create with defaults if missing). */
  async getSingleton() {
    const existing = await this.findAll({}, { limit: 1 });
    if (existing.length) return existing[0];
    return this.create({ key: 'email_preferences' });
  }
}

module.exports = new EmailPreferenceRepository();