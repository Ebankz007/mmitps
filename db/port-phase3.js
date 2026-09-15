// db/port-phase3.js — port trading domain data: Mongo → PostgreSQL
// Orphan principle: skip + log user-referenced docs whose users exist nowhere.
// Only fundamentalData + cotReports (no user refs) are portable as-is.
const { MongoClient } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const oidToUuid = (oid) => `00000000-${oid.slice(0, 4)}-${oid.slice(4, 8)}-${oid.slice(8, 12)}-${oid.slice(12)}`;
const asJson = (v) => (v === undefined || v === null ? null : JSON.stringify(v));
const asNum = (v) => (v === undefined || v === null ? null : Number(v));

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
    await client.query('TRUNCATE TABLE fundamental_data, cot_reports RESTART IDENTITY CASCADE');

    // ─── fundamental_data (no user refs) ────────────────────────────────
    const fdocs = await db.collection('fundamentaldatas').find({}).toArray();
    let fCount = 0;
    for (const d of fdocs) {
      await client.query(
        `INSERT INTO fundamental_data
         (id, country, indicator, value, previous_value, forecast_value, impact, release_date, period, unit, source, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          oidToUuid(d._id.toString()), d.country, d.indicator,
          String(d.value), d.previousValue != null ? String(d.previousValue) : null,
          d.forecastValue != null ? String(d.forecastValue) : null,
          d.impact || 'Medium', new Date(d.releaseDate), d.period || null, d.unit || null,
          d.source || null, d.createdAt || new Date(), d.updatedAt || new Date(),
        ]
      );
      fCount++;
    }

    // ─── cot_reports (no user refs) ─────────────────────────────────────
    const cdocs = await db.collection('cotreports').find({}).toArray();
    let cCount = 0;
    for (const d of cdocs) {
      await client.query(
        `INSERT INTO cot_reports
         (id, asset, reporting_date, non_commercial_long, non_commercial_short, commercial_long, commercial_short,
          speculator_long, speculator_short, open_interest, net_position, sentiment_score, source, metadata, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          oidToUuid(d._id.toString()), d.asset, new Date(d.reportingDate),
          asNum(d.nonCommercialLong), asNum(d.nonCommercialShort),
          asNum(d.commercialLong), asNum(d.commercialShort),
          asNum(d.speculatorLong), asNum(d.speculatorShort),
          asNum(d.openInterest), asNum(d.netPosition),
          asNum(d.sentimentScore), d.source || 'CFTC',
          asJson(d.metadata), d.createdAt || new Date(), d.updatedAt || new Date(),
        ]
      );
      cCount++;
    }

    // ─── user-referenced collections: orphan audit ──────────────────────
    // All referenced users were verified to exist in NO database (checked against
    // PG users + Mongo users). Skip + log per orphan principle.
    const userRefCollections = [
      { name: 'tradejournals', refs: ['user'] },
      { name: 'tradingbots', refs: ['user'] },
      { name: 'signals', refs: ['provider'] },
      { name: 'analyses', refs: ['author'] },
      { name: 'copysubscriptions', refs: ['follower', 'provider'] },
      { name: 'tradingaccounts', refs: ['user'] },
      { name: 'copytrades', refs: ['follower', 'provider'] },
    ];

    for (const { name, refs } of userRefCollections) {
      const docs = await db.collection(name).find({}).toArray();
      for (const d of docs) {
        for (const ref of refs) {
          if (d[ref]) {
            logOrphan(name, d._id.toString(), `phantom user ref ${ref}=${d[ref].toString()}`);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Ported: fundamental_data ${fCount}/${fdocs.length}, cot_reports ${cCount}/${cdocs.length}`);
    console.log(`Orphans logged: ${orphans.length} docs across user-referenced trading collections`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  fs.writeFileSync(path.join(__dirname, 'port-log-phase3.json'), JSON.stringify({ orphans }, null, 2));
  console.log('Orphan log → db/port-log-phase3.json');

  await c.close();
  await pool.end();
})().catch((e) => { console.error('PORT FAILED:', e.message); process.exit(1); });