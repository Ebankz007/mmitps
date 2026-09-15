/**
 * UserEmailController — PostgreSQL edition.
 * Email notification preferences live in users.preferences.notifications (jsonb).
 */
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');

const ALLOWED_CATEGORIES = ['auth', 'finance', 'kyc', 'subscription', 'trading', 'support', 'system', 'marketing'];

/**
 * GET /api/v1/user/email-preferences
 * Returns authenticated user's email notification category preferences
 */
exports.getEmailPreferences = async (req, res, next) => {
    try {
        const user = await UserRepository.findById(req.user.id);
        if (!user) return next(ApiError.notFound('User not found'));

        const notifications = user.preferences?.notifications || {};
        res.json({
            success: true,
            data: {
                email:            notifications.email ?? true,
                emailCategories:  notifications.emailCategories || {}
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
        const user = await UserRepository.findById(req.user.id);
        if (!user) return next(ApiError.notFound('User not found'));

        const notifications = {
            ...(user.preferences?.notifications || {}),
        };

        if (typeof email === 'boolean') {
            notifications.email = email;
        }

        if (emailCategories && typeof emailCategories === 'object') {
            const currentCategories = { ...(notifications.emailCategories || {}) };
            for (const [category, value] of Object.entries(emailCategories)) {
                if (ALLOWED_CATEGORIES.includes(category)) {
                    currentCategories[category] = Boolean(value);
                }
            }
            notifications.emailCategories = currentCategories;
        }

        const updated = await UserRepository.update(req.user.id, {
            preferences: { ...(user.preferences || {}), notifications },
        });

        res.json({
            success: true,
            message: 'Email preferences updated',
            data: updated.preferences?.notifications || {}
        });
    } catch (err) {
        next(err);
    }
};