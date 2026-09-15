const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/v1/user/email-preferences
 * Returns authenticated user's email notification category preferences
 */
exports.getEmailPreferences = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('preferences.notifications');
        if (!user) return next(ApiError.notFound('User not found'));

        res.json({
            success: true,
            data: {
                email:            user.preferences?.notifications?.email ?? true,
                emailCategories:  user.preferences?.notifications?.emailCategories || {}
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/v1/user/email-preferences
 * Body: { email: Boolean, emailCategories: { finance: true, kyc: false, ... } }
 */
exports.updateEmailPreferences = async (req, res, next) => {
    try {
        const { email, emailCategories } = req.body;
        const updateFields = {};

        if (typeof email === 'boolean') {
            updateFields['preferences.notifications.email'] = email;
        }

        if (emailCategories && typeof emailCategories === 'object') {
            const allowed = ['auth', 'finance', 'kyc', 'subscription', 'trading', 'support', 'system', 'marketing'];
            for (const [category, value] of Object.entries(emailCategories)) {
                if (allowed.includes(category)) {
                    updateFields[`preferences.notifications.emailCategories.${category}`] = Boolean(value);
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true, select: 'preferences.notifications' }
        );

        res.json({
            success: true,
            message: 'Email preferences updated',
            data: user.preferences?.notifications || {}
        });
    } catch (err) {
        next(err);
    }
};
