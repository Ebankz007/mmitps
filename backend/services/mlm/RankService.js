const RankRepository = require('../../repositories/mlm/RankRepository');
const RankHistoryRepository = require('../../repositories/mlm/RankHistoryRepository');
const GenealogyRepository = require('../../repositories/GenealogyRepository');
const CommissionService = require('./CommissionService');
const WalletService = require('../financial/WalletService');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

class RankService {
    /**
     * Evaluate user's current rank qualification
     * Returns the highest rank the user qualifies for
     */
    async evaluateUserRank(userId) {
        try {
            // Get user's genealogy node
            const node = await GenealogyRepository.findByUserId(userId);
            if (!node) {
                throw new ApiError(404, 'User not found in genealogy tree');
            }

            // Get all ranks sorted by level (ascending)
            const ranks = await RankRepository.getRankHierarchy();

            let highestQualifiedRank = null;
            let qualificationDetails = {};

            // Evaluate each rank starting from lowest
            for (const rank of ranks) {
                const isQualified = await this.checkRankQualification(userId, rank, node);

                if (isQualified.qualified) {
                    highestQualifiedRank = rank;
                    qualificationDetails = isQualified.details;
                } else {
                    // Stop at first unqualified rank (since they're sorted by level)
                    break;
                }
            }

            return {
                currentRank: node.rank,
                qualifiedRank: highestQualifiedRank ? highestQualifiedRank.name : node.rank,
                shouldAdvance: highestQualifiedRank && highestQualifiedRank.name !== node.rank,
                qualificationDetails,
                nextRank: await this.getNextRankInfo(node.rank)
            };
        } catch (error) {
            logger.error('Error evaluating user rank:', error);
            throw error;
        }
    }

    /**
     * Check if user qualifies for a specific rank
     */
    async checkRankQualification(userId, rankConfig, node = null) {
        try {
            // Get node if not provided
            if (!node) {
                node = await GenealogyRepository.findByUserId(userId);
                if (!node) {
                    return { qualified: false, reason: 'User not in genealogy tree' };
                }
            }

            const req = rankConfig.requirements;
            const details = {
                personalVolume: { required: req.personalVolume, actual: node.personalVolume, met: false },
                groupVolume: { required: req.groupVolume, actual: node.groupVolume, met: false },
                leftLegVolume: { required: req.leftLegVolume, actual: node.leftLegVolume, met: false },
                rightLegVolume: { required: req.rightLegVolume, actual: node.rightLegVolume, met: false },
                directReferrals: { required: req.directReferrals, actual: 0, met: false },
                activeDirects: { required: req.activeDirects, actual: 0, met: false },
                rankedDirects: { required: req.rankedDirectsRequired || [], actual: {}, met: false }
            };

            // Check personal volume
            if (node.personalVolume < req.personalVolume) {
                details.personalVolume.met = false;
                return { qualified: false, reason: 'Insufficient personal volume', details };
            }
            details.personalVolume.met = true;

            // Check group volume
            if (node.groupVolume < req.groupVolume) {
                details.groupVolume.met = false;
                return { qualified: false, reason: 'Insufficient group volume', details };
            }
            details.groupVolume.met = true;

            // Check left leg volume
            if (node.leftLegVolume < req.leftLegVolume) {
                details.leftLegVolume.met = false;
                return { qualified: false, reason: 'Insufficient left leg volume', details };
            }
            details.leftLegVolume.met = true;

            // Check right leg volume
            if (node.rightLegVolume < req.rightLegVolume) {
                details.rightLegVolume.met = false;
                return { qualified: false, reason: 'Insufficient right leg volume', details };
            }
            details.rightLegVolume.met = true;

            // Get direct referrals
            const directReferrals = await GenealogyRepository.getDirectReferrals(userId);
            details.directReferrals.actual = directReferrals.length;

            // Check direct referrals count
            if (directReferrals.length < req.directReferrals) {
                details.directReferrals.met = false;
                return { qualified: false, reason: 'Insufficient direct referrals', details };
            }
            details.directReferrals.met = true;

            // Check active directs
            const activeDirects = directReferrals.filter(ref => ref.isActive);
            details.activeDirects.actual = activeDirects.length;

            if (activeDirects.length < req.activeDirects) {
                details.activeDirects.met = false;
                return { qualified: false, reason: 'Insufficient active directs', details };
            }
            details.activeDirects.met = true;

            // Check ranked directs requirement
            if (req.rankedDirectsRequired && req.rankedDirectsRequired.length > 0) {
                const rankedDirectsCheck = await this.checkRankedDirectsRequirement(
                    directReferrals,
                    req.rankedDirectsRequired
                );

                details.rankedDirects.actual = rankedDirectsCheck.actual;
                details.rankedDirects.met = rankedDirectsCheck.qualified;

                if (!rankedDirectsCheck.qualified) {
                    return {
                        qualified: false,
                        reason: rankedDirectsCheck.reason,
                        details
                    };
                }
            } else {
                details.rankedDirects.met = true;
            }

            // All requirements met
            return { qualified: true, details };
        } catch (error) {
            logger.error('Error checking rank qualification:', error);
            throw error;
        }
    }

