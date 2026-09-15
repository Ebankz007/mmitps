/**
 * AdminTradingController — PostgreSQL edition.
 * Admin trading management (mirrors Mongo adminTradingController).
 */
const SocialTradingRepository = require('../../repositories/pg/SocialTradingRepository');
const CopySubscriptionRepository = require('../../repositories/pg/CopySubscriptionRepository');
const TradingAccountRepository = require('../../repositories/pg/TradingAccountRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const TradingService = require('../../services/pg/TradingService');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

/** GET /admin/trading/providers */
exports.getAllProviders = catchAsync(async (req, res) => {
  const providers = await SocialTradingRepository.findAll({}, { sort: 'followers', direction: 'desc' });
  res.status(200).json({ success: true, count: providers.length, data: providers });
});

/** PATCH /admin/trading/provider/:id/verify */
exports.toggleVerification = catchAsync(async (req, res) => {
  const provider = await SocialTradingRepository.findById(req.params.id);

  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider profile not found' });
  }

  const { verified } = req.body;
  const updated = await SocialTradingRepository.update(provider.id, {
    verified: typeof verified !== 'undefined' ? verified : !provider.verified,
  });

  res.status(200).json({ success: true, data: updated });
});

/** PATCH /admin/trading/provider/:id/status */
exports.updateProviderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }

  const provider = await SocialTradingRepository.findById(req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider profile not found' });
  }

  const updated = await SocialTradingRepository.update(provider.id, { status });
  res.status(200).json({ success: true, data: updated });
});

/** GET /admin/trading/subscriptions */
exports.getAllSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await CopySubscriptionRepository.findAll({}, { sort: 'createdAt', direction: 'desc' });
  res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
});

/** GET /admin/trading/provider/user/:userId */
exports.getProviderByUserId = catchAsync(async (req, res) => {
  const provider = await SocialTradingRepository.findByUserId(req.params.userId);

  if (!provider) {
    return res.status(404).json({ success: false, error: 'Provider profile not found for this user' });
  }

  res.status(200).json({ success: true, data: provider });
});

/** GET /admin/trading/user/:userId/accounts */
exports.getAccountsByUserId = catchAsync(async (req, res) => {
  const accounts = await TradingAccountRepository.findByUserId(req.params.userId, { sort: 'createdAt', direction: 'desc' });
  res.status(200).json({ success: true, count: accounts.length, data: accounts });
});

/** PATCH /admin/trading/user/:userId/provider-toggle */
exports.toggleProviderStatus = catchAsync(async (req, res) => {
  const user = await UserRepository.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Toggle isProvider flag and sync the role accordingly
  const newIsProvider = !user.isProvider;
  const newRole = newIsProvider ? 'provider' : 'trader';

  await UserRepository.update(user.id, { isProvider: newIsProvider, role: newRole });

  // Ensure a SocialTrading profile exists for the new provider
  if (newIsProvider) {
    const existingProfile = await SocialTradingRepository.findByUserId(user.id);
    if (!existingProfile) {
      await SocialTradingRepository.create({
        userId: user.id,
        displayName: user.username || user.profile?.firstName || user.email.split('@')[0],
        status: 'active',
      });
    }
  }

  res.status(200).json({
    success: true,
    data: { userId: user.id, isProvider: newIsProvider, role: newRole },
  });
});

/** POST /admin/trading/c-book/follow */
exports.createCBookSubscription = catchAsync(async (req, res) => {
  const { providerId, accountId } = req.body;
  const adminId = req.user.id;

  if (!providerId || !accountId) {
    return res.status(400).json({ success: false, error: 'Provider ID and Account ID are required' });
  }

  const subscription = await TradingService.followProvider(adminId, providerId, 0, {
    isCBook: true,
    followerAccountId: accountId,
  });

  res.status(201).json({
    success: true,
    data: subscription,
    message: 'Stealth C-Book subscription created successfully',
  });
});

/** POST /admin/trading/accounts */
exports.addTradingAccount = catchAsync(async (req, res) => {
  const { name, login, password, server, platform } = req.body;
  const adminId = req.user.id;

  if (!login || !password || !server) {
    return res.status(400).json({ success: false, error: 'Missing required fields (login, password, server)' });
  }

  // Check if account already exists for this admin
  const existing = await TradingAccountRepository.findOne({ userId: adminId, login, server });
  if (existing) {
    return res.status(400).json({ success: false, error: 'This account is already connected' });
  }

  const normalizedPlatform = (platform || 'mt4').toLowerCase();

  const account = await TradingAccountRepository.create({
    userId: adminId,
    name: name || `C-Book ${login}`,
    login,
    accountNumber: login,
    password,
    server,
    platform: normalizedPlatform,
    isBalanceSync: true,
    status: 'active',
  });

  res.status(201).json({
    success: true,
    data: account,
    message: 'Trading account added successfully',
  });
});