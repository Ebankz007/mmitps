const Plan = require('../models/Plan');

// @desc    Get all subscription plans
// @route   GET /api/v1/admin/plans
// @access  Private/Admin
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single plan
// @route   GET /api/v1/admin/plans/:id
// @access  Private/Admin
exports.getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new plan
// @route   POST /api/v1/admin/plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
    try {
        const plan = await Plan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update plan
// @route   PUT /api/v1/admin/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete plan (soft delete)
// @route   DELETE /api/v1/admin/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Toggle plan status
// @route   PATCH /api/v1/admin/plans/:id/toggle
// @access  Private/Admin
exports.togglePlanStatus = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }
        plan.isActive = !plan.isActive;
        await plan.save();
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
