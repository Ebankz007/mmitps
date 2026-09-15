// db/schema/core.js — Core domain tables
// Migrated from: backend/models/*.js (root models)
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index, uniqueIndex } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

// ─── Enums ────────────────────────────────────────────────────────────
const userRole = pgEnum('user_role', [
  'user', 'admin', 'super_admin', 'manager', 'trader',
  'analyst', 'support', 'guest', 'provider', 'instructor',
]);

const planType = pgEnum('plan_type', ['membership', 'service']);
const planInterval = pgEnum('plan_interval', ['month', 'quarter', 'year', 'lifetime']);
const subscriptionStatus = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'incomplete', 'trialing']);
const invoiceStatus = pgEnum('invoice_status', ['paid', 'open', 'void', 'uncollectible']);
const siteContentType = pgEnum('site_content_type', [
  'hero', 'text', 'cards', 'features', 'faq', 'cta', 'footer',
  'settings', 'grid', 'testimonials', 'stats', 'slides',
]);
const contentBlockType = pgEnum('content_block_type', [
  'article', 'layout', 'setting', 'media', 'event', 'testimonial',
]);
const signalAction = pgEnum('signal_action', ['BUY', 'SELL']);
const signalTimeframe = pgEnum('signal_timeframe', ['1M', '5M', '15M', '30M', '1H', '4H', 'D1', 'W1', 'MN']);
const signalStatus = pgEnum('signal_status', ['pending', 'open', 'closed', 'cancelled']);
const noteCategory = pgEnum('note_category', ['general', 'trading', 'analysis', 'strategy', 'reminder', 'other']);
const featureTier = pgEnum('feature_tier', ['FREE', 'BASIC', 'PRO', 'PREMIUM', 'ENTERPRISE', 'INSTITUTIONAL']);
const featureCategory = pgEnum('feature_category', ['trading', 'analysis', 'mlm', 'platform', 'social']);
const certificateStatus = pgEnum('certificate_status', ['active', 'revoked']);
const tradingStyle = pgEnum('trading_style', ['scalping', 'day_trading', 'swing_trading', 'position_trading', 'mixed']);
const riskLevel = pgEnum('risk_level', ['conservative', 'moderate', 'aggressive']);
const traderStatus = pgEnum('trader_status', ['active', 'inactive', 'suspended']);
const socialCategory = pgEnum('social_category', ['Global', 'Asian', 'European', 'Middle East', 'African']);
const connectionStatus = pgEnum('connection_status', ['Disconnected', 'Connected', 'Error']);
const serviceStatus = pgEnum('service_status', ['online', 'offline', 'degraded', 'maintenance']);

// ─── Users ────────────────────────────────────────────────────────────
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username'),
  password: text('password').notNull(), // bcrypt hash — never plaintext
  role: userRole('role').default('user'),
  isProvider: boolean('is_provider').default(false),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  profile: jsonb('profile').default({ firstName: null, lastName: null, phone: null, avatar: null, timezone: 'UTC', country: null }),
  preferences: jsonb('preferences').default({}),
  referralCode: text('referral_code'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpire: timestamp('reset_password_expire', { withTimezone: true }),
  tierId: uuid('tier_id'), // FK → tiers (financial.js)
  lockedWalletBalance: numeric('locked_wallet_balance', { precision: 20, scale: 4, mode: 'number' }).default(0),
  membershipTier: text('membership_tier').default('Basic'),
  activeServices: text('active_services').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_users_role').on(t.role),
  index('idx_users_is_active').on(t.isActive),
  index('idx_users_email_verified').on(t.emailVerified),
  uniqueIndex('idx_users_referral_code').on(t.referralCode).where(sql`${t.referralCode} IS NOT NULL`),
]);

// ─── Plans ────────────────────────────────────────────────────────────
const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  currency: text('currency').default('USD'),
  type: planType('type').default('service'),
  allowedServices: text('allowed_services').array().default([]),
  interval: planInterval('interval').default('lifetime'),
  description: text('description').default(''),
  features: jsonb('features').default({}),
  limits: jsonb('limits').default({}),
  isActive: boolean('is_active').default(true),
  allowedMenus: text('allowed_menus').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────
const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: uuid('plan_id').notNull().references(() => plans.id),
  serviceKey: text('service_key'),
  type: planType('type').default('service'),
  status: subscriptionStatus('status').default('incomplete'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_subscriptions_user').on(t.userId),
  index('idx_subscriptions_plan').on(t.planId),
]);

