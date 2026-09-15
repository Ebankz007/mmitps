// db/test-financial-routes.js — integration test: financial routes on the PG stack
// Boots the real financialRoutes + payoutRoutes on a minimal express app, issues a
// real JWT via pg TokenService, and exercises the endpoints over HTTP.
const express = require('express');
const http = require('http');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('../backend/repositories/pg/UserRepository');
const TokenService = require('../backend/services/pg/TokenService');
const CouponRepository = require('../backend/repositories/pg/CouponRepository');
const { pool } = require('./index');

const financialRoutes = require('../backend/routes/financialRoutes');
const payoutRoutes = require('../backend/routes/payoutRoutes');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const app = express();
app.use(express.json());
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/financial/payouts', payoutRoutes);
// error handler (mirrors server.js behavior)
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
});

const server = http.createServer(app);
let BASE = '';

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  BASE = `http://127.0.0.1:${server.address().port}`;

  // Connect Mongo too — getActivePaymentMethods reads config via ApiServiceManager (Phase 5 domain)
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mmitps');

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash('TestPass@123', salt);

  const alice = await UserRepository.create({
    email: `alice_${Date.now()}@test.local`,
    username: 'alice_fin',
    password: pw,
    role: 'user',
    isActive: true,
  });
  const bob = await UserRepository.create({
    email: `bob_${Date.now()}@test.local`,
    username: 'bob_fin',
    password: pw,
    role: 'user',
    isActive: true,
  });

  const aliceToken = await TokenService.generateToken(alice.id, new Date(Date.now() + 3600 * 1000), 'access');
  const bobToken = await TokenService.generateToken(bob.id, new Date(Date.now() + 3600 * 1000), 'access');

  console.log('=== AUTH GATE ===');
  let r = await api('GET', '/api/v1/financial/wallet/balance');
  check('401 without token', r.status === 401);

  console.log('=== WALLET ===');
  r = await api('GET', '/api/v1/financial/wallet/balance', { token: aliceToken });
  check('balance returns USD 0 wallet', r.status === 200 && r.json.data.some(b => b.currency === 'USD' && b.amount === 0));

  r = await api('GET', '/api/v1/financial/wallet/balance?currency=usd', { token: aliceToken });
  check('balance by currency', r.status === 200 && r.json.data.balance === 0);

  r = await api('POST', '/api/v1/financial/wallet/deposit', { token: aliceToken, body: { amount: 500, currency: 'USD', method: 'bank_transfer' } });
  check('deposit 500 USD', r.status === 200 && r.json.data.transaction.type === 'deposit' && r.json.data.transaction.status === 'completed');
  const txId = r.json.data.transaction.id;

  r = await api('GET', '/api/v1/financial/wallet/balance?currency=USD', { token: aliceToken });
  check('balance 500 after deposit', r.json.data.balance === 500);

  r = await api('POST', '/api/v1/financial/wallet/withdraw', { token: aliceToken, body: { amount: 100, currency: 'USD', details: { bankName: 'Test', accountNumber: '123' } } });
  check('withdraw 100 USD (pending)', r.status === 200 && r.json.data.status === 'pending');

  r = await api('GET', '/api/v1/financial/wallet/balance?currency=USD', { token: aliceToken });
  check('frozen 100 after withdraw', r.json.data.balance === 400);

  r = await api('POST', '/api/v1/financial/wallet/withdraw', { token: aliceToken, body: { amount: 99999, currency: 'USD' } });
  check('over-withdraw rejected', r.status === 400);

  console.log('=== TRANSFER ===');
  r = await api('POST', '/api/v1/financial/wallet/transfer', { token: aliceToken, body: { recipientEmail: bob.email, amount: 50, currency: 'USD' } });
  check('transfer 50 to bob', r.status === 200 && r.json.data.type === 'transfer_out');

  r = await api('GET', '/api/v1/financial/wallet/balance?currency=USD', { token: aliceToken });
  check('alice 350 after transfer', r.json.data.balance === 350);

  r = await api('GET', '/api/v1/financial/wallet/balance?currency=USD', { token: bobToken });
  check('bob 50 after transfer', r.json.data.balance === 50);

  r = await api('POST', '/api/v1/financial/wallet/transfer', { token: aliceToken, body: { recipientEmail: 'nobody@nowhere.com', amount: 10, currency: 'USD' } });
  check('transfer to unknown user rejected', r.status === 404);

  console.log('=== TRANSACTIONS ===');
  r = await api('GET', '/api/v1/financial/transactions', { token: aliceToken });
  check('history lists alice txs', r.status === 200 && Array.isArray(r.json.data) && r.json.data.length >= 3);

  r = await api('GET', `/api/v1/financial/transactions/${txId}`, { token: aliceToken });
  check('getTransaction own tx', r.status === 200 && r.json.data.id === txId);

  r = await api('GET', `/api/v1/financial/transactions/${txId}`, { token: bobToken });
  check('getTransaction foreign tx → 404', r.status === 404);

  r = await api('GET', '/api/v1/financial/transactions?type=deposit', { token: aliceToken });
  check('filter by type=deposit', r.json.data.every(t => t.type === 'deposit'));

  console.log('=== COUPONS ===');
  const coupon = await CouponRepository.create({ code: `INT${Date.now()}`.slice(0, 10).toUpperCase(), discountType: 'percentage', discountValue: 10, usageLimit: 5 });
  r = await api('POST', '/api/v1/financial/coupons/validate', { token: aliceToken, body: { code: coupon.code, amount: 100 } });
  check('validate coupon', r.status === 200 && r.json.data.discountAmount === 10 && r.json.data.finalAmount === 90);

  r = await api('POST', '/api/v1/financial/coupons/validate', { token: aliceToken, body: { code: 'NOPE123', amount: 100 } });
  check('invalid coupon rejected', r.status === 404);

  r = await api('POST', '/api/v1/financial/coupons/redeem', { token: aliceToken, body: { code: coupon.code } });
  check('redeem coupon', r.status === 200);

  r = await api('GET', '/api/v1/financial/coupons/active', { token: aliceToken });
  check('active coupons list', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== CONFIG ===');
  r = await api('GET', '/api/v1/financial/currencies', { token: aliceToken });
  check('supported currencies (PG SystemConfig)', r.status === 200 && r.json.data.some(c => c.symbol === 'USD'));

  r = await api('GET', '/api/v1/financial/payment-methods', { token: aliceToken });
  check('payment methods', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== CLEANUP ===');
  await CouponRepository.delete(coupon.id);
  await pool.query('DELETE FROM transactions WHERE user_id IN ($1, $2)', [alice.id, bob.id]);
  await pool.query('DELETE FROM wallets WHERE user_id IN ($1, $2)', [alice.id, bob.id]);
  await UserRepository.delete(alice.id);
  await UserRepository.delete(bob.id);
  check('test data cleaned', !(await UserRepository.findById(alice.id)) && !(await UserRepository.findById(bob.id)));

  console.log(`\n${failures === 0 ? 'ALL FINANCIAL ROUTE TESTS PASSED' : failures + ' FAILURES'}`);
  server.close();
  await mongoose.disconnect();
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  server.close();
  await mongoose.disconnect().catch(() => {});
  await pool.end();
  process.exit(1);
});