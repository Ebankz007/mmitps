// db/check-databases.js — list databases and check orphan users across them
const { MongoClient, ObjectId } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps';
const ORPHAN_IDS = [
  '69b3af48e3af65124e8e407b', '69b3afdb04df7a18f518cc73', '69b3b08db3dd52dccb7155d0',
  '69b3b34c4de8fd6f005b0bd1', '69b3b3aa8a573b873a6238ca', '699874869d0d8a0f58f0805b',
];

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(d => `${d.name} (${(d.sizeOnDisk / 1048576).toFixed(1)}MB)`).join(', '));

    for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      const db = client.db(dbInfo.name);
      const colls = await db.listCollections({}, { nameOnly: true }).toArray();
      if (colls.some(c => c.name === 'users')) {
        for (const id of ORPHAN_IDS) {
          const found = await db.collection('users').findOne({ _id: new ObjectId(id) });
          if (found) console.log(`FOUND ${id} in db "${dbInfo.name}".users as ${found.email}`);
        }
      }
    }
    console.log('Search complete.');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
})();