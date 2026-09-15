/**
 * RankService — PostgreSQL edition.
 * Mirrors the Mongo services/mlm/RankService.
 * PG adaptations: node.user?.id (populated) || node.userId; rank advancement
 * bonus writes the commission via MLMCommissionRepository (Mongo called
 * CommissionService.create which does not exist) and deposits USD (Mongo passed
 * the description as the currency — latent bug fixed).
 */
const MLMRankRepository = require('../../repositories/pg/MLMRankRepository');
const MLMRankHistoryRepository = require('../../repositories/pg/MLMRankHistoryRepository');
const MLMTreeNodeRepository = require('../../repositories/pg/MLMTreeNodeRepository');
const MLMCommissionRepository = require('../../repositories/pg/MLMCommissionRepository');
const WalletService = require('./WalletService');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class RankService {
  /** Evaluate user's current rank qualification. */
  async evaluateUserRank(userId) {
    try {
      const node = await MLMTreeNodeRepository.findByUserId(userId);
      if (!node) {
        throw new ApiError(404, 'User not found in genealogy tree');
      }

      const ranks = await MLMRankRepository.getRankHierarchy();

      let highestQualifiedRank = null;
      let qualificationDetails = {};

      for (const rank of ranks) {
        const isQualified = await this.checkRankQualification(userId, rank, node);
        if (isQualified.qualified) {
          highestQualifiedRank = rank;
          qualificationDetails = isQualified.details;
        } else {
          break;
        }
      }

      return {
        currentRank: node.rank,
        qualifiedRank: highestQualifiedRank ? highestQualifiedRank.name : node.rank,
        shouldAdvance: highestQualifiedRank && highestQualifiedRank.name !== node.rank,
        qualificationDetails,
        nextRank: await this.getNextRankInfo(node.rank),
      };
    } catch (error) {
      logger.error('Error evaluating user rank:', error);
      throw error;
    }
  }

  /** Check if user qualifies for a specific rank. */
  async checkRankQualification(userId, rankConfig, node = null) {
    try {
      if (!node) {
        node = await MLMTreeNodeRepository.findByUserId(userId);
        if (!node) {
          return { qualified: false, reason: 'User not in genealogy tree' };
        }
      }

      const req = rankConfig.requirements || {};
      const details = {
        personalVolume: { required: req.personalVolume || 0, actual: node.personalVolume || 0, met: false },
        groupVolume: { required: req.groupVolume || 0, actual: node.groupVolume || 0, met: false },
        leftLegVolume: { required: req.leftLegVolume || 0, actual: node.leftLegVolume || 0, met: false },
        rightLegVolume: { required: req.rightLegVolume || 0, actual: node.rightLegVolume || 0, met: false },
        directReferrals: { required: req.directReferrals || 0, actual: 0, met: false },
        activeDirects: { required: req.activeDirects || 0, actual: 0, met: false },
        rankedDirects: { required: req.rankedDirectsRequired || [], actual: {}, met: false },
      };

      if (node.personalVolume < details.personalVolume.required) {
        return { qualified: false, reason: 'Insufficient personal volume', details };
      }
      details.personalVolume.met = true;

      if (node.groupVolume < details.groupVolume.required) {
        return { qualified: false, reason: 'Insufficient group volume', details };
      }
      details.groupVolume.met = true;

      if (node.leftLegVolume < details.leftLegVolume.required) {
        return { qualified: false, reason: 'Insufficient left leg volume', details };
      }
      details.leftLegVolume.met = true;

      if (node.rightLegVolume < details.rightLegVolume.required) {
        return { qualified: false, reason: 'Insufficient right leg volume', details };
      }
      details.rightLegVolume.met = true;

      const directReferrals = await MLMTreeNodeRepository.getDirectReferrals(userId);
      details.directReferrals.actual = directReferrals.length;

      if (directReferrals.length < details.directReferrals.required) {
        details.directReferrals.met = false;
        return { qualified: false, reason: 'Insufficient direct referrals', details };
      }
      details.directReferrals.met = true;

      const activeDirects = directReferrals.filter((ref) => ref.isActive);
      details.activeDirects.actual = activeDirects.length;

      if (activeDirects.length < details.activeDirects.required) {
        details.activeDirects.met = false;
        return { qualified: false, reason: 'Insufficient active directs', details };
      }
      details.activeDirects.met = true;

      if (details.rankedDirects.required.length > 0) {
        const rankedDirectsCheck = await this.checkRankedDirectsRequirement(directReferrals, details.rankedDirects.required);
        details.rankedDirects.actual = rankedDirectsCheck.actual;
        details.rankedDirects.met = rankedDirectsCheck.qualified;

        if (!rankedDirectsCheck.qualified) {
          return { qualified: false, reason: rankedDirectsCheck.reason, details };
        }
      } else {
        details.rankedDirects.met = true;
      }

      return { qualified: true, details };
    } catch (error) {
      logger.error('Error checking rank qualification:', error);
      throw error;
    }
  }

  /** Check required number of directs at specific ranks. */
  async checkRankedDirectsRequirement(directReferrals, requirements) {
    const rankedDirects = {};

    for (const ref of directReferrals) {
      const rank = ref.rank || 'Starter';
      rankedDirects[rank] = (rankedDirects[rank] || 0) + 1;
    }

    for (const req of requirements) {
      const count = rankedDirects[req.rank] || 0;
      if (count < req.count) {
        return {
          qualified: false,
          reason: `Need ${req.count} ${req.rank} directs, have ${count}`,
          actual: rankedDirects,
        };
      }
    }

    return { qualified: true, actual: rankedDirects };
  }

  /** Advance user to a new rank. */
  async advanceUserRank(userId, newRank, qualificationSnapshot) {
    try {
      const node = await MLMTreeNodeRepository.findByUserId(userId);
      if (!node) {
        throw new ApiError(404, 'User not found in genealogy tree');
      }

      const previousRank = node.rank;

      if (previousRank === newRank) {
        return { advanced: false, reason: 'User already at this rank' };
      }

      const rankConfig = await MLMRankRepository.findByName(newRank);
      if (!rankConfig) {
        throw new ApiError(404, `Rank configuration not found: ${newRank}`);
      }

      await MLMTreeNodeRepository.update(node.id, { rank: newRank });

      const rankHistory = await MLMRankHistoryRepository.createRankHistory({
        userId,
        previousRank,
        newRank,
        achievedAt: new Date(),
        qualificationSnapshot: qualificationSnapshot || {
          personalVolume: node.personalVolume,
          groupVolume: node.groupVolume,
          leftLegVolume: node.leftLegVolume,
          rightLegVolume: node.rightLegVolume,
          directReferrals: qualificationSnapshot?.directReferrals?.actual || 0,
          activeDirects: qualificationSnapshot?.activeDirects?.actual || 0,
        },
        bonusAwarded: 0,
      });

      let bonusTransaction = null;
      const rankAdvancementBonus = rankConfig.benefits?.rankAdvancementBonus || 0;

      if (rankAdvancementBonus > 0) {
        bonusTransaction = await this.awardRankAdvancementBonus(
          userId,
          newRank,
          rankAdvancementBonus,
          rankHistory.id
        );

        await MLMRankHistoryRepository.update(rankHistory.id, {
          bonusAwarded: rankAdvancementBonus,
          bonusTransactionId: bonusTransaction.id,
        });
      }

      logger.info(`User ${userId} advanced from ${previousRank} to ${newRank}`);

      return {
        advanced: true,
        previousRank,
        newRank,
        bonusAwarded: rankAdvancementBonus,
        rankHistory,
        bonusTransaction,
      };
    } catch (error) {
      logger.error('Error advancing user rank:', error);
      throw error;
    }
  }

  /** Award rank advancement bonus (commission + wallet deposit). */
  async awardRankAdvancementBonus(userId, newRank, bonusAmount, rankHistoryId) {
    try {
      const commission = await MLMCommissionRepository.create({
        userId,
        type: 'rank_advancement',
        amount: bonusAmount,
        status: 'approved',
        rank: newRank,
        description: `Rank advancement bonus for achieving ${newRank}`,
        metadata: { rankHistoryId },
      });

      await WalletService.deposit(
        userId,
        bonusAmount,
        'USD',
        'rank_advancement_bonus',
        `Rank advancement bonus: ${newRank}`
      );

      logger.info(`Awarded ${bonusAmount} rank advancement bonus to user ${userId}`);

      return commission;
    } catch (error) {
      logger.error('Error awarding rank advancement bonus:', error);
      throw error;
    }
  }

  /** Evaluate all users and advance those who qualify. */
  async evaluateAllUsersRanks() {
    try {
      logger.info('Starting batch rank evaluation for all users');

      const nodes = await MLMTreeNodeRepository.findAll({ isActive: true }, { populate: 'user' });

      let totalEvaluated = 0;
      let totalAdvanced = 0;
      const advancements = [];

      for (const node of nodes) {
        try {
          const userId = node.user?.id || node.userId;
          totalEvaluated++;

          const evaluation = await this.evaluateUserRank(userId);

          if (evaluation.shouldAdvance) {
            const advancement = await this.advanceUserRank(
              userId,
              evaluation.qualifiedRank,
              evaluation.qualificationDetails
            );

            if (advancement.advanced) {
              totalAdvanced++;
              advancements.push({
                userId,
                username: node.user?.username || 'unknown',
                previousRank: advancement.previousRank,
                newRank: advancement.newRank,
                bonusAwarded: advancement.bonusAwarded,
              });
            }
          }
        } catch (error) {
          logger.error(`Error evaluating user ${node.userId}:`, error);
        }
      }

      logger.info(`Batch rank evaluation complete: ${totalAdvanced}/${totalEvaluated} users advanced`);

      return { totalEvaluated, totalAdvanced, advancements };
    } catch (error) {
      logger.error('Error in batch rank evaluation:', error);
      throw error;
    }
  }

  /** Get next rank information. */
  async getNextRankInfo(currentRankName) {
    try {
      const currentRank = await MLMRankRepository.findByName(currentRankName);
      if (!currentRank) return null;
      return MLMRankRepository.getNextRank(currentRank.level);
    } catch (error) {
      logger.error('Error getting next rank info:', error);
      return null;
    }
  }

  /** Get rank progress for a user. */
  async getRankProgress(userId) {
    try {
      const node = await MLMTreeNodeRepository.findByUserId(userId);
      if (!node) {
        throw new ApiError(404, 'User not found in genealogy tree');
      }

      const currentRank = await MLMRankRepository.findByName(node.rank);
      const nextRank = await this.getNextRankInfo(node.rank);

      if (!nextRank) {
        return {
          currentRank: currentRank.name,
          atMaxRank: true,
          progress: null,
        };
      }

      const req = nextRank.requirements;
      const progress = {
        personalVolume: this.calculateProgress(node.personalVolume, req.personalVolume),
        groupVolume: this.calculateProgress(node.groupVolume, req.groupVolume),
        leftLegVolume: this.calculateProgress(node.leftLegVolume, req.leftLegVolume),
        rightLegVolume: this.calculateProgress(node.rightLegVolume, req.rightLegVolume),
      };

      const directReferrals = await MLMTreeNodeRepository.getDirectReferrals(userId);
      const activeDirects = directReferrals.filter((ref) => ref.isActive);

      progress.directReferrals = this.calculateProgress(directReferrals.length, req.directReferrals);
      progress.activeDirects = this.calculateProgress(activeDirects.length, req.activeDirects);

      return {
        currentRank: currentRank.name,
        nextRank: nextRank.name,
        atMaxRank: false,
        progress,
        requirements: req,
      };
    } catch (error) {
      logger.error('Error getting rank progress:', error);
      throw error;
    }
  }

  /** Calculate progress percentage. */
  calculateProgress(current, required) {
    if (required === 0) return { current: 0, required: 0, percentage: 100, met: true };
    const percentage = Math.min((current / required) * 100, 100);
    return {
      current,
      required,
      percentage: Math.round(percentage * 100) / 100,
      met: current >= required,
    };
  }

  async getUserRankHistory(userId) {
    return MLMRankHistoryRepository.getRankProgression(userId);
  }

  async getAllRanks() {
    return MLMRankRepository.getAllRanksWithDetails();
  }

  async getRankDetails(rankName) {
    return MLMRankRepository.findByName(rankName);
  }
}

module.exports = new RankService();