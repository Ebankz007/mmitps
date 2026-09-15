// db/port-phase2.js — MongoDB → PostgreSQL data port: financial domain
//   wallets, transactions, tiers (+ users.tier_id backfill)
// - Deterministic ObjectId → UUID mapping (same scheme as Phase 1)
// - Skips orphan rows (FK targets missing), logs them to db/port-log-phase2.json
// - Idempotent: TRUNCATEs target tables first (CASCADE), runs in one transaction
// Usage: node db/port-phase2.js
const { MongoClient, ObjectId } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';
const ORPHAN_LOG = path.join(__dirname, 'port-log-phase2.json');

// ObjectId (24 hex) → UUID (32 hex): 00000000-XXXX-XXXX-XXXX-XXXXXXXXXXXX
function oidToUuid(oid) {
  const hex = oid.toString();
  if (!/^[0-9a-f]{24}$/i.test(hex)) throw new Error(`Invalid ObjectId: ${hex}`);
  return `00000000-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 24)}`;
}

const asDate = (v) => (v instanceof Date ? v : v ? new Date(v) : null);
const asArr = (v) => (Array.isArray(v) ? v : []);
const stripSubIds = (arr) => asArr(arr).map(({ _id, __v, ...rest }) => rest);
// jsonb values must be JSON strings for pg — the driver turns JS arrays into
// PG array literals ({...}), which is invalid JSON (see wallets.balances)
const asJson = (v) => (v === null || v === undefined ? null : JSON.stringify(v));

