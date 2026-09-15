// db/schema/mlm.js — MLM domain tables (binary tree)
// Migrated from: backend/models/MLM/*.js
// Uses the ltree extension for materialized-path tree queries.
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index, uniqueIndex, customType } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { users } = require('./core');
const { transactions } = require('./financial');

// ─── Custom ltree type ────────────────────────────────────────────────
const ltree = customType({ dataType() { return 'ltree'; } });

// ─── Enums ────────────────────────────────────────────────────────────
const commissionType = pgEnum('commission_type', [
  'binary_match', 'direct_referral', 'matching_bonus', 'leadership_pool',
  'rank_advancement', 'fast_start', 'team_bonus', 'car_bonus', 'travel_bonus',
  'infinity_bonus', 'global_pool', 'copy_trading', 'signal_provider',
  'tokenization', 'staking_rewards', 'adjustment', 'clawback',
]);
const commissionStatus = pgEnum('commission_status', [
  'locked', 'pending', 'approved', 'paid', 'held', 'cancelled', 'reversed',
]);
const legType = pgEnum('leg_type', ['left', 'right', 'both']);
const periodType = pgEnum('period_type', ['daily', 'weekly', 'monthly']);
const treePosition = pgEnum('tree_position', ['left', 'right', 'root']);
const placementPref = pgEnum('placement_pref', ['left', 'right', 'weaker_bv', 'weaker_referrals', 'holding_tank']);
const qualificationStatus = pgEnum('qualification_status', ['qualified', 'not_qualified', 'grace_period']);

