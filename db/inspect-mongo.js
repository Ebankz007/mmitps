// db/inspect-mongo.js — inventory MongoDB collections for Phase 1 port
// Usage: node db/inspect-mongo.js
const { MongoClient } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to:', db.databaseName, '| version:', (await db.command({ buildInfo: 1 })).version);

    const collections = await db.listCollections().toArray();
    console.log(`\n${collections.length} collections:`);

    const phase1 = ['users', 'plans', 'subscriptions', 'invoices'];
    for (const c of collections.sort((a, b) => a.name.localeCompare(b.name))) {
      const count = await db.collection(c.name).countDocuments();
      const marker = phase1.includes(c.name) ? '  <-- PHASE 1' : '';
      console.log(`  ${c.name.padEnd(28)} ${String(count).padStart(6)}${marker}`);
    }

    // Sample one doc from each Phase 1 collection (trimmed)
    for (const name of phase1) {
      const exists = collections.some(c => c.name === name);
      if (!exists) { console.log(`\n[${name}] MISSING — no collection`); continue; }
      const doc = await db.collection(name).findOne({});
      console.log(`\n[${name}] sample keys:`, doc ? Object.keys(doc).join(', ') : '(empty collection)');
      if (doc) {
        // Show a compact preview of the document (truncate long fields)
        const preview = JSON.stringify(doc, (k, v) => {
          if (typeof v === 'string' && v.length > 80) return v.slice(0, 80) + '…';
          return v;
        });
        console.log('  preview:', preview.length > 1500 ? preview.slice(0, 1500) + '…' : preview);
      }
    }
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
})();