    /**
     * Check if user has required number of directs at specific ranks
     */
    async checkRankedDirectsRequirement(directReferrals, requirements) {
        const rankedDirects = {};

        // Count directs by rank
        directReferrals.forEach(ref => {
            const rank = ref.rank || 'Starter';
            rankedDirects[rank] = (rankedDirects[rank] || 0) + 1;
        });

        // Check each requirement
        for (const req of requirements) {
            const count = rankedDirects[req.rank] || 0;
            if (count < req.count) {
                return {
                    qualified: false,
                    reason: `Need ${req.count} ${req.rank} directs, have ${count}`,
                    actual: rankedDirects
                };
            }
        }

        return { qualified: true, actual: rankedDirects };
    }

    /**
     * Advance user to a new rank
     */
    async advanceUserRank(userId, newRank, qualificationSnapshot) {
        try {
            // Get user's current node
            const node = await GenealogyRepository.findByUserId(userId);
            if (!node) {
                throw new ApiError(404, 'User not found in genealogy tree');
            }

            const previousRank = node.rank;

            // Don't advance if already at this rank
            if (previousRank === newRank) {
                return { advanced: false, reason: 'User already at this rank' };
            }

            // Get rank configuration
            const rankConfig = await RankRepository.findByName(newRank);
            if (!rankConfig) {
                throw new ApiError(404, `Rank configuration not found: ${newRank}`);
            }

            // Update node rank
            await GenealogyRepository.update(node._id, { rank: newRank });

            // Create rank history record
            const rankHistory = await RankHistoryRepository.createRankHistory({
                user: userId,
                previousRank,
                newRank,
                achievedAt: new Date(),
                qualificationSnapshot: qualificationSnapshot || {
                    personalVolume: node.personalVolume,
                    groupVolume: node.groupVolume,
                    leftLegVolume: node.leftLegVolume,
                    rightLegVolume: node.rightLegVolume,
                    directReferrals: qualificationSnapshot?.directReferrals?.actual || 0,
                    activeDirects: qualificationSnapshot?.activeDirects?.actual || 0
                },
                bonusAwarded: 0
            });

            // Award rank advancement bonus if configured
            let bonusTransaction = null;
            const rankAdvancementBonus = rankConfig.benefits?.rankAdvancementBonus || 0;

            if (rankAdvancementBonus > 0) {
                bonusTransaction = await this.awardRankAdvancementBonus(
                    userId,
                    newRank,
                    rankAdvancementBonus,
                    rankHistory._id
                );

                // Update rank history with bonus info
                await RankHistoryRepository.update(rankHistory._id, {
                    bonusAwarded: rankAdvancementBonus,
                    bonusTransaction: bonusTransaction._id
                });
            }

            logger.info(`User ${userId} advanced from ${previousRank} to ${newRank}`);

            return {
                advanced: true,
                previousRank,
                newRank,
                bonusAwarded: rankAdvancementBonus,
                rankHistory,
                bonusTransaction
            };
        } catch (error) {
            logger.error('Error advancing user rank:', error);
            throw error;
        }
    }

