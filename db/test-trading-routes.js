// db/test-trading-routes.js — integration test: trading routes on the PG stack
// Boots the real tradingRoutes + tradingMiscRoutes on a minimal express app,
// issues real JWTs via pg TokenService, and exercises the endpoints over HTTP.
const express = require('express');
const http = require('http');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('../backend/repositories/pg/UserRepository');
const TokenService = require('../backend/services/pg/TokenService');
const CopyTradeRepository = require('../backend/repositories/pg/CopyTradeRepository');
const { pool } = require('./index');

const tradingRoutes = require('../backend/routes/tradingRoutes');
const tradingMiscRoutes = require('../backend/routes/tradingMiscRoutes');
const journalRoutes = require('../backend/routes/journalRoutes');
const tradingBotRoutes = require('../backend/routes/tradingBotRoutes');
const analysisRoutes = require('../backend/routes/analysisRoutes');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const app = express();
app.use(express.json());
app.use('/api/v1/trading', tradingRoutes);
app.use('/api/v1/trading', tradingMiscRoutes);
app.use('/api/v1/journal', journalRoutes);
app.use('/api/v1/bot-system', tradingBotRoutes);
app.use('/api/v1/analysis', analysisRoutes);
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

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash('TestPass@123', salt);

  const alice = await UserRepository.create({
    email: `alice_${Date.now()}@test.local`,
    username: 'alice_trd',
    password: pw,
    role: 'user',
    isActive: true,
  });
  const carol = await UserRepository.create({
    email: `carol_${Date.now()}@test.local`,
    username: 'carol_trd',
    password: pw,
    role: 'analyst',
    isActive: true,
  });

  // Settlement transfers to admin@mmitps.com — ensure that user exists in PG
  let admin = await UserRepository.findByEmail('admin@mmitps.com');
  let adminCreatedByTest = false;
  if (!admin) {
    admin = await UserRepository.create({
      email: 'admin@mmitps.com',
      username: 'admin',
      password: pw,
      role: 'admin',
      isActive: true,
    });
    adminCreatedByTest = true;
  }

  const aliceToken = await TokenService.generateToken(alice.id, new Date(Date.now() + 3600 * 1000), 'access');
  const carolToken = await TokenService.generateToken(carol.id, new Date(Date.now() + 3600 * 1000), 'access');

  console.log('=== AUTH GATE ===');
  let r = await api('GET', '/api/v1/trading/signals/active');
  check('401 without token', r.status === 401);

  console.log('=== TRADING ACCOUNTS ===');
  r = await api('POST', '/api/v1/trading/accounts', { token: aliceToken, body: { platform: 'mt5', accountNumber: 'ACC-ALICE-1', server: 'ICMarkets-Demo', accountName: 'Alice MT5' } });
  check('alice connects account', r.status === 201 && r.json.data.status === 'connected');
  const aliceAccountId = r.json.data.id;

  r = await api('POST', '/api/v1/trading/accounts', { token: carolToken, body: { platform: 'mt5', accountNumber: 'ACC-CAROL-1', server: 'ICMarkets-Demo', accountName: 'Carol MT5' } });
  check('carol connects account', r.status === 201);
  const carolAccountId = r.json.data.id;

  r = await api('GET', '/api/v1/trading/accounts', { token: aliceToken });
  check('getMyAccounts', r.status === 200 && r.json.count === 1);

  r = await api('POST', `/api/v1/trading/accounts/${aliceAccountId}/sync`, { token: aliceToken });
  check('syncAccountStats', r.status === 200 && typeof r.json.data.totalPnL === 'number');

  // Fund alice so she can follow a provider (allocation comes out of wallet)
  const WalletService = require('../backend/services/pg/WalletService');
  await WalletService.deposit(alice.id, 1000, 'USD', 'bank_transfer', `DEP-TEST-${Date.now()}`);

  console.log('=== SIGNALS ===');
  r = await api('POST', '/api/v1/trading/signals', { token: aliceToken, body: { pair: 'EURUSD', type: 'buy', entryPrice: 1.1000, stopLoss: 1.0900, takeProfit: [1.1200, 1.1300] } });
  check('user cannot create signal (role gate)', r.status === 403);

  r = await api('POST', '/api/v1/trading/signals', { token: carolToken, body: { pair: 'EURUSD', type: 'buy', entryPrice: 1.1000, stopLoss: 1.0900, takeProfit: [1.1200, 1.1300], analysis: 'Test signal' } });
  check('analyst creates signal', r.status === 201 && r.json.data.providerId === carol.id);
  const signalId = r.json.data.id;

  r = await api('GET', '/api/v1/trading/signals/active', { token: aliceToken });
  check('getActiveSignals includes signal', r.status === 200 && r.json.data.some(s => s.id === signalId));

  console.log('=== COPY TRADING ===');
  r = await api('POST', '/api/v1/trading/copy/follow', { token: aliceToken, body: { providerId: carol.id, amount: 100 } });
  check('alice follows carol (100 USD allocation)', r.status === 200 && r.json.data.status === 'active');
  const subId = r.json.data.id;

  r = await api('POST', '/api/v1/trading/copy/follow', { token: aliceToken, body: { providerId: carol.id, amount: 100 } });
  check('duplicate follow rejected', r.status === 400);

  r = await api('GET', '/api/v1/trading/copy/my-subscriptions', { token: aliceToken });
  check('getMySubscriptions', r.status === 200 && r.json.data.some(s => s.id === subId));

  r = await api('GET', '/api/v1/trading/copy/my-followers', { token: carolToken });
  check('getProviderFollowers', r.status === 200 && r.json.data.some(s => s.followerId === alice.id));

  // Simulate an executed copy trade, then close the signal → settlement accrues
  const copyTrade = await CopyTradeRepository.create({
    followerId: alice.id,
    providerId: carol.id,
    symbol: 'EURUSD',
    direction: 'buy',
    status: 'executed',
    providerEntryPrice: 1.1000,
    copiedLotSize: 0.1,
    executedAt: new Date(),
  });

  r = await api('PATCH', `/api/v1/trading/signals/${signalId}/close`, { token: carolToken, body: { exitPrice: 1.1050, result: 'win', pips: 50 } });
  check('closeSignal settles copy trade PnL', r.status === 200 && r.json.data.status === 'closed');

  const subAfter = await require('../backend/repositories/pg/CopySubscriptionRepository').findById(subId);
  check('subscription accrued PnL (0.005 × 0.1 × 100000 = 50)', subAfter.accruedPnL === 50, `got ${subAfter.accruedPnL}`);
  check('subscription pending commission (20% = 10)', subAfter.pendingCommission === 10, `got ${subAfter.pendingCommission}`);
  check('settlement status pending', subAfter.settlementStatus === 'pending');

  r = await api('POST', `/api/v1/trading/copy/settle/${subId}`, { token: aliceToken });
  check('settleCommission (master 9 / admin 1)', r.status === 200 && r.json.data.masterAmount === 9 && r.json.data.adminAmount === 1);

  r = await api('POST', `/api/v1/trading/copy/confirm-receipt/${subId}`, { token: carolToken });
  check('confirmSettlementReceipt resets + reactivates', r.status === 200);

  const subAfterConfirm = await require('../backend/repositories/pg/CopySubscriptionRepository').findById(subId);
  check('subscription reset after confirm', subAfterConfirm.settlementStatus === 'none' && subAfterConfirm.pendingCommission === 0 && subAfterConfirm.status === 'active');

  console.log('=== JOURNALS ===');
  r = await api('POST', '/api/v1/journal/add', { token: aliceToken, body: { symbol: 'EURUSD', direction: 'buy', entryPrice: 1.1000, entryTime: new Date().toISOString(), lotSize: 0.1 } });
  check('addTrade', r.status === 201 && r.json.data.userId === alice.id);
  const tradeId = r.json.data.id;

  r = await api('GET', '/api/v1/journal/my', { token: aliceToken });
  check('getMyJournal', r.status === 200 && r.json.data.some(t => t.id === tradeId));

  r = await api('GET', '/api/v1/journal/stats', { token: aliceToken });
  check('getJournalStats', r.status === 200 && typeof r.json.data.totalTrades === 'number');

  r = await api('PUT', `/api/v1/journal/${tradeId}`, { token: aliceToken, body: { notes: 'Updated note' } });
  check('updateTrade', r.status === 200 && r.json.data.notes === 'Updated note');

  r = await api('PUT', `/api/v1/journal/${tradeId}`, { token: carolToken, body: { notes: 'Hijack' } });
  check('updateTrade foreign → 404', r.status === 404);

  console.log('=== BOTS ===');
  r = await api('POST', '/api/v1/bot-system', { token: aliceToken, body: { name: 'Alice Bot', pair: 'EURUSD', strategy: 'SENTIMENT_FOLLOWING', allocation: 500 } });
  check('createBot', r.status === 201 && r.json.data.userId === alice.id);
  const botId = r.json.data.id;

  r = await api('GET', '/api/v1/bot-system', { token: aliceToken });
  check('getMyBots', r.status === 200 && r.json.data.some(b => b.id === botId));

  r = await api('PATCH', `/api/v1/bot-system/${botId}/status`, { token: aliceToken, body: { status: 'active' } });
  check('updateStatus', r.status === 200 && r.json.data.status === 'active');

  r = await api('PATCH', `/api/v1/bot-system/${botId}/status`, { token: aliceToken, body: { status: 'bogus' } });
  check('invalid status rejected', r.status === 400);

  console.log('=== ANALYSES ===');
  r = await api('POST', '/api/v1/analysis', { token: carolToken, body: { title: 'EURUSD Outlook', pair: 'EURUSD', type: 'technical', content: 'Test analysis', prediction: { direction: 'bullish', targetPrice: 1.1200, stopLoss: 1.0900 } } });
  check('createAnalysis', r.status === 201 && r.json.data.authorId === carol.id);
  const analysisId = r.json.data.id;

  r = await api('GET', '/api/v1/analysis');
  check('getActiveAnalysis (public)', r.status === 200 && r.json.data.some(a => a.id === analysisId));

  r = await api('GET', '/api/v1/analysis/pair/EURUSD');
  check('getAnalysisByPair (public)', r.status === 200 && r.json.data.some(a => a.id === analysisId));

  r = await api('DELETE', `/api/v1/analysis/${analysisId}`, { token: aliceToken });
  check('deleteAnalysis foreign → 403', r.status === 403);

  r = await api('DELETE', `/api/v1/analysis/${analysisId}`, { token: carolToken });
  check('deleteAnalysis owner', r.status === 200);

  console.log('=== CLEANUP ===');
  await CopyTradeRepository.delete(copyTrade.id);
  await pool.query('DELETE FROM copy_subscriptions WHERE id = $1', [subId]);
  await pool.query('DELETE FROM trading_signals WHERE id = $1', [signalId]);
  await pool.query('DELETE FROM trade_journals WHERE id = $1', [tradeId]);
  await pool.query('DELETE FROM trading_bots WHERE id = $1', [botId]);
  await pool.query('DELETE FROM trading_accounts WHERE id IN ($1, $2)', [aliceAccountId, carolAccountId]);
  await pool.query('DELETE FROM transactions WHERE user_id IN ($1, $2)', [alice.id, carol.id]);
  await pool.query('DELETE FROM transactions WHERE related_user_id IN ($1, $2)', [alice.id, carol.id]);
  await pool.query('DELETE FROM wallets WHERE user_id IN ($1, $2)', [alice.id, carol.id]);
  await UserRepository.delete(alice.id);
  await UserRepository.delete(carol.id);
  if (adminCreatedByTest) {
    await pool.query('DELETE FROM transactions WHERE user_id = $1', [admin.id]);
    await pool.query('DELETE FROM wallets WHERE user_id = $1', [admin.id]);
    await UserRepository.delete(admin.id);
  } else {
    // Surgical: remove only the settlement rows this test created on the real admin
    await pool.query('DELETE FROM transactions WHERE user_id = $1 AND related_user_id IN ($2, $3)', [admin.id, alice.id, carol.id]);
  }
  check('test data cleaned', !(await UserRepository.findById(alice.id)) && !(await UserRepository.findById(carol.id)));

  console.log(`\n${failures === 0 ? 'ALL TRADING ROUTE TESTS PASSED' : failures + ' FAILURES'}`);
  server.close();
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  server.close();
  await pool.end();
  process.exit(1);
});