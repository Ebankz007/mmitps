/**
 * FundamentalDataRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { fundamentalData } = require('../../../db/schema/trading');
const { pool } = require('../../../db');

class FundamentalDataRepository extends BaseRepository {
  constructor() {
    super(fundamentalData);
  }

  async findByCountry(country, options = {}) {
    return this.findAll({ country }, options);
  }

  /**
   * Latest value per indicator for a country (mirrors the Mongo aggregation).
   * Uses DISTINCT ON to grab the newest release per indicator.
   */
  async latestByCountry(country) {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (indicator)
              indicator,
              value,
              previous_value AS "previousValue",
              forecast_value AS "forecastValue",
              impact,
              release_date AS "releaseDate"
       FROM fundamental_data
       WHERE country = $1
       ORDER BY indicator, release_date DESC`,
      [country]
    );
    return rows;
  }

  /** Upsert by (country, indicator, releaseDate) — mirrors Mongo bulkWrite upsert. */
  async upsertMany(dataArray) {
    const { pool } = require('../../../db');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of dataArray) {
        const existing = await client.query(
          `SELECT id FROM fundamental_data
           WHERE country = $1 AND indicator = $2 AND release_date = $3`,
          [item.country, item.indicator, new Date(item.releaseDate)]
        );
        if (existing.rows.length) {
          await client.query(
            `UPDATE fundamental_data
             SET value = $1, previous_value = $2, forecast_value = $3, impact = $4,
                 period = $5, unit = $6, source = $7, updated_at = NOW()
             WHERE id = $8`,
            [
              String(item.value ?? ''),
              item.previousValue != null ? String(item.previousValue) : null,
              item.forecastValue != null ? String(item.forecastValue) : null,
              item.impact || 'Medium',
              item.period || null,
              item.unit || null,
              item.source || null,
              existing.rows[0].id,
            ]
          );
        } else {
          await client.query(
            `INSERT INTO fundamental_data
               (country, indicator, value, previous_value, forecast_value, impact, release_date, period, unit, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              item.country,
              item.indicator,
              String(item.value ?? ''),
              item.previousValue != null ? String(item.previousValue) : null,
              item.forecastValue != null ? String(item.forecastValue) : null,
              item.impact || 'Medium',
              new Date(item.releaseDate),
              item.period || null,
              item.unit || null,
              item.source || null,
            ]
          );
        }
      }
      await client.query('COMMIT');
      return { success: true, count: dataArray.length };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new FundamentalDataRepository();