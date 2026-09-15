const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// We need to ensure models are loaded
try { require('../models/Subscription'); } catch (e) { }
try { require('../models/Plan'); } catch (e) { }

exports.checkFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            // Admin always has access
            if (req.user.role === 'admin' || req.user.role === 'super_admin') {
                return next();
            }

            const Subscription = mongoose.model('Subscription');
            const sub = await Subscription.findOne({ user: req.user._id }).populate('plan');

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

            if (!sub.plan) {
                return res.status(403).json({ success: false, message: 'Plan not found for subscription' });
            }

            // Check feature in Plan
            // Plan.features is a Map in Mongoose
            const hasFeature = sub.plan.features.get(featureName);

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
