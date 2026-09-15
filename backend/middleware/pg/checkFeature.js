/**
 * checkFeature — PostgreSQL edition.
 * Gates feature access behind an active subscription whose plan grants the feature.
 */
const SubscriptionRepository = require('../../repositories/pg/SubscriptionRepository');
const PlanRepository = require('../../repositories/pg/PlanRepository');

exports.checkFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            // Admin always has access
            if (req.user.role === 'admin' || req.user.role === 'super_admin') {
                return next();
            }

            const sub = await SubscriptionRepository.findActiveByUser(req.user.id);

            if (!sub) {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription required',
                    code: 'NO_SUBSCRIPTION'
                });
            }

            if (sub.status !== 'active' && sub.status !== 'trialing') {
                return res.status(403).json({
                    success: false,
                    message: 'Active subscription required',
                    code: 'SUBSCRIPTION_INACTIVE'
                });
            }

            const plan = await PlanRepository.findById(sub.planId);
            if (!plan) {
                return res.status(403).json({ success: false, message: 'Plan not found for subscription' });
            }

            // Plan.features is a JSONB object in PG
            const hasFeature = plan.features && plan.features[featureName];

            if (!hasFeature) {
                return res.status(403).json({
                    success: false,
                    message: `Upgrade to ${featureName} plan required`,
                    code: 'UPGRADE_REQUIRED'
                });
            }

            next();
        } catch (error) {
            console.error('Feature Gate Error:', error);
            res.status(500).json({ success: false, message: 'Server error checking permissions' });
        }
    };
};