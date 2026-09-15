/**
 * AdminEmailController — PostgreSQL edition.
 * Email driver config + admin notification prefs + templates (all pg-backed).
 */
const EmailPreferenceRepository = require('../../repositories/pg/EmailPreferenceRepository');
const EmailTemplateService = require('../../services/EmailTemplateService');
const EmailService = require('../../services/emailService');
const ApiServiceManager = require('../../services/ApiServiceManager');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

/** GET /admin/email/config */
exports.getEmailConfig = async (req, res, next) => {
  try {
    const config = await ApiServiceManager.getMaskedConfig();
    res.json({ success: true, data: config.email || {} });
  } catch (err) {
    next(err);
  }
};

/** PUT /admin/email/config */
exports.updateEmailConfig = async (req, res, next) => {
  try {
    const config = await ApiServiceManager.getConfig();
    config.email = { ...config.email, ...req.body };
    await ApiServiceManager.updateConfig(config, req.user.id);

    // Reset transporter so next email uses new settings
    EmailService.resetTransporter();

    logger.info(`Email config updated by ${req.user.email}`);
    res.json({ success: true, message: 'Email configuration updated' });
  } catch (err) {
    next(err);
  }
};

/** POST /admin/email/test */
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

/** GET /admin/email/preferences */
exports.getPreferences = async (req, res, next) => {
  try {
    const prefs = await EmailPreferenceRepository.getSingleton();
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
};

/** PUT /admin/email/preferences */
exports.updatePreferences = async (req, res, next) => {
  try {
    const { adminRecipients, adminNotifications } = req.body;
    const prefs = await EmailPreferenceRepository.getSingleton();

    const data = { lastModifiedById: req.user.id };
    if (adminRecipients !== undefined) data.adminRecipients = adminRecipients;
    if (adminNotifications) {
      const merged = { ...(prefs.adminNotifications || {}), ...adminNotifications };
      data.adminNotifications = merged;
    }

    const updated = await EmailPreferenceRepository.update(prefs.id, data);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/** GET /admin/email/user-defaults */
exports.getUserDefaults = async (req, res, next) => {
  try {
    const prefs = await EmailPreferenceRepository.getSingleton();
    res.json({ success: true, data: prefs.userDefaultNotifications });
  } catch (err) {
    next(err);
  }
};

/** PUT /admin/email/user-defaults */
exports.updateUserDefaults = async (req, res, next) => {
  try {
    const prefs = await EmailPreferenceRepository.getSingleton();
    const merged = { ...(prefs.userDefaultNotifications || {}), ...req.body };
    const updated = await EmailPreferenceRepository.update(prefs.id, {
      userDefaultNotifications: merged,
      lastModifiedById: req.user.id,
    });
    res.json({ success: true, data: updated.userDefaultNotifications });
  } catch (err) {
    next(err);
  }
};

/** GET /admin/email/templates */
exports.getAllTemplates = async (req, res, next) => {
  try {
    const templates = await EmailTemplateService.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
};

/** GET /admin/email/templates/:key */
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplateService.getTemplate(req.params.key);
    res.json({ success: true, data: template });
  } catch (err) {
    next(ApiError.notFound(err.message));
  }
};

/** PUT /admin/email/templates/:key */
exports.updateTemplate = async (req, res, next) => {
  try {
    const { subject, htmlBody, isActive } = req.body;
    const template = await EmailTemplateService.updateTemplate(
      req.params.key,
      { subject, htmlBody, isActive },
      req.user.id
    );
    logger.info(`Template '${req.params.key}' updated by ${req.user.email}`);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
};

/** POST /admin/email/templates/:key/reset */
exports.resetTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplateService.resetTemplate(req.params.key);
    res.json({ success: true, data: template, message: 'Template reset to default' });
  } catch (err) {
    next(err);
  }
};