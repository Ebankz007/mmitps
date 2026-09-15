// backend/repositories/pg/COTReportRepository.js — cot_reports (Trading)
const BaseRepository = require('./BaseRepository');
const { cotReports } = require('../../../db/schema/trading');
const { and, eq } = require('drizzle-orm');

class COTReportRepository extends BaseRepository {
  constructor() {
    super(cotReports);
  }

  /** Find the latest report for an asset. */
  async findLatestByAsset(asset) {
    const rows = await this.findAll({ asset }, { sort: '-reportingDate', limit: 1 });
    return rows[0] ?? null;
  }

  /**
   * Upsert a report by (asset, reportingDate) — mirrors the Mongo
   * bulkWrite updateOne upsert used by COTDataMinerService.
   */
  async upsertByAssetDate(data) {
    const existing = await this.findOne({
      asset: data.asset,
      reportingDate: data.reportingDate instanceof Date ? data.reportingDate : new Date(data.reportingDate),
    });
    if (existing) {
      return this.update(existing.id, data);
    }
    return this.create(data);
  }
}

module.exports = new COTReportRepository();