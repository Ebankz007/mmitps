/**
 * KYCRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { kycDocuments } = require('../../../db/schema/kyc');

class KYCRepository extends BaseRepository {
  constructor() {
    super(kycDocuments);
  }

  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, { sort: 'createdAt', direction: 'desc', ...options });
  }

  async findPending(options = {}) {
    return this.findAll({ status: 'pending' }, { sort: 'createdAt', direction: 'asc', ...options });
  }

  async updateStatus(documentId, status, verifiedById, rejectionReason = null) {
    return this.update(documentId, {
      status,
      verifiedById,
      verifiedAt: new Date(),
      rejectionReason,
    });
  }
}

module.exports = new KYCRepository();