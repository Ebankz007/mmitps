const BonusActivity = require('../models/Financial/BonusActivity');
const BonusClaim = require('../models/Financial/BonusClaim');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

exports.getActiveBonuses = async (req, res, next) => {
    try {
        const bonuses = await BonusActivity.find({ 
            isActive: true,
            $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }]
        }).sort('-createdAt');
        
        // Find which bonuses the user has already claimed
        const claims = await BonusClaim.find({ user: req.user._id });
        const claimedBonusIds = claims.map(c => c.bonusActivity.toString());

        // Attach 'claimStatus' to each bonus
        const bonusesWithStatus = bonuses.map(bonus => {
            const b = bonus.toObject();
            const existingClaim = claims.find(c => c.bonusActivity.toString() === b._id.toString());
            b.claimStatus = existingClaim ? existingClaim.status : 'unclaimed';
            return b;
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

        const bonus = await BonusActivity.findById(bonusId);
        
        if (!bonus || !bonus.isActive || (bonus.expiryDate && new Date(bonus.expiryDate) < new Date())) {
            return next(new ApiError(400, 'This bonus is no longer active or available.'));
        }

        // Verify if max capacity reached
        if (bonus.maxClaims > 0 && bonus.currentClaims >= bonus.maxClaims) {
            return next(new ApiError(400, 'This bonus has reached the maximum number of claims.'));
        }

        // Check if user already claimed this
        const existingClaim = await BonusClaim.findOne({ user: req.user._id, bonusActivity: bonusId });
        if (existingClaim) {
            return next(new ApiError(400, `You have already submitted a claim. Status: ${existingClaim.status}`));
        }

        const claim = await BonusClaim.create({
            user: req.user._id,
            bonusActivity: bonusId,
            claimProof: claimProof || ''
        });

        // Increment current claim count
        bonus.currentClaims += 1;
        await bonus.save();

        res.status(201).json(new ApiResponse(true, claim, 'Bonus claim submitted successfully'));
    } catch (err) {
        // Handle race condition uniqueness error
        if (err.code === 11000) {
            return next(new ApiError(400, 'You have already submitted a claim.'));
        }
        next(err);
    }
};

exports.getMyClaims = async (req, res, next) => {
    try {
        const claims = await BonusClaim.find({ user: req.user._id })
            .populate('bonusActivity', 'title rewardAmount rewardCurrency')
            .sort('-createdAt');
        
        res.status(200).json(new ApiResponse(true, claims, 'My claims fetched successfully'));
    } catch (err) {
        next(err);
    }
};
