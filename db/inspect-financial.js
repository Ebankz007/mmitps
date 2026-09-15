// db/inspect-financial.js — inventory Phase 2 (financial) collections
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';
const FINANCIAL = ['wallets', 'transactions', 'tiers', 'modules', 'cryptowallets', 'savedbankaccounts', 'pendingwithdrawals', 'coupons', 'bonusactivities', 'bonusclaims'];

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db();

    for (const name of FINANCIAL) {
      const count = await db.collection(name).countDocuments().catch(() => -1);
      if (count === -1) { console.log(`[${name}] MISSING`); continue; }
      const doc = await db.collection(name).findOne({});
      console.log(`\n[${name}] ${count} docs`);
      if (doc) {
        const preview = JSON.stringify(doc, (k, v) => {
          if (typeof v === 'string' && v.length > 60) return v.slice(0, 60) + '…';
          return v;
        });
        console.log('  sample:', preview.length > 1800 ? preview.slice(0, 1800) + '…' : preview);
      } else {
        console.log('  (empty)');
      }
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
})();