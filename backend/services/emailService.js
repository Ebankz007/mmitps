const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const ApiServiceManager = require('./ApiServiceManager');
const EmailTemplateService = require('./EmailTemplateService');

class EmailService {
    constructor() {
        this._transporter = null;
        this._lastDriver = null;
    }

    // ─── Driver Resolution ──────────────────────────────────────────────────────

    async getConfig() {
        const config = await ApiServiceManager.getConfig();
        return config.email || {};
    }

    /**
     * Build nodemailer transporter based on active driver from config
     * Drivers: smtp | sendgrid | mailgun
     */
    async getTransporter() {
        const emailConfig = await this.getConfig();
        const driver = emailConfig.driver || 'smtp';

        // Re-create transporter if driver changed
        if (this._transporter && this._lastDriver === driver) {
            return this._transporter;
        }

        let transportConfig;

        if (driver === 'sendgrid') {
            transportConfig = {
                host: 'smtp.sendgrid.net',
                port: 587,
                auth: {
                    user: 'apikey',
                    pass: emailConfig.sendgridApiKey || ''
                }
            };
        } else if (driver === 'mailgun') {
            transportConfig = {
                host: emailConfig.mailgunHost || 'smtp.mailgun.org',
                port: 587,
                auth: {
                    user: emailConfig.mailgunUser || '',
                    pass: emailConfig.mailgunApiKey || ''
                }
            };
        } else {
            // Default: SMTP
            transportConfig = {
                host: emailConfig.host || 'smtp.gmail.com',
                port: Number(emailConfig.port) || 587,
                secure: emailConfig.secure === true || emailConfig.secure === 'true',
                auth: {
                    user: emailConfig.user || '',
                    pass: emailConfig.pass || ''
                }
            };
        }

        this._transporter = nodemailer.createTransport(transportConfig);
        this._lastDriver = driver;
        return this._transporter;
    }

    // Reset transporter (called after config change)
    resetTransporter() {
        this._transporter = null;
        this._lastDriver = null;
    }

    // ─── Core Send ──────────────────────────────────────────────────────────────

    async sendEmail(to, subject, html) {
        const emailConfig = await this.getConfig();
        const fromName    = emailConfig.fromName || 'MMITPS';
        const fromAddress = emailConfig.fromAddress || emailConfig.user || 'noreply@mmitps.com';

        // Mock mode: skip real send if credentials missing
        if (!emailConfig.user && !emailConfig.sendgridApiKey && !emailConfig.mailgunApiKey) {
            logger.warn(`💌 Email Mock: To: ${to} | Subject: ${subject}`);
            return { mocked: true };
        }

        try {
            const transporter = await this.getTransporter();
            const result = await transporter.sendMail({
                from: `${fromName} <${fromAddress}>`,
                to,
                subject,
                html
            });
            logger.info(`✅ Email sent → ${to} | ${subject}`);
            return result;
        } catch (error) {
            logger.error(`❌ Email send failed → ${to}: ${error.message}`);
            this.resetTransporter();
            // Failing silently instead of throwing to prevent breaking user flows (e.g. registration)
            // due to invalid SMTP credentials during pre-production testing.
            return { failed: true, reason: error.message };
        }
    }

    // ─── Event-Based Send (with template + preference checks) ───────────────────

    /**
     * Send an event-driven email using stored template + preferences
     * @param {string}   eventKey   - e.g. 'finance.deposit_confirmed'
     * @param {Object}   user       - user document (needs email, preferences)
     * @param {Object}   variables  - template variable values
     * @param {Object}   [options]  - override: { bypassPreference: true }
     */
    async sendEvent(eventKey, user, variables = {}, options = {}) {
        // Check user master email kill-switch
        if (user?.preferences?.notifications?.email === false && !options.bypassPreference) {
            logger.info(`📵 Email suppressed (master off): ${user.email} | ${eventKey}`);
            return null;
        }

        // Check user category preference
        if (!options.bypassPreference && user?.preferences?.notifications?.emailCategories) {
            const category  = EmailTemplateService.getCategoryForKey(eventKey);
            const catPref   = user.preferences.notifications.emailCategories[category];
            if (catPref === false) {
                logger.info(`📵 Email suppressed (category off): ${user.email} | ${category}`);
                return null;
            }
        }

        // Build variables with user context merged in
        const mergedVars = {
            user: {
                firstName: user?.profile?.firstName || user?.username || 'User',
                lastName:  user?.profile?.lastName  || '',
                email:     user?.email || '',
                username:  user?.username || ''
            },
            platform: { name: 'MMITPS', url: process.env.FRONTEND_URL || 'https://app.mmitps.com' },
            ...variables
        };

        // Render template
        const rendered = await EmailTemplateService.renderEvent(eventKey, mergedVars);
        if (!rendered) {
            logger.info(`📵 Template inactive or missing: ${eventKey}`);
            return null;
        }

        return this.sendEmail(user.email, rendered.subject, rendered.html);
    }

