// db/port-phase6.js — port Phase 6 (System services, tokenization, payment, features, menus, social) data: Mongo → PostgreSQL
// Orphan principle: skip + log user-owned docs whose users exist nowhere.
// Skipped (phantom users / non-portable): investments 2, aml_checks 1, trading_bots 6, analyses 1,
//   invoices 4 (all $99 open, phantom user 699874869d0d8a0f58f0805b), copy_subscriptions 2 (trader=null, provider_id NOT NULL),
//   course_progresses 1 + support_tickets 1 (already logged in phase5).
const { MongoClient } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const oidToUuid = (oid) => `00000000-${oid.slice(0, 4)}-${oid.slice(4, 8)}-${oid.slice(8, 12)}-${oid.slice(12)}`;
const asJson = (v) => (v === undefined || v === null ? null : JSON.stringify(v));
const asNum = (v) => (v === undefined || v === null ? null : Number(v));
const asTextArray = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return '{}';
  return `{${arr.map((s) => `"${String(s).replace(/"/g, '""')}"`).join(',')}}`;
};

const orphans = [];
const logOrphan = (collection, docId, reason) => {
  orphans.push({ collection, docId, reason });
};

(async () => {
  const c = new MongoClient('mongodb://127.0.0.1:27017');
  await c.connect();
  const db = c.db('mmitps');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`TRUNCATE TABLE
      token_pools, payment_gateways, feature_flags, menu_configs, social_handles, system_services
      RESTART IDENTITY CASCADE`);

    // ─── token_pools (2, no user refs) ──────────────────────────────────
    const tp = await db.collection('tokenpools').find({}).toArray();
    for (const d of tp) {
      await client.query(
        `INSERT INTO token_pools (id, name, description, asset_type, total_token_supply, token_price,
          min_investment, max_investment, tokens_sold, status, expected_return, duration,
          images, documents, start_date, end_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [oidToUuid(d._id.toString()), d.name, d.description || null, d.assetType || 'other',
         asNum(d.totalTokenSupply) ?? 0, asNum(d.tokenPrice) ?? 0,
         asNum(d.minInvestment), asNum(d.maxInvestment), asNum(d.tokensSold) ?? 0,
         d.status || 'open', d.expectedReturn || null, d.duration || null,
         asTextArray(d.images), asTextArray(d.documents),
         d.startDate ? new Date(d.startDate) : null, d.endDate ? new Date(d.endDate) : null,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── payment_gateways (2, no user refs) ─────────────────────────────
    const pg = await db.collection('paymentgateways').find({}).toArray();
    for (const d of pg) {
      await client.query(
        `INSERT INTO payment_gateways (id, name, display_name, is_active, config, supported_methods, description, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [oidToUuid(d._id.toString()), d.name, d.displayName || d.name, d.isActive !== false,
         asJson(d.config), asTextArray(d.supportedMethods), d.description || null,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── feature_flags (2, no user refs) ────────────────────────────────
    const ff = await db.collection('featureflags').find({}).toArray();
    for (const d of ff) {
      await client.query(
        `INSERT INTO feature_flags (id, name, description, enabled, required_tier, category, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [oidToUuid(d._id.toString()), d.name, d.description || null, d.enabled === true,
         d.requiredTier || 'FREE', d.category || 'platform',
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── menu_configs (22, no user refs) ────────────────────────────────
    const mc = await db.collection('menuconfigs').find({}).toArray();
    for (const d of mc) {
      await client.query(
        `INSERT INTO menu_configs (id, label, price, currency, description, is_active, attributes, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [oidToUuid(d._id.toString()), d.label, asNum(d.price) ?? 0, d.currency || 'USD',
         d.description || '', d.isActive !== false, asJson(d.attributes) ?? '{}',
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── social_handles (19, no user refs) ──────────────────────────────
    const sh = await db.collection('socialhandles').find({}).toArray();
    for (const d of sh) {
      await client.query(
        `INSERT INTO social_handles (id, platform, handle, url, category, icon, color, description, "order", is_active, connection_status, api_credentials, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [oidToUuid(d._id.toString()), d.platform, d.handle, d.url, d.category || 'Global',
         d.icon || null, d.color || null, d.description || null, asNum(d.order) ?? 0,
         d.isActive !== false, 'Disconnected', asJson(d.apiCredentials),
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── system_services (2, no user refs) ──────────────────────────────
    const ss = await db.collection('systemservices').find({}).toArray();
    for (const d of ss) {
      await client.query(
        `INSERT INTO system_services (id, name, url, api_key, health_endpoint, status, is_active, last_health_check, description, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [oidToUuid(d._id.toString()), d.name, d.url, d.apiKey || '', d.healthEndpoint || null,
         d.status || 'online', d.isActive !== false, d.lastHealthCheck ? new Date(d.lastHealthCheck) : null,
         d.description || null, d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── Skipped user-owned collections (phantom users) ─────────────────
    const inv = await db.collection('investments').find({}).toArray();
    for (const d of inv) logOrphan('investments', d._id.toString(), `phantom user ref user=${d.user.toString()} → skipped`);
    const aml = await db.collection('amlchecks').find({}).toArray();
    for (const d of aml) logOrphan('amlchecks', d._id.toString(), `phantom user ref user=${d.user.toString()} → skipped`);
    const bots = await db.collection('tradingbots').find({}).toArray();
    for (const d of bots) logOrphan('tradingbots', d._id.toString(), `phantom user ref user=${d.user.toString()} → skipped`);
    const an = await db.collection('analyses').find({}).toArray();
    for (const d of an) logOrphan('analyses', d._id.toString(), `phantom author ref author=${d.author.toString()} → skipped`);
    const invs = await db.collection('invoices').find({}).toArray();
    for (const d of invs) logOrphan('invoices', d._id.toString(), `phantom user ref user=${d.user.toString()} ($${d.amount} ${d.status}) → skipped`);
    const cs = await db.collection('copysubscriptions').find({}).toArray();
    for (const d of cs) logOrphan('copysubscriptions', d._id.toString(), `trader=null, provider_id NOT NULL → skipped`);
    const cps = await db.collection('courseprogresses').find({}).toArray();
    for (const d of cps) logOrphan('courseprogresses', d._id.toString(), `phantom user ref user=${d.user.toString()} → skipped`);
    const st = await db.collection('supporttickets').find({}).toArray();
    for (const d of st) logOrphan('supporttickets', d._id.toString(), `phantom user ref user=${d.user.toString()} → skipped`);

    await client.query('COMMIT');
    console.log(`Ported: token_pools ${tp.length}, payment_gateways ${pg.length}, feature_flags ${ff.length}, menu_configs ${mc.length}, social_handles ${sh.length}, system_services ${ss.length}`);
    console.log(`Skipped: investments ${inv.length}, aml_checks ${aml.length}, trading_bots ${bots.length}, analyses ${an.length}, invoices ${invs.length}, copy_subscriptions ${cs.length}, course_progresses ${cps.length}, support_tickets ${st.length} (phantom users / non-portable)`);
    console.log(`Orphans logged: ${orphans.length}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  fs.writeFileSync(path.join(__dirname, 'port-log-phase6.json'), JSON.stringify({ orphans }, null, 2));
  console.log('Orphan log → db/port-log-phase6.json');

  await c.close();
  await pool.end();
})().catch((e) => { console.error('PORT FAILED:', e.message); process.exit(1); });