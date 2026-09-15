const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load Models
const {
    PaymentGateway,
    SystemService,
    FeatureFlag,
    SystemConfig
} = require('./models');

const seedSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps');
        console.log('🗑️  Clearing system configurations...');

        await PaymentGateway.deleteMany({});
        await SystemService.deleteMany({});
        await FeatureFlag.deleteMany({});
        await SystemConfig.deleteMany({ key: { $in: ['geo_restrictions', 'maintenance_mode', 'platform_settings'] } });

        // 1. Seed Payment Gateways
        console.log('🌱 Seeding Payment Gateways...');
        await PaymentGateway.insertMany([
            {
                name: 'stripe',
                displayName: 'Stripe',
                isActive: true,
                config: {
                    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
                    secretKey: process.env.STRIPE_SECRET_KEY || '',
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
                    currency: 'USD'
                },
                supportedMethods: ['card', 'bank_transfer']
            },
            {
                name: 'paypal',
                displayName: 'PayPal',
                isActive: false,
                config: {
                    clientId: process.env.PAYPAL_CLIENT_ID || '',
                    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
                    mode: 'sandbox',
                    currency: 'USD'
                },
                supportedMethods: ['paypal']
            }
        ]);

        // 2. Seed System Services
        console.log('🌱 Seeding System Services...');
        await SystemService.insertMany([
            {
                name: 'analyticsService',
                url: 'http://analytics-service:3000',
                healthEndpoint: '/health',
                apiKey: process.env.ANALYTICS_API_KEY || '',
                status: 'online',
                isActive: true,
                description: 'Core analytics and metrics service'
            },
            {
                name: 'marketDataService',
                url: 'http://market-data:3001',
                healthEndpoint: '/health',
                apiKey: process.env.MARKET_DATA_API_KEY || '',
                status: 'online',
                isActive: true,
                description: 'Real-time market data feed'
            },
            {
                name: 'optionsFlowService',
                url: 'http://options-flow-service',
                healthEndpoint: '/health',
                apiKey: '',
                status: 'offline',
                isActive: false,
                description: 'Options flow data integration'
            }
        ]);

        // 3. Seed Feature Flags
        console.log('🌱 Seeding Feature Flags...');
        await FeatureFlag.insertMany([
            { name: 'analytics', enabled: true, requiredTier: 'BASIC', category: 'analysis' },
            { name: 'basicCharts', enabled: true, requiredTier: 'BASIC', category: 'trading' },
            { name: 'advancedCharts', enabled: true, requiredTier: 'PRO', category: 'trading' },
            { name: 'optionsFlowData', enabled: true, requiredTier: 'PRO', category: 'analysis' },
            { name: 'vpsHosting', enabled: true, requiredTier: 'PRO', category: 'platform' },
            { name: 'apiAccess', enabled: true, requiredTier: 'INSTITUTIONAL', category: 'platform' },
            { name: 'customScripting', enabled: true, requiredTier: 'INSTITUTIONAL', category: 'trading' },
            { name: 'priorityExecution', enabled: true, requiredTier: 'INSTITUTIONAL', category: 'trading' }
        ]);

        // 4. Seed Geo-Restrictions
        console.log('🌱 Seeding Geo-Restrictions...');
        await SystemConfig.create({
            key: 'geo_restrictions',
            value: {
                tokenization: { enabled: true, blockedCountries: ['US', 'CN', 'KP', 'IR'] },
                copytrading: { enabled: true, blockedCountries: ['US'] },
                crypto: { enabled: true, blockedCountries: ['KP', 'IR', 'SY', 'CU'] },
                leverage: { enabled: true, limitedCountries: { 'EU': 30, 'GB': 30, 'AU': 30 } },
                mlm: { enabled: true, blockedCountries: ['CN', 'FR'] }
            },
            category: 'security',
            description: 'Country-based feature restrictions'
        });

        // 5. Seed Platform Settings
        console.log('🌱 Seeding Platform Settings...');
        await SystemConfig.create({
            key: 'maintenance_mode',
            value: false,
            category: 'general',
            description: 'Enable to put entire site in maintenance mode'
        });

        console.log('✅ System Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding system: ${error.message}`);
        process.exit(1);
    }
};

seedSystem();
