// db/test-mlm-routes.js — integration test: MLM routes on the PG stack
// Boots the real mlmRoutes on a minimal express app, issues real JWTs via pg
// TokenService, and exercises the endpoints over HTTP.
const express = require('express');
const http = require('http');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('../backend/repositories/pg/UserRepository');
const TokenService = require('../backend/services/pg/TokenService');
const MLMTreeNodeRepository = require('../backend/repositories/pg/MLMTreeNodeRepository');
const { pool } = require('./index');

const mlmRoutes = require('../backend/routes/mlmRoutes');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const app = express();
app.use(express.json());
app.use('/api/v1/mlm', mlmRoutes);
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

  // Ported tree member (testuser1) + fresh admin + fresh placement target
  const treeUser = await UserRepository.findByEmail('testuser1@example.com');
  check('ported tree user resolvable', !!treeUser);

  const admin = await UserRepository.create({
    email: `mlm_admin_${Date.now()}@test.local`,
    username: 'mlm_admin',
    password: pw,
    role: 'admin',
    isActive: true,
  });
  const freshUser = await UserRepository.create({
    email: `mlm_fresh_${Date.now()}@test.local`,
    username: 'mlm_fresh',
    password: pw,
    role: 'user',
    isActive: true,
  });
  const placeTarget = await UserRepository.create({
    email: `mlm_place_${Date.now()}@test.local`,
    username: 'mlm_place',
    password: pw,
    role: 'user',
    isActive: true,
  });

  const userToken = await TokenService.generateToken(treeUser.id, new Date(Date.now() + 3600 * 1000), 'access');
  const adminToken = await TokenService.generateToken(admin.id, new Date(Date.now() + 3600 * 1000), 'access');
  const freshToken = await TokenService.generateToken(freshUser.id, new Date(Date.now() + 3600 * 1000), 'access');

  console.log('=== AUTH GATE ===');
  let r = await api('GET', '/api/v1/mlm/binary');
  check('401 without token', r.status === 401);

  console.log('=== BINARY / SPONSOR TREES ===');
  r = await api('GET', '/api/v1/mlm/binary', { token: userToken });
  check('getBinaryTree: 7 nodes, user populated', r.status === 200 && r.json.data.length === 7 && r.json.data[0].user.email === 'testuser1@example.com');

  r = await api('GET', '/api/v1/mlm/sponsor', { token: userToken });
  check('getSponsorTree', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== LEG SETTINGS ===');
  r = await api('GET', '/api/v1/mlm/leg-settings', { token: userToken });
  check('getLegSettings', r.status === 200 && r.json.data.preferredPlacement === 'left' && typeof r.json.data.stats.leftLegVolume === 'number');

  r = await api('POST', '/api/v1/mlm/leg-settings', { token: userToken, body: { preferredPlacement: 'right' } });
  check('updateLegSettings → right', r.status === 200 && r.json.data.preferredPlacement === 'right');

  r = await api('POST', '/api/v1/mlm/leg-settings', { token: userToken, body: { preferredPlacement: 'left' } });
  check('updateLegSettings → back to left', r.status === 200 && r.json.data.preferredPlacement === 'left');

  console.log('=== COMMISSIONS ===');
  r = await api('GET', '/api/v1/mlm/commissions', { token: userToken });
  check('getCommissions (user view)', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== RANKS ===');
  r = await api('GET', '/api/v1/mlm/ranks', { token: userToken });
  check('getAllRanks: 6', r.status === 200 && r.json.data.length === 6 && r.json.data[0].name === 'Starter');

  r = await api('GET', '/api/v1/mlm/ranks/Starter', { token: userToken });
  check('getRankDetails(Starter)', r.status === 200 && r.json.data.level === 1);

  r = await api('GET', '/api/v1/mlm/ranks/Bogus', { token: userToken });
  check('getRankDetails(bogus) 404', r.status === 404);

  r = await api('POST', '/api/v1/mlm/ranks/evaluate', { token: userToken });
  check('evaluateMyRank', r.status === 200 && r.json.data.currentRank === 'Starter' && typeof r.json.data.shouldAdvance === 'boolean');

  r = await api('GET', '/api/v1/mlm/ranks/progress', { token: userToken });
  check('getMyRankProgress: next Bronze', r.status === 200 && r.json.data.nextRank === 'Bronze' && r.json.data.atMaxRank === false);

  r = await api('GET', '/api/v1/mlm/rank-history', { token: userToken });
  check('getMyRankHistory', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== ADMIN: ELIGIBLE USERS ===');
  r = await api('GET', '/api/v1/mlm/eligible-users', { token: userToken });
  check('non-admin blocked 403', r.status === 403);

  r = await api('GET', '/api/v1/mlm/eligible-users', { token: adminToken });
  check('getEligibleUsers (fresh user listed)', r.status === 200 && r.json.data.some((u) => u.id === freshUser.id));

  console.log('=== ADMIN: PLACEMENT ===');
  r = await api('POST', '/api/v1/mlm/root', { token: adminToken, body: { userId: freshUser.id } });
  check('createRoot for fresh user', r.status === 201 && r.json.data.position === 'root');

  r = await api('POST', '/api/v1/mlm/placement', { token: adminToken, body: { userId: placeTarget.id, sponsorId: treeUser.id, strategy: 'right' } });
  check('placeUser under testuser1 (right)', r.status === 200 && r.json.data.depth === 1 && r.json.data.parentId === treeUser.id);

  r = await api('GET', '/api/v1/mlm/binary', { token: userToken });
  check('binary tree now 8 nodes', r.status === 200 && r.json.data.length === 8);

  console.log('=== ADMIN: COMMISSION REPORT ===');
  r = await api('GET', '/api/v1/mlm/commissions/report', { token: adminToken });
  check('report requires dates', r.status === 400);

  r = await api('GET', `/api/v1/mlm/commissions/report?startDate=${encodeURIComponent('2026-01-01')}&endDate=${encodeURIComponent('2026-12-31')}`, { token: adminToken });
  check('getCommissionsReport', r.status === 200 && Array.isArray(r.json.data) && r.json.data.length >= 7);

  console.log('=== ADMIN: RANK OPS ===');
  r = await api('GET', `/api/v1/mlm/rank-history/${treeUser.id}`, { token: adminToken });
  check('getUserRankHistory (admin)', r.status === 200 && Array.isArray(r.json.data));

  r = await api('POST', '/api/v1/mlm/ranks/evaluate-all', { token: adminToken });
  check('evaluateAllRanks batch', r.status === 200 && typeof r.json.data.totalEvaluated === 'number');

  // Cleanup: remove the placed node + restore testuser1's rightChildId so the
  // ported tree stays pristine for other suites (exact-count assertions).
  const placeNode = await MLMTreeNodeRepository.findByUserId(placeTarget.id);
  if (placeNode) {
    await MLMTreeNodeRepository.delete(placeNode.id);
    const t1Node = await MLMTreeNodeRepository.findByUserId(treeUser.id);
    await MLMTreeNodeRepository.update(t1Node.id, { rightChildId: null });
  }

  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  server.close();
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('TEST CRASH:', e); process.exit(1); });