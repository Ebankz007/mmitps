// db/schema/tokenization.js — Tokenization domain tables
// Migrated from: backend/models/Tokenization/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index } = require('drizzle-orm/pg-core');
const { users } = require('./core');
const { transactions } = require('./financial');

// ─── Enums ────────────────────────────────────────────────────────────
const assetType = pgEnum('asset_type', ['real_estate', 'commodity', 'startup', 'art', 'other']);
const poolStatus = pgEnum('pool_status', ['upcoming', 'open', 'closed', 'completed', 'cancelled']);
const investmentPoolStatus = pgEnum('investment_pool_status', ['draft', 'funding', 'active', 'closed', 'liquidating']);
const poolCategory = pgEnum('pool_category', ['forex', 'crypto', 'stocks', 'commodities', 'real_estate', 'mixed']);
const poolRiskLevel = pgEnum('pool_risk_level', ['low', 'medium', 'high', 'extreme']);
const investmentStatus = pgEnum('investment_status', ['active', 'withdrawn', 'locked']);
const investmentStatus2 = pgEnum('investment_status2', ['active', 'sold', 'transferred', 'cancelled']);

// ─── Token Pools ──────────────────────────────────────────────────────
const tokenPools = pgTable('token_pools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  assetType: assetType('asset_type').notNull(),
  totalTokenSupply: numeric('total_token_supply', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  tokenPrice: numeric('token_price', { precision: 20, scale: 8, mode: 'number' }).notNull(),
  minInvestment: numeric('min_investment', { precision: 20, scale: 4, mode: 'number' }).default(1),
  maxInvestment: numeric('max_investment', { precision: 20, scale: 4, mode: 'number' }),
  tokensSold: numeric('tokens_sold', { precision: 20, scale: 4, mode: 'number' }).default(0),
  status: poolStatus('status').default('upcoming'),
  expectedReturn: text('expected_return'), // e.g. "12% APY"
  duration: text('duration'),
  images: text('images').array().default([]),
  documents: text('documents').array().default([]),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Investment Pools ─────────────────────────────────────────────────
const investmentPools = pgTable('investment_pools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  description: text('description'),
  category: poolCategory('category'),
  managerId: uuid('manager_id').references(() => users.id),
  status: investmentPoolStatus('status').default('draft'),
  targetSize: numeric('target_size', { precision: 20, scale: 4, mode: 'number' }),
  currentSize: numeric('current_size', { precision: 20, scale: 4, mode: 'number' }).default(0),
  minInvestment: numeric('min_investment', { precision: 20, scale: 4, mode: 'number' }).default(100),
  maxInvestment: numeric('max_investment', { precision: 20, scale: 4, mode: 'number' }),
  currency: text('currency').default('USD'),
  tokenPrice: numeric('token_price', { precision: 20, scale: 8, mode: 'number' }).default(1),
  tokensAvailable: numeric('tokens_available', { precision: 20, scale: 4, mode: 'number' }),
  tokensSold: numeric('tokens_sold', { precision: 20, scale: 4, mode: 'number' }).default(0),
  expectedReturn: numeric('expected_return', { precision: 10, scale: 4, mode: 'number' }),
  actualReturn: numeric('actual_return', { precision: 10, scale: 4, mode: 'number' }).default(0),
  riskLevel: poolRiskLevel('risk_level'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  lockupPeriod: integer('lockup_period'), // days
  assets: jsonb('assets').default([]), // [{symbol, amount, value, allocation}]
  documents: jsonb('documents').default([]), // [{name, url, type}]
  features: text('features').array().default([]),
  isFeatured: boolean('is_featured').default(false),
  allowNewInvestments: boolean('allow_new_investments').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_investment_pools_status').on(t.status),
  index('idx_investment_pools_category').on(t.category),
]);

// ─── Pool Investments ─────────────────────────────────────────────────
const poolInvestments = pgTable('pool_investments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  poolId: uuid('pool_id').notNull().references(() => investmentPools.id),
  amount: numeric('amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  currency: text('currency').default('USD'),
  tokensOwned: numeric('tokens_owned', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  tokenPriceAtPurchase: numeric('token_price_at_purchase', { precision: 20, scale: 8, mode: 'number' }),
  currentValue: numeric('current_value', { precision: 20, scale: 4, mode: 'number' }),
  profit: numeric('profit', { precision: 20, scale: 4, mode: 'number' }).default(0),
  profitPercentage: numeric('profit_percentage', { precision: 10, scale: 4, mode: 'number' }).default(0),
  status: investmentStatus('status').default('active'),
  lockupEndDate: timestamp('lockup_end_date', { withTimezone: true }),
  autoCompound: boolean('auto_compound').default(false),
  dividendsEarned: numeric('dividends_earned', { precision: 20, scale: 4, mode: 'number' }).default(0),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  investedAt: timestamp('invested_at', { withTimezone: true }).defaultNow(),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_pool_investments_user_pool').on(t.userId, t.poolId),
  index('idx_pool_investments_pool_status').on(t.poolId, t.status),
]);

// ─── Investments (TokenPool-based) ────────────────────────────────────
const investments = pgTable('investments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  poolId: uuid('pool_id').notNull().references(() => tokenPools.id),
  tokensPurchased: numeric('tokens_purchased', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  amountInvested: numeric('amount_invested', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  status: investmentStatus2('status').default('active'),
  transactionReference: text('transaction_reference'),
  dividendsEarned: numeric('dividends_earned', { precision: 20, scale: 4, mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_investments_user_pool').on(t.userId, t.poolId),
]);

module.exports = {
  assetType, poolStatus, investmentPoolStatus, poolCategory, poolRiskLevel,
  investmentStatus, investmentStatus2,
  tokenPools, investmentPools, poolInvestments, investments,
};