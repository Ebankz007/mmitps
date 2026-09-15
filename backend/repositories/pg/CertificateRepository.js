// backend/repositories/pg/CertificateRepository.js — certificates (Education)
const BaseRepository = require('./BaseRepository');
const { certificates } = require('../../../db/schema/core');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class CertificateRepository extends BaseRepository {
  constructor() {
    super(certificates, {
      relations: {
        recipient: { table: users, on: eq(certificates.recipientId, users.id) },
      },
    });
  }

  async findByCode(code) {
    return this.findOne({ code }, { populate: 'recipient' });
  }

  async findByRecipient(recipientId) {
    return this.findAll({ recipientId }, { sort: '-issueDate' });
  }

  async findActiveByCode(code) {
    return this.findOne({ code, status: 'active' }, { populate: 'recipient' });
  }

  async findByRecipientAndCourse(recipientId, courseId) {
    return this.findOne({ recipientId, courseId });
  }
}

module.exports = new CertificateRepository();