    // ─── Direct Convenience Wrappers ────────────────────────────────────────────

    async sendWelcomeEmail(user) {
        return this.sendEvent('auth.welcome', user);
    }

    async sendPasswordReset(user, resetUrl) {
        return this.sendEvent('auth.password_reset', user, { resetUrl });
    }

    async sendMagicLink(user, magicLink) {
        return this.sendEvent('auth.magic_link', user, { magicLink });
    }

    async sendEmailVerification(user, verifyUrl) {
        return this.sendEvent('auth.email_verify', user, { verifyUrl });
    }

    async sendDepositConfirmation(user, amount, currency, transactionId) {
        return this.sendEvent('finance.deposit_confirmed', user, { amount, currency, transactionId });
    }

    async sendDepositPending(user, amount, currency) {
        return this.sendEvent('finance.deposit_pending', user, { amount, currency });
    }

    async sendWithdrawalApproved(user, amount, currency) {
        return this.sendEvent('finance.withdrawal_approved', user, { amount, currency });
    }

    async sendWithdrawalRejected(user, amount, currency, reason) {
        return this.sendEvent('finance.withdrawal_rejected', user, { amount, currency, reason });
    }

    async sendKycSubmitted(user) {
        return this.sendEvent('kyc.submitted', user);
    }

    async sendKycApproved(user) {
        return this.sendEvent('kyc.approved', user);
    }

    async sendKycRejected(user, reason) {
        return this.sendEvent('kyc.rejected', user, { reason });
    }

    async sendSubscriptionActivated(user, planName) {
        return this.sendEvent('subscription.activated', user, { planName });
    }

    async sendSubscriptionUpgraded(user, planName) {
        return this.sendEvent('subscription.upgraded', user, { planName });
    }

    async sendSubscriptionExpired(user, planName) {
        return this.sendEvent('subscription.expired', user, { planName });
    }

    async sendSubscriptionPaymentFailed(user, planName, amount) {
        return this.sendEvent('subscription.payment_failed', user, { planName, amount });
    }

    async sendSignalAlert(user, signal) {
        return this.sendEvent('trading.signal_alert', user, { signal });
    }

    async sendBotAlert(user, botName, action, symbol) {
        return this.sendEvent('trading.bot_alert', user, { botName, action, symbol });
    }

    async sendSupportTicketOpened(user, ticketId, ticketSubject) {
        return this.sendEvent('support.ticket_opened', user, { ticketId, ticketSubject });
    }

    async sendSupportTicketReplied(user, ticketId, ticketSubject) {
        return this.sendEvent('support.ticket_replied', user, { ticketId, ticketSubject });
    }

    async sendBroadcast(to, subject, html) {
        return this.sendEmail(to, subject, html);
    }

    // ─── Test Email ─────────────────────────────────────────────────────────────

    async sendTestEmail(toEmail, templateKey) {
        const baseUrl = process.env.FRONTEND_URL || 'https://app.mmitps.com';
        const sampleVars = {
            user:      { firstName: 'Test', lastName: 'User', email: toEmail, username: 'testuser' },
            platform:  { name: 'MMITPS', url: baseUrl },
            amount:    '1,000',
            currency:  'USD',
            planName:  'Pro Trader',
            resetUrl:  `${baseUrl}/reset-password?token=sample`,
            magicLink: `${baseUrl}/login/verify?token=sample`,
            verifyUrl: `${baseUrl}/verify-email?token=sample`,
            reason:    'Documentation incomplete',
            ticketId:  'TKT-0001',
            ticketSubject: 'Account access issue',
            signal:    { pair: 'EURUSD', direction: 'BUY', price: '1.0850' },
            botName:   'Demo Bot',
            action:    'BUY',
            symbol:    'BTCUSD',
            transactionId: 'TXN-demo-1234'
        };

        const rendered = await EmailTemplateService.renderEvent(templateKey, sampleVars);
        if (!rendered) throw new Error(`Template '${templateKey}' not found or inactive`);

        return this.sendEmail(toEmail, `[TEST] ${rendered.subject}`, rendered.html);
    }
}

module.exports = new EmailService();
