// db/check-enums.js — validate Mongo enum values against PG enum constraints
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';

const ALLOWED = {
  'users.role': ['user', 'admin', 'super_admin', 'manager', 'trader', 'analyst', 'support', 'guest', 'provider', 'instructor'],
  'plans.type': ['membership', 'service'],
  'plans.interval': ['month', 'quarter', 'year', 'lifetime'],
  'subscriptions.type': ['membership', 'service'],
  'subscriptions.status': ['active', 'past_due', 'canceled', 'incomplete', 'trialing'],
  'invoices.status': ['paid', 'open', 'void', 'uncollectible'],
};

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db();

    const checks = [
      ['users', 'role'],
      ['plans', 'type'],
      ['plans', 'interval'],
      ['subscriptions', 'type'],
      ['subscriptions', 'status'],
      ['invoices', 'status'],
    ];

    let allOk = true;
    for (const [coll, field] of checks) {
      const values = await db.collection(coll).distinct(field);
      const allowed = ALLOWED[`${coll}.${field}`];
      const bad = values.filter(v => v !== null && v !== undefined && !allowed.includes(v));
      const status = bad.length === 0 ? 'OK  ' : 'FAIL';
      if (bad.length > 0) allOk = false;
      console.log(`[${status}] ${coll}.${field}: ${JSON.stringify(values)}`);
      if (bad.length > 0) console.log(`       NOT IN ENUM: ${JSON.stringify(bad)}`);
    }

    // Also check for orphan refs (subscriptions.user/plan, invoices.user)
    const userIds = new Set((await db.collection('users').find({}, { projection: { _id: 1 } }).toArray()).map(d => d._id.toString()));
    const planIds = new Set((await db.collection('plans').find({}, { projection: { _id: 1 } }).toArray()).map(d => d._id.toString()));

    const subs = await db.collection('subscriptions').find({}).toArray();
    const orphanUsers = subs.filter(s => !userIds.has(s.user?.toString())).length;
    const orphanPlans = subs.filter(s => !planIds.has(s.plan?.toString())).length;
    console.log(`\n[${orphanUsers === 0 ? 'OK  ' : 'FAIL'}] subscriptions orphan user refs: ${orphanUsers}`);
    console.log(`[${orphanPlans === 0 ? 'OK  ' : 'FAIL'}] subscriptions orphan plan refs: ${orphanPlans}`);

    const invs = await db.collection('invoices').find({}).toArray();
    const orphanInvUsers = invs.filter(i => !userIds.has(i.user?.toString())).length;
    console.log(`[${orphanInvUsers === 0 ? 'OK  ' : 'FAIL'}] invoices orphan user refs: ${orphanInvUsers}`);

    console.log(allOk ? '\nALL ENUM CHECKS PASSED' : '\nENUM MISMATCHES FOUND — schema may need enum values added');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
})();