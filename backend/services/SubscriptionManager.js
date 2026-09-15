const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');

class SubscriptionManager {
    constructor() {
        // Dependencies will be injected or required
        this.paymentGateway = require('./PaymentGatewayManager');
    }

    async getPlanByCode(code) {
        return await Plan.findOne({ code });
    }

    async createSubscription(userId, planCode, paymentMethodId) {
        // 1. Get Plan
        const plan = await this.getPlanByCode(planCode);
        if (!plan) throw new Error('Invalid plan code');

        // 2. Call Payment Gateway to create/update customer & subscription
        // const stripeResult = await this.paymentGateway.createSubscription(userId, plan, paymentMethodId);

        // 3. Create Local Subscription Record
        // ... implementation placeholder ...

        return { status: 'pending', message: 'Subscription creation initiated' };
    }

    async getUserSubscription(userId) {
        return await Subscription.findOne({ user: userId }).populate('plan');
    }

    async checkAccess(userId, requiredFeature) {
        const sub = await this.getUserSubscription(userId);
        if (!sub || sub.status !== 'active') return false;

        return sub.plan.features.get(requiredFeature) === true;
    }
}

module.exports = new SubscriptionManager();
