const AuthService = require('../services/AuthService');
const TokenService = require('../services/TokenService');
const UserService = require('../services/UserService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');

// Ensure models are loaded
require('../models/Subscription');
const Subscription = mongoose.model('Subscription');
const logger = require('../utils/logger');

exports.register = catchAsync(async (req, res) => {
    const { user, tokens } = await AuthService.register(req.body);
    const result = {
        user,
        token: tokens.access.token,
        refreshToken: tokens.refresh.token,
        tokens
    };
    const response = new ApiResponse(true, result, 'Registration successful');
    response.token = tokens.access.token;
    response.user = user;
    res.status(201).json(response);
});

exports.login = catchAsync(async (req, res) => {
    console.log('[DEBUG AUTH] Incoming login request:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password);
    console.log('[DEBUG AUTH] Controller: AuthService.login returned success. Fetching subscriptions...');

    // Fetch Active Subscriptions
    const userId = user.id || user._id;
    const activeSubs = await Subscription.find({
        user: userId,
        status: { $in: ['active', 'trialing'] }
    }).populate('plan');

    // Enrich user response
    const userResponse = {
        ...user,
        membershipTier: user.preferences?.membershipTier || 'Basic',
        activeServices: user.preferences?.activeServices || [],
        subscriptions: activeSubs.map(s => ({
            id: s._id,
            type: s.type,
            serviceKey: s.serviceKey,
            status: s.status,
            plan: s.plan ? {
                name: s.plan.name,
                code: s.plan.code,
                type: s.plan.type,
                interval: s.plan.interval
            } : null,
            currentPeriodEnd: s.currentPeriodEnd
        }))
    };

    const result = {
        user: userResponse,
        token: tokens.access.token,
        refreshToken: tokens.refresh.token,
        tokens
    };

    const response = new ApiResponse(true, result, 'Login successful');
    // Hybrid support for legacy api_real.js (top level) and modern AuthService.js (data.data)
    response.token = tokens.access.token;
    response.user = userResponse;

    res.status(200).json(response);
});

exports.logout = catchAsync(async (req, res) => {
    await AuthService.logout(req.body.refreshToken);
    res.status(200).json(new ApiResponse(true, null, 'Logged out successfully'));
});

exports.getMe = catchAsync(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const user = await UserService.findById(userId);
    res.status(200).json(new ApiResponse(true, user, 'User profile retrieved'));
});

exports.forgotPassword = catchAsync(async (req, res) => {
    await AuthService.forgotPassword(req.body.email);
    res.status(200).json(new ApiResponse(true, null, 'Email sent'));
});

exports.resetPassword = catchAsync(async (req, res) => {
    await AuthService.resetPassword(req.params.token, req.body.password);
    res.status(200).json(new ApiResponse(true, null, 'Password reset successful'));
});

exports.sendMagicLink = catchAsync(async (req, res) => {
    await AuthService.sendMagicLink(req.body.email);
    res.status(200).json(new ApiResponse(true, null, 'Magic link sent to your email'));
});

exports.verifyMagicLink = catchAsync(async (req, res) => {
    const { user, tokens } = await AuthService.verifyMagicLink(req.body.token);
    res.status(200).json(new ApiResponse(true, { user, token: tokens.access.token, tokens }, 'Magic link verified'));
});

exports.syncSocialUser = catchAsync(async (req, res) => {
    const { user, tokens } = await AuthService.syncSocialUser(req.body);
    res.status(200).json(new ApiResponse(true, { user, token: tokens.access.token, tokens }, 'Social user synced'));
});
exports.refreshSession = catchAsync(async (req, res) => {
    const tokens = await TokenService.generateAuthTokens(req.user);
    res.status(200).json(new ApiResponse(true, { tokens, token: tokens.access.token }, 'Session extended successfully'));
});
