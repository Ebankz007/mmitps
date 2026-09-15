// db/schema/trading.js — Trading domain tables
// Migrated from: backend/models/Trading/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index, uniqueIndex } = require('drizzle-orm/pg-core');
const { users } = require('./core');

// ─── Enums ────────────────────────────────────────────────────────────
const analysisType = pgEnum('analysis_type', ['technical', 'fundamental', 'sentiment']);
const analysisDirection = pgEnum('analysis_direction', ['bullish', 'bearish', 'neutral']);
const botStrategy = pgEnum('bot_strategy', ['SENTIMENT_FOLLOWING', 'CONSERVATIVE_CONFIRMATION', 'RETRACEMENT_ENTRY']);
const botStatus = pgEnum('bot_status', ['active', 'paused', 'stopped']);
const accountStatus = pgEnum('account_status', ['connected', 'disconnected', 'invalid_credentials', 'pending', 'error']);
const journalDirection = pgEnum('journal_direction', ['buy', 'sell', 'long', 'short']);
const orderType = pgEnum('order_type', ['market', 'limit', 'stop', 'stop_limit']);
const journalStatus = pgEnum('journal_status', ['open', 'closed', 'cancelled']);
const signalType = pgEnum('signal_type', ['buy', 'sell']);
const signalStatus2 = pgEnum('signal_status2', ['active', 'closed', 'cancelled']);
const signalResult = pgEnum('signal_result', ['win', 'loss', 'breakeven', 'unknown']);
const impactLevel = pgEnum('impact_level', ['High', 'Medium', 'Low']);
const copyTradeStatus = pgEnum('copy_trade_status', ['pending', 'executed', 'failed', 'closed']);
const copySubStatus = pgEnum('copy_sub_status', ['active', 'paused', 'expired']);
const lotSizeStrategy = pgEnum('lot_size_strategy', ['SIGNAL', 'FIXED', 'MULTIPLIER']);
const settlementStatus = pgEnum('settlement_status', ['none', 'pending', 'paid', 'confirmed', 'overdue']);

// ─── Analyses ─────────────────────────────────────────────────────────
const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  pair: text('pair').notNull(),
  type: analysisType('type').default('technical'),
  content: text('content').notNull(),
  chartUrl: text('chart_url'),
  prediction: jsonb('prediction').default({}), // {direction, targetPrice, stopLoss}
  isPremium: boolean('is_premium').default(false),
  tags: text('tags').array().default([]),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_analyses_author_type').on(t.authorId, t.type),
  index('idx_analyses_pair').on(t.pair),
]);

// ─── Trading Bots ─────────────────────────────────────────────────────
const tradingBots = pgTable('trading_bots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  pair: text('pair').notNull(),
  strategy: botStrategy('strategy').default('SENTIMENT_FOLLOWING'),
  allocation: numeric('allocation', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  status: botStatus('status').default('paused'),
  settings: jsonb('settings').default({ stopLossPips: 30, takeProfitPips: 60, maxConcurrentTrades: 1, riskPerTrade: 1, maxDailyLoss: 100, trailingStop: false }),
  stats: jsonb('stats').default({ totalTrades: 0, winRate: 0, netProfit: 0 }),
  lastExecutedAt: timestamp('last_executed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_trading_bots_user_status').on(t.userId, t.status),
  index('idx_trading_bots_strategy').on(t.strategy),
]);

// ─── Trading Accounts ─────────────────────────────────────────────────
const tradingAccounts = pgTable('trading_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  platform: text('platform').notNull(), // ~35 platform enum — kept as text to avoid enum churn
  accountName: text('account_name'),
  accountNumber: text('account_number').notNull(),
  passwordEncrypted: text('password_encrypted'), // AES-256-GCM — NEVER plaintext
  apiKeyEncrypted: text('api_key_encrypted'), // AES-256-GCM
  apiSecretEncrypted: text('api_secret_encrypted'), // AES-256-GCM
  server: text('server'),
  broker: text('broker'),
  status: accountStatus('status').default('pending'),
  lastSync: timestamp('last_sync', { withTimezone: true }),
  balance: numeric('balance', { precision: 20, scale: 4, mode: 'number' }).default(0),
  equity: numeric('equity', { precision: 20, scale: 4, mode: 'number' }).default(0),
  currency: text('currency').default('USD'),
  isPublic: boolean('is_public').default(false),
  isProvider: boolean('is_provider').default(false),
  providerProfile: jsonb('provider_profile').default({}), // {name, description, strategy, minDeposit, performanceFee, managementFee, riskScore}
  stats: jsonb('stats').default({}), // {balance, equity, dayPnL, totalPnL, lastSyncedAt}
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_trading_accounts_user_platform').on(t.userId, t.platform),
]);

