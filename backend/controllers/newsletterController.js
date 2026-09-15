const { Newsletter } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Subscribe to newsletter
 * @route POST /api/v1/newsletter/subscribe
 * @access Public
 */
exports.subscribe = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(new ApiResponse(false, null, 'Email is required'));
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
        if (existing.status === 'active') {
            return res.status(400).json(new ApiResponse(false, null, 'Email is already subscribed'));
        }

        // Re-activate if unsubscribed
        existing.status = 'active';
        await existing.save();
        return res.status(200).json(new ApiResponse(true, null, 'Re-subscribed successfully'));
    }

    await Newsletter.create({ email });

    res.status(201).json(new ApiResponse(true, null, 'Thank you for subscribing to our newsletter!'));
});

/**
 * Unsubscribe from newsletter
 * @route POST /api/v1/newsletter/unsubscribe
 * @access Public
 */
exports.unsubscribe = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(new ApiResponse(false, null, 'Email is required'));
    }

    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
        return res.status(404).json(new ApiResponse(false, null, 'Subscription not found'));
    }

    subscription.status = 'unsubscribed';
    await subscription.save();

    res.status(200).json(new ApiResponse(true, null, 'You have been unsubscribed from our newsletter.'));
});
