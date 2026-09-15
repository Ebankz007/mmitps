/**
 * CouponRepository — PostgreSQL edition.
 */
const BaseRepository = require('./BaseRepository');
const { coupons } = require('../../../db/schema/financial');

class CouponRepository extends BaseRepository {
  constructor() {
    super(coupons);
  }

  async findByCode(code) {
    return this.findOne({ code: String(code).toUpperCase() });
  }

  async findActive(options = {}) {
    return this.findAll({ isActive: true }, options);
  }

  async findByCategory(category, options = {}) {
    return this.findAll({ category, isActive: true }, options);
  }

  /**
   * Increment usage count — ATOMIC.
   * Single conditional UPDATE prevents the read-modify-write race that let
   * concurrent redemptions over-use a coupon (both read the same count, both
   * passed the check, both wrote — over-redemption by N-1).
   */
  async incrementUsage(id) {
    const { pool } = require('../../../db');
    const { rows } = await pool.query(
      `UPDATE coupons
       SET usage_count = usage_count + 1, updated_at = NOW()
       WHERE id = $1
         AND (usage_limit IS NULL OR usage_limit = 0 OR usage_count < usage_limit)
       RETURNING *`,
      [id]
    );
    if (!rows.length) {
      const error = new Error('Coupon usage limit reached');
      error.statusCode = 400;
      throw error;
    }
    return rows[0];
  }
}

module.exports = new CouponRepository();