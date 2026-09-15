// db/index.js — PostgreSQL connection (Drizzle + node-postgres)
// Replaces Mongoose as the data layer for migrated domains.
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://mmitps_user:mmitps_dev_pass_2026@localhost:5433/mmitps_dev';

// Connection pool — sized for a trading platform workload.
// Tune max/min based on production AApanel capacity.
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // max concurrent clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500, // recycle connections to avoid memory bloat
});

pool.on('error', (err) => {
  console.error('[pg] Unexpected error on idle client:', err.message);
});

const db = drizzle(pool);

/**
 * Health check — mirrors HealthService for MongoDB.
 * Returns { ok, latencyMs } or throws.
 */
async function pingDatabase() {
  const start = Date.now();
  const res = await pool.query('SELECT 1 AS ok');
  return { ok: res.rows[0].ok === 1, latencyMs: Date.now() - start };
}

module.exports = { db, pool, pingDatabase, DATABASE_URL };