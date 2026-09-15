/**
 * PendingWithdrawalRepository — PostgreSQL edition.
 * Withdrawal approval workflow: status transitions + approval log (JSONB).
 */
const BaseRepository = require('./BaseRepository');
const { pendingWithdrawals } = require('../../../db/schema/financial');

class PendingWithdrawalRepository extends BaseRepository {
  constructor() {
    super(pendingWithdrawals);
  }

  async findByUserId(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  async findPending(options = {}) {
    return this.findAll({ status: 'pending_approval' }, { sort: 'createdAt', ...options });
  }

  async findByStatus(status, options = {}) {
    return this.findAll({ status }, { sort: '-createdAt', ...options });
  }

  /** Approve a withdrawal (appends to the approvals JSONB log) */
  async approve(id, approverId, notes = '') {
    const current = await this.findById(id);
    if (!current) return null;
    const approvals = Array.isArray(current.approvals) ? current.approvals : [];
    approvals.push({ approver: approverId, action: 'approved', notes, timestamp: new Date().toISOString() });
    return this.update(id, {
      status: 'approved',
      approvals,
      requiresApproval: false,
    });
  }

  /** Reject a withdrawal */
  async reject(id, approverId, notes = '') {
    const current = await this.findById(id);
    if (!current) return null;
    const approvals = Array.isArray(current.approvals) ? current.approvals : [];
    approvals.push({ approver: approverId, action: 'rejected', notes, timestamp: new Date().toISOString() });
    return this.update(id, {
      status: 'rejected',
      approvals,
      requiresApproval: false,
    });
  }

  async markProcessing(id) {
    return this.update(id, { status: 'processing' });
  }

  async markCompleted(id, transactionId) {
    return this.update(id, { status: 'completed', transactionId });
  }

  async markCancelled(id, notes = '') {
    return this.update(id, { status: 'cancelled', notes });
  }
}

module.exports = new PendingWithdrawalRepository();