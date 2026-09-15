/**
 * PaymentGatewayRepository — PostgreSQL edition (payment_gateways).
 */
const BaseRepository = require('./BaseRepository');
const { paymentGateways } = require('../../../db/schema/core');

class PaymentGatewayRepository extends BaseRepository {
  constructor() {
    super(paymentGateways);
  }

  async findByName(name) {
    return this.findOne({ name });
  }
}

module.exports = new PaymentGatewayRepository();