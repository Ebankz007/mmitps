/**
 * TierService — PostgreSQL edition.
 * Mirrors the Mongo TierService (locked-balance tier upgrades) on the pg stack.
 * Users carry tier_id + locked_wallet_balance columns; locked commissions live
 * in mlm_commissions (status = 'locked', unlocks_at_tier_level).
 */
const { pool } = require('../../../db');
const UserRepository = require('../../repositories/pg/UserRepository');
const TierRepository = require('../../repositories/pg/TierRepository');
const MLMCommissionRepository = require('../../repositories/pg/MLMCommissionRepository');

class TierService {
  /**
   * Calculates the prorated difference between the user's current tier and desired tier.
   */
  static calculateUpgradeCost(currentTier, targetTier) {
    if (!currentTier || !targetTier) return 0;
    if (targetTier.level <= currentTier.level) return 0; // No downgrades/sideways via this path
    const diff = Number(targetTier.price) - Number(currentTier.price);
    return diff > 0 ? diff : 0;
  }

  /**
   * Retrieves the locked wallet balance and checks sufficiency for the target tier.
   */
  static async checkLockedBalanceUpgradeExigency(userId, targetTierId) {
    const user = await UserRepository.findById(userId);
    const targetTier = await TierRepository.findById(targetTierId);

    if (!user || !targetTier || !user.tierId) throw new Error('Invalid upgrade parameters');

    const currentTier = await TierRepository.findById(user.tierId);
    if (!currentTier) throw new Error('User currently has no tier');

    const upgradeCost = this.calculateUpgradeCost(currentTier, targetTier);
    if (upgradeCost <= 0) throw new Error('Invalid target tier level');

    return {
      canUpgradeWithBalance: Number(user.lockedWalletBalance || 0) >= upgradeCost,
      lockedBalance: Number(user.lockedWalletBalance || 0),
      upgradeCost,
      currentTier,
      targetTier,
    };
  }

  /**
   * Consumes locked commissions to upgrade the user if sufficient balance exists.
   * Runs in a single PG transaction.
   */
  static async upgradeViaLockedBalance(userId, targetTierId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const user = await UserRepository.findById(userId);
      const targetTier = await TierRepository.findById(targetTierId);

      if (!user || !targetTier || !user.tierId) throw new Error('Invalid upgrade parameters');
      const currentTier = await TierRepository.findById(user.tierId);
      if (!currentTier) throw new Error('User currently has no tier');

      const upgradeCost = this.calculateUpgradeCost(currentTier, targetTier);
      if (upgradeCost <= 0) throw new Error('Invalid tier upgrade path');

      if (Number(user.lockedWalletBalance || 0) < upgradeCost) {
        throw new Error('Insufficient locked commission balance to upgrade');
      }

      // Find all locked commissions for this user, oldest first
      const lockedCommissions = await MLMCommissionRepository.findAll(
        { userId, status: 'locked' },
        { sort: 'createdAt' }
      );

      let remainingCost = upgradeCost;

      for (const commission of lockedCommissions) {
        if (remainingCost <= 0) break;

        const amount = Number(commission.amount);
        if (amount <= remainingCost) {
          remainingCost -= amount;
          await client.query(
            `UPDATE mlm_commissions SET status = 'approved', is_used_for_upgrade = true WHERE id = $1`,
            [commission.id]
          );
        } else {
          // Split: consume `remainingCost`, keep the rest locked as a remainder
          const remainder = amount - remainingCost;
          await client.query(
            `UPDATE mlm_commissions SET amount = $1, status = 'approved', is_used_for_upgrade = true WHERE id = $2`,
            [remainingCost, commission.id]
          );
          await client.query(
            `INSERT INTO mlm_commissions (user_id, type, amount, currency, status, unlocks_at_tier_level, description)
             VALUES ($1, $2, $3, $4, 'locked', $5, $6)`,
            [commission.userId, commission.type, remainder, commission.currency || 'USD',
             commission.unlocksAtTierLevel, 'Remainder from tier upgrade partial consumption']
          );
          remainingCost = 0;
        }
      }

      // Deduct from locked balance and set the new tier
      const newLockedBalance = Number(user.lockedWalletBalance || 0) - upgradeCost;
      await client.query(
        `UPDATE users SET locked_wallet_balance = $1, tier_id = $2 WHERE id = $3`,
        [newLockedBalance, targetTierId, userId]
      );

      // Unlock other commissions now eligible at the new tier level
      await this._unlockEligibleCommissionsTx(client, userId, targetTier.level);

      await client.query('COMMIT');
      return { success: true, newTier: targetTier.code };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Upgrades the user traditionally via cash/crypto payment (simulated).
   */
  static async upgradeNormally(userId, targetTierId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const targetTier = await TierRepository.findById(targetTierId);
      if (!targetTier) throw new Error('Target tier not found');

      await client.query(`UPDATE users SET tier_id = $1 WHERE id = $2`, [targetTierId, userId]);
      await this._unlockEligibleCommissionsTx(client, userId, targetTier.level);

      await client.query('COMMIT');
      return { success: true, newTier: targetTier.code };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Called after any tier upgrade to free up previously locked commissions
   * whose unlocks_at_tier_level is now satisfied. Runs inside a caller-provided
   * transaction client.
   */
  static async _unlockEligibleCommissionsTx(client, userId, newTierLevel) {
    const result = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM mlm_commissions
       WHERE user_id = $1 AND status = 'locked' AND unlocks_at_tier_level <= $2`,
      [userId, newTierLevel]
    );
    const totalUnlocked = Number(result.rows[0].total);

    if (totalUnlocked > 0) {
      await client.query(
        `UPDATE mlm_commissions SET status = 'approved'
         WHERE user_id = $1 AND status = 'locked' AND unlocks_at_tier_level <= $2`,
        [userId, newTierLevel]
      );
      await client.query(
        `UPDATE users SET locked_wallet_balance = GREATEST(locked_wallet_balance - $1, 0) WHERE id = $2`,
        [totalUnlocked, userId]
      );
    }
  }

  /**
   * Public wrapper (non-transactional) — kept for parity with the Mongo API.
   */
  static async unlockEligibleCommissions(userId, newTierLevel) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await this._unlockEligibleCommissionsTx(client, userId, newTierLevel);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = TierService;