// ─── Trade Journals ───────────────────────────────────────────────────
const tradeJournals = pgTable('trade_journals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tradingAccount: jsonb('trading_account').default({}), // {platform, accountId, broker}
  symbol: text('symbol').notNull(),
  direction: journalDirection('direction').notNull(),
  orderType: orderType('order_type').default('market'),
  lotSize: numeric('lot_size', { precision: 10, scale: 4, mode: 'number' }),
  units: integer('units'),
  leverage: numeric('leverage', { precision: 10, scale: 2, mode: 'number' }),
  entryPrice: numeric('entry_price', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  exitPrice: numeric('exit_price', { precision: 20, scale: 8, mode: 'number' }),
  stopLoss: numeric('stop_loss', { precision: 20, scale: 8, mode: 'number' }),
  takeProfit: numeric('take_profit', { precision: 20, scale: 8, mode: 'number' }),
  profitLoss: numeric('profit_loss', { precision: 20, scale: 4, mode: 'number' }),
  profitLossPips: numeric('profit_loss_pips', { precision: 10, scale: 2, mode: 'number' }),
  profitLossPercent: numeric('profit_loss_percent', { precision: 10, scale: 4, mode: 'number' }),
  commission: numeric('commission', { precision: 20, scale: 4, mode: 'number' }).default(0),
  swap: numeric('swap', { precision: 20, scale: 4, mode: 'number' }).default(0),
  netProfitLoss: numeric('net_profit_loss', { precision: 20, scale: 4, mode: 'number' }),
  status: journalStatus('status').default('open'),
  setup: text('setup'),
  strategy: text('strategy'),
  timeframe: text('timeframe'),
  notes: text('notes'),
  tags: text('tags').array().default([]),
  emotions: jsonb('emotions').default({}), // {before, during, after}
  rating: integer('rating'),
  screenshots: jsonb('screenshots').default([]), // [{url, caption, type}]
  entryTime: timestamp('entry_time', { withTimezone: true }).notNull(),
  exitTime: timestamp('exit_time', { withTimezone: true }),
  duration: integer('duration'), // seconds (Mongoose stored Number)
  externalTradeId: text('external_trade_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_trade_journals_user_entry').on(t.userId, t.entryTime),
  index('idx_trade_journals_user_symbol').on(t.userId, t.symbol),
  index('idx_trade_journals_user_status').on(t.userId, t.status),
]);

// ─── Trading Signals (renamed from Trading/Signal to avoid clash) ─────
const tradingSignals = pgTable('trading_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  pair: text('pair').notNull(),
  type: signalType('type').notNull(),
  entryPrice: numeric('entry_price', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  stopLoss: numeric('stop_loss', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  takeProfit: numeric('take_profit', { precision: 20, scale: 8, mode: 'number' }).array(), // multi-TP
  status: signalStatus2('status').default('active'),
  result: signalResult('result').default('unknown'),
  pips: numeric('pips', { precision: 10, scale: 2, mode: 'number' }),
  analysis: text('analysis'),
  timeframe: text('timeframe'),
  isPremium: boolean('is_premium').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_trading_signals_provider_status').on(t.providerId, t.status),
  index('idx_trading_signals_pair').on(t.pair),
]);

// ─── Fundamental Data ─────────────────────────────────────────────────
const fundamentalData = pgTable('fundamental_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: text('country').notNull(),
  indicator: text('indicator').notNull(),
  value: text('value').notNull(),
  previousValue: text('previous_value'),
  forecastValue: text('forecast_value'),
  impact: impactLevel('impact').default('Medium'),
  releaseDate: timestamp('release_date', { withTimezone: true }).notNull(),
  period: text('period'),
  unit: text('unit'),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_fundamental_data_indicator').on(t.indicator),
  index('idx_fundamental_data_release').on(t.releaseDate),
  index('idx_fundamental_data_country_indicator').on(t.country, t.indicator, t.releaseDate),
]);

