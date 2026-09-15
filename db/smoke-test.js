const { pool, pingDatabase } = require('./index');

(async () => {
  const ping = await pingDatabase();
  console.log('Ping:', JSON.stringify(ping));

  const count = await pool.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'"
  );
  console.log('Tables:', count.rows[0].n);

  // Spot-check ltree
  const ltree = await pool.query("SELECT 'A.B.C'::ltree");
  console.log('ltree:', ltree.rows[0].ltree);

  // Verify ptd_signals is queryable
  const ptd = await pool.query(
    "INSERT INTO ptd_signals (symbol, timeframe, logic_type, direction, confidence) VALUES ('BTCUSDT', '4h', 'Fibonacci', 'UP', 0.78) RETURNING id, symbol"
  );
  console.log('ptd_signals insert:', JSON.stringify(ptd.rows[0]));

  // Clean up
  await pool.query('DELETE FROM ptd_signals');
  console.log('ptd_signals cleanup done');

  await pool.end();
  console.log('PASS — Drizzle + ptd_signals healthy');
})().catch(e => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
