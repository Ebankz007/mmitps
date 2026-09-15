// db/port-phase1.js — MongoDB → PostgreSQL data port: users, plans, subscriptions, invoices
// - Deterministic ObjectId → UUID mapping (reversible: strip "00000-" + dashes)
// - Skips orphan rows (missing FK targets), logs them to db/port-log-orphans.json
// - Idempotent: TRUNCATEs target tables first (CASCADE), runs in one transaction
// Usage: node db/port-phase1.js
const { MongoClient } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';
const ORPHAN_LOG = path.join(__dirname, 'port-log-orphans.json');

// ObjectId (24 hex) → UUID (32 hex): 00000000-XXXX-XXXX-XXXX-XXXXXXXXXXXX
function oidToUuid(oid) {
  const hex = oid.toString();
  if (!/^[0-9a-f]{24}$/i.test(hex)) throw new Error(`Invalid ObjectId: ${hex}`);
  return `00000000-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 24)}`;
}

const asDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null);
const asArr = (v) => (Array.isArray(v) ? v : []);

function mapUser(doc) {
  const prefs = doc.preferences || {};
  const { membershipTier, activeServices, ...restPrefs } = prefs;
  return {
    id: oidToUuid(doc._id),
    email: doc.email,
    username: doc.username ?? null,
    password: doc.password,
    role: doc.role ?? 'user',
    is_provider: doc.isProvider ?? false,
    is_active: doc.isActive ?? true,
    email_verified: doc.emailVerified ?? false,
    last_login: asDate(doc.lastLogin),
    profile: doc.profile ?? {},
    preferences: restPrefs,
    referral_code: doc.referralCode ?? null,
    reset_password_token: doc.resetPasswordToken ?? null,
    reset_password_expire: asDate(doc.resetPasswordExpire),
    tier_id: null, // tiers ported in Phase 2; set when tier refs exist
    locked_wallet_balance: doc.lockedWalletBalance ?? 0,
    membership_tier: membershipTier ?? 'Basic',
    active_services: asArr(activeServices),
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

function mapPlan(doc) {
  return {
    id: oidToUuid(doc._id),
    name: doc.name,
    code: doc.code,
    price: doc.price ?? 0,
    currency: doc.currency ?? 'USD',
    type: doc.type ?? 'service',
    allowed_services: asArr(doc.allowedServices),
    interval: doc.interval ?? 'lifetime',
    description: doc.description ?? '',
    features: doc.features ?? {},
    limits: doc.limits ?? {},
    is_active: doc.isActive ?? true,
    allowed_menus: asArr(doc.allowedMenus),
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

function mapSubscription(doc, userUuids, planUuids) {
  const userId = doc.user ? oidToUuid(doc.user) : null;
  const planId = doc.plan ? oidToUuid(doc.plan) : null;
  if (!userId || !planId || !userUuids.has(userId) || !planUuids.has(planId)) return null;
  return {
    id: oidToUuid(doc._id),
    user_id: userId,
    plan_id: planId,
    service_key: doc.serviceKey ?? null,
    type: doc.type ?? 'service',
    status: doc.status ?? 'incomplete',
    stripe_customer_id: doc.stripeCustomerId ?? null,
    stripe_subscription_id: doc.stripeSubscriptionId ?? null,
    current_period_start: asDate(doc.currentPeriodStart),
    current_period_end: asDate(doc.currentPeriodEnd),
    cancel_at_period_end: doc.cancelAtPeriodEnd ?? false,
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

function mapInvoice(doc, userUuids) {
  const userId = doc.user ? oidToUuid(doc.user) : null;
  if (!userId || !userUuids.has(userId)) return null;
  return {
    id: oidToUuid(doc._id),
    user_id: userId,
    subscription_id: doc.subscription ? oidToUuid(doc.subscription) : null,
    amount: doc.amount ?? 0,
    currency: doc.currency ?? 'USD',
    status: doc.status ?? 'open',
    stripe_invoice_id: doc.stripeInvoiceId ?? null,
    paid_at: asDate(doc.paidAt),
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  const pgClient = await pool.connect();
  const orphans = { subscriptions: [], invoices: [] };
  let usersWithTier = 0;

  try {
    await client.connect();
    const db = client.db();

    // ── Read + map ────────────────────────────────────────────────
    const planDocs = await db.collection('plans').find({}).toArray();
    const userDocs = await db.collection('users').find({}).toArray();
    const subDocs = await db.collection('subscriptions').find({}).toArray();
    const invDocs = await db.collection('invoices').find({}).toArray();

    const plans = planDocs.map(mapPlan);
    const users = userDocs.map(mapUser);

    // Detect users referencing tiers (Phase 2 table — FK would fail)
    for (const doc of userDocs) {
      if (doc.tier) { usersWithTier++; console.log(`  NOTE: user ${doc._id} references tier ${doc.tier} — tier_id left NULL (Phase 2)`); }
    }

    const userUuids = new Set(users.map(u => u.id));
    const planUuids = new Set(plans.map(p => p.id));

    const subscriptions = [];
    for (const doc of subDocs) {
      const row = mapSubscription(doc, userUuids, planUuids);
      if (row) subscriptions.push(row);
      else orphans.subscriptions.push(doc);
    }

    const invoices = [];
    for (const doc of invDocs) {
      const row = mapInvoice(doc, userUuids);
      if (row) invoices.push(row);
      else orphans.invoices.push(doc);
    }

    // ── Transaction ───────────────────────────────────────────────
    await pgClient.query('BEGIN');
    await pgClient.query('TRUNCATE users, plans, subscriptions, invoices RESTART IDENTITY CASCADE');

    const insert = async (table, rows, cols) => {
      if (rows.length === 0) return 0;
      const colList = cols.join(', ');
      const placeholders = rows.map((_, i) => `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(', ')})`).join(', ');
      const values = rows.flatMap(r => cols.map(c => r[c]));
      await pgClient.query(`INSERT INTO ${table} (${colList}) VALUES ${placeholders}`, values);
      return rows.length;
    };

    const userCols = ['id', 'email', 'username', 'password', 'role', 'is_provider', 'is_active', 'email_verified', 'last_login', 'profile', 'preferences', 'referral_code', 'reset_password_token', 'reset_password_expire', 'tier_id', 'locked_wallet_balance', 'membership_tier', 'active_services', 'created_at', 'updated_at'];
    const planCols = ['id', 'name', 'code', 'price', 'currency', 'type', 'allowed_services', 'interval', 'description', 'features', 'limits', 'is_active', 'allowed_menus', 'created_at', 'updated_at'];
    const subCols = ['id', 'user_id', 'plan_id', 'service_key', 'type', 'status', 'stripe_customer_id', 'stripe_subscription_id', 'current_period_start', 'current_period_end', 'cancel_at_period_end', 'created_at', 'updated_at'];
    const invCols = ['id', 'user_id', 'subscription_id', 'amount', 'currency', 'status', 'stripe_invoice_id', 'paid_at', 'created_at', 'updated_at'];

    const nPlans = await insert('plans', plans, planCols);
    const nUsers = await insert('users', users, userCols);
    const nSubs = await insert('subscriptions', subscriptions, subCols);
    const nInvs = await insert('invoices', invoices, invCols);

    await pgClient.query('COMMIT');

    // ── Report ────────────────────────────────────────────────────
    console.log('\n=== PHASE 1 PORT COMPLETE ===');
    console.log(`plans:         ${nPlans}/${planDocs.length} ported`);
    console.log(`users:         ${nUsers}/${userDocs.length} ported`);
    console.log(`subscriptions: ${nSubs}/${subDocs.length} ported`);
    console.log(`invoices:      ${nInvs}/${invDocs.length} ported`);
    if (usersWithTier > 0) console.log(`users w/ tier ref: ${usersWithTier} (tier_id NULL — Phase 2)`);

    if (orphans.subscriptions.length || orphans.invoices.length) {
      fs.writeFileSync(ORPHAN_LOG, JSON.stringify({ portedAt: new Date().toISOString(), subscriptions: orphans.subscriptions, invoices: orphans.invoices }, null, 2));
      console.log(`\nORPHANS SKIPPED (logged to ${path.basename(ORPHAN_LOG)}):`);
      console.log(`  subscriptions: ${orphans.subscriptions.length}`);
      console.log(`  invoices:      ${orphans.invoices.length}`);
    } else {
      console.log('\nNo orphans — all rows ported.');
    }
  } catch (e) {
    await pgClient.query('ROLLBACK').catch(() => {});
    console.error('FAIL — transaction rolled back:', e.message);
    process.exit(1);
  } finally {
    pgClient.release();
    await client.close();
    await pool.end();
  }
})();