/**
 * CouponController — PostgreSQL edition.
 * Mirrors the Mongo couponController (validate/redeem/list) via pg CouponRepository.
 */
const CouponRepository = require('../../repositories/pg/CouponRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** Validate a coupon code */
exports.validateCoupon = catchAsync(async (req, res) => {
  const { code, amount, category } = req.body;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const coupon = await CouponRepository.findByCode(code);

  if (!coupon || !coupon.isActive) {
    throw ApiError.notFound('Invalid or inactive coupon code');
  }

  // Check expiry
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
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
    finalAmount: amount ? Math.max(0, amount - discountAmount) : undefined,
  }, 'Coupon validated successfully'));
});

/** Redeem a coupon (called after payment success) */
exports.redeemCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;
  const coupon = await CouponRepository.findByCode(code);

  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  await CouponRepository.incrementUsage(coupon.id);

  res.status(200).json(new ApiResponse(true, null, 'Coupon redeemed'));
});

/** Get active coupons for users */
exports.getCoupons = catchAsync(async (req, res) => {
  const coupons = await CouponRepository.findAll({
    isActive: true,
    $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
  }, { limit: 10 });

  res.status(200).json(new ApiResponse(true, coupons, 'Active coupons retrieved'));
});

/** Admin: Get all coupons */
exports.adminGetCoupons = catchAsync(async (req, res) => {
  const coupons = await CouponRepository.findAll({}, { sort: 'createdAt', direction: 'desc' });
  res.status(200).json(new ApiResponse(true, coupons, 'All coupons retrieved'));
});

/** Admin: Create a new coupon */
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
    description,
  } = req.body;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const existing = await CouponRepository.findByCode(code.toUpperCase());
  if (existing) {
    throw ApiError.badRequest('Coupon code already exists');
  }

  const coupon = await CouponRepository.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    category,
    description,
  });

  res.status(201).json(new ApiResponse(true, coupon, 'Coupon created successfully'));
});