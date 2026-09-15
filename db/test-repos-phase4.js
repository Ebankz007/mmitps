// db/test-repos-phase4.js — MLM domain repositories + service logic against PostgreSQL
const UserRepository = require('../backend/repositories/pg/UserRepository');
const MLMRankRepository = require('../backend/repositories/pg/MLMRankRepository');
const MLMCommissionRepository = require('../backend/repositories/pg/MLMCommissionRepository');
const MLMTreeNodeRepository = require('../backend/repositories/pg/MLMTreeNodeRepository');
const MLMVolumeHistoryRepository = require('../backend/repositories/pg/MLMVolumeHistoryRepository');
const MLMRankHistoryRepository = require('../backend/repositories/pg/MLMRankHistoryRepository');
const GenealogyService = require('../backend/services/pg/GenealogyService');
const CommissionService = require('../backend/services/pg/CommissionService');
const RankService = require('../backend/services/pg/RankService');
const { uuidToLtree } = require('../backend/utils/ltree');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const stamp = Date.now();
let root, child, child2, child3, t1, t3;

(async () => {
  console.log('=== SETUP ===');
  const mk = (email, username) => UserRepository.create({ email, username, password: 'x', role: 'user' });
  root = await mk(`mlm_root_${stamp}@test.local`, 'mlm_root');
  child = await mk(`mlm_child_${stamp}@test.local`, 'mlm_child');
  child2 = await mk(`mlm_child2_${stamp}@test.local`, 'mlm_child2');
  child3 = await mk(`mlm_child3_${stamp}@test.local`, 'mlm_child3');
  check('4 test users created', [root, child, child2, child3].every((u) => !!u.id));

  // Ported tree users (Phase 1 users, Phase 4 tree)
  t1 = await UserRepository.findByEmail('testuser1@example.com');
  t3 = await UserRepository.findByEmail('testuser3@example.com');
  check('ported tree users resolvable', !!t1 && !!t3);

  console.log('=== MLM RANKS ===');
  const ranks = await MLMRankRepository.getRankHierarchy();
  check('rank hierarchy: 6 ranks sorted by level', ranks.length === 6 && ranks[0].level === 1 && ranks[5].level === 6);
  check('rank hierarchy fields', !!ranks[0].name && !!ranks[0].requirements && !!ranks[0].benefits);

  const starter = await MLMRankRepository.findByName('Starter');
  check('findByName(Starter)', starter && starter.level === 1 && starter.badge === '🌱');

  const next = await MLMRankRepository.getNextRank(1);
  check('getNextRank(1) → Bronze', next && next.name === 'Bronze');

  const prev = await MLMRankRepository.getPreviousRank(2);
  check('getPreviousRank(2) → Starter', prev && prev.name === 'Starter');

  const reqs = await MLMRankRepository.getRankRequirements('Starter');
  check('getRankRequirements', reqs && typeof reqs.personalVolume === 'number');

  check('rankExists(Starter)', await MLMRankRepository.rankExists('Starter'));
  check('rankExists(bogus) false', !(await MLMRankRepository.rankExists('bogus')));

  const details = await MLMRankRepository.getAllRanksWithDetails();
  check('getAllRanksWithDetails: 6, name present, no id/createdAt', details.length === 6 && details[0].name === 'Starter' && details[0].id === undefined);

  console.log('=== MLM TREE (ported data) ===');
  const t1Node = await MLMTreeNodeRepository.findByUserId(t1.id);
  check('findByUserId populates user', t1Node && t1Node.user && t1Node.user.email === 'testuser1@example.com');
  check('root node shape', t1Node.position === 'root' && t1Node.depth === 0 && t1Node.path === uuidToLtree(t1.id));

  const downline = await MLMTreeNodeRepository.getDownline(t1Node.path);
  check('getDownline(root) = 7 (self + 6)', downline.length === 7 && downline[0].depth === 0 && downline[6].depth === 6);

  const t3Node = await MLMTreeNodeRepository.findByUserId(t3.id);
  const downline3 = await MLMTreeNodeRepository.getDownline(t3Node.path);
  check('getDownline(testuser3) = 5', downline3.length === 5 && downline3.every((n) => n.depth >= 2));

  const directs = await MLMTreeNodeRepository.getDirectReferrals(t1.id);
  check('getDirectReferrals(testuser1) = 1', directs.length === 1 && directs[0].user.email === 'testuser2@example.com');

  const children = await MLMTreeNodeRepository.getChildren(t1.id);
  check('getChildren(testuser1) = 1 (user-id keyed)', children.length === 1 && children[0].userId === t1Node.leftChildId);

  const extreme = await MLMTreeNodeRepository.findExtremeNode(t1.id, 'left');
  check('findExtremeNode(testuser1,left) → testuser7', extreme && extreme.user.email === 'testuser7@example.com');

  console.log('=== MLM TREE (placement) ===');
  const rootNode = await GenealogyService.createRoot(root.id);
  check('createRoot', rootNode.position === 'root' && rootNode.path === uuidToLtree(root.id));

  const placed = await GenealogyService.placeUser(child.id, root.id, 'left');
  check('placeUser left: depth 1, parent=root, path', placed.depth === 1 && placed.parentId === root.id && placed.position === 'left' && placed.path === `${uuidToLtree(root.id)}.${uuidToLtree(child.id)}`);

  const rootAfter = await MLMTreeNodeRepository.findByUserId(root.id);
  check('parent leftChildId updated', rootAfter.leftChildId === child.id);

  const placed2 = await GenealogyService.placeUser(child2.id, root.id, 'right');
  check('placeUser right: rightChildId updated', placed2.position === 'right' && placed2.path === `${uuidToLtree(root.id)}.${uuidToLtree(child2.id)}`);

  const rootAfter2 = await MLMTreeNodeRepository.findByUserId(root.id);
  check('both children set', rootAfter2.leftChildId === child.id && rootAfter2.rightChildId === child2.id);

  const placedAuto = await GenealogyService.placeUser(child3.id, root.id, 'manual', child.id, 'right');
  check('manual placement under child', placedAuto.parentId === child.id && placedAuto.position === 'right' && placedAuto.depth === 2);

  let collisionThrown = false;
  try {
    await GenealogyService.placeUser(child3.id, root.id, 'manual', child.id, 'right');
  } catch (e) {
    collisionThrown = e.statusCode === 400;
  }
  check('manual collision throws 400 (right occupied)', collisionThrown);

  const duplicateRoot = await GenealogyService.createRoot(root.id);
  check('createRoot idempotent', duplicateRoot.id === rootNode.id);

  console.log('=== MLM COMMISSIONS ===');
  const comms = await MLMCommissionRepository.findByUserId(t1.id);
  check('findByUserId(testuser1) returns commissions', Array.isArray(comms));

  const total = await MLMCommissionRepository.getTotalEarnings(t1.id);
  check('getTotalEarnings is number', typeof total === 'number');

  const paidComms = await MLMCommissionRepository.findAll({ userId: t1.id, status: 'paid' });
  check('findAll status filter', Array.isArray(paidComms));

  const created = await MLMCommissionRepository.create({
    userId: root.id,
    type: 'binary_match',
    amount: 42.5,
    status: 'pending',
    volumeLeft: 100,
    volumeRight: 80,
    volumeMatched: 80,
    carryForward: 20,
    rank: 'Starter',
    periodType: 'weekly',
    periodStart: new Date('2026-09-01'),
    periodEnd: new Date('2026-09-07'),
  });
  check('create with period columns', created.id && created.periodType === 'weekly' && created.volumeMatched === 80);

  const inFilter = await MLMCommissionRepository.findAll({ userId: { $in: [root.id, child.id] } });
  check('$in filter', inFilter.some((c) => c.userId === root.id));

  console.log('=== MLM VOLUME HISTORY ===');
  const vh = await MLMVolumeHistoryRepository.create({
    userId: root.id,
    periodType: 'weekly',
    periodStart: new Date('2026-09-01'),
    periodEnd: new Date('2026-09-07'),
    personalVolume: 500,
    leftLegVolume: 300,
    rightLegVolume: 200,
    groupVolume: 1000,
    volumeMatched: 200,
    commissionsEarned: 10,
  });
  check('volume history create', vh.id && vh.personalVolume === 500);

  const vhFound = await MLMVolumeHistoryRepository.findByUserAndPeriod(root.id, 'weekly', new Date('2026-09-01'));
  check('findByUserAndPeriod', vhFound && vhFound.id === vh.id);

  const vhSummary = await MLMVolumeHistoryRepository.getPeriodSummary(root.id, '2026-09-01', '2026-09-07');
  check('getPeriodSummary sums', vhSummary.personalVolume === 500 && vhSummary.groupVolume === 1000);

  console.log('=== MLM RANK HISTORY ===');
  const rh = await MLMRankHistoryRepository.createRankHistory({
    userId: root.id,
    previousRank: 'Starter',
    newRank: 'Bronze',
    achievedAt: new Date(),
    qualificationSnapshot: { personalVolume: { required: 100, actual: 110, met: true } },
    bonusAwarded: 0,
  });
  check('rank history create', rh.id && rh.newRank === 'Bronze');

  const progression = await MLMRankHistoryRepository.getRankProgression(root.id);
  check('getRankProgression', progression.length === 1 && progression[0].newRank === 'Bronze');

  check('getLatestRank', (await MLMRankHistoryRepository.getLatestRank(root.id)) === 'Bronze');
  check('hasAchievedRank', await MLMRankHistoryRepository.hasAchievedRank(root.id, 'Bronze'));
  check('hasAchievedRank negative', !(await MLMRankHistoryRepository.hasAchievedRank(root.id, 'Diamond')));
  check('getTotalRankBonuses', (await MLMRankHistoryRepository.getTotalRankBonuses(root.id)) === 0);

  const stats = await MLMRankHistoryRepository.getRankStatistics(new Date(Date.now() - 86400000), new Date(Date.now() + 86400000));
  check('getRankStatistics has Bronze entry', stats.Bronze && stats.Bronze.count >= 1);

  console.log('=== COMMISSION SERVICE LOGIC ===');
  // Fresh tree for deterministic service tests (ported users accumulate across runs)
  const bmRoot = await mk(`mlm_bm_${stamp}@test.local`, 'mlm_bm_root');
  const bmChild = await mk(`mlm_bm2_${stamp}@test.local`, 'mlm_bm_child');
  await GenealogyService.createRoot(bmRoot.id);
  await GenealogyService.placeUser(bmChild.id, bmRoot.id, 'left');
  const bmRootNode = await MLMTreeNodeRepository.findByUserId(bmRoot.id);
  await MLMTreeNodeRepository.update(bmRootNode.id, { leftLegVolume: 1000, rightLegVolume: 400 });

  // Direct referral: sponsor tier fallback 5% → 100 * 0.05 = 5
  const dr = await CommissionService.calculateDirectReferral(bmRoot.id, 100, 'subscription', 0);
  check('calculateDirectReferral 5% = 5', dr === 5);

  // Locked when purchased tier exceeds sponsor tier
  const drLocked = await CommissionService.calculateDirectReferral(bmRoot.id, 100, 'subscription', 99);
  check('calculateDirectReferral locks at higher tier', drLocked === 5);

  const lockedComms = await MLMCommissionRepository.findAll({ userId: bmRoot.id, type: 'direct_referral', status: 'locked' });
  check('locked commission recorded with unlocksAtTierLevel', lockedComms.length === 1 && lockedComms[0].unlocksAtTierLevel === 99);

  // Multi-level: root has no sponsor → no-op; child has sponsor root → 1 level
  await CommissionService.calculateMultiLevelReferral(bmChild.id, 100, 'registration');
  const mlComms = await MLMCommissionRepository.findAll({ userId: bmRoot.id, generation: 1 });
  check('multi-level: 10% level-1 to sponsor', mlComms.length === 1 && mlComms[0].amount === 10);

  // Binary match: 400 matched @ 5% = 20
  const bm = await CommissionService.calculateBinaryMatch(bmRoot.id, null, 0);
  check('binary match: 400 matched @ 5% = 20', bm && bm.volumeMatched === 400 && bm.carryForward === 600 && bm.amount === 20 && bm.type === 'binary_match');

  // Matching bonus: parent at Bronze = 5% of downline commissions (100 → 5)
  await MLMTreeNodeRepository.update(bmRootNode.id, { rank: 'Bronze' });
  await MLMCommissionRepository.create({ userId: bmChild.id, type: 'binary_match', amount: 100, status: 'pending' });
  const mb = await CommissionService.calculateMatchingBonus(bmRoot.id, null);
  check('matching bonus: 5% of 100 = 5', mb && mb.amount === 5 && mb.type === 'matching_bonus');

  console.log('=== RANK SERVICE LOGIC ===');
  const evalRoot = await RankService.evaluateUserRank(root.id);
  check('evaluateUserRank returns structure', evalRoot && typeof evalRoot.shouldAdvance === 'boolean' && evalRoot.currentRank === 'Starter');

  const progress = await RankService.getRankProgress(root.id);
  check('getRankProgress: next rank Bronze', progress && progress.nextRank === 'Bronze' && progress.atMaxRank === false);

  // Advance root to Bronze manually
  const adv = await RankService.advanceUserRank(root.id, 'Bronze', { directReferrals: { actual: 1 }, activeDirects: { actual: 1 } });
  check('advanceUserRank to Bronze', adv.advanced === true && adv.previousRank === 'Starter' && adv.newRank === 'Bronze');
  check('rank history written on advance', adv.rankHistory && adv.rankHistory.newRank === 'Bronze');

  const noAdvance = await RankService.advanceUserRank(root.id, 'Bronze');
  check('advance to same rank rejected', noAdvance.advanced === false);

  const rootNodeAfter = await MLMTreeNodeRepository.findByUserId(root.id);
  check('node rank updated', rootNodeAfter.rank === 'Bronze');

  // Restore testuser1 volumes for route tests
  const t1Restore = await MLMTreeNodeRepository.findByUserId(t1.id);
  await MLMTreeNodeRepository.update(t1Restore.id, { leftLegVolume: 0, rightLegVolume: 0 });

  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('TEST CRASH:', e); process.exit(1); });