// db/inspect-orphans.js — examine orphan refs in subscriptions/invoices
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db();

    const userIds = new Set((await db.collection('users').find({}, { projection: { _id: 1 } }).toArray()).map(d => d._id.toString()));
    const planIds = new Set((await db.collection('plans').find({}, { projection: { _id: 1 } }).toArray()).map(d => d._id.toString()));

    const subs = await db.collection('subscriptions').find({}).toArray();
    console.log(`Subscriptions total: ${subs.length}`);
    for (const s of subs) {
      const uOk = userIds.has(s.user?.toString());
      const pOk = planIds.has(s.plan?.toString());
      if (!uOk || !pOk) {
        console.log(`  ORPHAN sub _id=${s._id} user=${s.user} (${uOk ? 'OK' : 'MISSING'}) plan=${s.plan} (${pOk ? 'OK' : 'MISSING'}) status=${s.status} type=${s.type}`);
      }
    }

    const invs = await db.collection('invoices').find({}).toArray();
    console.log(`\nInvoices total: ${invs.length}`);
    for (const i of invs) {
      const uOk = userIds.has(i.user?.toString());
      if (!uOk) {
        console.log(`  ORPHAN invoice _id=${i._id} user=${i.user} (MISSING) amount=${i.amount} status=${i.status} createdAt=${i.createdAt?.toISOString()}`);
      }
    }

    // Do orphaned users exist under a different shape? Check if any user doc has these IDs as _id in other collections
    const orphanUserIds = [...new Set([...subs.filter(s => !userIds.has(s.user?.toString())).map(s => s.user?.toString()), ...invs.map(i => i.user?.toString())])];
    console.log(`\nOrphan user IDs: ${JSON.stringify(orphanUserIds)}`);
    for (const id of orphanUserIds) {
      if (!id) continue;
      const inWallets = await db.collection('wallets').countDocuments({ user: new (require('mongodb').ObjectId)(id) });
      const inTxns = await db.collection('transactions').countDocuments({ user: new (require('mongodb').ObjectId)(id) });
      console.log(`  ${id}: wallets=${inWallets} transactions=${inTxns}`);
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
})();