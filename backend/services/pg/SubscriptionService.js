/**
 * SubscriptionService — PostgreSQL edition.
 * Mirrors the Mongo SubscriptionService on the pg stack.
 */
const SubscriptionRepository = require('../../repositories/pg/SubscriptionRepository');
const PlanRepository = require('../../repositories/pg/PlanRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');

class SubscriptionService {
  async getSubscriptions(userId) {
    return SubscriptionRepository.findActiveByUser(userId);
  }

  async getSubscription(userId) {
    return SubscriptionRepository.findActiveByUser(userId);
  }

  async getAvailablePlans() {
    return PlanRepository.findActive();
  }

  async subscribe(userId, planCode, serviceKey = null) {
    // 1. Check if plan exists
    const plan = await PlanRepository.findByCode(planCode);
    if (!plan) {
      throw ApiError.notFound('Plan not found');
    }

    // 2. Fetch User
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // 3. Logic based on Plan Type
    if (plan.type === 'membership') {
      return this._handleMembershipPurchase(user, plan);
    } else {
      return this._handleServicePurchase(user, plan, serviceKey);
    }
  }

  async _handleMembershipPurchase(user, plan) {
    // Membership is lifetime/one-time
    const sub = await SubscriptionRepository.create({
      userId: user.id,
      planId: plan.id,
      type: 'membership',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: null, // Lifetime
    });

    // Update User preferences.membershipTier
    const preferences = {
      ...(user.preferences || {}),
      membershipTier: plan.name,
    };
    await UserRepository.update(user.id, { preferences });

    // Trigger Multi-Level Referral Commissions (5 levels, 10% each)
    if (Number(plan.price) > 0) {
      const CommissionService = require('./CommissionService');
      try {
        await CommissionService.calculateMultiLevelReferral(user.id, Number(plan.price), 'registration');
      } catch (error) {
        console.error('Failed to calculate multi-level referral commissions:', error);
      }
    }

    return sub;
  }

  async _handleServicePurchase(user, plan, serviceKey) {
    console.log('[DEBUG] Handler Service Purchase:', { userId: user.id, planCode: plan.code, serviceKey });
    if (!serviceKey) {
      throw ApiError.badRequest('Service key is required for service subscriptions [v2]');
    }

    // Check if User's Membership Tier allows this service
    const currentTier = user.preferences?.membershipTier || 'Basic';
    const membershipPlan = await PlanRepository.findOne({ name: currentTier, type: 'membership' });

    if (!membershipPlan || !(membershipPlan.allowedServices || []).includes(serviceKey)) {
      throw ApiError.forbidden(`Your current tier (${currentTier}) does not allow subscribing to ${serviceKey}. Please upgrade your membership.`);
    }

    // Check for existing active subscription for THIS specific service
    const activeSubs = await SubscriptionRepository.findActiveByUser(user.id);
    const existingSvcSub = activeSubs.find(s => s.serviceKey === serviceKey);

    if (existingSvcSub) {
      throw ApiError.conflict(`You already have an active subscription for ${serviceKey}`);
    }

    // Calculate period end based on interval
    const periodEnd = new Date();
    if (plan.interval === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (plan.interval === 'quarter') periodEnd.setMonth(periodEnd.getMonth() + 3);
    else if (plan.interval === 'year') periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const sub = await SubscriptionRepository.create({
      userId: user.id,
      planId: plan.id,
      type: 'service',
      serviceKey,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    });

    // Update User preferences.activeServices (add if missing)
    const activeServices = new Set(user.preferences?.activeServices || []);
    activeServices.add(serviceKey);
    await UserRepository.update(user.id, {
      preferences: { ...(user.preferences || {}), activeServices: [...activeServices] },
    });

    // Trigger Multi-Level Referral Commissions for Service Subscription
    if (Number(plan.price) > 0) {
      const CommissionService = require('./CommissionService');
      try {
        await CommissionService.calculateMultiLevelReferral(user.id, Number(plan.price), 'subscription');
      } catch (error) {
        console.error('Failed to calculate multi-level referral commissions:', error);
      }
    }

    return sub;
  }

  async cancelSubscription(userId, subscriptionId) {
    const sub = await SubscriptionRepository.findById(subscriptionId);
    if (!sub || sub.userId !== userId) {
      throw ApiError.notFound('Subscription not found');
    }

    return SubscriptionRepository.update(sub.id, {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    });
  }
}

module.exports = new SubscriptionService();