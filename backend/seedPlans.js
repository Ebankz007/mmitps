// Script to seed initial subscription plans to the database
require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const Plan = require('./models/Plan');

const plans = [
    {
        name: 'Basic',
        code: 'BASIC',
        description: 'Perfect for getting started with essential trading tools',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
            analytics: true,
            basicCharts: true,
            tradingAgents: 1,
            communityAccess: true,
            advancedCharts: false,
            optionsFlowData: false,
            vpsHosting: false,
            apiAccess: false,
            customScripting: false,
            priorityExecution: false
        },
        rateLimits: {
            apiCallsPerDay: 1000,
            wsConnectionsPerSession: 1
        },
        type: 'membership',
        isActive: true
    },
    {
        name: 'Advanced',
        code: 'ADVANCED',
        description: 'One-time registration fee. Access advanced market analytics and institutional tools.',
        price: 249,
        currency: 'USD',
        billingCycle: 'lifetime',
        features: {
            analytics: true,
            basicCharts: true,
            tradingAgents: 10,
            communityAccess: true,
            advancedCharts: true,
            optionsFlowData: false,
            vpsHosting: false,
            apiAccess: false,
            customScripting: false,
            priorityExecution: false
        },
        rateLimits: {
            apiCallsPerDay: 5000,
            wsConnectionsPerSession: 2
        },
        type: 'membership',
        isActive: true
    },
    {
        name: 'Pro',
        code: 'PRO',
        description: 'For serious traders who need advanced analytics and tools',
        price: 499,
        currency: 'USD',
        billingCycle: 'lifetime',
        features: {
            analytics: true,
            basicCharts: true,
            tradingAgents: 25,
            communityAccess: true,
            advancedCharts: true,
            optionsFlowData: true,
            vpsHosting: true,
            apiAccess: false,
            customScripting: false,
            priorityExecution: false
        },
        rateLimits: {
            apiCallsPerDay: 10000,
            wsConnectionsPerSession: 5
        },
        type: 'membership',
        isActive: true
    }
];

const seedPlans = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mmitps');
        console.log('✅ Connected to MongoDB');

        // Clear existing plans
        await Plan.deleteMany({});
        console.log('🗑️  Cleared existing plans');

        // Insert new plans
        const createdPlans = await Plan.insertMany(plans);
        console.log(`✅ Seeded ${createdPlans.length} subscription plans`);

        createdPlans.forEach(plan => {
            console.log(`   - ${plan.name} (${plan.code}): $${plan.price}/${plan.billingCycle}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding plans:', error);
        process.exit(1);
    }
};

// Run seeder
seedPlans();
