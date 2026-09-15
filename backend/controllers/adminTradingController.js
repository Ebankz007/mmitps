const SocialTrading = require('../models/SocialTrading');
const CopySubscription = require('../models/Trading/CopySubscription');
const TradingAccount = require('../models/Trading/TradingAccount');
const User = require('../models/User');

// @desc    Get all social trading providers
// @route   GET /api/v1/admin/trading/providers
// @access  Private/Admin
exports.getAllProviders = async (req, res) => {
    try {
        const providers = await SocialTrading.find()
            .populate('userId', 'username email role isActive')
            .sort({ followers: -1 });

        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Toggle provider verification status
// @route   PATCH /api/v1/admin/trading/provider/:id/verify
// @access  Private/Admin
exports.toggleVerification = async (req, res) => {
    try {
        const provider = await SocialTrading.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider profile not found' });
        }

        const { verified } = req.body;
        provider.verified = typeof verified !== 'undefined' ? verified : !provider.verified;
        await provider.save();

        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update provider status (active, inactive, suspended)
// @route   PATCH /api/v1/admin/trading/provider/:id/status
// @access  Private/Admin
exports.updateProviderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status value' });
        }

        const provider = await SocialTrading.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider profile not found' });
        }

        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all copy trading subscriptions
// @route   GET /api/v1/admin/trading/subscriptions
// @access  Private/Admin
exports.getAllSubscriptions = async (req, res) => {
    try {
        let subscriptions = await CopySubscription.find()
            .populate('follower', 'username email')
            .populate('provider', 'username email')
            .sort({ createdAt: -1 });

        // Filter out orphans (where follower or provider no longer exists)
        subscriptions = subscriptions.filter(s => s.follower && s.provider);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get provider profile by user ID
// @route   GET /api/v1/admin/trading/provider/user/:userId
// @access  Private/Admin
exports.getProviderByUserId = async (req, res) => {
    try {
        const provider = await SocialTrading.findOne({ userId: req.params.userId })
            .populate('userId', 'username email role isActive');

        if (!provider) {
            return res.status(404).json({ success: false, error: 'Provider profile not found for this user' });
        }

        res.status(200).json({ success: true, data: provider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all broker trading accounts for a user
// @route   GET /api/v1/admin/trading/user/:userId/accounts
// @access  Private/Admin
exports.getAccountsByUserId = async (req, res) => {
    try {
        const accounts = await TradingAccount.find({ userId: req.params.userId })
            .select('-credentials')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: accounts.length,
            data: accounts
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Toggle isProvider (Master Trader) status on a User
// @route   PATCH /api/v1/admin/trading/user/:userId/provider-toggle
// @access  Private/Admin
exports.toggleProviderStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Toggle isProvider flag and sync the role accordingly
        user.isProvider = !user.isProvider;
        if (user.isProvider) {
            // Promote to provider role so authorize('provider') middleware grants access
            user.role = 'provider';
            // Ensure a SocialTrading profile exists for this provider
            const SocialTrading = require('../models/SocialTrading');
            const existingProfile = await SocialTrading.findOne({ userId: user._id });
            if (!existingProfile) {
                await SocialTrading.create({
                    userId: user._id,
                    displayName: user.username || user.profile?.firstName || user.email.split('@')[0],
                    status: 'active'
                });
            }
        } else {
            // Demote back to trader role
            user.role = 'trader';
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: { userId: user._id, isProvider: user.isProvider, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Admin initiates a C-Book (stealth) subscription
// @route   POST /api/v1/admin/trading/c-book/follow
// @access  Private/Admin
exports.createCBookSubscription = async (req, res) => {
    try {
        const { providerId, accountId } = req.body;
        const adminId = req.user._id;

        if (!providerId || !accountId) {
            return res.status(400).json({ success: false, error: 'Provider ID and Account ID are required' });
        }

        const TradingService = require('../services/trading/TradingService');
        const subscription = await TradingService.followProvider(adminId, providerId, 0, {
            isCBook: true,
            followerAccountId: accountId
        });

        res.status(201).json({
            success: true,
            data: subscription,
            message: 'Stealth C-Book subscription created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Add a single trading account for the admin
// @route   POST /api/v1/admin/trading/accounts
// @access  Private/Admin
exports.addTradingAccount = async (req, res) => {
    try {
        const { name, login, password, server, platform } = req.body;
        const adminId = req.user._id;

        if (!login || !password || !server) {
            return res.status(400).json({ success: false, error: 'Missing required fields (login, password, server)' });
        }

        // Check if account already exists for this admin
        const existing = await TradingAccount.findOne({ user: adminId, login, server });
        if (existing) {
            return res.status(400).json({ success: false, error: 'This account is already connected' });
        }

        const normalizedPlatform = (platform || 'mt4').toLowerCase();

        const account = await TradingAccount.create({
            user: adminId,
            userId: adminId,
            name: name || `C-Book ${login}`,
            login,
            // accountNumber needed by model:
            accountNumber: login,
            password, 
            server,
            platform: normalizedPlatform,
            isBalanceSync: true,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: account,
            message: 'Trading account added successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
