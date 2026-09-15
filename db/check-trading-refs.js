// db/check-trading-refs.js — do trading doc user refs exist in PG?
const { MongoClient } = require('mongodb');
const { pool } = require('./index');

const oidToUuid = (oid) => `00000000-${oid.slice(0, 4)}-${oid.slice(4, 8)}-${oid.slice(8, 12)}-${oid.slice(12)}`;

(async () => {
  const c = new MongoClient('mongodb://127.0.0.1:27017');
  await c.connect();
  const db = c.db('mmitps');

  const refs = new Map(); // uuid -> {collections: []}
  const add = (oid, coll) => {
    if (!oid) return;
    const oidStr = typeof oid === 'string' ? oid : oid.toString();
    const uuid = oidToUuid(oidStr);
    if (!refs.has(uuid)) refs.set(uuid, { oid: oidStr, collections: [] });
    refs.get(uuid).collections.push(coll);
  };

  for (const doc of await db.collection('tradejournals').find({}).toArray()) add(doc.user, 'tradejournals');
  for (const doc of await db.collection('signals').find({}).toArray()) add(doc.provider, 'signals');
  for (const doc of await db.collection('analyses').find({}).toArray()) add(doc.author, 'analyses');
  for (const doc of await db.collection('tradingbots').find({}).toArray()) add(doc.user, 'tradingbots');
  for (const doc of await db.collection('copysubscriptions').find({}).toArray()) { add(doc.follower, 'copysubscriptions(follower)'); add(doc.provider, 'copysubscriptions(provider)'); }

  const uuids = [...refs.keys()];
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = ANY($1)', [uuids]);
  const found = new Set(rows.map((r) => r.id));

  // Also check Mongo users collection for the same ObjectIds
  const { ObjectId } = require('mongodb');
  const mongoIds = [...refs.values()].map((r) => new ObjectId(r.oid));
  const mongoUsers = await db.collection('users').find({ _id: { $in: mongoIds } }).toArray();
  const mongoFound = new Set(mongoUsers.map((u) => u._id.toString()));
  console.log(`Referenced users: ${uuids.length}, found in PG: ${found.size}, found in Mongo users: ${mongoFound.size}`);
  for (const u of mongoUsers) console.log(`  Mongo user: ${u._id.toString()} ${u.username} ${u.email}`);

  console.log(`\nReferenced users: ${uuids.length}, found in PG: ${found.size}`);
  for (const [uuid, info] of refs) {
    console.log(`${found.has(uuid) ? 'FOUND ' : 'MISSING'} ${uuid} (${info.oid}) ← ${info.collections.join(', ')}`);
  }

  await c.close();
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });