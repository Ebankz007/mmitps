const mongoose = require('mongoose');
const Plan = require('./backend/models/Plan');
const Subscription = require('./backend/models/Subscription');
const User = require('./backend/models/User');
const { SystemService, SystemConfig, PaymentGateway, FeatureFlag } = require('./backend/models');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Seed Plans
        const plansData = [
            { name: 'Basic', code: 'BASIC', price: 0, interval: 'month', isActive: true },
            { name: 'Pro', code: 'PRO', price: 99, interval: 'month', isActive: true },
            { name: 'Institutional', code: 'INSTITUTIONAL', price: 499, interval: 'month', isActive: true }
        ];

        for (const pd of plansData) {
            await Plan.findOneAndUpdate({ code: pd.code }, pd, { upsert: true, new: true });
        }
        console.log('Plans seeded');

        // 2. Clear System Config & Services for fresh start
        await SystemConfig.deleteMany({ key: { $in: ['general_site_name', 'support_email', 'geo_restrictions'] } });
        await SystemService.deleteMany({});
        await PaymentGateway.deleteMany({});
        await FeatureFlag.deleteMany({});

        // 3. Seed System Config
        await SystemConfig.create([
            { key: 'general_site_name', value: 'MMITPS Platform', category: 'general' },
            { key: 'support_email', value: 'support@mmitps.com', category: 'general' },
            {
                key: 'geo_restrictions',
                value: {
                    tokenization: { enabled: true, blockedCountries: ['KP', 'IR'] },
                    copytrading: { enabled: true, blockedCountries: ['US'] }
                },
                category: 'security'
            }
        ]);
        console.log('System settings seeded');

        // 4. Seed Services
        await SystemService.create([
            { name: 'Email Service', url: 'http://localhost:5006/api/v1/services/email', isActive: true, status: 'online' },
            { name: 'KYC Provider', url: 'https://api.veriff.me', isActive: true, status: 'online' }
        ]);
        console.log('Services seeded');

        // 5. Seed Payment Gateways
        await PaymentGateway.create([
            { name: 'stripe', displayName: 'Stripe (Credit Card)', isActive: true, config: { currency: 'USD' }, supportedMethods: ['card'] },
            { name: 'coinpayments', displayName: 'Crypto (BTC/USDT)', isActive: true, config: { currency: 'USD' }, supportedMethods: ['crypto'] }
        ]);
        console.log('Payment gateways seeded');

        // 6. Seed Feature Flags
        await FeatureFlag.create([
            { name: 'AI_TRADING', enabled: true, requiredTier: 'PRO', category: 'trading' },
            { name: 'VPS_HOSTING', enabled: false, requiredTier: 'INSTITUTIONAL', category: 'platform' }
        ]);
        console.log('Feature flags seeded');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
