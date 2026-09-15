const BaseRepository = require('./BaseRepository');
const { systemConfigs } = require('../../../db/schema/system');

class SystemConfigRepository extends BaseRepository {
  constructor() {
    super(systemConfigs);
  }

  /** Find config by key. */
  async findByKey(key) {
    return this.findOne({ key });
  }

  /** Get config value (JSONB) or default. */
  async getValue(key, fallback = null) {
    const config = await this.findByKey(key);
    return config?.value ?? fallback;
  }

  /** Upsert a config value (JSONB) with optional lastModifiedBy. */
  async updateConfig(key, value, lastModifiedBy = null) {
    const existing = await this.findByKey(key);
    const data = { key, value, lastModifiedBy };
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create(data);
  }
}

module.exports = new SystemConfigRepository();