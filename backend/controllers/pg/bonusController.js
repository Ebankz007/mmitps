/**
 * BonusController — PostgreSQL edition.
 */
const { BonusActivityRepository, BonusClaimRepository } = require('../../repositories/pg/BonusRepository');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getActiveBonuses = async (req, res, next) => {
    try {
        const bonuses = await BonusActivityRepository.findActive({ sort: 'createdAt', direction: 'desc' });

        // Filter out expired bonuses (client-side on expiryDate)
        const now = new Date();
        const validBonuses = bonuses.filter(b => !b.expiryDate || new Date(b.expiryDate) > now);

        // Find which bonuses the user has already claimed
        const claims = await BonusClaimRepository.findByUserId(req.user.id);
        const claimedBonusIds = claims.map(c => c.bonusActivityId);

        // Attach 'claimStatus' to each bonus
        const bonusesWithStatus = validBonuses.map(bonus => {
            const existingClaim = claims.find(c => c.bonusActivityId === bonus.id);
            return { ...bonus, claimStatus: existingClaim ? existingClaim.status : 'unclaimed' };
        });

        res.status(200).json(new ApiResponse(true, bonusesWithStatus, 'Active bonuses fetched successfully'));
    } catch (err) {
        next(err);
    }
};

exports.claimBonus = async (req, res, next) => {
    try {
        const bonusId = req.params.id;
        const { claimProof } = req.body;

        const bonus = await BonusActivityRepository.findById(bonusId);

        if (!bonus || !bonus.isActive || (bonus.expiryDate && new Date(bonus.expiryDate) < new Date())) {
            return next(new ApiError(400, 'This bonus is no longer active or available.'));
        }

        // Verify if max capacity reached
        if (bonus.maxClaims > 0 && bonus.currentClaims >= bonus.maxClaims) {
            return next(new ApiError(400, 'This bonus has reached the maximum number of claims.'));
        }

        // Check if user already claimed this
        const existingClaim = await BonusClaimRepository.findClaimed(req.user.id, bonusId);
        if (existingClaim) {
            return next(new ApiError(400, `You have already submitted a claim. Status: ${existingClaim.status}`));
        }

        const claim = await BonusClaimRepository.create({
            userId: req.user.id,
            bonusActivityId: bonusId,
            claimProof: claimProof || ''
        });

        // Increment current claim count
        await BonusActivityRepository.incrementClaims(bonusId);

        res.status(201).json(new ApiResponse(true, claim, 'Bonus claim submitted successfully'));
    } catch (err) {
        // Handle race condition uniqueness error (PG unique index on user+activity)
        if (err.code === '23505') {
            return next(new ApiError(400, 'You have already submitted a claim.'));
        }
        next(err);
    }
};

exports.getMyClaims = async (req, res, next) => {
    try {
        const claims = await BonusClaimRepository.findByUserId(req.user.id, {
            sort: 'createdAt',
            direction: 'desc',
            populate: 'bonusActivity',
        });

        res.status(200).json(new ApiResponse(true, claims, 'My claims fetched successfully'));
    } catch (err) {
        next(err);
    }
};