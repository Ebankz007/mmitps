// db/schema/financial.js — Financial domain tables
// Migrated from: backend/models/Financial/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index, uniqueIndex } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { users } = require('./core');

// ─── Enums ────────────────────────────────────────────────────────────
const txType = pgEnum('tx_type', [
  'deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'internal_transfer',
  'commission', 'bonus', 'fee', 'refund', 'adjustment', 'trade_profit',
  'trade_loss', 'copy_trade_fee', 'subscription', 'tokenization_investment',
  'tokenization_return', 'staking_deposit', 'staking_withdrawal', 'staking_reward',
]);
const txCategory = pgEnum('tx_category', ['wallet', 'trading', 'mlm', 'subscription', 'tokenization', 'staking', 'other']);
const txStatus = pgEnum('tx_status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed', 'expired']);
const feeType = pgEnum('fee_type', ['percentage', 'fixed', 'tiered']);
const paymentMethod = pgEnum('payment_method', [
  'bank_transfer', 'card', 'crypto', 'paystack', 'flutterwave', 'korapay',
  'stripe', 'mobile_money', 'ussd', 'internal', 'manual', 'referral_commission',
]);
const bankAccountType = pgEnum('bank_account_type', ['savings', 'checking', 'current']);
const withdrawalStatus = pgEnum('withdrawal_status', [
  'pending_approval', 'approved', 'processing', 'completed', 'rejected', 'cancelled',
]);
const approvalAction = pgEnum('approval_action', ['approved', 'rejected']);
const bonusClaimStatus = pgEnum('bonus_claim_status', ['pending', 'approved', 'rejected']);
const bonusCriteria = pgEnum('bonus_criteria', ['manual', 'first_deposit', 'kyc_approved', 'trade_volume']);
const couponType = pgEnum('coupon_type', ['percentage', 'fixed']);
const couponCategory = pgEnum('coupon_category', ['subscription', 'shop', 'all']);
const moduleInterval = pgEnum('module_interval', ['month', 'quarter', 'year']);

// ─── Wallets ──────────────────────────────────────────────────────────
const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  balances: jsonb('balances').default([]), // [{currency, amount, frozen}]
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings').default({ defaultCurrency: 'USD', autoConvert: false }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Transactions ─────────────────────────────────────────────────────
const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: txType('type').notNull(),
  category: txCategory('category').default('wallet'),
  status: txStatus('status').default('pending'),
  amount: numeric('amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  amountUSD: numeric('amount_usd', { precision: 20, scale: 4, mode: 'number' }),
  exchangeRate: numeric('exchange_rate', { precision: 20, scale: 8, mode: 'number' }),
  fee: numeric('fee', { precision: 20, scale: 4, mode: 'number' }).default(0),
  feeType: feeType('fee_type'),
  feeCurrency: text('fee_currency'),
  netAmount: numeric('net_amount', { precision: 20, scale: 4, mode: 'number' }),
  paymentMethod: paymentMethod('payment_method'),
  paymentProvider: text('payment_provider'),
  paymentDetails: jsonb('payment_details'),
  crypto: jsonb('crypto'), // {chain, token, txHash, fromAddress, toAddress, confirmations, requiredConfirmations, blockNumber}
  bank: jsonb('bank'), // {bankName, bankCode, accountNumber, accountName, routingNumber, swiftCode, reference}
  reference: text('reference').unique(),
  externalReference: text('external_reference'),
  relatedUserId: uuid('related_user_id').references(() => users.id),
  relatedTransactionId: uuid('related_transaction_id'),
  mlmCommissionId: uuid('mlm_commission_id'), // FK → mlm_commissions (mlm.js)
  balanceBefore: numeric('balance_before', { precision: 20, scale: 4, mode: 'number' }),
  balanceAfter: numeric('balance_after', { precision: 20, scale: 4, mode: 'number' }),
  description: text('description'),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_transactions_user_created').on(t.userId, t.createdAt),
  index('idx_transactions_status').on(t.status),
  index('idx_transactions_type').on(t.type),
  index('idx_transactions_category').on(t.category),
  index('idx_transactions_external_ref').on(t.externalReference),
  index('idx_transactions_crypto_txhash').on(sql`(${t.crypto}->>'txHash')`),
]);

