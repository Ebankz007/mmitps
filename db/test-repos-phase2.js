// db/test-repos-phase2.js — financial domain repositories against PostgreSQL
const UserRepository = require('../backend/repositories/pg/UserRepository');
const WalletRepository = require('../backend/repositories/pg/WalletRepository');
const TransactionRepository = require('../backend/repositories/pg/TransactionRepository');
const TierRepository = require('../backend/repositories/pg/TierRepository');
const CouponRepository = require('../backend/repositories/pg/CouponRepository');
const PendingWithdrawalRepository = require('../backend/repositories/pg/PendingWithdrawalRepository');
const { BonusActivityRepository, BonusClaimRepository } = require('../backend/repositories/pg/BonusRepository');
const ModuleRepository = require('../backend/repositories/pg/ModuleRepository');
const CryptoWalletRepository = require('../backend/repositories/pg/CryptoWalletRepository');
const SavedBankAccountRepository = require('../backend/repositories/pg/SavedBankAccountRepository');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const TEST_EMAIL = `fin_${Date.now()}@test.local`;
let userId = null;
const cleanupIds = { wallet: null, tx: [], coupon: null, withdrawal: null, bonusActivity: null, bonusClaim: null, module: null, cryptoWallet: null, bankAccount: null };

(async () => {
  console.log('=== SETUP (test user) ===');
  const user = await UserRepository.create({
    email: TEST_EMAIL,
    username: 'fintest',
    password: 'x', // never used for login
    role: 'user',
  });
  userId = user.id;
  check('test user created', !!userId);

  console.log('=== WALLET: find-or-create + balance ops ===');
  const w1 = await WalletRepository.findByUserId(userId);
  check('findByUserId creates wallet', w1 && Array.isArray(w1.balances));
  check('initial USD balance 0', w1.balances.find(b => b.currency === 'USD')?.amount === 0);

  const w2 = await WalletRepository.updateBalance(userId, 'USD', 1000);
  check('credit USD +1000', w2.balances.find(b => b.currency === 'USD')?.amount === 1000);

  const w3 = await WalletRepository.updateBalance(userId, 'USD', -250);
  check('debit USD -250', w3.balances.find(b => b.currency === 'USD')?.amount === 750);

  const w4 = await WalletRepository.updateBalance(userId, 'BTC', 0.5);
  check('credit new currency BTC', w4.balances.find(b => b.currency === 'BTC')?.amount === 0.5);

  let insufficient = false;
  try { await WalletRepository.updateBalance(userId, 'USD', -100000); }
  catch (e) { insufficient = e.statusCode === 400; }
  check('insufficient funds rejected (400)', insufficient);

  let noCurrency = false;
  try { await WalletRepository.updateBalance(userId, 'EUR', -10); }
  catch (e) { noCurrency = e.statusCode === 400; }
  check('debit missing currency rejected', noCurrency);

  console.log('=== WALLET: freeze/unfreeze ===');
  const f1 = await WalletRepository.freezeFunds(userId, 'USD', 200);
  const usdAfterFreeze = f1.balances.find(b => b.currency === 'USD');
  check('freeze moves 200 to frozen', usdAfterFreeze.amount === 550 && usdAfterFreeze.frozen === 200);

  const f2 = await WalletRepository.unfreezeFunds(userId, 'USD', 100);
  const usdAfterUnfreeze = f2.balances.find(b => b.currency === 'USD');
  check('unfreeze restores 100', usdAfterUnfreeze.amount === 650 && usdAfterUnfreeze.frozen === 100);

  let overFreeze = false;
  try { await WalletRepository.freezeFunds(userId, 'USD', 99999); }
  catch (e) { overFreeze = e.statusCode === 400; }
  check('over-freeze rejected', overFreeze);

  console.log('=== WALLET: concurrency (FOR UPDATE) ===');
  // 10 parallel +10 credits — without locking this would lose updates
  await Promise.all(Array.from({ length: 10 }, () => WalletRepository.updateBalance(userId, 'USD', 10)));
  const wConcurrent = await WalletRepository.findByUserId(userId);
  const usdConcurrent = wConcurrent.balances.find(b => b.currency === 'USD');
  check('10 parallel credits all landed (650+100=750)', usdConcurrent.amount === 750, `got ${usdConcurrent.amount}`);

  console.log('=== TRANSACTIONS ===');
  const tx1 = await TransactionRepository.create({
    userId, type: 'deposit', category: 'wallet', status: 'completed',
    amount: 500, currency: 'USD', reference: `TXTEST-${Date.now()}`,
  });
  cleanupIds.tx.push(tx1.id);
  check('tx create returns camelCase', tx1.type === 'deposit' && tx1.amount === 500);

  const found = await TransactionRepository.findByReference(tx1.reference);
  check('findByReference works', found?.id === tx1.id);

  const byUser = await TransactionRepository.findByUserId(userId);
  check('findByUserId works', byUser.length === 1);

  const tx2 = await TransactionRepository.create({
    userId, type: 'withdrawal', status: 'pending', amount: 100, currency: 'USD', reference: `TXTEST2-${Date.now()}`,
  });
  cleanupIds.tx.push(tx2.id);
  const active = await TransactionRepository.findActiveByUser(userId);
  check('findActiveByUser returns pending', active.some(t => t.id === tx2.id));

  const done = await TransactionRepository.markCompleted(tx2.id);
  check('markCompleted sets status+completedAt', done.status === 'completed' && !!done.completedAt);
  const activeAfter = await TransactionRepository.findActiveByUser(userId);
  check('completed tx no longer active', !activeAfter.some(t => t.id === tx2.id));

  console.log('=== TIERS ===');
  const basic = await TierRepository.findByCode('basic');
  check('findByCode basic', basic?.name === 'Basic Tier' && basic?.level === 0);
  const activeTiers = await TierRepository.findActive();
  check('findActive returns 4', activeTiers.length === 4);
  const lvl2 = await TierRepository.findByLevel(2);
  check('findByLevel 2 = pro', lvl2?.code === 'pro');

  console.log('=== COUPONS ===');
  const coupon = await CouponRepository.create({
    code: `TEST${Date.now()}`.slice(0, 12).toUpperCase(), discountType: 'percentage', discountValue: 10,
    usageLimit: 2,
  });
  cleanupIds.coupon = coupon.id;
  check('coupon create', coupon.code === coupon.code.toUpperCase());
  const byCode = await CouponRepository.findByCode(coupon.code);
  check('findByCode', byCode?.id === coupon.id);
  await CouponRepository.incrementUsage(coupon.id);
  await CouponRepository.incrementUsage(coupon.id);
  let limitHit = false;
  try { await CouponRepository.incrementUsage(coupon.id); }
  catch (e) { limitHit = e.statusCode === 400; }
  check('usage limit enforced (3rd use rejected)', limitHit);

  console.log('=== PENDING WITHDRAWALS ===');
  const wd = await PendingWithdrawalRepository.create({
    userId, amount: 50, currency: 'USD', fee: 0, netAmount: 50,
    paymentMethod: 'bank_transfer', destination: { bankName: 'Test Bank', accountNumber: '1234567890' },
  });
  cleanupIds.withdrawal = wd.id;
  check('withdrawal created pending_approval', wd.status === 'pending_approval');
  const approved = await PendingWithdrawalRepository.approve(wd.id, userId, 'looks good');
  check('approve sets status+approval log', approved.status === 'approved' && approved.approvals?.length === 1 && approved.approvals[0].action === 'approved');
  const rejected = await PendingWithdrawalRepository.reject(wd.id, userId, 'nope');
  check('reject transitions from approved', rejected.status === 'rejected' && rejected.approvals?.length === 2);

  console.log('=== BONUS ===');
  const bonus = await BonusActivityRepository.create({
    title: 'Test Bonus', description: 'test', rewardAmount: 25, rewardCurrency: 'USD',
    criteria: 'manual', maxClaims: 1,
  });
  cleanupIds.bonusActivity = bonus.id;
  const claim = await BonusClaimRepository.create({ userId, bonusActivityId: bonus.id });
  cleanupIds.bonusClaim = claim.id;
  check('claim created', claim.status === 'pending');
  const claimed = await BonusClaimRepository.findClaimed(userId, bonus.id);
  check('findClaimed finds it', claimed?.id === claim.id);
  const approvedClaim = await BonusClaimRepository.approve(claim.id, userId);
  check('claim approved', approvedClaim.status === 'approved' && !!approvedClaim.processedAt);
  await BonusActivityRepository.incrementClaims(bonus.id);
  let claimLimit = false;
  try { await BonusActivityRepository.incrementClaims(bonus.id); }
  catch (e) { claimLimit = e.statusCode === 400; }
  check('bonus maxClaims enforced', claimLimit);

  console.log('=== MODULES / CRYPTO / BANK ===');
  const mod = await ModuleRepository.create({ code: `mod${Date.now()}`.slice(0, 10), name: 'Test Module', basePrice: 50 });
  cleanupIds.module = mod.id;
  check('module create + findByCode', (await ModuleRepository.findByCode(mod.code))?.id === mod.id);

  const cw = await CryptoWalletRepository.create({ userId, chain: 'ETH', address: `0x${Date.now().toString(16).padStart(40, '0')}` });
  cleanupIds.cryptoWallet = cw.id;
  const cwRead = await CryptoWalletRepository.findById(cw.id);
  check('crypto wallet create + read', cwRead?.chain === 'ETH');
  check('crypto wallet by user', (await CryptoWalletRepository.findByUserId(userId)).length === 1);

  const ba = await SavedBankAccountRepository.create({
    userId, accountName: 'Kai Test', accountNumber: '9876543210', bankName: 'Test Bank',
    bankCode: '001', country: 'NG', currency: 'NGN',
  });
  cleanupIds.bankAccount = ba.id;
  check('bank account create + findByUserId', (await SavedBankAccountRepository.findByUserId(userId)).length === 1);

  console.log('=== CLEANUP ===');
  for (const id of cleanupIds.tx) await TransactionRepository.delete(id);
  if (cleanupIds.withdrawal) await PendingWithdrawalRepository.delete(cleanupIds.withdrawal);
  if (cleanupIds.coupon) await CouponRepository.delete(cleanupIds.coupon);
  if (cleanupIds.bonusClaim) await BonusClaimRepository.delete(cleanupIds.bonusClaim);
  if (cleanupIds.bonusActivity) await BonusActivityRepository.delete(cleanupIds.bonusActivity);
  if (cleanupIds.module) await ModuleRepository.delete(cleanupIds.module);
  if (cleanupIds.cryptoWallet) await CryptoWalletRepository.delete(cleanupIds.cryptoWallet);
  if (cleanupIds.bankAccount) await SavedBankAccountRepository.delete(cleanupIds.bankAccount);
  // wallet FK has no cascade — delete wallet before user
  await pool.query('DELETE FROM wallets WHERE user_id = $1', [userId]);
  if (userId) await UserRepository.delete(userId);
  check('all test rows cleaned up', !(await UserRepository.findById(userId)));

  console.log(`\n${failures === 0 ? 'ALL PHASE 2 TESTS PASSED' : failures + ' FAILURES'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  try {
    if (userId) await UserRepository.delete(userId);
  } catch (_) {}
  await pool.end();
  process.exit(1);
});