function mapWallet(doc, userUuids) {
  const userId = doc.user ? oidToUuid(doc.user) : null;
  if (!userId || !userUuids.has(userId)) return null;
  return {
    id: oidToUuid(doc._id),
    user_id: userId,
    balances: asJson(stripSubIds(doc.balances)), // jsonb — strip Mongo subdoc _ids
    is_active: doc.isActive ?? true,
    settings: asJson(doc.settings ?? { defaultCurrency: 'USD', autoConvert: false }),
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

function mapTransaction(doc, userUuids) {
  const userId = doc.user ? oidToUuid(doc.user) : null;
  if (!userId || !userUuids.has(userId)) return null;
  return {
    id: oidToUuid(doc._id),
    user_id: userId,
    type: doc.type,
    category: doc.category ?? 'wallet',
    status: doc.status ?? 'pending',
    amount: doc.amount ?? 0,
    currency: doc.currency,
    amount_usd: doc.amountUSD ?? null,
    exchange_rate: doc.exchangeRate ?? null,
    fee: doc.fee ?? 0,
    fee_type: doc.feeType ?? null,
    fee_currency: doc.feeCurrency ?? null,
    net_amount: doc.netAmount ?? null,
    payment_method: doc.paymentMethod ?? null,
    payment_provider: doc.paymentProvider ?? null,
    payment_details: asJson(doc.paymentDetails ?? null),
    crypto: asJson(doc.crypto ?? null),
    bank: asJson(doc.bank ?? null),
    reference: doc.reference ?? null,
    external_reference: doc.externalReference ?? null,
    related_user_id: doc.relatedUser ? oidToUuid(doc.relatedUser) : null,
    related_transaction_id: doc.relatedTransaction ? oidToUuid(doc.relatedTransaction) : null,
    mlm_commission_id: doc.mlmCommission ? oidToUuid(doc.mlmCommission) : null,
    balance_before: doc.balanceBefore ?? null,
    balance_after: doc.balanceAfter ?? null,
    description: doc.description ?? null,
    notes: doc.notes ?? null,
    metadata: asJson(doc.metadata ?? null),
    processed_at: asDate(doc.processedAt),
    completed_at: asDate(doc.completedAt),
    failed_at: asDate(doc.failedAt),
    cancelled_at: asDate(doc.cancelledAt),
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

function mapTier(doc) {
  return {
    id: oidToUuid(doc._id),
    code: doc.code,
    name: doc.name,
    level: doc.level ?? 0,
    price: doc.price ?? 0,
    currency: doc.currency ?? 'USD',
    features: asJson(doc.features ?? {}),
    accessible_modules: asArr(doc.accessibleModules),
    commissions: asJson(doc.commissions ?? { directReferralPercent: 5, binaryMatchPercent: 5 }),
    is_active: doc.isActive ?? true,
    created_at: asDate(doc.createdAt) ?? new Date(),
    updated_at: asDate(doc.updatedAt) ?? new Date(),
  };
}

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  const pgClient = await pool.connect();
  const orphans = { wallets: [], transactions: [] };
  const tierMappings = []; // audit trail for stale tier refs
  let tierBackfilled = 0;

  try {
    await client.connect();
    const mdb = client.db();

    // ── Read + map ────────────────────────────────────────────────
    const userDocs = await mdb.collection('users').find({}).toArray();
    const userUuids = new Set(userDocs.map((u) => oidToUuid(u._id)));

    const tierDocs = await mdb.collection('tiers').find({}).toArray();
    const tiers = tierDocs.map(mapTier);
    const tierUuidByCode = new Map(tiers.map((t) => [t.code, t.id]));

    const walletDocs = await mdb.collection('wallets').find({}).toArray();
    const wallets = [];
    for (const doc of walletDocs) {
      const row = mapWallet(doc, userUuids);
      if (row) wallets.push(row);
      else orphans.wallets.push(doc);
    }

    const txDocs = await mdb.collection('transactions').find({}).toArray();
    const transactions = [];
    for (const doc of txDocs) {
      const row = mapTransaction(doc, userUuids);
      if (row) transactions.push(row);
      else orphans.transactions.push(doc);
    }

    // ── users.tier_id backfill ────────────────────────────────────
    const basicUuid = tierUuidByCode.get('basic');
    const tierBackfills = [];
    for (const u of userDocs) {
      const ref = u.tier || u.preferences?.tier;
      if (!ref) continue;
      const refUuid = oidToUuid(ref);
      if (tiers.some((t) => t.id === refUuid)) {
        tierBackfills.push({ userId: oidToUuid(u._id), tierUuid: refUuid, via: 'direct' });
      } else if (basicUuid) {
        // Stale ref (tier deleted in a re-seed) — user's membershipTier is 'Basic' → map to basic
        tierBackfills.push({ userId: oidToUuid(u._id), tierUuid: basicUuid, via: 'stale→basic' });
        tierMappings.push({ user: u.email, staleTier: refUuid, mappedTo: 'basic' });
      }
    }

    // ── Transaction ───────────────────────────────────────────────
    await pgClient.query('BEGIN');
    await pgClient.query(
      'TRUNCATE wallets, transactions, tiers, crypto_wallets, saved_bank_accounts, pending_withdrawals, bonus_activities, bonus_claims, coupons, modules RESTART IDENTITY CASCADE'
    );

    const insert = async (table, rows, cols) => {
      if (rows.length === 0) return 0;
      const colList = cols.join(', ');
      const placeholders = rows.map((_, i) => `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(', ')})`).join(', ');
      const values = rows.flatMap((r) => cols.map((c) => r[c]));
      await pgClient.query(`INSERT INTO ${table} (${colList}) VALUES ${placeholders}`, values);
      return rows.length;
    };

    const tierCols = ['id', 'code', 'name', 'level', 'price', 'currency', 'features', 'accessible_modules', 'commissions', 'is_active', 'created_at', 'updated_at'];
    const walletCols = ['id', 'user_id', 'balances', 'is_active', 'settings', 'created_at', 'updated_at'];
    const txCols = ['id', 'user_id', 'type', 'category', 'status', 'amount', 'currency', 'amount_usd', 'exchange_rate', 'fee', 'fee_type', 'fee_currency', 'net_amount', 'payment_method', 'payment_provider', 'payment_details', 'crypto', 'bank', 'reference', 'external_reference', 'related_user_id', 'related_transaction_id', 'mlm_commission_id', 'balance_before', 'balance_after', 'description', 'notes', 'metadata', 'processed_at', 'completed_at', 'failed_at', 'cancelled_at', 'created_at', 'updated_at'];

    const nTiers = await insert('tiers', tiers, tierCols);
    const nWallets = await insert('wallets', wallets, walletCols);
    const nTxs = await insert('transactions', transactions, txCols);

    // tier_id backfill (users.tier_id has no FK constraint — safe)
    for (const b of tierBackfills) {
      await pgClient.query('UPDATE users SET tier_id = $1 WHERE id = $2', [b.tierUuid, b.userId]);
      tierBackfilled++;
    }

    await pgClient.query('COMMIT');

    // ── Report ────────────────────────────────────────────────────
    console.log('\n=== PHASE 2 PORT COMPLETE ===');
    console.log(`tiers:         ${nTiers}/${tierDocs.length} ported`);
    console.log(`wallets:       ${nWallets}/${walletDocs.length} ported`);
    console.log(`transactions:  ${nTxs}/${txDocs.length} ported`);
    console.log(`tier_id backfill: ${tierBackfilled}/${tierBackfills.length} users (${tierMappings.length} stale→basic mapped)`);
    for (const m of tierMappings) console.log(`  stale→basic: ${m.user} (${m.staleTier})`);

    if (orphans.wallets.length || orphans.transactions.length) {
      fs.writeFileSync(ORPHAN_LOG, JSON.stringify({ portedAt: new Date().toISOString(), wallets: orphans.wallets, transactions: orphans.transactions }, null, 2));
      console.log(`\nORPHANS SKIPPED (logged to ${path.basename(ORPHAN_LOG)}):`);
      console.log(`  wallets:      ${orphans.wallets.length}`);
      console.log(`  transactions: ${orphans.transactions.length}`);
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