// ─── Invoices ─────────────────────────────────────────────────────────
const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  amount: numeric('amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  currency: text('currency').default('USD'),
  status: invoiceStatus('status').default('open'),
  stripeInvoiceId: text('stripe_invoice_id'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_invoices_user').on(t.userId),
]);

// ─── Site Content ─────────────────────────────────────────────────────
const siteContents = pgTable('site_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  page: text('page').notNull(),
  section: text('section').notNull(),
  type: siteContentType('type').default('text'),
  data: jsonb('data').notNull().default({}),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_site_contents_page_order').on(t.page, t.sortOrder),
]);

// ─── Content Blocks ───────────────────────────────────────────────────
const contentBlocks = pgTable('content_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  type: contentBlockType('type').default('article'),
  title: text('title').notNull(),
  content: text('content').default(''),
  data: jsonb('data').default({}),
  isActive: boolean('is_active').default(true),
  authorId: uuid('author_id').references(() => users.id),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Social Signals (renamed from root Signal to avoid clash) ─────────
const socialSignals = pgTable('social_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  traderId: uuid('trader_id').notNull().references(() => users.id),
  traderName: text('trader_name').notNull(),
  symbol: text('symbol').notNull(),
  action: signalAction('action').notNull(),
  entryPrice: numeric('entry_price', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  stopLoss: numeric('stop_loss', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  takeProfit: numeric('take_profit', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  lotSize: numeric('lot_size', { precision: 10, scale: 4, mode: 'number' }).default(0.01),
  timeframe: signalTimeframe('timeframe').default('D1'),
  strategy: text('strategy'),
  confidence: integer('confidence').default(50),
  riskRewardRatio: numeric('risk_reward_ratio', { precision: 10, scale: 4, mode: 'number' }).default(0),
  notes: text('notes'),
  status: signalStatus('status').default('pending'),
  openTime: timestamp('open_time', { withTimezone: true }).defaultNow(),
  closeTime: timestamp('close_time', { withTimezone: true }),
  closePrice: numeric('close_price', { precision: 20, scale: 8, mode: 'number' }),
  profit: numeric('profit', { precision: 20, scale: 4, mode: 'number' }).default(0),
  profitPercentage: numeric('profit_percentage', { precision: 10, scale: 4, mode: 'number' }).default(0),
  views: integer('views').default(0),
  copies: integer('copies').default(0),
  likes: integer('likes').default(0),
  comments: jsonb('comments').default([]), // [{userId, userName, text, createdAt}]
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_social_signals_trader').on(t.traderId, t.createdAt),
  index('idx_social_signals_status').on(t.status),
  index('idx_social_signals_symbol').on(t.symbol),
  index('idx_social_signals_created').on(t.createdAt),
]);

// ─── Payment Gateways ─────────────────────────────────────────────────
const paymentGateways = pgTable('payment_gateways', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  isActive: boolean('is_active').default(false),
  config: jsonb('config').default({}),
  supportedMethods: text('supported_methods').array().default([]),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Notes ────────────────────────────────────────────────────────────
const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: noteCategory('category').default('general'),
  isPinned: boolean('is_pinned').default(false),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_notes_user_created').on(t.userId, t.createdAt),
  index('idx_notes_user_pinned').on(t.userId, t.isPinned, t.createdAt),
]);

// ─── Feature Flags ────────────────────────────────────────────────────
const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').default(false),
  requiredTier: featureTier('required_tier').default('PRO'),
  category: featureCategory('category').default('platform'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Menu Configs ─────────────────────────────────────────────────────
const menuConfigs = pgTable('menu_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).default(0),
  currency: text('currency').default('USD'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  attributes: jsonb('attributes').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Certificates ─────────────────────────────────────────────────────
const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientId: uuid('recipient_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull(), // FK → courses (education.js)
  courseName: text('course_name').notNull(),
  code: text('code').unique(),
  issueDate: timestamp('issue_date', { withTimezone: true }).defaultNow(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  status: certificateStatus('status').default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_certificates_recipient').on(t.recipientId),
]);

// ─── Social Trading Profiles ──────────────────────────────────────────
const socialTradings = pgTable('social_tradings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  displayName: text('display_name').notNull(),
  avatar: text('avatar').default('/assets/default-avatar.png'),
  bio: text('bio'),
  totalTrades: integer('total_trades').default(0),
  winningTrades: integer('winning_trades').default(0),
  losingTrades: integer('losing_trades').default(0),
  winRate: numeric('win_rate', { precision: 5, scale: 2, mode: 'number' }).default(0),
  profitFactor: numeric('profit_factor', { precision: 10, scale: 4, mode: 'number' }).default(0),
  averageReturn: numeric('average_return', { precision: 10, scale: 4, mode: 'number' }).default(0),
  maxDrawdown: numeric('max_drawdown', { precision: 10, scale: 4, mode: 'number' }).default(0),
  sharpeRatio: numeric('sharpe_ratio', { precision: 10, scale: 4, mode: 'number' }).default(0),
  totalProfit: numeric('total_profit', { precision: 20, scale: 4, mode: 'number' }).default(0),
  totalLoss: numeric('total_loss', { precision: 20, scale: 4, mode: 'number' }).default(0),
  netProfit: numeric('net_profit', { precision: 20, scale: 4, mode: 'number' }).default(0),
  bestTrade: numeric('best_trade', { precision: 20, scale: 4, mode: 'number' }).default(0),
  worstTrade: numeric('worst_trade', { precision: 20, scale: 4, mode: 'number' }).default(0),
  averageTradeSize: numeric('average_trade_size', { precision: 20, scale: 4, mode: 'number' }).default(0),
  followers: integer('followers').default(0),
  following: integer('following').default(0),
  copiers: integer('copiers').default(0),
  reputation: integer('reputation').default(0),
  verified: boolean('verified').default(false),
  isProvider: boolean('is_provider').default(false),
  subscriptionFee: numeric('subscription_fee', { precision: 10, scale: 2, mode: 'number' }).default(0),
  freeTrialDays: integer('free_trial_days').default(0),
  tradingStyle: tradingStyle('trading_style'),
  preferredMarkets: text('preferred_markets').array().default([]),
  riskLevel: riskLevel('risk_level').default('moderate'),
  lastTradeDate: timestamp('last_trade_date', { withTimezone: true }),
  lastSignalDate: timestamp('last_signal_date', { withTimezone: true }),
  memberSince: timestamp('member_since', { withTimezone: true }).defaultNow(),
  status: traderStatus('status').default('active'),
  monthlyReturns: jsonb('monthly_returns').default([]), // [{month, year, return, trades}]
  socialHandles: jsonb('social_handles').default({}), // {telegram, twitter, instagram, youtube, website}
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_social_tradings_winrate').on(t.winRate),
  index('idx_social_tradings_netprofit').on(t.netProfit),
  index('idx_social_tradings_followers').on(t.followers),
  index('idx_social_tradings_reputation').on(t.reputation),
  index('idx_social_tradings_status').on(t.status),
]);

// ─── Social Handles ───────────────────────────────────────────────────
const socialHandles = pgTable('social_handles', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(),
  handle: text('handle').notNull(),
  url: text('url').notNull(),
  category: socialCategory('category').notNull(),
  icon: text('icon').default('ExternalLink'),
  color: text('color').default('#amber-500'),
  description: text('description'),
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  connectionStatus: connectionStatus('connection_status').default('Disconnected'),
  apiCredentials: jsonb('api_credentials').default({}), // {webhookUrl, channelId, botToken}
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_social_handles_category_order').on(t.category, t.order),
]);

// ─── Social Follows ───────────────────────────────────────────────────
const socialFollows = pgTable('social_follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id),
  traderId: uuid('trader_id').notNull().references(() => users.id),
  isCopying: boolean('is_copying').default(false),
  followedAt: timestamp('followed_at', { withTimezone: true }).defaultNow(),
  copyStartedAt: timestamp('copy_started_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('idx_social_follows_unique').on(t.followerId, t.traderId),
]);

// ─── System Services ──────────────────────────────────────────────────
const systemServices = pgTable('system_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  url: text('url').notNull(),
  apiKey: text('api_key').default(''),
  healthEndpoint: text('health_endpoint').default('/health'),
  status: serviceStatus('status').default('offline'),
  isActive: boolean('is_active').default(true),
  lastHealthCheck: timestamp('last_health_check', { withTimezone: true }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

module.exports = {
  userRole, planType, planInterval, subscriptionStatus, invoiceStatus,
  siteContentType, contentBlockType, signalAction, signalTimeframe, signalStatus,
  noteCategory, featureTier, featureCategory, certificateStatus, tradingStyle,
  riskLevel, traderStatus, socialCategory, connectionStatus, serviceStatus,
  users, plans, subscriptions, invoices, siteContents, contentBlocks,
  socialSignals, paymentGateways, notes, featureFlags, menuConfigs,
  certificates, socialTradings, socialHandles, socialFollows, systemServices,
};