// backend/repositories/pg/SiteStatusRepository.js — site_statuses (System, singleton)
const BaseRepository = require('./BaseRepository');
const { siteStatuses } = require('../../../db/schema/system');

class SiteStatusRepository extends BaseRepository {
  constructor() {
    super(siteStatuses);
  }

  /** Get the singleton status row (create with defaults if missing). */
  async getOrCreate() {
    const existing = await this.findAll({}, { limit: 1 });
    if (existing.length) return existing[0];
    return this.create({ version: '2.0.0' });
  }

  /** Append annealing reports (keep last 50) + update health. */
  async recordAnnealing(reports) {
    const status = await this.getOrCreate();
    const reportsWithTs = reports.map((r) => ({ ...r, timestamp: new Date() }));
    const merged = [...(status.annealingReports || []), ...reportsWithTs].slice(-50);
    const hasErrors = reports.some((r) => r.status === 'error');
    const hasWarnings = reports.some((r) => r.status === 'warning');
    return this.update(status.id, {
      annealingReports: merged,
      health: {
        status: hasErrors ? 'critical' : hasWarnings ? 'degraded' : 'healthy',
        lastChecked: new Date(),
      },
    });
  }
}

module.exports = new SiteStatusRepository();