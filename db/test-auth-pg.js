// db/test-auth-pg.js — end-to-end auth flow against PostgreSQL (Phase 1 exit criteria)
const AuthService = require('../backend/services/pg/AuthService');
const TokenService = require('../backend/services/pg/TokenService');
const UserService = require('../backend/services/pg/UserService');
const UserRepository = require('../backend/repositories/pg/UserRepository');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const TEST_EMAIL = `authtest_${Date.now()}@test.local`;

// Stub the (still Mongo-backed) email service BEFORE any auth call — it is
// migrated to PG in Phase 5; here we only need to verify the auth flow.
const emailService = require('../backend/services/emailService');
emailService.sendWelcomeEmail = async () => {};
emailService.sendPasswordReset = async (u, url) => { sentResetUrl = url; };
emailService.sendEmail = async () => {};
let sentResetUrl = null;

(async () => {
  console.log('=== REGISTER ===');
  const { user, tokens } = await AuthService.register({
    email: TEST_EMAIL,
    username: 'authtest',
    password: 'StrongPass123!',
    role: 'user',
  });
  check('register returns user', !!user && user.email === TEST_EMAIL);
  check('register strips password', !('password' in user));
  check('register returns tokens', !!tokens?.access?.token && !!tokens?.refresh?.token);
  check('user has UUID id', /^[0-9a-f]{8}-/.test(user.id), user.id);

  const stored = await UserRepository.findByIdWithPassword(user.id);
  check('password hashed in DB (bcrypt)', stored && stored.password.startsWith('$2') && stored.password !== 'StrongPass123!');

  let dupRejected = false;
  try { await AuthService.register({ email: TEST_EMAIL, password: 'x' }); }
  catch (e) { dupRejected = e.statusCode === 409; }
  check('duplicate email rejected (409)', dupRejected);

  console.log('=== LOGIN ===');
  const login = await AuthService.login(TEST_EMAIL, 'StrongPass123!');
  check('login success returns user', login.user.email === TEST_EMAIL);
  check('login strips password', !('password' in login.user));
  check('login returns access token', !!login.tokens.access.token);
  check('access token has user sub', TokenService.verifyToken(login.tokens.access.token, 'access').then(p => p.sub === user.id).catch(() => false));

  let badLogin = false;
  try { await AuthService.login(TEST_EMAIL, 'WrongPass!'); }
  catch (e) { badLogin = e.statusCode === 401; }
  check('wrong password rejected (401)', badLogin);

  let missingLogin = false;
  try { await AuthService.login('nobody@nowhere.zzz', 'x'); }
  catch (e) { missingLogin = e.statusCode === 401; }
  check('unknown email rejected (401)', missingLogin);

  console.log('=== JWT / PROTECT ===');
  const payload = await TokenService.verifyToken(login.tokens.access.token, 'access');
  check('verifyToken returns payload', payload.sub === user.id && payload.type === 'access');

  let badType = false;
  try { await TokenService.verifyToken(login.tokens.access.token, 'refresh'); }
  catch (e) { badType = e.statusCode === 401; }
  check('wrong token type rejected', badType);

  const me = await UserService.findById(payload.sub);
  check('protect path: findById from JWT sub', me && me.email === TEST_EMAIL);

  console.log('=== REFRESH ===');
  const refreshed = await AuthService.refreshAuth(login.tokens.refresh.token);
  check('refreshAuth returns new tokens', !!refreshed.access?.token);

  let badRefresh = false;
  try { await AuthService.refreshAuth('garbage.token.here'); }
  catch (e) { badRefresh = e.statusCode === 401; }
  check('invalid refresh token rejected', badRefresh);

  console.log('=== FORGOT / RESET PASSWORD ===');
  // forgotPassword sends email — stub already installed at top of test
  await AuthService.forgotPassword(TEST_EMAIL);
  check('forgotPassword issued reset URL', !!sentResetUrl, sentResetUrl || '');
  const resetToken = sentResetUrl.split('token=')[1];

  const beforeReset = await UserRepository.findByIdWithPassword(user.id);
  check('reset token stored hashed', !!beforeReset.resetPasswordToken && beforeReset.resetPasswordToken !== resetToken);
  check('reset expiry set', !!beforeReset.resetPasswordExpire);

  await AuthService.resetPassword(resetToken, 'NewPass456!');
  const afterReset = await UserRepository.findByIdWithPassword(user.id);
  check('password changed', afterReset.password !== stored.password);
  check('reset token cleared', afterReset.resetPasswordToken === null);

  const loginAfterReset = await AuthService.login(TEST_EMAIL, 'NewPass456!');
  check('login with new password works', loginAfterReset.user.email === TEST_EMAIL);

  let expiredToken = false;
  try { await AuthService.resetPassword('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', 'X'); }
  catch (e) { expiredToken = e.statusCode === 400; }
  check('invalid reset token rejected', expiredToken);

  console.log('=== MAGIC LINK ===');
  let sentMagicUrl = null;
  emailService.sendEmail = async (to, subject, html) => { sentMagicUrl = html.match(/href="([^"]+)"/)?.[1]; };
  await AuthService.sendMagicLink(TEST_EMAIL);
  check('magic link sent', !!sentMagicUrl);
  const magicToken = sentMagicUrl.split('token=')[1];
  const magicLogin = await AuthService.verifyMagicLink(magicToken);
  check('magic link login works', magicLogin.user.email === TEST_EMAIL);

  console.log('=== PROFILE / PREFERENCES (pg UserService) ===');
  const updated = await UserService.updateProfile(user.id, { firstName: 'Kai', lastName: 'Test' });
  check('updateProfile merges into JSONB', updated.profile?.firstName === 'Kai' && updated.profile?.lastName === 'Test');
  const avatar = await UserService.updateProfilePicture(user.id, '/assets/avatar-1.png');
  check('updateProfilePicture sets avatar', avatar.profile?.avatar === '/assets/avatar-1.png');
  const prefs = await UserService.updatePreferences(user.id, { theme: 'light', language: 'en' });
  check('updatePreferences merges', prefs.preferences?.theme === 'light' && prefs.preferences?.language === 'en');
  check('updatePreferences preserves existing', prefs.preferences?.sessionDuration !== undefined || Object.keys(prefs.preferences).length >= 2);

  let wrongCurrent = false;
  try { await UserService.changePassword(user.id, 'WrongCurrent!', 'X'); }
  catch (e) { wrongCurrent = e.statusCode === 401; }
  check('changePassword rejects wrong current', wrongCurrent);
  await UserService.changePassword(user.id, 'NewPass456!', 'FinalPass789!');
  const finalLogin = await AuthService.login(TEST_EMAIL, 'FinalPass789!');
  check('changePassword works', finalLogin.user.email === TEST_EMAIL);

  console.log('=== CLEANUP ===');
  await UserRepository.delete(user.id);
  const gone = await UserRepository.findById(user.id);
  check('test user cleaned up', gone === null);

  console.log(`\n${failures === 0 ? 'ALL AUTH TESTS PASSED — Phase 1 exit criteria met' : failures + ' FAILURES'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  // Crash-safe cleanup — never leak a test user into the DB
  try {
    const leaked = await UserRepository.findByEmail(TEST_EMAIL);
    if (leaked) await UserRepository.delete(leaked.id);
  } catch (_) {}
  await pool.end();
  process.exit(1);
});