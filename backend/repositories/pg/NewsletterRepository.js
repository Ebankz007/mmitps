// backend/repositories/pg/NewsletterRepository.js — newsletters (System)
const BaseRepository = require('./BaseRepository');
const { newsletters } = require('../../../db/schema/system');

class NewsletterRepository extends BaseRepository {
  constructor() {
    super(newsletters);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }
}

module.exports = new NewsletterRepository();