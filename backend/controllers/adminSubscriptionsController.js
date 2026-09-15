const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Plan = require('../models/Plan');

// @desc    Create new subscription manually
// @route   POST /api/v1/admin/subscriptions
// @access  Private/Admin
exports.createSubscription = async (req, res) => {
    try {
        const { userId, planId, status, paymentMethod } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

        // Calculate end date based on plan billing cycle
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (plan.billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const subscription = await Subscription.create({
            user: userId,
            plan: planId,
            status: status || 'active',
            startDate,
            currentPeriodEnd: endDate,
            paymentMethod: paymentMethod || 'manual_admin',
            billingCycle: plan.billingCycle,
            price: plan.price,
            currency: plan.currency
        });

        // Update user's subscription reference
        user.subscription = {
            plan: plan.name.toLowerCase(), // Store simplified plan name or ID depending on User model
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.currentPeriodEnd
        };
        await user.save();

        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all subscriptions with filters
// @route   GET /api/v1/admin/subscriptions
// @access  Private/Admin
exports.getAllSubscriptions = async (req, res) => {
    try {
        const { status, planCode, search, page = 1, limit = 20 } = req.query;

        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by plan
        if (planCode) {
            const plan = await Plan.findOne({ code: planCode });
            if (plan) query.plan = plan._id;
        }

        // Search by user email/name
        if (search) {
            const users = await User.find({
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            query.user = { $in: users.map(u => u._id) };
        }

        const skip = (page - 1) * limit;

        const subscriptions = await Subscription.find(query)
            .populate('user', 'email username')
            .populate('plan', 'name code price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Subscription.countDocuments(query);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: subscriptions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get subscription by ID
// @route   GET /api/v1/admin/subscriptions/:id
// @access  Private/Admin
exports.getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('user', 'email username role')
            .populate('plan');

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update subscription manually
// @route   PUT /api/v1/admin/subscriptions/:id
// @access  Private/Admin
exports.updateSubscription = async (req, res) => {
    try {
        const { status, currentPeriodEnd, plan } = req.body;

        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        if (status) subscription.status = status;
        if (currentPeriodEnd) subscription.currentPeriodEnd = new Date(currentPeriodEnd);
        if (plan) subscription.plan = plan;

        await subscription.save();

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Cancel subscription
// @route   DELETE /api/v1/admin/subscriptions/:id/cancel
// @access  Private/Admin
exports.cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        subscription.status = 'canceled';
        subscription.canceledAt = new Date();
        await subscription.save();

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Extend subscription
// @route   PATCH /api/v1/admin/subscriptions/:id/extend
// @access  Private/Admin
exports.extendSubscription = async (req, res) => {
    try {
        const { days } = req.body;

        if (!days || days < 1) {
            return res.status(400).json({ success: false, error: 'Invalid days value' });
        }

        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        const currentEnd = new Date(subscription.currentPeriodEnd);
        currentEnd.setDate(currentEnd.getDate() + parseInt(days));
        subscription.currentPeriodEnd = currentEnd;

        await subscription.save();

        res.status(200).json({
            success: true,
            message: `Subscription extended by ${days} days`,
            data: subscription
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get subscription stats
// @route   GET /api/v1/admin/subscriptions/stats
// @access  Private/Admin
exports.getSubscriptionStats = async (req, res) => {
    try {
        const totalActive = await Subscription.countDocuments({ status: 'active' });
        const totalCanceled = await Subscription.countDocuments({ status: 'canceled' });
        const totalPastDue = await Subscription.countDocuments({ status: 'past_due' });

        // Revenue (mock - should calculate from invoices)
        const monthlyRevenue = totalActive * 99; // Simplified

        res.status(200).json({
            success: true,
            data: {
                total: totalActive + totalCanceled + totalPastDue,
                active: totalActive,
                canceled: totalCanceled,
                pastDue: totalPastDue,
                monthlyRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