// ─── Tiers ────────────────────────────────────────────────────────────
const tiers = pgTable('tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  level: integer('level').notNull().unique().default(0),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).notNull().default(0),
  currency: text('currency').default('USD'),
  features: jsonb('features').default({}),
  accessibleModules: text('accessible_modules').array().default([]),
  commissions: jsonb('commissions').default({ directReferralPercent: 5, binaryMatchPercent: 5 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Crypto Wallets ───────────────────────────────────────────────────
const cryptoWallets = pgTable('crypto_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  chain: text('chain').notNull(),
  address: text('address').notNull().unique(),
  privateKeyEncrypted: text('private_key_encrypted'), // AES-256-GCM encrypted — NEVER plaintext
  derivationPath: text('derivation_path'),
  walletIndex: integer('wallet_index'),
  label: text('label'),
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_crypto_wallets_user_chain').on(t.userId, t.chain),
]);

// ─── Saved Bank Accounts ──────────────────────────────────────────────
const savedBankAccounts = pgTable('saved_bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number').notNull(),
  bankName: text('bank_name').notNull(),
  bankCode: text('bank_code').notNull(),
  country: text('country').notNull(),
  currency: text('currency').notNull(),
  accountType: bankAccountType('account_type').default('savings'),
  routingNumber: text('routing_number'),
  swiftCode: text('swift_code'),
  iban: text('iban'),
  isVerified: boolean('is_verified').default(false),
  isPrimary: boolean('is_primary').default(false),
  label: text('label'),
  recipientCode: text('recipient_code'),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_saved_bank_accounts_user').on(t.userId),
]);

// ─── Pending Withdrawals ──────────────────────────────────────────────
const pendingWithdrawals = pgTable('pending_withdrawals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  fee: numeric('fee', { precision: 20, scale: 4, mode: 'number' }).default(0),
  netAmount: numeric('net_amount', { precision: 20, scale: 4, mode: 'number' }),
  paymentMethod: text('payment_method').notNull(),
  destination: jsonb('destination').notNull(), // bank or crypto details
  status: withdrawalStatus('status').default('pending_approval'),
  requiresApproval: boolean('requires_approval').default(false),
  approvalLevel: integer('approval_level').default(1),
  approvals: jsonb('approvals').default([]), // [{approver, action, notes, timestamp}]
  twoFactorVerified: boolean('two_factor_verified').default(false),
  emailVerified: boolean('email_verified').default(false),
  verificationCode: text('verification_code'),
  verificationExpires: timestamp('verification_expires', { withTimezone: true }),
  transactionId: uuid('transaction_id'), // FK → transactions
  notes: text('notes'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_pending_withdrawals_user_status').on(t.userId, t.status),
  index('idx_pending_withdrawals_status_created').on(t.status, t.createdAt),
]);

// ─── Bonus Activities ─────────────────────────────────────────────────
const bonusActivities = pgTable('bonus_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  rewardAmount: numeric('reward_amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  rewardCurrency: text('reward_currency').default('USD'),
  criteria: bonusCriteria('criteria').default('manual'),
  isActive: boolean('is_active').default(true),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  maxClaims: integer('max_claims').default(0),
  currentClaims: integer('current_claims').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Bonus Claims ─────────────────────────────────────────────────────
const bonusClaims = pgTable('bonus_claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  bonusActivityId: uuid('bonus_activity_id').notNull().references(() => bonusActivities.id),
  status: bonusClaimStatus('status').default('pending'),
  claimProof: text('claim_proof').default(''),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  processedBy: uuid('processed_by').references(() => users.id),
  rejectionReason: text('rejection_reason').default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('idx_bonus_claims_unique').on(t.userId, t.bonusActivityId),
]);

// ─── Coupons ──────────────────────────────────────────────────────────
const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  discountType: couponType('discount_type').default('percentage'),
  discountValue: numeric('discount_value', { precision: 10, scale: 4, mode: 'number' }).notNull(),
  minPurchaseAmount: numeric('min_purchase_amount', { precision: 20, scale: 4, mode: 'number' }).default(0),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 20, scale: 4, mode: 'number' }),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  usageLimit: integer('usage_limit').default(1),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  category: couponCategory('category').default('all'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Modules ──────────────────────────────────────────────────────────
const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  billingInterval: moduleInterval('billing_interval').default('month'),
  basePrice: numeric('base_price', { precision: 10, scale: 2, mode: 'number' }).notNull().default(50),
  currency: text('currency').default('USD'),
  tierOverrides: jsonb('tier_overrides').default({}), // Map of tier code → price
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

module.exports = {
  txType, txCategory, txStatus, feeType, paymentMethod, bankAccountType,
  withdrawalStatus, approvalAction, bonusClaimStatus, bonusCriteria,
  couponType, couponCategory, moduleInterval,
  wallets, transactions, tiers, cryptoWallets, savedBankAccounts,
  pendingWithdrawals, bonusActivities, bonusClaims, coupons, modules,
};