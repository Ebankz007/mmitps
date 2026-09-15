/**
 * AdminBonusController — PostgreSQL edition.
 */
const { BonusActivityRepository, BonusClaimRepository } = require('../../repositories/pg/BonusRepository');
const WalletRepository = require('../../repositories/pg/WalletRepository');
const TransactionRepository = require('../../repositories/pg/TransactionRepository');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// ----------------------------------------------------
// Bonus Activity Management
// ----------------------------------------------------

exports.createBonus = async (req, res, next) => {
    try {
        const bonus = await BonusActivityRepository.create(req.body);
        res.status(201).json(new ApiResponse(true, bonus, 'Bonus created successfully'));
    } catch (err) {
        next(err);
    }
};

exports.getBonuses = async (req, res, next) => {
    try {
        const bonuses = await BonusActivityRepository.findAll({}, { sort: 'createdAt', direction: 'desc' });
        res.status(200).json(new ApiResponse(true, bonuses, 'Bonuses fetched successfully'));
    } catch (err) {
        next(err);
    }
};

exports.updateBonus = async (req, res, next) => {
    try {
        const bonus = await BonusActivityRepository.update(req.params.id, req.body);
        if (!bonus) {
            return next(new ApiError(404, 'Bonus not found'));
        }
        res.status(200).json(new ApiResponse(true, bonus, 'Bonus updated successfully'));
    } catch (err) {
        next(err);
    }
};

exports.deleteBonus = async (req, res, next) => {
    try {
        const bonus = await BonusActivityRepository.delete(req.params.id);
        if (!bonus) {
            return next(new ApiError(404, 'Bonus not found'));
        }
        res.status(200).json(new ApiResponse(true, 'Bonus deleted successfully'));
    } catch (err) {
        next(err);
    }
};

// ----------------------------------------------------
// Claims Management
// ----------------------------------------------------

exports.getClaims = async (req, res, next) => {
    try {
        const claims = await BonusClaimRepository.findAll({}, {
            sort: 'createdAt',
            direction: 'desc',
            populate: 'bonusActivity',
        });
        res.status(200).json(new ApiResponse(true, claims, 'Claims fetched successfully'));
    } catch (err) {
        next(err);
    }
};

exports.processClaim = async (req, res, next) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return next(new ApiError(400, 'Invalid status. Must be approved or rejected.'));
        }

        const claim = await BonusClaimRepository.findById(req.params.id, { populate: 'bonusActivity' });

        if (!claim) {
            return next(new ApiError(404, 'Claim not found'));
        }

        if (claim.status !== 'pending') {
            return next(new ApiError(400, 'This claim has already been processed.'));
        }

        if (status === 'rejected') {
            const updated = await BonusClaimRepository.reject(
                req.params.id,
                req.user.id,
                rejectionReason || 'Criteria not met'
            );
            return res.status(200).json(new ApiResponse(true, updated, 'Claim rejected successfully'));
        }

        // Handle Approval (Credit Wallet)
        const currency = claim.bonusActivity?.rewardCurrency || 'USD';
        const amount = claim.bonusActivity?.rewardAmount;
        if (amount === undefined || amount === null) {
            return next(new ApiError(400, 'Bonus activity missing reward amount'));
        }

        const wallet = await WalletRepository.updateBalance(claim.userId, currency, amount);

        // Record Transaction
        const balanceObj = (wallet.balances || []).find(b => b.currency === currency);
        const balanceAfter = balanceObj ? balanceObj.amount : amount;

        await TransactionRepository.create({
            userId: claim.userId,
            type: 'bonus',
            category: 'wallet',
            status: 'completed',
            amount,
            currency,
            amountUSD: amount, // Assuming USD for now mapped 1:1 if not crypto
            paymentMethod: 'internal',
            description: `Bonus Claim Award: ${claim.bonusActivity.title}`,
            reference: `BNS-${Date.now()}-${String(claim.userId).substring(0, 6)}`,
            balanceBefore: balanceAfter - amount,
            balanceAfter,
        });

        const updated = await BonusClaimRepository.approve(req.params.id, req.user.id);

        res.status(200).json(new ApiResponse(true, updated, 'Claim approved and funds credited successfully'));
    } catch (err) {
        next(err);
    }
};