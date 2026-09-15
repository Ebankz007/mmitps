/**
 * AdminPlansController — PostgreSQL edition.
 * Plans CRUD (mirrors Mongo adminPlansController).
 */
const PlanRepository = require('../../repositories/pg/PlanRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** GET /admin/plans */
exports.getAllPlans = catchAsync(async (req, res) => {
  const plans = await PlanRepository.findAll({}, { sort: 'price', direction: 'asc' });
  res.status(200).json({ success: true, count: plans.length, data: plans });
});

/** GET /admin/plans/:id */
exports.getPlanById = catchAsync(async (req, res) => {
  const plan = await PlanRepository.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }
  res.status(200).json({ success: true, data: plan });
});

/** POST /admin/plans */
exports.createPlan = catchAsync(async (req, res) => {
  const plan = await PlanRepository.create(req.body);
  res.status(201).json({ success: true, data: plan });
});

/** PUT /admin/plans/:id */
exports.updatePlan = catchAsync(async (req, res) => {
  const plan = await PlanRepository.update(req.params.id, req.body);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }
  res.status(200).json({ success: true, data: plan });
});

/** DELETE /admin/plans/:id (soft delete) */
exports.deletePlan = catchAsync(async (req, res) => {
  const plan = await PlanRepository.update(req.params.id, { isActive: false });
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }
  res.status(200).json({ success: true, data: {} });
});

/** PATCH /admin/plans/:id/toggle */
exports.togglePlanStatus = catchAsync(async (req, res) => {
  const plan = await PlanRepository.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, error: 'Plan not found' });
  }
  const updated = await PlanRepository.update(plan.id, { isActive: !plan.isActive });
  res.status(200).json({ success: true, data: updated });
});