    /**
     * Award rank advancement bonus
     */
    async awardRankAdvancementBonus(userId, newRank, bonusAmount, rankHistoryId) {
        try {
            // Create commission record
            const commission = await CommissionService.create({
                user: userId,
                type: 'rank_advancement',
                amount: bonusAmount,
                status: 'approved',
                rank: newRank,
                description: `Rank advancement bonus for achieving ${newRank}`,
                metadata: {
                    rankHistoryId: rankHistoryId
                }
            });

            // Deposit to wallet
            await WalletService.deposit(
                userId,
                bonusAmount,
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

    /**
     * Evaluate all users and advance those who qualify
     */
    async evaluateAllUsersRanks() {
        try {
            logger.info('Starting batch rank evaluation for all users');

            // Get all users in genealogy
            const nodes = await GenealogyRepository.findAll({ isActive: true });

            let totalEvaluated = 0;
            let totalAdvanced = 0;
            const advancements = [];

            for (const node of nodes) {
                try {
                    const userId = node.user._id || node.user;
                    totalEvaluated++;

                    // Evaluate user's rank
                    const evaluation = await this.evaluateUserRank(userId);

                    // Advance if qualified for higher rank
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
                                username: node.user.username || 'unknown',
                                previousRank: advancement.previousRank,
                                newRank: advancement.newRank,
                                bonusAwarded: advancement.bonusAwarded
                            });
                        }
                    }
                } catch (error) {
                    logger.error(`Error evaluating user ${node.user}:`, error);
                    // Continue with next user
                }
            }

            logger.info(`Batch rank evaluation complete: ${totalAdvanced}/${totalEvaluated} users advanced`);

            return {
                totalEvaluated,
                totalAdvanced,
                advancements
            };
        } catch (error) {
            logger.error('Error in batch rank evaluation:', error);
            throw error;
        }
    }

    /**
     * Get next rank information
     */
    async getNextRankInfo(currentRankName) {
        try {
            const currentRank = await RankRepository.findByName(currentRankName);
            if (!currentRank) {
                return null;
            }

            const nextRank = await RankRepository.getNextRank(currentRank.level);
            return nextRank;
        } catch (error) {
            logger.error('Error getting next rank info:', error);
            return null;
        }
    }

    /**
     * Get rank progress for a user
     */
    async getRankProgress(userId) {
        try {
            const node = await GenealogyRepository.findByUserId(userId);
            if (!node) {
                throw new ApiError(404, 'User not found in genealogy tree');
            }

            const currentRank = await RankRepository.findByName(node.rank);
            const nextRank = await this.getNextRankInfo(node.rank);

            if (!nextRank) {
                return {
                    currentRank: currentRank.name,
                    atMaxRank: true,
                    progress: null
                };
            }

            // Calculate progress towards next rank
            const req = nextRank.requirements;
            const progress = {
                personalVolume: this.calculateProgress(node.personalVolume, req.personalVolume),
                groupVolume: this.calculateProgress(node.groupVolume, req.groupVolume),
                leftLegVolume: this.calculateProgress(node.leftLegVolume, req.leftLegVolume),
                rightLegVolume: this.calculateProgress(node.rightLegVolume, req.rightLegVolume)
            };

            // Get direct referrals for counts
            const directReferrals = await GenealogyRepository.getDirectReferrals(userId);
            const activeDirects = directReferrals.filter(ref => ref.isActive);

            progress.directReferrals = this.calculateProgress(directReferrals.length, req.directReferrals);
            progress.activeDirects = this.calculateProgress(activeDirects.length, req.activeDirects);

            return {
                currentRank: currentRank.name,
                nextRank: nextRank.name,
                atMaxRank: false,
                progress,
                requirements: req
            };
        } catch (error) {
            logger.error('Error getting rank progress:', error);
            throw error;
        }
    }

    /**
     * Calculate progress percentage
     */
    calculateProgress(current, required) {
        if (required === 0) return { current: 0, required: 0, percentage: 100, met: true };

        const percentage = Math.min((current / required) * 100, 100);
        return {
            current,
            required,
            percentage: Math.round(percentage * 100) / 100,
            met: current >= required
        };
    }

    /**
     * Get user's rank history
     */
    async getUserRankHistory(userId) {
        return RankHistoryRepository.getRankProgression(userId);
    }

    /**
     * Get all rank configurations
     */
    async getAllRanks() {
        return RankRepository.getAllRanksWithDetails();
    }

    /**
     * Get specific rank details
     */
    async getRankDetails(rankName) {
        return RankRepository.findByName(rankName);
    }
}

module.exports = new RankService();
