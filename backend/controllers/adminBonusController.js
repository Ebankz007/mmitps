const BonusActivity = require('../models/Financial/BonusActivity');
const BonusClaim = require('../models/Financial/BonusClaim');
const Wallet = require('../models/Financial/Wallet');
const Transaction = require('../models/Financial/Transaction');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ----------------------------------------------------
// Bonus Activity Management
// ----------------------------------------------------

exports.createBonus = async (req, res, next) => {
    try {
        const bonus = await BonusActivity.create(req.body);
        res.status(201).json(new ApiResponse(true, bonus, 'Bonus created successfully'));
    } catch (err) {
        next(err);
    }
};

exports.getBonuses = async (req, res, next) => {
    try {
        const bonuses = await BonusActivity.find().sort('-createdAt');
        res.status(200).json(new ApiResponse(true, bonuses, 'Bonuses fetched successfully'));
    } catch (err) {
        next(err);
    }
};

exports.updateBonus = async (req, res, next) => {
    try {
        const bonus = await BonusActivity.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
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
        const bonus = await BonusActivity.findByIdAndDelete(req.params.id);
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
        const claims = await BonusClaim.find()
            .populate('user', 'firstName lastName email')
            .populate('bonusActivity', 'title rewardAmount rewardCurrency')
            .sort('-createdAt');
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

        const claim = await BonusClaim.findById(req.params.id).populate('bonusActivity');
        
        if (!claim) {
            return next(new ApiError(404, 'Claim not found'));
        }
        
        if (claim.status !== 'pending') {
            return next(new ApiError(400, 'This claim has already been processed.'));
        }

        claim.status = status;
        claim.processedAt = new Date();
        claim.processedBy = req.user._id;

        if (status === 'rejected') {
            claim.rejectionReason = rejectionReason || 'Criteria not met';
            await claim.save();
            return res.status(200).json(new ApiResponse(true, claim, 'Claim rejected successfully'));
        }

        // Handle Approval (Credit Wallet)
        const wallet = await Wallet.findOne({ user: claim.user });
        if (!wallet) {
            return next(new ApiError(404, 'User wallet not found. Cannot process bonus.'));
        }

        const currency = claim.bonusActivity.rewardCurrency || 'USD';
        const amount = claim.bonusActivity.rewardAmount;

        let balanceObj = wallet.balances.find(b => b.currency === currency);
        if (!balanceObj) {
            wallet.balances.push({ currency, amount: 0, frozen: 0 });
            balanceObj = wallet.balances.find(b => b.currency === currency);
        }

        const balanceBefore = balanceObj.amount;
        balanceObj.amount += amount;
        
        await wallet.save();

        // Record Transaction
        await Transaction.create({
            user: claim.user,
            type: 'bonus',
            category: 'wallet',
            status: 'completed',
            amount: amount,
            currency: currency,
            amountUSD: amount, // Assuming USD for now mapped 1:1 if not crypto
            paymentMethod: 'internal',
            description: `Bonus Claim Award: ${claim.bonusActivity.title}`,
            reference: `BNS-${Date.now()}-${claim.user.toString().substring(0,6)}`,
            balanceBefore,
            balanceAfter: balanceObj.amount
        });

        await claim.save();

        res.status(200).json(new ApiResponse(true, claim, 'Claim approved and funds credited successfully'));
    } catch (err) {
        next(err);
    }
};
