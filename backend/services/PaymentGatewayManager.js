const ApiServiceManager = require('./ApiServiceManager');

class PaymentGatewayManager {
    constructor() {
        this.stripe = null;
    }

    async getStripe() {
        if (this.stripe) return this.stripe;

        const config = await ApiServiceManager.getConfig();
        const stripeConfig = config.payments.stripe;

        if (stripeConfig.secretKey && stripeConfig.status === 'active') {
            this.stripe = require('stripe')(stripeConfig.secretKey);
        }
        return this.stripe;
    }

    async getCellulantConfig() {
        const config = await ApiServiceManager.getConfig();
        if (config.payments.cellulant && config.payments.cellulant.status === 'active') {
            return config.payments.cellulant;
        }
        return null;
    }

    async getCoinPaymentsConfig() {
        const config = await ApiServiceManager.getConfig();
        if (config.payments.coinpayments && config.payments.coinpayments.status === 'active') {
            return config.payments.coinpayments;
        }
        return null;
    }

    async getKorapayConfig() {
        const config = await ApiServiceManager.getConfig();
        if (config.payments.korapay && config.payments.korapay.status === 'active') {
            return config.payments.korapay;
        }
        return null;
    }

    async createCustomer(user) {
        console.log(`[PaymentGateway] Creating customer for ${user.email}`);
        const stripe = await this.getStripe();

        if (stripe) {
            return await stripe.customers.create({ email: user.email });
        }

        return { id: 'cus_mock_' + Date.now() };
    }

    async createSubscription(customerId, planId, paymentMethodId) {
        console.log(`[PaymentGateway] Creating subscription for ${customerId} on plan ${planId}`);
        // Logic to create stripe subscription
        return { id: 'sub_mock_456', status: 'active' };
    }

    async handleWebhook(event) {
        console.log(`[PaymentGateway] Handling webhook type: ${event.type}`);
        // Normalize event and notify SubscriptionManager
    }
}

module.exports = new PaymentGatewayManager();
