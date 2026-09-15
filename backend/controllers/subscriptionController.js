const SubscriptionService = require('../services/SubscriptionService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getMySubscription = catchAsync(async (req, res) => {
    const subscription = await SubscriptionService.getSubscription(req.user._id);
    res.status(200).json(new ApiResponse(true, subscription, 'Subscription retrieved'));
});

exports.subscribe = catchAsync(async (req, res) => {
    const { planCode, serviceKey } = req.body;
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('[CRITICAL DEBUG] Subscription Request Body:', JSON.stringify(req.body));
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    if (!planCode) {
        throw new Error('Plan code is required');
    }
    const subscription = await SubscriptionService.subscribe(req.user._id, planCode, serviceKey);
    res.status(201).json(new ApiResponse(true, subscription, 'Subscribed successfully'));
});

exports.cancelSubscription = catchAsync(async (req, res) => {
    const subscription = await SubscriptionService.cancelSubscription(req.user._id);
    res.status(200).json(new ApiResponse(true, subscription, 'Subscription canceled'));
});

exports.getAvailablePlans = catchAsync(async (req, res) => {
    const plans = await SubscriptionService.getAvailablePlans();
    res.status(200).json(new ApiResponse(true, plans, 'Available plans retrieved'));
});