// ─── MLM Ranks ────────────────────────────────────────────────────────
const mlmRanks = pgTable('mlm_ranks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  level: integer('level').notNull().unique(),
  requirements: jsonb('requirements').default({}), // {personalVolume, groupVolume, directReferrals, activeDirects, leftLegVolume, rightLegVolume, rankedDirectsRequired}
  benefits: jsonb('benefits').default({}), // {binaryCommissionRate, binaryCapPercentage, directReferralBonus, matchingBonus, matchingLevels, leadershipPoolShare, carOverride, travelFund, otherBonuses}
  badge: text('badge'),
  color: text('color'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── MLM Commissions ──────────────────────────────────────────────────
const mlmCommissions = pgTable('mlm_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: commissionType('type').notNull(),
  amount: numeric('amount', { precision: 20, scale: 4, mode: 'number' }).notNull(),
  currency: text('currency').default('USD'),
  status: commissionStatus('status').default('pending'),
  unlocksAtTierLevel: integer('unlocks_at_tier_level'),
  isUsedForUpgrade: boolean('is_used_for_upgrade').default(false),
  sourceUserId: uuid('source_user_id').references(() => users.id),
  sourceTransactionId: uuid('source_transaction_id').references(() => transactions.id),
  generation: integer('generation'),
  leg: legType('leg'),
  volumeLeft: numeric('volume_left', { precision: 20, scale: 4, mode: 'number' }),
  volumeRight: numeric('volume_right', { precision: 20, scale: 4, mode: 'number' }),
  volumeMatched: numeric('volume_matched', { precision: 20, scale: 4, mode: 'number' }),
  carryForward: numeric('carry_forward', { precision: 20, scale: 4, mode: 'number' }),
  rank: text('rank'),
  periodType: periodType('period_type'),
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  description: text('description'),
  metadata: jsonb('metadata').default({}),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  paidTransactionId: uuid('paid_transaction_id').references(() => transactions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_mlm_commissions_user_created').on(t.userId, t.createdAt),
  index('idx_mlm_commissions_type_status').on(t.type, t.status),
  index('idx_mlm_commissions_period').on(t.periodStart, t.periodEnd),
]);

// ─── MLM Tree Nodes (binary tree via ltree) ───────────────────────────
const mlmTreeNodes = pgTable('mlm_tree_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  sponsorId: uuid('sponsor_id').references(() => users.id),
  parentId: uuid('parent_id').references(() => users.id),
  position: treePosition('position'),
  leftChildId: uuid('left_child_id').references(() => users.id),
  rightChildId: uuid('right_child_id').references(() => users.id),
  depth: integer('depth').default(0),
  path: ltree('path'), // materialized path: root.1.2.3 (left=1, right=2)
  ancestors: uuid('ancestors').array().default([]),
  leftDescendantCount: integer('left_descendant_count').default(0),
  rightDescendantCount: integer('right_descendant_count').default(0),
  leftLegVolume: numeric('left_leg_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  rightLegVolume: numeric('right_leg_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  leftLegVolumeThisPeriod: numeric('left_leg_volume_this_period', { precision: 20, scale: 4, mode: 'number' }).default(0),
  rightLegVolumeThisPeriod: numeric('right_leg_volume_this_period', { precision: 20, scale: 4, mode: 'number' }).default(0),
  personalVolume: numeric('personal_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  personalVolumeThisPeriod: numeric('personal_volume_this_period', { precision: 20, scale: 4, mode: 'number' }).default(0),
  groupVolume: numeric('group_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  rank: text('rank').default('Starter'),
  isActive: boolean('is_active').default(true),
  preferredPlacement: placementPref('preferred_placement').default('left'),
  qualificationStatus: qualificationStatus('qualification_status').default('not_qualified'),
  lastActivityDate: timestamp('last_activity_date', { withTimezone: true }),
  joinDate: timestamp('join_date', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_mlm_tree_sponsor').on(t.sponsorId),
  index('idx_mlm_tree_parent_position').on(t.parentId, t.position),
  index('idx_mlm_tree_path').using('gist', sql`${t.path}`),
  index('idx_mlm_tree_depth').on(t.depth),
]);

// ─── MLM Volume History ───────────────────────────────────────────────
const mlmVolumeHistories = pgTable('mlm_volume_histories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  periodType: periodType('period_type').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  personalVolume: numeric('personal_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  leftLegVolume: numeric('left_leg_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  rightLegVolume: numeric('right_leg_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  groupVolume: numeric('group_volume', { precision: 20, scale: 4, mode: 'number' }).default(0),
  carryForwardLeft: numeric('carry_forward_left', { precision: 20, scale: 4, mode: 'number' }).default(0),
  carryForwardRight: numeric('carry_forward_right', { precision: 20, scale: 4, mode: 'number' }).default(0),
  volumeMatched: numeric('volume_matched', { precision: 20, scale: 4, mode: 'number' }).default(0),
  commissionsEarned: numeric('commissions_earned', { precision: 20, scale: 4, mode: 'number' }).default(0),
  rank: text('rank'),
  directReferrals: integer('direct_referrals').default(0),
  activeDirects: integer('active_directs').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_mlm_volume_user_period').on(t.userId, t.periodStart),
  index('idx_mlm_volume_type_start').on(t.periodType, t.periodStart),
]);

// ─── MLM Rank History ─────────────────────────────────────────────────
const mlmRankHistories = pgTable('mlm_rank_histories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  previousRank: text('previous_rank'),
  newRank: text('new_rank').notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }).defaultNow(),
  qualificationSnapshot: jsonb('qualification_snapshot').default({}), // {personalVolume, groupVolume, leftLegVolume, rightLegVolume, directReferrals, activeDirects, rankedDirects}
  bonusAwarded: numeric('bonus_awarded', { precision: 20, scale: 4, mode: 'number' }).default(0),
  bonusTransactionId: uuid('bonus_transaction_id'), // FK → mlm_commissions
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_mlm_rank_history_user').on(t.userId, t.achievedAt),
]);

module.exports = {
  commissionType, commissionStatus, legType, periodType, treePosition,
  placementPref, qualificationStatus, ltree,
  mlmRanks, mlmCommissions, mlmTreeNodes, mlmVolumeHistories, mlmRankHistories,
};