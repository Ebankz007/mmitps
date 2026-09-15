const EmailTemplateRepository = require('../repositories/pg/EmailTemplateRepository');
const logger = require('../utils/logger');

// Category mapping: template key prefix → user category name
const KEY_CATEGORY_MAP = {
    'auth':         'auth',
    'finance':      'finance',
    'kyc':          'kyc',
    'subscription': 'subscription',
    'trading':      'trading',
    'support':      'support',
    'system':       'system'
};

class EmailTemplateService {
    /**
     * Returns the category string for a given template key
     * e.g. 'finance.deposit_confirmed' → 'finance'
     */
    getCategoryForKey(key) {
        const prefix = key.split('.')[0];
        return KEY_CATEGORY_MAP[prefix] || 'system';
    }

    /**
     * Get all templates (summary list) — PostgreSQL edition
     */
    async getAllTemplates() {
        return EmailTemplateRepository.findAll({}, { sort: 'category,key' });
    }

    /**
     * Get single template by key — PostgreSQL edition
     */
    async getTemplate(key) {
        const template = await EmailTemplateRepository.findByKey(key);
        if (!template) throw new Error(`Email template '${key}' not found`);
        return template;
    }

    /**
     * Update template subject and/or htmlBody — PostgreSQL edition
     */
    async updateTemplate(key, { subject, htmlBody, isActive }, userId) {
        const template = await EmailTemplateRepository.findByKey(key);
        if (!template) throw new Error(`Email template '${key}' not found`);

        const update = { lastModifiedById: userId };
        if (subject !== undefined)  update.subject  = subject;
        if (htmlBody !== undefined) update.htmlBody = htmlBody;
        if (isActive !== undefined) update.isActive = isActive;

        return EmailTemplateRepository.update(template.id, update);
    }

    /**
     * Reset template to its compiled default — PostgreSQL edition
     * Returns the default template object from the seed definitions
     */
    async resetTemplate(key) {
        const { DEFAULT_TEMPLATES } = require('../seedEmailTemplates');
        const defaults = DEFAULT_TEMPLATES.find(t => t.key === key);
        if (!defaults) throw new Error(`No default definition found for '${key}'`);

        const template = await EmailTemplateRepository.findByKey(key);
        if (!template) throw new Error(`Email template '${key}' not found`);

        return EmailTemplateRepository.update(template.id, {
            subject: defaults.subject,
            htmlBody: defaults.htmlBody,
            isActive: true
        });
    }

    /**
     * Render a template by replacing {{variable}} placeholders with values
     * @param {string} template - text with {{variable}} tokens
     * @param {Object} variables - flat key-value map
     */
    renderTemplate(template, variables = {}) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmed = key.trim();
            // Support dot notation: {{user.firstName}}
            const value = trimmed.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), variables);
            return value !== undefined ? String(value) : match;
        });
    }

    /**
     * Build the full rendered email HTML + subject for an event — PostgreSQL edition
     * Returns null if template is inactive
     */
    async renderEvent(eventKey, variables = {}) {
        const template = await EmailTemplateRepository.findByKey(eventKey);
        if (!template || !template.isActive) return null;

        return {
            subject: this.renderTemplate(template.subject, variables),
            html:    this.renderTemplate(template.htmlBody, variables)
        };
    }
}

module.exports = new EmailTemplateService();
