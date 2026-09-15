// db/test-repos-phase3.js — trading domain repositories against PostgreSQL
const UserRepository = require('../backend/repositories/pg/UserRepository');
const TradingAccountRepository = require('../backend/repositories/pg/TradingAccountRepository');
const TradeJournalRepository = require('../backend/repositories/pg/TradeJournalRepository');
const SignalRepository = require('../backend/repositories/pg/SignalRepository');
const AnalysisRepository = require('../backend/repositories/pg/AnalysisRepository');
const TradingBotRepository = require('../backend/repositories/pg/TradingBotRepository');
const CopySubscriptionRepository = require('../backend/repositories/pg/CopySubscriptionRepository');
const CopyTradeRepository = require('../backend/repositories/pg/CopyTradeRepository');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const stamp = Date.now();
let users = [];
let account = null;
let journal = null;
let journal2 = null;
let signal = null;
let analysis = null;
let bot = null;
let sub = null;
let copyTrade = null;

(async () => {
  console.log('=== SETUP ===');
  const mk = (email, username) => UserRepository.create({ email, username, password: 'x', role: 'user' });
  users.push(await mk(`ta_${stamp}@test.local`, 'ta_user'));
  users.push(await mk(`tb_${stamp}@test.local`, 'tb_user'));
  users.push(await mk(`tc_${stamp}@test.local`, 'tc_user')); // follower
  users.push(await mk(`td_${stamp}@test.local`, 'td_user')); // provider
  check('4 test users created', users.length === 4);

  console.log('=== TRADING ACCOUNTS ===');
  account = await TradingAccountRepository.create({
    userId: users[0].id,
    platform: 'mt5',
    accountName: 'Alpha MT5',
    accountNumber: 'ACC-1001',
    passwordEncrypted: 'AES:deadbeef',
    apiKeyEncrypted: 'AES:cafe',
    apiSecretEncrypted: 'AES:babe',
    server: 'ICMarkets-Demo',
    broker: 'IC Markets',
    status: 'pending',
    balance: 10000,
    equity: 10050,
    currency: 'USD',
  });
  check('account create', !!account.id && account.platform === 'mt5');

  const acctRead = await TradingAccountRepository.findById(account.id);
  check('encrypted fields excluded by default', acctRead.passwordEncrypted === undefined && acctRead.apiKeyEncrypted === undefined);
  const acctFull = await TradingAccountRepository.findById(account.id, { select: '+passwordEncrypted' });
  check('+override exposes encrypted field', acctFull.passwordEncrypted === 'AES:deadbeef');

  const connected = await TradingAccountRepository.markConnected(account.id, { balance: 12000, equity: 12100, currency: 'USD' });
  check('markConnected sets status+balance', connected.status === 'connected' && connected.balance === 12000 && !!connected.lastSync);

  const byUser = await TradingAccountRepository.findByUserId(users[0].id);
  check('findByUserId', byUser.length === 1);
  check('findByIdAndUser (wrong user → null)', (await TradingAccountRepository.findByIdAndUser(account.id, users[1].id)) === null);

  console.log('=== TRADE JOURNALS ===');
  journal = await TradeJournalRepository.create({
    userId: users[0].id,
    symbol: 'EURUSD',
    direction: 'buy',
    orderType: 'market',
    lotSize: 0.02,
    entryPrice: 1.085,
    stopLoss: 1.082,
    takeProfit: 1.091,
    commission: 2.5,
    swap: 0.5,
    status: 'open',
    strategy: 'SENTIMENT_FOLLOWING',
    entryTime: new Date('2026-02-14T12:51:12Z'),
    tags: ['test'],
  });
  check('journal create', journal.symbol === 'EURUSD' && journal.status === 'open');

  const closed = await TradeJournalRepository.closeTrade(journal.id, {
    exitPrice: 1.092,
    profitLoss: 140,
    profitLossPips: 70,
    exitTime: new Date('2026-02-14T13:51:12Z'),
  });
  check('closeTrade computes netProfitLoss (140-2.5-0.5=137)', closed.netProfitLoss === 137);
  check('closeTrade computes duration 3600s', closed.duration === 3600);
  check('closeTrade sets status', closed.status === 'closed');

  journal2 = await TradeJournalRepository.create({
    userId: users[0].id,
    symbol: 'GBPUSD',
    direction: 'sell',
    entryPrice: 1.26,
    status: 'closed',
    entryTime: new Date('2026-02-15T10:00:00Z'),
    exitTime: new Date('2026-02-15T11:00:00Z'),
    profitLoss: -50,
    netProfitLoss: -50,
    duration: 3600,
  });
  const openJ = await TradeJournalRepository.create({
    userId: users[0].id,
    symbol: 'USDJPY',
    direction: 'buy',
    entryPrice: 149.5,
    status: 'open',
    entryTime: new Date(),
  });

  const stats = await TradeJournalRepository.getStats(users[0].id);
  check('getStats totalTrades=2 (closed only)', stats.totalTrades === 2, `got ${stats.totalTrades}`);
  check('getStats winCount=1', stats.winCount === 1);
  check('getStats totalProfitLoss=87 (137-50)', stats.totalProfitLoss === 87);
  check('getStats winRate=50', stats.winRate === 50);
  check('getStats largestWin=137', stats.largestWin === 137);
  check('getStats largestLoss=-50', stats.largestLoss === -50);

  const byStatus = await TradeJournalRepository.findByStatus(users[0].id, 'open');
  check('findByStatus open → 1', byStatus.length === 1);
  check('findByUser sorts by entryTime desc', (await TradeJournalRepository.findByUser(users[0].id))[0].symbol === 'USDJPY');

  console.log('=== SIGNALS ===');
  signal = await SignalRepository.create({
    providerId: users[3].id,
    pair: 'BTC/USD',
    type: 'buy',
    entryPrice: 50000,
    stopLoss: 48000,
    takeProfit: [52000, 55000],
    status: 'active',
    analysis: 'Bullish divergence',
    isPremium: true,
  });
  check('signal create (takeProfit array round-trip)', Array.isArray(signal.takeProfit) && signal.takeProfit.length === 2);
  const activeSignals = await SignalRepository.findActive();
  check('findActive includes signal + provider populated', activeSignals.some((s) => s.id === signal.id && s.provider?.username === 'td_user'));
  check('findByProvider', (await SignalRepository.findByProvider(users[3].id)).length === 1);

  console.log('=== ANALYSES ===');
  analysis = await AnalysisRepository.create({
    authorId: users[3].id,
    title: 'BTCUSD Technical Analysis',
    pair: 'BTC/USD',
    type: 'technical',
    content: 'Bullish pattern on daily.',
    prediction: { direction: 'bullish', targetPrice: 65000, stopLoss: 58000 },
    tags: ['btc'],
  });
  check('analysis create (prediction jsonb)', analysis.prediction.direction === 'bullish');
  const activeAnalyses = await AnalysisRepository.findActive();
  check('findActive includes author', activeAnalyses.some((a) => a.id === analysis.id && a.author?.username === 'td_user'));
  const viewed = await AnalysisRepository.incrementViews(analysis.id);
  check('incrementViews → 1', viewed.viewCount === 1);

  console.log('=== TRADING BOTS ===');
  bot = await TradingBotRepository.create({
    userId: users[0].id,
    name: 'Alpha Sentinel',
    pair: 'EURUSD',
    strategy: 'CONSERVATIVE_CONFIRMATION',
    allocation: 1000,
    status: 'active',
    settings: { stopLossPips: 25, takeProfitPips: 50, riskPerTrade: 2, maxConcurrentTrades: 1, maxDailyLoss: 100, trailingStop: false },
    stats: { totalTrades: 0, winRate: 0, netProfit: 0 },
  });
  check('bot create', bot.name === 'Alpha Sentinel' && bot.status === 'active');
  const activeBots = await TradingBotRepository.getActiveBots();
  check('getActiveBots includes bot + user', activeBots.some((b) => b.id === bot.id && b.user?.username === 'ta_user'));
  check('findByIdAndUser (wrong user → null)', (await TradingBotRepository.findByIdAndUser(bot.id, users[1].id)) === null);

  console.log('=== COPY SUBSCRIPTIONS ===');
  const followerAccount = await TradingAccountRepository.create({
    userId: users[2].id,
    platform: 'mt5',
    accountNumber: 'ACC-2001',
    status: 'connected',
  });
  sub = await CopySubscriptionRepository.create({
    followerId: users[2].id,
    providerId: users[3].id,
    status: 'active',
    allocationAmount: 1000,
    riskMultiplier: 1,
    lotSizeStrategy: 'SIGNAL',
    lotSizeValue: 0.01,
    followerAccountId: followerAccount.id,
  });
  check('copy sub create', sub.followerId === users[2].id && sub.status === 'active');
  const byFollower = await CopySubscriptionRepository.findByFollower(users[2].id);
  check('findByFollower includes provider', byFollower.some((s) => s.id === sub.id && s.provider?.username === 'td_user'));
  check('findSubscription', (await CopySubscriptionRepository.findSubscription(users[2].id, users[3].id))?.id === sub.id);
  const paused = await CopySubscriptionRepository.pause(users[2].id, users[3].id, 'user request');
  check('pause sets status+suspensionReason', paused.status === 'paused' && paused.suspensionReason === 'user request');
  const resumed = await CopySubscriptionRepository.resume(users[2].id, users[3].id);
  check('resume clears suspension', resumed.status === 'active' && resumed.suspensionReason === '');

  console.log('=== COPY TRADES ===');
  copyTrade = await CopyTradeRepository.create({
    followerId: users[2].id,
    providerId: users[3].id,
    providerTradeId: journal.id,
    symbol: 'EURUSD',
    direction: 'buy',
    providerLotSize: 0.02,
    status: 'pending',
    allocation: 1000,
  });
  check('copy trade create', copyTrade.status === 'pending');
  const executed = await CopyTradeRepository.markExecuted(copyTrade.id, { copiedLotSize: 0.01, followerEntryPrice: 1.0851, slippage: 0.0001 });
  check('markExecuted', executed.status === 'executed' && executed.copiedLotSize === 0.01);
  const closedCT = await CopyTradeRepository.close(copyTrade.id, { followerProfitLoss: 68.5, providerProfitLoss: 137 });
  check('close computes', closedCT.status === 'closed' && closedCT.followerProfitLoss === 68.5 && !!closedCT.closedAt);
  const failedCT = await CopyTradeRepository.create({
    followerId: users[2].id, providerId: users[3].id, symbol: 'EURUSD', direction: 'buy', status: 'pending',
  });
  const failed = await CopyTradeRepository.markFailed(failedCT.id, 'insufficient margin');
  check('markFailed', failed.status === 'failed' && failed.failureReason === 'insufficient margin');
  check('findActiveByFollower excludes closed/failed', (await CopyTradeRepository.findActiveByFollower(users[2].id)).length === 0);

  console.log('=== CLEANUP ===');
  await CopyTradeRepository.delete(failedCT.id);
  await CopyTradeRepository.delete(copyTrade.id);
  await CopySubscriptionRepository.delete(sub.id);
  await TradingAccountRepository.delete(followerAccount.id);
  await TradingBotRepository.delete(bot.id);
  await AnalysisRepository.delete(analysis.id);
  await SignalRepository.delete(signal.id);
  await TradeJournalRepository.delete(openJ.id);
  await TradeJournalRepository.delete(journal2.id);
  await TradeJournalRepository.delete(journal.id);
  await TradingAccountRepository.delete(account.id);
  for (const u of users) await UserRepository.delete(u.id);
  check('all test rows cleaned', !(await UserRepository.findById(users[0].id)));

  console.log(`\n${failures === 0 ? 'ALL PHASE 3 TESTS PASSED' : failures + ' FAILURES'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error('TEST CRASH:', e);
  try {
    if (users.length) for (const u of users) await UserRepository.delete(u.id).catch(() => {});
  } catch (_) {}
  await pool.end();
  process.exit(1);
});