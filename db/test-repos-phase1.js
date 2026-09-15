// db/test-repos-phase1.js — exercise Phase 1 repositories against ported data
const userRepo = require('../backend/repositories/pg/UserRepository');
const planRepo = require('../backend/repositories/pg/PlanRepository');
const subRepo = require('../backend/repositories/pg/SubscriptionRepository');
const invRepo = require('../backend/repositories/pg/InvoiceRepository');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

(async () => {
  console.log('=== UserRepository ===');
  const user = await userRepo.findByEmail('john@example.com');
  check('findByEmail returns user', !!user);
  check('camelCase keys (emailVerified)', user && 'emailVerified' in user, JSON.stringify(Object.keys(user).slice(0, 8)));
  check('password excluded by default', user && !('password' in user));
  check('nested JSONB preserved (profile.timezone)', user && user.profile?.timezone === 'UTC');
  check('preferences JSONB intact', user && user.preferences?.theme === 'dark');
  check('membershipTier extracted', user && user.membershipTier === 'Basic');
  check('activeServices array', Array.isArray(user.activeServices));

  const withPw = await userRepo.findByEmailWithPassword('john@example.com');
  check('findByEmailWithPassword includes password', withPw && typeof withPw.password === 'string' && withPw.password.startsWith('$2'));
  check('bcrypt hash preserved', withPw && withPw.password.startsWith('$2a$'));

  const byId = await userRepo.findById(user.id);
  check('findById works', byId && byId.email === 'john@example.com');

  const exists = await userRepo.emailExists('john@example.com');
  check('emailExists true', exists === true);
  const notExists = await userRepo.emailExists('nobody@nowhere.zzz');
  check('emailExists false', notExists === false);

  const rolePage = await userRepo.findByRole('user', { page: 1, limit: 5 });
  check('findByRole paginate shape', rolePage && Array.isArray(rolePage.results) && rolePage.pagination.total > 0);
  check('paginate metadata', rolePage.pagination.pages >= 1 && rolePage.pagination.hasNext === (rolePage.pagination.total > 5));
  check('paginate limit respected', rolePage.results.length <= 5);

  console.log('=== PlanRepository ===');
  const basic = await planRepo.findByCode('BASIC');
  check('findByCode BASIC', basic && basic.name === 'Basic');
  check('price numeric', basic && basic.price === 0);
  const pro = await planRepo.findByCode('PRO');
  check('price 99.00', pro && pro.price === 99);
  const active = await planRepo.findActive();
  check('findActive returns active only', Array.isArray(active) && active.every(p => p.isActive === true));
  check('findActive count', active.length === 3); // Signal Service is inactive

  console.log('=== SubscriptionRepository ===');
  const subs = await subRepo.findActiveByUser('00000000-69b3-b400-450c-c33bebd721a8');
  check('findActiveByUser returns subs', Array.isArray(subs) && subs.length > 0);
  if (subs.length > 0) {
    check('plan populated (nested)', subs[0].plan && typeof subs[0].plan === 'object' && subs[0].plan.name);
    check('populated plan has camelCase', 'code' in subs[0].plan, JSON.stringify(Object.keys(subs[0].plan).slice(0, 5)));
  }
  const oneSub = await subRepo.findByUser('00000000-69b3-b400-450c-c33bebd721a8');
  check('findByUser populated', oneSub && oneSub.plan?.code);

  console.log('=== InvoiceRepository (empty — orphans skipped) ===');
  const invs = await invRepo.findByUser('00000000-69a0-d782-311b-7f935be10e34');
  check('findByUser empty', Array.isArray(invs) && invs.length === 0);

  console.log('=== Write round-trip (create → update → delete) ===');
  const created = await userRepo.create({
    email: 'roundtrip@test.local',
    username: 'roundtrip',
    password: '$2a$10$testhash',
    role: 'user',
    profile: { timezone: 'UTC' },
    preferences: { theme: 'light' },
  });
  check('create returns row with id', created && created.id && created.email === 'roundtrip@test.local');
  check('create camelCase', created && 'emailVerified' in created && created.emailVerified === false);

  // Small delay so updatedAt (ms precision) strictly exceeds createdAt — the
  // create + update can otherwise land in the same millisecond on fast runs.
  await new Promise((r) => setTimeout(r, 5));
  const updated = await userRepo.update(created.id, { username: 'roundtrip2', preferences: { theme: 'dark' } });
  check('update returns updated row', updated && updated.username === 'roundtrip2');
  check('update preserves other fields', updated && updated.email === 'roundtrip@test.local');
  check('updatedAt bumped (strict)', updated && new Date(updated.updatedAt) > new Date(created.updatedAt));

  const deleted = await userRepo.delete(created.id);
  check('delete returns deleted row', deleted && deleted.id === created.id);
  const gone = await userRepo.findById(created.id);
  check('row actually deleted', gone === null);

  console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' FAILURES'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  await pool.end();
  process.exit(1);
});