// ─── COT Reports ──────────────────────────────────────────────────────
const cotReports = pgTable('cot_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  asset: text('asset').notNull(),
  reportingDate: timestamp('reporting_date', { withTimezone: true }).notNull(),
  nonCommercialLong: numeric('non_commercial_long', { precision: 20, scale: 4, mode: 'number' }),
  nonCommercialShort: numeric('non_commercial_short', { precision: 20, scale: 4, mode: 'number' }),
  commercialLong: numeric('commercial_long', { precision: 20, scale: 4, mode: 'number' }),
  commercialShort: numeric('commercial_short', { precision: 20, scale: 4, mode: 'number' }),
  speculatorLong: numeric('speculator_long', { precision: 20, scale: 4, mode: 'number' }),
  speculatorShort: numeric('speculator_short', { precision: 20, scale: 4, mode: 'number' }),
  openInterest: numeric('open_interest', { precision: 20, scale: 4, mode: 'number' }),
  netPosition: numeric('net_position', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  sentimentScore: numeric('sentiment_score', { precision: 5, scale: 2, mode: 'number' }),
  source: text('source').default('CFTC'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_cot_reports_asset_date').on(t.asset, t.reportingDate),
]);

// ─── Copy Trades ──────────────────────────────────────────────────────
const copyTrades = pgTable('copy_trades', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  providerTradeId: uuid('provider_trade_id'), // FK → trade_journals
  followerTradeId: uuid('follower_trade_id'), // FK → trade_journals
  allocation: numeric('allocation', { precision: 20, scale: 4, mode: 'number' }),
  riskMultiplier: numeric('risk_multiplier', { precision: 10, scale: 4, mode: 'number' }).default(1),
  maxLotSize: numeric('max_lot_size', { precision: 10, scale: 4, mode: 'number' }),
  symbol: text('symbol'),
  direction: journalDirection('direction'),
  providerLotSize: numeric('provider_lot_size', { precision: 10, scale: 4, mode: 'number' }),
  copiedLotSize: numeric('copied_lot_size', { precision: 10, scale: 4, mode: 'number' }),
  providerEntryPrice: numeric('provider_entry_price', { precision: 20, scale: 8, mode: 'number' }),
  followerEntryPrice: numeric('follower_entry_price', { precision: 20, scale: 8, mode: 'number' }),
  slippage: numeric('slippage', { precision: 20, scale: 8, mode: 'number' }),
  providerProfitLoss: numeric('provider_profit_loss', { precision: 20, scale: 4, mode: 'number' }),
  followerProfitLoss: numeric('follower_profit_loss', { precision: 20, scale: 4, mode: 'number' }),
  status: copyTradeStatus('status').default('pending'),
  failureReason: text('failure_reason'),
  copyFee: numeric('copy_fee', { precision: 20, scale: 4, mode: 'number' }),
  providerShare: numeric('provider_share', { precision: 20, scale: 4, mode: 'number' }),
  platformShare: numeric('platform_share', { precision: 20, scale: 4, mode: 'number' }),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_copy_trades_follower_provider').on(t.followerId, t.providerId),
  index('idx_copy_trades_provider_executed').on(t.providerId, t.executedAt),
]);

// ─── Copy Subscriptions ───────────────────────────────────────────────
const copySubscriptions = pgTable('copy_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  status: copySubStatus('status').default('active'),
  allocationAmount: numeric('allocation_amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  riskMultiplier: numeric('risk_multiplier', { precision: 10, scale: 4, mode: 'number' }).default(1),
  lotSizeStrategy: lotSizeStrategy('lot_size_strategy').default('SIGNAL'),
  lotSizeValue: numeric('lot_size_value', { precision: 10, scale: 4, mode: 'number' }).default(0.01),
  minLotSize: numeric('min_lot_size', { precision: 10, scale: 4, mode: 'number' }).default(0),
  maxDrawdown: numeric('max_drawdown', { precision: 10, scale: 2, mode: 'number' }).default(20),
  accruedPnL: numeric('accrued_pnl', { precision: 20, scale: 4, mode: 'number' }).default(0),
  pendingCommission: numeric('pending_commission', { precision: 20, scale: 4, mode: 'number' }).default(0),
  settlementStatus: settlementStatus('settlement_status').default('none'),
  settlementDeadline: timestamp('settlement_deadline', { withTimezone: true }),
  lastSettlementAt: timestamp('last_settlement_at', { withTimezone: true }),
  isSuspended: boolean('is_suspended').default(false),
  suspensionReason: text('suspension_reason'),
  maxPositions: integer('max_positions').default(5),
  allowedSymbols: text('allowed_symbols').array().default([]),
  excludedSymbols: text('excluded_symbols').array().default([]),
  followerAccountId: uuid('follower_account_id').notNull().references(() => tradingAccounts.id),
  isCBook: boolean('is_c_book').default(false),
  totalProfit: numeric('total_profit', { precision: 20, scale: 4, mode: 'number' }).default(0),
  equityAtStart: numeric('equity_at_start', { precision: 20, scale: 4, mode: 'number' }),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('idx_copy_subs_unique').on(t.followerId, t.providerId, t.followerAccountId),
]);

module.exports = {
  analysisType, analysisDirection, botStrategy, botStatus, accountStatus,
  journalDirection, orderType, journalStatus, signalType, signalStatus2,
  signalResult, impactLevel, copyTradeStatus, copySubStatus, lotSizeStrategy,
  settlementStatus,
  analyses, tradingBots, tradingAccounts, tradeJournals, tradingSignals,
  fundamentalData, cotReports, copyTrades, copySubscriptions,
};