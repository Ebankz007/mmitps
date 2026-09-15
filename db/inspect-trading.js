// db/inspect-trading.js — inspect Mongo trading collections (counts + sample docs)
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';

(async () => {
  const c = new MongoClient('mongodb://127.0.0.1:27017');
  await c.connect();
  const db = c.db('mmitps');

  const names = [
    'tradingaccounts', 'tradejournals', 'signals', 'analyses',
    'tradingbots', 'copytrades', 'copysubscriptions',
    'fundamentaldatas', 'cotreports',
  ];

  for (const n of names) {
    try {
      const cnt = await db.collection(n).countDocuments();
      console.log(`\n=== ${n}: ${cnt} docs ===`);
      if (cnt > 0) {
        const sample = await db.collection(n).findOne();
        console.log(JSON.stringify(sample, null, 1).slice(0, 1200));
      }
    } catch (e) {
      console.log(`\n=== ${n}: ERROR ${e.message}`);
    }
  }

  await c.close();
})().catch((e) => { console.error(e.message); process.exit(1); });