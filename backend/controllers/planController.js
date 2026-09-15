const PlanService = require('../services/PlanService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.createPlan = catchAsync(async (req, res) => {
    const plan = await PlanService.createPlan(req.body);
    res.status(201).json(new ApiResponse(true, plan, 'Plan created successfully'));
});

exports.getPlans = catchAsync(async (req, res) => {
    // Admin gets all, user gets active (logic can be refined or split)
    const plans = await PlanService.findAll(); // BaseService method
    res.status(200).json(new ApiResponse(true, plans, 'Plans retrieved successfully'));
});

exports.getActivePlans = catchAsync(async (req, res) => {
    const plans = await PlanService.getActivePlans();
    res.status(200).json(new ApiResponse(true, plans, 'Active plans retrieved successfully'));
});

exports.getPlan = catchAsync(async (req, res) => {
    const plan = await PlanService.findById(req.params.id);
    if (!plan) throw new Error('Plan not found');
    res.status(200).json(new ApiResponse(true, plan, 'Plan retrieved successfully'));
});

exports.updatePlan = catchAsync(async (req, res) => {
    const plan = await PlanService.updatePlan(req.params.id, req.body);
    res.status(200).json(new ApiResponse(true, plan, 'Plan updated successfully'));
});

exports.deletePlan = catchAsync(async (req, res) => {
    await PlanService.delete(req.params.id);
    res.status(200).json(new ApiResponse(true, null, 'Plan deleted successfully'));
});
