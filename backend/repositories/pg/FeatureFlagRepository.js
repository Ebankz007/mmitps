/**
 * FeatureFlagRepository — PostgreSQL edition (feature_flags).
 */
const BaseRepository = require('./BaseRepository');
const { featureFlags } = require('../../../db/schema/core');

class FeatureFlagRepository extends BaseRepository {
  constructor() {
    super(featureFlags);
  }

  async findByName(name) {
    return this.findOne({ name });
  }
}

module.exports = new FeatureFlagRepository();