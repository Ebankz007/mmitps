/**
 * AdminSubscriptionController — PostgreSQL edition.
 * Admin subscription management (mirrors Mongo adminSubscriptionsController).
 */
const SubscriptionRepository = require('../../repositories/pg/SubscriptionRepository');
const PlanRepository = require('../../repositories/pg/PlanRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** POST /admin/subscriptions — manually create a subscription */
exports.createSubscription = catchAsync(async (req, res) => {
  const { userId, planId, status, serviceKey } = req.body;

  const user = await UserRepository.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const plan = await PlanRepository.findById(planId);
  if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

  // Calculate end date based on plan interval
  const startDate = new Date();
  const endDate = new Date(startDate);
  if (plan.interval === 'year') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else if (plan.interval === 'quarter') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (plan.interval === 'month') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    // lifetime — far future
    endDate.setFullYear(endDate.getFullYear() + 100);
  }

  const subscription = await SubscriptionRepository.create({
    userId,
    planId,
    serviceKey: serviceKey || plan.code,
    type: plan.type,
    status: status || 'active',
    currentPeriodStart: startDate,
    currentPeriodEnd: endDate,
  });

  res.status(201).json({ success: true, data: subscription });
});

/** GET /admin/subscriptions — all subscriptions with filters */
exports.getAllSubscriptions = catchAsync(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  let filters = {};
  if (status) filters.status = status;
  if (search) {
    // Search by user email/username via user relation
    const users = await UserRepository.findAll({
      $or: [
        { email: { $regex: search } },
        { username: { $regex: search } },
      ],
    });
    filters.userId = { $in: users.map(u => u.id) };
  }

  const subscriptions = await SubscriptionRepository.findAll(filters, {
    sort: 'createdAt',
    direction: 'desc',
    page: parseInt(page),
    limit: parseInt(limit),
  });

  const total = await SubscriptionRepository.count(filters);

  res.status(200).json({
    success: true,
    count: subscriptions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: subscriptions,
  });
});

/** GET /admin/subscriptions/stats */
exports.getSubscriptionStats = catchAsync(async (req, res) => {
  const totalActive = await SubscriptionRepository.count({ status: 'active' });
  const totalCanceled = await SubscriptionRepository.count({ status: 'canceled' });
  const totalPastDue = await SubscriptionRepository.count({ status: 'past_due' });

  res.status(200).json({
    success: true,
    data: {
      total: totalActive + totalCanceled + totalPastDue,
      active: totalActive,
      canceled: totalCanceled,
      pastDue: totalPastDue,
    },
  });
});

/** GET /admin/subscriptions/:id */
exports.getSubscriptionById = catchAsync(async (req, res) => {
  const subscription = await SubscriptionRepository.findById(req.params.id);
  if (!subscription) {
    return res.status(404).json({ success: false, error: 'Subscription not found' });
  }
  res.status(200).json({ success: true, data: subscription });
});

/** PUT /admin/subscriptions/:id */
exports.updateSubscription = catchAsync(async (req, res) => {
  const { status, currentPeriodEnd, planId } = req.body;

  const subscription = await SubscriptionRepository.findById(req.params.id);
  if (!subscription) {
    return res.status(404).json({ success: false, error: 'Subscription not found' });
  }

  const data = {};
  if (status) data.status = status;
  if (currentPeriodEnd) data.currentPeriodEnd = new Date(currentPeriodEnd);
  if (planId) data.planId = planId;

  const updated = await SubscriptionRepository.update(subscription.id, data);
  res.status(200).json({ success: true, data: updated });
});

/** DELETE /admin/subscriptions/:id/cancel */
exports.cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionRepository.findById(req.params.id);
  if (!subscription) {
    return res.status(404).json({ success: false, error: 'Subscription not found' });
  }

  const updated = await SubscriptionRepository.update(subscription.id, {
    status: 'canceled',
    cancelAtPeriodEnd: true,
  });
  res.status(200).json({ success: true, data: updated });
});

/** PATCH /admin/subscriptions/:id/extend */
exports.extendSubscription = catchAsync(async (req, res) => {
  const { days } = req.body;

  if (!days || days < 1) {
    return res.status(400).json({ success: false, error: 'Invalid days value' });
  }

  const subscription = await SubscriptionRepository.findById(req.params.id);
  if (!subscription) {
    return res.status(404).json({ success: false, error: 'Subscription not found' });
  }

  const currentEnd = new Date(subscription.currentPeriodEnd || new Date());
  currentEnd.setDate(currentEnd.getDate() + parseInt(days));

  const updated = await SubscriptionRepository.update(subscription.id, { currentPeriodEnd: currentEnd });

  res.status(200).json({
    success: true,
    message: `Subscription extended by ${days} days`,
    data: updated,
  });
});