const Coupon = require('../models/Financial/Coupon');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Validate a coupon code
 */
exports.validateCoupon = catchAsync(async (req, res) => {
    const { code, amount, category } = req.body;

    if (!code) {
        throw ApiError.badRequest('Coupon code is required');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
        throw ApiError.notFound('Invalid or inactive coupon code');
    }

    // Check expiry
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        throw ApiError.badRequest('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
        throw ApiError.badRequest('Coupon usage limit reached');
    }

    // Check minimum purchase
    if (amount && amount < coupon.minPurchaseAmount) {
        throw ApiError.badRequest(`Minimum purchase of ${coupon.minPurchaseAmount} required for this coupon`);
    }

    // Check category
    if (category && coupon.category !== 'all' && coupon.category !== category) {
        throw ApiError.badRequest(`Coupon is not applicable to ${category}`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (amount) {
        if (coupon.discountType === 'percentage') {
            discountAmount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }
    }

    res.status(200).json(new ApiResponse(true, {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: amount ? Math.max(0, amount - discountAmount) : undefined
    }, 'Coupon validated successfully'));
});

/**
 * Redeem a coupon (called after payment success)
 */
exports.redeemCoupon = catchAsync(async (req, res) => {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        throw ApiError.notFound('Coupon not found');
    }

    coupon.usageCount += 1;
    await coupon.save();

    res.status(200).json(new ApiResponse(true, null, 'Coupon redeemed'));
});

/**
 * Get active coupons for users
 */
exports.getCoupons = catchAsync(async (req, res) => {
    const coupons = await Coupon.find({
        isActive: true,
        $or: [
            { expiryDate: { $gt: new Date() } },
            { expiryDate: null }
        ]
    }).limit(10);

    res.status(200).json(new ApiResponse(true, coupons, 'Active coupons retrieved'));
});

/**
 * Admin: Get all coupons
 */
exports.adminGetCoupons = catchAsync(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(true, coupons, 'All coupons retrieved'));
});

/**
 * Admin: Create a new coupon
 */
exports.adminCreateCoupon = catchAsync(async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        expiryDate,
        usageLimit,
        category,
        description
    } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
        throw ApiError.badRequest('Coupon code already exists');
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        expiryDate,
        usageLimit,
        category,
        description
    });

    res.status(201).json(new ApiResponse(true, coupon, 'Coupon created successfully'));
});
