const { Plan, FeatureFlag } = require('../models');

// @desc    Get all feature flags
// @route   GET /api/v1/admin/features
// @access  Private/Admin
exports.getAllFeatures = async (req, res) => {
    try {
        const features = await FeatureFlag.find();

        // Convert array to object keyed by name to maintain frontend compatibility
        const featureFlags = {};
        features.forEach(f => {
            featureFlags[f.name] = {
                enabled: f.enabled,
                requiredTier: f.requiredTier,
                description: f.description,
                category: f.category
            };
        });

        res.status(200).json({ success: true, data: featureFlags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update feature flag
// @route   PUT /api/v1/admin/features/:featureName
// @access  Private/Admin
exports.updateFeature = async (req, res) => {
    try {
        const { featureName } = req.params;
        const { enabled, requiredTier, description, category } = req.body;

        const feature = await FeatureFlag.findOne({ name: featureName });
        if (!feature) {
            return res.status(404).json({ success: false, error: 'Feature not found' });
        }

        if (typeof enabled !== 'undefined') feature.enabled = enabled;
        if (requiredTier) feature.requiredTier = requiredTier;
        if (description) feature.description = description;
        if (category) feature.category = category;

        await feature.save();

        res.status(200).json({
            success: true,
            data: feature
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get rate limits by plan
// @route   GET /api/v1/admin/rate-limits
// @access  Private/Admin
exports.getRateLimits = async (req, res) => {
    try {
        const plans = await Plan.find().select('name code rateLimits');
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update rate limits for a plan
// @route   PUT /api/v1/admin/rate-limits/:planId
// @access  Private/Admin
exports.updateRateLimits = async (req, res) => {
    try {
        const { planId } = req.params;
        const { apiCallsPerDay, wsConnectionsPerSession } = req.body;

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        if (apiCallsPerDay) plan.rateLimits.apiCallsPerDay = apiCallsPerDay;
        if (wsConnectionsPerSession) plan.rateLimits.wsConnectionsPerSession = wsConnectionsPerSession;

        await plan.save();

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Add new feature flag
// @route   POST /api/v1/admin/features
// @access  Private/Admin
exports.addFeatureFlag = async (req, res) => {
    try {
        const { featureName, enabled, requiredTier, description, category } = req.body;

        if (!featureName) {
            return res.status(400).json({ success: false, error: 'Feature name required' });
        }

        const existing = await FeatureFlag.findOne({ name: featureName });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Feature already exists' });
        }

        const feature = await FeatureFlag.create({
            name: featureName,
            enabled: enabled !== undefined ? enabled : false,
            requiredTier: requiredTier || 'PRO',
            description,
            category: category || 'platform'
        });

        res.status(201).json({
            success: true,
            data: feature
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
