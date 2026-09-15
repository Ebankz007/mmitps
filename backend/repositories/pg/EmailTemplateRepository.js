// backend/repositories/pg/EmailTemplateRepository.js — email_templates (System)
const BaseRepository = require('./BaseRepository');
const { emailTemplates } = require('../../../db/schema/system');

class EmailTemplateRepository extends BaseRepository {
  constructor() {
    super(emailTemplates);
  }

  async findByKey(key) {
    return this.findOne({ key });
  }
}

module.exports = new EmailTemplateRepository();