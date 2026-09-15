const EmailPreference = require('../models/System/EmailPreference');
const EmailTemplateService = require('../services/EmailTemplateService');
const EmailService = require('../services/emailService');
const ApiServiceManager = require('../services/ApiServiceManager');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// ─── Email Driver Config ──────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/email/config
 * Returns current email driver config (with password masked)
 */
exports.getEmailConfig = async (req, res, next) => {
    try {
        const config = await ApiServiceManager.getMaskedConfig();
        res.json({ success: true, data: config.email || {} });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/v1/admin/email/config
 * Update email driver settings (SMTP, SendGrid, Mailgun)
 * Body: { driver, host, port, secure, user, pass, fromName, fromAddress,
 *         sendgridApiKey, mailgunApiKey, mailgunHost, mailgunUser }
 */
exports.updateEmailConfig = async (req, res, next) => {
    try {
        const config = await ApiServiceManager.getConfig();
        config.email = { ...config.email, ...req.body };
        await ApiServiceManager.updateConfig(config, req.user._id);

        // Reset transporter so next email uses new settings
        EmailService.resetTransporter();

        logger.info(`Email config updated by ${req.user.email}`);
        res.json({ success: true, message: 'Email configuration updated' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/admin/email/test
 * Send a test email using the active driver
 * Body: { to, templateKey }
 */
exports.sendTestEmail = async (req, res, next) => {
    try {
        const { to, templateKey } = req.body;
        if (!to) return next(ApiError.badRequest('Recipient email (to) is required'));

        await EmailService.sendTestEmail(to, templateKey || 'auth.welcome');
        res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (err) {
        next(err);
    }
};

// ─── Admin Notification Preferences ──────────────────────────────────────────

/**
 * GET /api/v1/admin/email/preferences
 */
exports.getPreferences = async (req, res, next) => {
    try {
        const prefs = await EmailPreference.getSingleton();
        res.json({ success: true, data: prefs });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/v1/admin/email/preferences
 * Body: { adminRecipients: [], adminNotifications: { 'auth.welcome': true, ... } }
 */
exports.updatePreferences = async (req, res, next) => {
    try {
        const { adminRecipients, adminNotifications } = req.body;
        const prefs = await EmailPreference.getSingleton();

        if (adminRecipients !== undefined) prefs.adminRecipients = adminRecipients;
        if (adminNotifications) {
            for (const [key, val] of Object.entries(adminNotifications)) {
                prefs.adminNotifications.set(key, Boolean(val));
            }
        }

        prefs.lastModifiedBy = req.user._id;
        await prefs.save();

        res.json({ success: true, data: prefs });
    } catch (err) {
        next(err);
    }
};

// ─── User Default Preferences ─────────────────────────────────────────────────

/**
 * GET /api/v1/admin/email/user-defaults
 */
exports.getUserDefaults = async (req, res, next) => {
    try {
        const prefs = await EmailPreference.getSingleton();
        res.json({ success: true, data: prefs.userDefaultNotifications });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/v1/admin/email/user-defaults
 * Body: { auth: true, finance: true, ... }
 */
exports.updateUserDefaults = async (req, res, next) => {
    try {
        const prefs = await EmailPreference.getSingleton();
        prefs.userDefaultNotifications = { ...prefs.userDefaultNotifications.toObject?.() || prefs.userDefaultNotifications, ...req.body };
        prefs.lastModifiedBy = req.user._id;
        await prefs.save();
        res.json({ success: true, data: prefs.userDefaultNotifications });
    } catch (err) {
        next(err);
    }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/email/templates
 */
exports.getAllTemplates = async (req, res, next) => {
    try {
        const templates = await EmailTemplateService.getAllTemplates();
        res.json({ success: true, data: templates });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/admin/email/templates/:key
 */
exports.getTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplateService.getTemplate(req.params.key);
        res.json({ success: true, data: template });
    } catch (err) {
        next(ApiError.notFound(err.message));
    }
};

/**
 * PUT /api/v1/admin/email/templates/:key
 * Body: { subject, htmlBody, isActive }
 */
exports.updateTemplate = async (req, res, next) => {
    try {
        const { subject, htmlBody, isActive } = req.body;
        const template = await EmailTemplateService.updateTemplate(
            req.params.key,
            { subject, htmlBody, isActive },
            req.user._id
        );
        logger.info(`Template '${req.params.key}' updated by ${req.user.email}`);
        res.json({ success: true, data: template });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/admin/email/templates/:key/reset
 * Reset template to factory default
 */
exports.resetTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplateService.resetTemplate(req.params.key);
        res.json({ success: true, data: template, message: 'Template reset to default' });
    } catch (err) {
        next(err);
    }
};
