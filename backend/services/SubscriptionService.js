const SubscriptionRepository = require('../repositories/SubscriptionRepository');
const PlanRepository = require('../repositories/PlanRepository');
const UserRepository = require('../repositories/UserRepository');
const BaseService = require('./BaseService');
const ApiError = require('../utils/ApiError');

class SubscriptionService extends BaseService {
    constructor() {
        super(SubscriptionRepository);
    }

    async getSubscriptions(userId) {
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
        // Check if user already has this tier or better (Simplified: just allow upgrade/update)

        const sub = await SubscriptionRepository.create({
            user: user._id,
            plan: plan._id,
            type: 'membership',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: null // Lifetime
        });

        // Update User Model (Corrected Path)
        await UserRepository.update(user._id, {
            'preferences.membershipTier': plan.name
        });

        // Trigger Multi-Level Referral Commissions (5 levels, 10% each)
        if (plan.price > 0) {
            const CommissionService = require('./mlm/CommissionService');
            try {
                await CommissionService.calculateMultiLevelReferral(user._id, plan.price, 'registration');
            } catch (error) {
                console.error('Failed to calculate multi-level referral commissions:', error);
            }
        }

        return sub;
    }

    async _handleServicePurchase(user, plan, serviceKey) {
        console.log('[DEBUG] Handler Service Purchase:', { userId: user._id, planCode: plan.code, serviceKey });
        if (!serviceKey) {
            throw ApiError.badRequest('Service key is required for service subscriptions [v2]');
        }

        // Check if User's Membership Tier allows this service (Corrected Path)
        const currentTier = user.preferences?.membershipTier || 'Basic';
        const membershipPlan = await PlanRepository.model.findOne({ name: currentTier, type: 'membership' });

        if (!membershipPlan || !membershipPlan.allowedServices.includes(serviceKey)) {
            throw ApiError.forbidden(`Your current tier (${currentTier}) does not allow subscribing to ${serviceKey}. Please upgrade your membership.`);
        }

        // Check for existing active subscription for THIS specific service
        const activeSubs = await SubscriptionRepository.findActiveByUser(user._id);
        const existingSvcSub = activeSubs.find(s => s.serviceKey === serviceKey);

        if (existingSvcSub) {
            throw ApiError.conflict(`You already have an active subscription for ${serviceKey}`);
        }

        // Calculate period end based on interval
        let periodEnd = new Date();
        if (plan.interval === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
        else if (plan.interval === 'quarter') periodEnd.setMonth(periodEnd.getMonth() + 3);
        else if (plan.interval === 'year') periodEnd.setFullYear(periodEnd.getFullYear() + 1);

        const sub = await SubscriptionRepository.create({
            user: user._id,
            plan: plan._id,
            type: 'service',
            serviceKey: serviceKey,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd
        });

        // Update User Model's activeServices array (Corrected Path)
        await UserRepository.update(user._id, {
            $addToSet: { 'preferences.activeServices': serviceKey }
        });

        // Trigger Multi-Level Referral Commissions for Service Subscription (5 levels, 10% each)
        if (plan.price > 0) {
            const CommissionService = require('./mlm/CommissionService');
            try {
                await CommissionService.calculateMultiLevelReferral(user._id, plan.price, 'subscription');
            } catch (error) {
                console.error('Failed to calculate multi-level referral commissions:', error);
            }
        }

        return sub;
    }

    async cancelSubscription(userId, subscriptionId) {
        // Need to allow canceling specific subscription
        const sub = await SubscriptionRepository.findById(subscriptionId);
        if (!sub || sub.user.toString() !== userId.toString()) {
            throw ApiError.notFound('Subscription not found');
        }

        const updatedSub = await SubscriptionRepository.update(sub._id, {
            status: 'canceled',
            cancelAtPeriodEnd: true
        });

        // If it's a service, we'll eventually need a job to remove it from user.activeServices 
        // when currentPeriodEnd arrives. For now, manual/immediate removal isn't desired if it's "cancel at end".

        return updatedSub;
    }
}

module.exports = new SubscriptionService();
