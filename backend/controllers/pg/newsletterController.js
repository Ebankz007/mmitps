/**
 * newsletterController — PostgreSQL edition.
 * Mirrors the Mongo controllers/newsletterController.
 */
const NewsletterRepository = require('../../repositories/pg/NewsletterRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.subscribe = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email required');

  const existing = await NewsletterRepository.findByEmail(email);
  if (existing) {
    if (existing.status === 'active') {
      throw new ApiError(400, 'Already subscribed');
    }
    const updated = await NewsletterRepository.update(existing.id, {
      status: 'active',
      subscribedAt: new Date(),
    });
    return res.status(200).json(new ApiResponse(true, updated, 'Subscription reactivated'));
  }

  const subscriber = await NewsletterRepository.create({
    email,
    status: 'active',
    subscribedAt: new Date(),
  });
  res.status(201).json(new ApiResponse(true, subscriber, 'Subscribed successfully'));
});

exports.unsubscribe = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email required');

  const existing = await NewsletterRepository.findByEmail(email);
  if (!existing) throw new ApiError(404, 'Subscription not found');

  const updated = await NewsletterRepository.update(existing.id, {
    status: 'unsubscribed',
    unsubscribedAt: new Date(),
  });
  res.status(200).json(new ApiResponse(true, updated, 'Unsubscribed'));
});