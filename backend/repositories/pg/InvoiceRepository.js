const BaseRepository = require('./BaseRepository');
const { invoices } = require('../../../db/schema/core');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(invoices);
  }

  /** Find all invoices for a user. */
  async findByUser(userId, options = {}) {
    return this.findAll({ userId }, options);
  }

  /** Find invoices by status (e.g., 'open', 'paid'). */
  async findByStatus(status, options = {}) {
    return this.paginate({ status }, options);
  }
}

module.exports = new InvoiceRepository();