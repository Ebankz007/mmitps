// db/schema/system.js — System domain tables
// Migrated from: backend/models/System/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, integer, jsonb, index, uniqueIndex, serial, doublePrecision } = require('drizzle-orm/pg-core');
const { users } = require('./core');

// ─── Enums ────────────────────────────────────────────────────────────
const configCategory = pgEnum('config_category', [
  'general', 'fees', 'limits', 'mlm', 'trading', 'security',
  'notifications', 'integrations', 'broadcast', 'financial',
]);
const healthStatus = pgEnum('health_status', ['healthy', 'degraded', 'critical']);
const annealingType = pgEnum('annealing_type', ['integrity', 'performance', 'security', 'cleanup']);
const annealingStatus = pgEnum('annealing_status', ['success', 'warning', 'error']);
const notificationType = pgEnum('notification_type', [
  'system', 'transaction', 'trading', 'mlm', 'security', 'kyc',
  'promotion', 'announcement', 'copy_trading', 'tokenization',
]);
const notificationPriority = pgEnum('notification_priority', ['low', 'normal', 'high', 'urgent']);
const newsletterStatus = pgEnum('newsletter_status', ['active', 'unsubscribed']);
const emailCategory = pgEnum('email_category', [
  'auth', 'transactional', 'marketing', 'security', 'kyc', 'support', 'system',
]);
const activityCategory = pgEnum('activity_category', [
  'auth', 'profile', 'wallet', 'trading', 'mlm', 'kyc', 'admin', 'system',
]);
const activityStatus = pgEnum('activity_status', ['success', 'failure', 'warning']);

// ─── System Config ────────────────────────────────────────────────────
const systemConfigs = pgTable('system_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').default({}),
  category: configCategory('category').default('general'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  lastModifiedById: uuid('last_modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_system_configs_category').on(t.category),
]);

// ─── Site Status ──────────────────────────────────────────────────────
const siteStatuses = pgTable('site_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  isMaintenanceMode: boolean('is_maintenance_mode').default(false),
  maintenanceMessage: text('maintenance_message').default('We are currently performing scheduled maintenance. Please check back shortly.'),
  version: text('version').default('2.0.0'),
  lastBuild: timestamp('last_build', { withTimezone: true }),
  health: jsonb('health').default({ status: 'healthy', lastChecked: null }),
  annealingReports: jsonb('annealing_reports').default([]), // [{type, status, message, details, timestamp}]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────
const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: notificationType('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data').default({}),
  priority: notificationPriority('priority').default('normal'),
  channels: jsonb('channels').default({ inApp: true, email: false, push: false, sms: false }),
  status: jsonb('status').default({ inAppSent: true, emailSent: false, pushSent: false, smsSent: false }),
  read: boolean('read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  actionUrl: text('action_url'),
  actionText: text('action_text'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_notifications_user_read').on(t.userId, t.read),
  index('idx_notifications_user_created').on(t.userId, t.createdAt),
]);

// ─── Newsletters ──────────────────────────────────────────────────────
const newsletters = pgTable('newsletters', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  status: newsletterStatus('status').default('active'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Email Templates ──────────────────────────────────────────────────
const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // one of 20 TEMPLATE_KEYS
  name: text('name').notNull(),
  category: emailCategory('category').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  variables: jsonb('variables').default([]), // [{name, description}]
  isActive: boolean('is_active').default(true),
  lastModifiedById: uuid('last_modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Email Preferences (singleton) ────────────────────────────────────
const emailPreferences = pgTable('email_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').default('email_preferences').unique(), // singleton
  adminRecipients: text('admin_recipients').array().default([]),
  adminNotifications: jsonb('admin_notifications').default({}),
  userDefaultNotifications: jsonb('user_default_notifications').default({
    auth: true, finance: true, kyc: true, subscription: true,
    trading: true, support: true, system: true, marketing: false,
  }),
  lastModifiedById: uuid('last_modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Activity Logs ────────────────────────────────────────────────────
const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  category: activityCategory('category').default('system'),
  description: text('description'),
  details: jsonb('details').default({}),
  targetType: text('target_type'),
  targetId: uuid('target_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  device: jsonb('device').default({}), // {type, browser, os}
  location: jsonb('location').default({}), // {country, city, coordinates}
  status: activityStatus('status').default('success'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_activity_logs_user_created').on(t.userId, t.createdAt),
  index('idx_activity_logs_action_created').on(t.action, t.createdAt),
  index('idx_activity_logs_category_created').on(t.category, t.createdAt),
  index('idx_activity_logs_created').on(t.createdAt),
]);

// ─── PTD Predictions (Python engine) ──────────────────────────────────
// Owned by backend-python (SQLAlchemy PTDSignal) — created here so the
// schema is tracked in Drizzle migrations and the Node backend can query
// prediction accuracy for admin reporting.
const ptdSignals = pgTable('ptd_signals', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull(),
  timeframe: text('timeframe'),
  signalTime: timestamp('signal_time', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  logicType: text('logic_type'), // Fibonacci, Gann, Astro, Cycles
  direction: text('direction'), // UP, DOWN, TRANSITION
  confidence: doublePrecision('confidence'),
  isEvaluated: boolean('is_evaluated').default(false),
  isHit: boolean('is_hit'),
  priceAtSignal: doublePrecision('price_at_signal'),
  actualTurnTime: timestamp('actual_turn_time', { withTimezone: true }),
  errorMinutes: doublePrecision('error_minutes'),
}, (t) => [
  index('idx_ptd_signals_symbol').on(t.symbol),
  index('idx_ptd_signals_evaluated').on(t.isEvaluated),
]);

module.exports = {
  configCategory, healthStatus, annealingType, annealingStatus,
  notificationType, notificationPriority, newsletterStatus, emailCategory,
  activityCategory, activityStatus,
  systemConfigs, siteStatuses, notifications, newsletters, emailTemplates,
  emailPreferences, activityLogs, ptdSignals,
};