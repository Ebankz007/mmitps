/**
 * seedEmailTemplates.js
 * Seeds 20 default HTML email templates into MongoDB.
 * Run: node backend/seedEmailTemplates.js
 * NOTE: MongoDB-era seed. DEFAULT_TEMPLATES is consumed by EmailTemplateService (PG).
 * The Mongo seed path is obsolete (models/ removed) — requires fail with a clear error.
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// ─── Shared Styles ────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #0a0a0f;
  color: #e2e8f0;
  margin: 0; padding: 0;
`;
const cardStyle = `
  max-width: 600px; margin: 40px auto;
  background: #13131a; border-radius: 12px;
  border: 1px solid #1e293b; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
`;
const headerStyle = `
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  padding: 32px 40px; text-align: center;
`;
const bodyStyle  = `padding: 36px 40px;`;
const footerStyle = `
  background: #0f0f1a; padding: 20px 40px;
  text-align: center; font-size: 12px; color: #64748b;
  border-top: 1px solid #1e293b;
`;
const btnStyle = `
  display: inline-block; padding: 14px 32px;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  color: #ffffff; text-decoration: none;
  border-radius: 8px; font-weight: 700;
  font-size: 15px; margin: 20px 0;
`;
const h2Style  = `color: #f8fafc; font-size: 22px; margin: 0 0 16px;`;
const pStyle   = `color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 12px;`;
const infoBox  = `background: #1e293b; border-radius: 8px; padding: 16px 20px; margin: 16px 0;`;

const wrap = (content) => `
<!DOCTYPE html><html><body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="${headerStyle}">
      <img src="{{platform.url}}/logo.png" alt="MMITPS" style="height:40px; margin-bottom:8px;" onerror="this.style.display='none'"/>
      <h1 style="color:#fff; font-size:24px; margin:0; letter-spacing:0.5px;">MMITPS</h1>
    </div>
    <div style="${bodyStyle}">${content}</div>
    <div style="${footerStyle}">
      <p style="margin:0 0 4px;">© 2026 MMITPS Inc. All rights reserved.</p>
      <p style="margin:0;">
        <a href="{{platform.url}}/unsubscribe" style="color:#475569; text-decoration:none;">Unsubscribe</a>
        &nbsp;|&nbsp;
        <a href="{{platform.url}}/privacy" style="color:#475569; text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body></html>`;

// ─── Template Definitions ─────────────────────────────────────────────────────
const DEFAULT_TEMPLATES = [
    {
        key: 'auth.welcome',
        name: 'Welcome Email',
        category: 'auth',
        description: 'Sent to new users upon registration',
        subject: 'Welcome to {{platform.name}}, {{user.firstName}}! 🎉',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'platform.name', description: 'Platform name' },
            { name: 'platform.url',  description: 'Platform URL' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Welcome aboard, {{user.firstName}}! 🚀</h2>
          <p style="${pStyle}">Your {{platform.name}} account is ready. You now have access to professional trading tools, real-time signals, and a global community of traders.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard" style="${btnStyle}">Go to Dashboard</a>
          </div>
          <p style="${pStyle}">If you have any questions, our support team is always here to help.</p>
        `)
    },
    {
        key: 'auth.password_reset',
        name: 'Password Reset',
        category: 'auth',
        description: 'Sent when a user requests a password reset',
        subject: 'Reset Your {{platform.name}} Password',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'resetUrl',       description: 'Password reset URL' },
            { name: 'platform.name', description: 'Platform name' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Password Reset Request</h2>
          <p style="${pStyle}">Hi {{user.firstName}},</p>
          <p style="${pStyle}">We received a request to reset your password. Click the button below to set a new password. This link expires in 10 minutes.</p>
          <div style="text-align:center;">
            <a href="{{resetUrl}}" style="${btnStyle}">Reset Password</a>
          </div>
          <p style="${pStyle}">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
        `)
    },
    {
        key: 'auth.email_verify',
        name: 'Email Verification',
        category: 'auth',
        description: 'Sent to verify user email address',
        subject: 'Verify your {{platform.name}} email address',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'verifyUrl',      description: 'Verification URL' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Verify Your Email</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, please verify your email address to unlock full access to your account.</p>
          <div style="text-align:center;">
            <a href="{{verifyUrl}}" style="${btnStyle}">Verify Email Address</a>
          </div>
          <p style="${pStyle}">This verification link expires in 24 hours.</p>
        `)
    },
    {
        key: 'auth.magic_link',
        name: 'Magic Link Login',
        category: 'auth',
        description: 'Passwordless login link',
        subject: 'Your {{platform.name}} login link',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'magicLink',      description: 'One-time login URL' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Your Login Link 🔑</h2>
          <p style="${pStyle}">Hi {{user.firstName}},</p>
          <p style="${pStyle}">Click below to instantly sign in to {{platform.name}}. This link expires in 15 minutes and can only be used once.</p>
          <div style="text-align:center;">
            <a href="{{magicLink}}" style="${btnStyle}">Sign In Now</a>
          </div>
          <p style="${pStyle}">Didn't request this? You can safely ignore this email.</p>
        `)
    },
    {
        key: 'finance.deposit_confirmed',
        name: 'Deposit Confirmed',
        category: 'finance',
        description: 'Sent when a user deposit is confirmed',
        subject: '✅ Deposit Confirmed — {{currency}} {{amount}}',
        variables: [
            { name: 'user.firstName',  description: "User's first name" },
            { name: 'amount',          description: 'Deposit amount' },
            { name: 'currency',        description: 'Currency code' },
            { name: 'transactionId',   description: 'Transaction reference' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Deposit Confirmed ✅</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your deposit has been confirmed and your wallet has been credited.</p>
          <div style="${infoBox}">
            <p style="margin:0; color:#94a3b8;"><strong style="color:#e2e8f0;">Amount:</strong> {{currency}} {{amount}}</p>
            <p style="margin:8px 0 0; color:#94a3b8;"><strong style="color:#e2e8f0;">Reference:</strong> {{transactionId}}</p>
          </div>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard/wallet" style="${btnStyle}">View Wallet</a>
          </div>
        `)
    },
    {
        key: 'finance.deposit_pending',
        name: 'Deposit Pending Review',
        category: 'finance',
        description: 'Sent when a deposit is awaiting admin review',
        subject: '⏳ Deposit Pending — {{currency}} {{amount}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'amount',         description: 'Deposit amount' },
            { name: 'currency',       description: 'Currency code' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Deposit Under Review ⏳</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, we've received your deposit of <strong>{{currency}} {{amount}}</strong> and it's currently under review.</p>
          <p style="${pStyle}">You will receive a confirmation email once it's approved, typically within 1–24 hours.</p>
        `)
    },
    {
        key: 'finance.withdrawal_approved',
        name: 'Withdrawal Approved',
        category: 'finance',
        description: 'Sent when a withdrawal is approved',
        subject: '✅ Withdrawal Approved — {{currency}} {{amount}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'amount',         description: 'Withdrawal amount' },
            { name: 'currency',       description: 'Currency code' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Withdrawal Approved ✅</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your withdrawal of <strong>{{currency}} {{amount}}</strong> has been approved and is being processed.</p>
          <p style="${pStyle}">Funds should arrive within 1–3 business days depending on your payment method.</p>
        `)
    },
    {
        key: 'finance.withdrawal_rejected',
        name: 'Withdrawal Rejected',
        category: 'finance',
        description: 'Sent when a withdrawal is rejected',
        subject: '❌ Withdrawal Rejected — {{currency}} {{amount}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'amount',         description: 'Withdrawal amount' },
            { name: 'currency',       description: 'Currency code' },
            { name: 'reason',         description: 'Rejection reason' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Withdrawal Not Approved</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your withdrawal request of <strong>{{currency}} {{amount}}</strong> was not approved.</p>
          <div style="${infoBox}">
            <p style="margin:0; color:#f87171;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="${pStyle}">Please contact our support team if you have questions or wish to resubmit.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/support" style="${btnStyle}">Contact Support</a>
          </div>
        `)
    },
    {
        key: 'kyc.submitted',
        name: 'KYC Submitted',
        category: 'kyc',
        description: 'Sent when user submits KYC documents',
        subject: '📋 KYC Documents Received',
        variables: [{ name: 'user.firstName', description: "User's first name" }],
        htmlBody: wrap(`
          <h2 style="${h2Style}">KYC Documents Received 📋</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, we've received your KYC documents. Our compliance team will review them and you will be notified within 1–3 business days.</p>
        `)
    },
    {
        key: 'kyc.approved',
        name: 'KYC Approved',
        category: 'kyc',
        description: 'Sent when KYC is successfully approved',
        subject: '✅ KYC Approved — Your Account is Verified',
        variables: [{ name: 'user.firstName', description: "User's first name" }],
        htmlBody: wrap(`
          <h2 style="${h2Style}">KYC Approved ✅</h2>
          <p style="${pStyle}">Congratulations, {{user.firstName}}! Your identity has been verified and your account now has full access to all {{platform.name}} features.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard" style="${btnStyle}">Explore Platform</a>
          </div>
        `)
    },
    {
        key: 'kyc.rejected',
        name: 'KYC Rejected',
        category: 'kyc',
        description: 'Sent when KYC documents are rejected',
        subject: '❌ KYC Verification — Action Required',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'reason',         description: 'Rejection reason' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">KYC Verification Requires Action</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your KYC submission could not be approved.</p>
          <div style="${infoBox}">
            <p style="margin:0; color:#f87171;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="${pStyle}">Please re-submit with the corrected documents to continue.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/kyc" style="${btnStyle}">Re-submit Documents</a>
          </div>
        `)
    },
    {
        key: 'subscription.activated',
        name: 'Subscription Activated',
        category: 'subscription',
        description: 'Sent when a new subscription is activated',
        subject: '🎉 Your {{planName}} Plan is Now Active!',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'planName',       description: 'Subscription plan name' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Welcome to {{planName}}! 🎉</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your <strong>{{planName}}</strong> subscription is now active. Enjoy all the premium features included in your plan.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard" style="${btnStyle}">Start Trading</a>
          </div>
        `)
    },
    {
        key: 'subscription.upgraded',
        name: 'Subscription Upgraded',
        category: 'subscription',
        description: 'Sent when a subscription is upgraded to a higher plan',
        subject: '⬆️ Subscription Upgraded to {{planName}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'planName',       description: 'New plan name' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Plan Upgraded ⬆️</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your subscription has been upgraded to <strong>{{planName}}</strong>. Your new features are immediately available.</p>
        `)
    },
    {
        key: 'subscription.expired',
        name: 'Subscription Expired',
        category: 'subscription',
        description: 'Sent when a subscription expires',
        subject: '⚠️ Your {{planName}} Subscription Has Expired',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'planName',       description: 'Expired plan name' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Subscription Expired ⚠️</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your <strong>{{planName}}</strong> subscription has expired. Renew today to restore full access.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/pricing" style="${btnStyle}">Renew Subscription</a>
          </div>
        `)
    },
    {
        key: 'subscription.payment_failed',
        name: 'Payment Failed',
        category: 'subscription',
        description: 'Sent when a subscription renewal payment fails',
        subject: '❌ Payment Failed for {{planName}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'planName',       description: 'Plan name' },
            { name: 'amount',         description: 'Failed payment amount' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Payment Failed</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, we were unable to process your payment of <strong>{{amount}}</strong> for your <strong>{{planName}}</strong> plan.</p>
          <p style="${pStyle}">Please update your payment method to avoid service interruption.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/billing" style="${btnStyle}">Update Payment Method</a>
          </div>
        `)
    },
    {
        key: 'trading.signal_alert',
        name: 'Trading Signal Alert',
        category: 'trading',
        description: 'Sent when a new trading signal is generated',
        subject: '📊 New Signal: {{signal.direction}} {{signal.pair}}',
        variables: [
            { name: 'user.firstName',   description: "User's first name" },
            { name: 'signal.pair',      description: 'Currency/Asset pair' },
            { name: 'signal.direction', description: 'BUY or SELL' },
            { name: 'signal.price',     description: 'Entry price' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">New Trading Signal 📊</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, a new signal is available:</p>
          <div style="${infoBox}">
            <p style="margin:0 0 8px; font-size:18px; font-weight:700; color:#e2e8f0;">{{signal.pair}}</p>
            <p style="margin:0 0 4px; color:#94a3b8;"><strong style="color:#e2e8f0;">Direction:</strong> {{signal.direction}}</p>
            <p style="margin:0; color:#94a3b8;"><strong style="color:#e2e8f0;">Entry Price:</strong> {{signal.price}}</p>
          </div>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard/signals" style="${btnStyle}">View Full Signal</a>
          </div>
        `)
    },
    {
        key: 'trading.bot_alert',
        name: 'Trading Bot Alert',
        category: 'trading',
        description: 'Sent when a trading bot executes an action',
        subject: '🤖 Bot Alert: {{botName}} executed {{action}} on {{symbol}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'botName',        description: 'Bot name' },
            { name: 'action',         description: 'BUY or SELL' },
            { name: 'symbol',         description: 'Trading symbol' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Bot Alert 🤖</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your bot <strong>{{botName}}</strong> just executed a <strong>{{action}}</strong> on <strong>{{symbol}}</strong>.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/dashboard/bots" style="${btnStyle}">View Bot Activity</a>
          </div>
        `)
    },
    {
        key: 'support.ticket_opened',
        name: 'Support Ticket Opened',
        category: 'support',
        description: 'Sent when a new support ticket is created',
        subject: '🎫 Support Ticket #{{ticketId}} — We Got Your Request',
        variables: [
            { name: 'user.firstName',  description: "User's first name" },
            { name: 'ticketId',        description: 'Ticket ID' },
            { name: 'ticketSubject',   description: 'Ticket subject line' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Ticket Received 🎫</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, we've received your support request and our team will respond within 24 hours.</p>
          <div style="${infoBox}">
            <p style="margin:0 0 4px; color:#94a3b8;"><strong style="color:#e2e8f0;">Ticket #:</strong> {{ticketId}}</p>
            <p style="margin:0; color:#94a3b8;"><strong style="color:#e2e8f0;">Subject:</strong> {{ticketSubject}}</p>
          </div>
        `)
    },
    {
        key: 'support.ticket_replied',
        name: 'Support Ticket Reply',
        category: 'support',
        description: 'Sent when an agent replies to a support ticket',
        subject: '💬 New Reply on Ticket #{{ticketId}}',
        variables: [
            { name: 'user.firstName',  description: "User's first name" },
            { name: 'ticketId',        description: 'Ticket ID' },
            { name: 'ticketSubject',   description: 'Ticket subject' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">New Reply on Your Ticket 💬</h2>
          <p style="${pStyle}">Hi {{user.firstName}}, your support team has replied to ticket <strong>#{{ticketId}}</strong>: {{ticketSubject}}.</p>
          <div style="text-align:center;">
            <a href="{{platform.url}}/support/tickets/{{ticketId}}" style="${btnStyle}">View Reply</a>
          </div>
        `)
    },
    {
        key: 'system.broadcast',
        name: 'System Broadcast',
        category: 'system',
        description: 'General broadcast email from admin',
        subject: '📢 Important Update from {{platform.name}}',
        variables: [
            { name: 'user.firstName', description: "User's first name" },
            { name: 'platform.name', description: 'Platform name' }
        ],
        htmlBody: wrap(`
          <h2 style="${h2Style}">Important Update 📢</h2>
          <p style="${pStyle}">Hi {{user.firstName}},</p>
          <p style="${pStyle}">This is an important update from the {{platform.name}} team. Please read the information below carefully.</p>
          <p style="${pStyle}">[Admin: Edit this template in the Email Templates section to add your broadcast message.]</p>
        `)
    }
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedTemplates = async () => {
    try {
        const mongoose = require('mongoose');
        const EmailTemplate = require('./models/System/EmailTemplate');
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';
        console.log('dY" Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.\n');

        let created = 0, updated = 0;

        for (const tmpl of DEFAULT_TEMPLATES) {
            const existing = await EmailTemplate.findOne({ key: tmpl.key });
            if (existing) {
                // Only update metadata; don't overwrite admin-edited subject/htmlBody
                await EmailTemplate.updateOne({ key: tmpl.key }, {
                    $set: { name: tmpl.name, category: tmpl.category, description: tmpl.description, variables: tmpl.variables }
                });
                console.log(`  ↩️  Updated metadata: ${tmpl.key}`);
                updated++;
            } else {
                await EmailTemplate.create(tmpl);
                console.log(`  ✅ Created: ${tmpl.key}`);
                created++;
            }
        }

        console.log(`\n🎉 Done! Created: ${created} | Updated: ${updated} | Total: ${DEFAULT_TEMPLATES.length}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

module.exports = { DEFAULT_TEMPLATES };

// Only auto-seed when run directly (node seedEmailTemplates.js)
// When required by other modules, just export DEFAULT_TEMPLATES
if (require.main === module) {
    seedTemplates();
}
