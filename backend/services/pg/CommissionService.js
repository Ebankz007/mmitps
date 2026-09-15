/**
 * CommissionService — PostgreSQL edition.
 * Mirrors the Mongo services/mlm/CommissionService.
 * PG adaptations: tier commission rates come from the tiers table via user.tierId
 * (Mongo populated preferences.tier); period {} is split into periodType/
 * periodStart/periodEnd columns; getCommissionsReport batches one query instead
 * of N+1.
 */
const MLMCommissionRepository = require('../../repositories/pg/MLMCommissionRepository');
const MLMTreeNodeRepository = require('../../repositories/pg/MLMTreeNodeRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const TierRepository = require('../../repositories/pg/TierRepository');
const WalletService = require('./WalletService');
const ApiError = require('../../utils/ApiError');

/** Resolve a user's tier commission rate + level (fallback 5% / level 0). */
async function getTierCommission(userId, field) {
  const user = await UserRepository.findById(userId);
  if (!user) return { percentage: 0.05, level: 0 };
  let tier = null;
  if (user.tierId) tier = await TierRepository.findById(user.tierId);
  const rate = tier?.commissions?.[field];
  return {
    percentage: typeof rate === 'number' ? rate / 100 : 0.05,
    level: tier?.level || 0,
  };
}

class CommissionService {
  /** Direct referral commission based on sponsor's tier percentage. */
  async calculateDirectReferral(sponsorId, amount, type = 'subscription', purchasedTierLevel = 0) {
    const { percentage: commissionPercentage, level: sponsorLevel } =
      await getTierCommission(sponsorId, 'directReferralPercent');

    const commissionAmount = amount * commissionPercentage;
    if (commissionAmount <= 0) return 0;

    let status = 'paid';
    let unlocksAtTierLevel = null;

    if (purchasedTierLevel > sponsorLevel) {
      status = 'locked';
      unlocksAtTierLevel = purchasedTierLevel;
    } else {
      await WalletService.deposit(sponsorId, commissionAmount, 'USD', 'internal', `REF-${Date.now()}`);
    }

    await MLMCommissionRepository.create({
      userId: sponsorId,
      type: 'direct_referral',
      amount: commissionAmount,
      status,
      unlocksAtTierLevel,
      description: `Direct referral bonus for ${type} (${commissionPercentage * 100}%)`,
    });

    return commissionAmount;
  }

  /** Multi-level referral commission (5 levels deep, 10% each). */
  async calculateMultiLevelReferral(userId, amount, type = 'registration') {
    if (!amount || amount <= 0) return;

    let currentUserId = userId;
    const commissionPercent = 0.10;
    const maxLevels = 5;

    for (let level = 1; level <= maxLevels; level++) {
      const node = await MLMTreeNodeRepository.findByUserId(currentUserId);
      if (!node || !node.sponsorId) break;

      const sponsorId = node.sponsorId;
      const commissionAmount = amount * commissionPercent;

      if (commissionAmount > 0) {
        await WalletService.deposit(
          sponsorId,
          commissionAmount,
          'USD',
          'referral_commission',
          `LEVEL-${level}-${type.toUpperCase()}-REF-${userId}`
        );

        await MLMCommissionRepository.create({
          userId: sponsorId,
          sourceUserId: userId,
          type: 'direct_referral',
          amount: commissionAmount,
          status: 'paid',
          generation: level,
          description: `Level ${level} referral commission from ${type} (${commissionPercent * 100}%)`,
        });
      }

      currentUserId = sponsorId;
    }
  }

  /** Binary match commission — matches weaker leg volume, pays on matched amount. */
  async calculateBinaryMatch(userId, period = null, targetTierLevel = 0) {
    const node = await MLMTreeNodeRepository.findByUserId(userId);
    if (!node) throw new ApiError(404, 'User not found in genealogy tree');

    const { percentage: commissionPercentage, level: sponsorLevel } =
      await getTierCommission(userId, 'binaryMatchPercent');

    const leftVolume = period ? node.leftLegVolumeThisPeriod : node.leftLegVolume;
    const rightVolume = period ? node.rightLegVolumeThisPeriod : node.rightLegVolume;

    const matchedVolume = Math.min(leftVolume, rightVolume);
    const carryForward = Math.abs(leftVolume - rightVolume);

    const commissionAmount = matchedVolume * commissionPercentage;

    if (commissionAmount > 0) {
      let status = 'pending';
      let unlocksAtTierLevel = null;

      if (targetTierLevel > sponsorLevel) {
        status = 'locked';
        unlocksAtTierLevel = targetTierLevel;
      }

      const commission = await MLMCommissionRepository.create({
        userId,
        type: 'binary_match',
        amount: commissionAmount,
        status,
        unlocksAtTierLevel,
        volumeLeft: leftVolume,
        volumeRight: rightVolume,
        volumeMatched: matchedVolume,
        carryForward,
        rank: node.rank,
        periodType: period ? 'weekly' : null,
        periodStart: period ? new Date(period.startDate) : null,
        periodEnd: period ? new Date(period.endDate) : null,
        description: `Binary match commission for ${matchedVolume} matched volume (${commissionPercentage * 100}%)`,
      });

      return commission;
    }

    return null;
  }

  /** Matching bonus from direct downline commissions, based on rank. */
  async calculateMatchingBonus(userId, period = null) {
    const node = await MLMTreeNodeRepository.findByUserId(userId);
    if (!node) throw new ApiError(404, 'User not found in genealogy tree');

    const matchingRates = {
      Starter: 0,
      Bronze: 0.05,
      Silver: 0.10,
      Gold: 0.15,
      Platinum: 0.20,
      Diamond: 0.25,
    };

    const matchingRate = matchingRates[node.rank] || 0;
    if (matchingRate === 0) return null;

    const children = await MLMTreeNodeRepository.getChildren(node.userId);
    if (children.length === 0) return null;

    const filters = {
      userId: { $in: children.map((c) => c.userId) },
      status: { $in: ['pending', 'approved', 'paid'] },
    };
    if (period) {
      filters.periodStart = { $gte: new Date(period.startDate) };
      filters.periodEnd = { $lte: new Date(period.endDate) };
    }

    const downlineCommissions = await MLMCommissionRepository.findAll(filters);
    const totalDownlineCommissions = downlineCommissions.reduce((sum, comm) => sum + comm.amount, 0);
    const bonusAmount = totalDownlineCommissions * matchingRate;

    if (bonusAmount > 0) {
      const commission = await MLMCommissionRepository.create({
        userId,
        type: 'matching_bonus',
        amount: bonusAmount,
        status: 'pending',
        rank: node.rank,
        generation: 1,
        periodType: period ? 'weekly' : null,
        periodStart: period ? new Date(period.startDate) : null,
        periodEnd: period ? new Date(period.endDate) : null,
        description: `Matching bonus (${matchingRate * 100}%) on downline commissions`,
      });

      return commission;
    }

    return null;
  }

  /** All commissions for a user within a date range. */
  async getCommissionsByPeriod(userId, startDate, endDate) {
    return MLMCommissionRepository.findAll(
      {
        userId,
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
      { sort: '-createdAt' }
    );
  }

  /** Commission summary grouped by type (same shape as Mongo). */
  async getUserCommissionSummary(userId, startDate, endDate) {
    const commissions = await this.getCommissionsByPeriod(userId, startDate, endDate);

    const summary = {
      binary_match: 0,
      direct_referral: 0,
      matching_bonus: 0,
      total: 0,
      details: [],
    };

    for (const comm of commissions) {
      if (comm.type === 'binary_match') summary.binary_match += comm.amount;
      else if (comm.type === 'direct_referral') summary.direct_referral += comm.amount;
      else if (comm.type === 'matching_bonus') summary.matching_bonus += comm.amount;

      if (comm.status === 'locked') {
        if (!summary.locked) summary.locked = 0;
        summary.locked += comm.amount;
      } else {
        summary.total += comm.amount;
      }

      summary.details.push({
        type: comm.type,
        amount: comm.amount,
        status: comm.status,
        date: comm.createdAt,
        description: comm.description,
      });
    }

    return summary;
  }

  /** Commission report for all users in a period (single batched query). */
  async getCommissionsReport(startDate, endDate) {
    const nodes = await MLMTreeNodeRepository.findAll({}, { populate: 'user' });
    const start = new Date(startDate);
    const end = new Date(endDate);

    // One query for all commissions in range, grouped in JS (avoids N+1)
    const allComms = await MLMCommissionRepository.findAll({
      createdAt: { $gte: start, $lte: end },
    });
    const byUser = new Map();
    for (const c of allComms) {
      if (!byUser.has(c.userId)) byUser.set(c.userId, []);
      byUser.get(c.userId).push(c);
    }

    const report = [];
    for (const node of nodes) {
      const userId = node.user?.id || node.userId;
      const username = node.user?.username || 'unknown';
      const comms = byUser.get(userId) || [];

      const summary = {
        binary_match: 0,
        direct_referral: 0,
        matching_bonus: 0,
        total: 0,
        details: [],
      };
      for (const comm of comms) {
        if (comm.type === 'binary_match') summary.binary_match += comm.amount;
        else if (comm.type === 'direct_referral') summary.direct_referral += comm.amount;
        else if (comm.type === 'matching_bonus') summary.matching_bonus += comm.amount;
        if (comm.status === 'locked') {
          if (!summary.locked) summary.locked = 0;
          summary.locked += comm.amount;
        } else {
          summary.total += comm.amount;
        }
        summary.details.push({
          type: comm.type,
          amount: comm.amount,
          status: comm.status,
          date: comm.createdAt,
          description: comm.description,
        });
      }

      report.push({
        userId,
        username,
        rank: node.rank,
        commissions: {
          binary_match: summary.binary_match,
          direct_referral: summary.direct_referral,
          matching_bonus: summary.matching_bonus,
          total: summary.total,
        },
        details: summary.details,
      });
    }

    return report;
  }
}

module.exports = new CommissionService();