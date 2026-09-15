const TradingAccount = require('../models/Trading/TradingAccount');
const { encrypt } = require('../utils/crypto');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// @desc    Connect a trading account
// @route   POST /api/v1/trading/accounts
// @access  Private
exports.connectAccount = catchAsync(async (req, res) => {
    const { platform, accountNumber, password, apiKey, apiSecret, server, broker, accountName } = req.body;
    const userId = req.user.id;

    // Check if account already exists for this user/platform
    const existing = await TradingAccount.findOne({ user: userId, accountNumber, platform });
    if (existing) {
        return res.status(400).json({ success: false, error: 'Account already connected' });
    }

    const accountData = {
        user: userId,
        platform,
        accountNumber,
        server,
        broker,
        accountName: accountName || `${platform.toUpperCase()} Account`,
        status: 'connected' // Mocking successful connection for now
    };

    if (password) accountData.password = encrypt(password);
    if (apiKey) accountData.apiKey = encrypt(apiKey);
    if (apiSecret) accountData.apiSecret = encrypt(apiSecret);

    const account = await TradingAccount.create(accountData);

    res.status(201).json({
        success: true,
        data: account
    });
});

// @desc    Get user's connected accounts
// @route   GET /api/v1/trading/accounts
// @access  Private
exports.getMyAccounts = catchAsync(async (req, res) => {
    const accounts = await TradingAccount.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
    });
});

// @desc    Disconnect/Delete a trading account
// @route   DELETE /api/v1/trading/accounts/:id
// @access  Private
exports.disconnectAccount = catchAsync(async (req, res) => {
    const account = await TradingAccount.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    if (!account) {
        return res.status(404).json({ success: false, error: 'Account not found or unauthorized' });
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Sync account statistics (Online Dashboard)
// @route   POST /api/v1/trading/accounts/:id/sync
// @access  Private
exports.syncAccountStats = catchAsync(async (req, res) => {
    const account = await TradingAccount.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!account) {
        throw new ApiError(404, 'Account not found');
    }

    // Mocking an "Online Sync" from the broker/platform
    // In a real scenario, this would call an external API or use a socket
    const mockPnL = (Math.random() * 200) - 50; // Random gain/loss
    
    account.stats = {
        balance: (account.stats?.balance || 5000) + mockPnL,
        equity: (account.stats?.equity || 5000) + mockPnL - 10, // spread/commissions
        dayPnL: mockPnL,
        totalPnL: (account.stats?.totalPnL || 0) + mockPnL,
        lastSyncedAt: new Date()
    };

    await account.save();

    res.status(200).json({
        success: true,
        data: account.stats
    });
});
