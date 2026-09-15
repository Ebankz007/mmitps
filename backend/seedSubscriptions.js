const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
const { User } = require('./models/index');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

const basePlans = [
    {
        name: 'Basic',
        code: 'BASIC',
        price: 0,
        features: {
            'analytics_dashboard': true,
            'trading_station': true,
            'basic_charts': true
        },
        limits: { 'max_agents': 1 }
    },
    {
        name: 'Pro',
        code: 'PRO',
        price: 99,
        features: {
            'analytics_dashboard': true,
            'trading_station': true,
            'advanced_charts': true,
            'options_flow': true,
            'vps_hosting': true,
            'ai_agent': true
        },
        limits: { 'max_agents': 5 }
    },
    {
        name: 'Institutional',
        code: 'INSTITUTIONAL',
        price: 499,
        features: {
            'analytics_dashboard': true,
            'trading_station': true,
            'institutional_tools': true,
            'custom_scripting': true,
            'api_access': true,
            'priority_support': true
        },
        limits: { 'max_agents': 100 }
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('🗑️  Clearing existing Plans and Subscriptions...');
        await Plan.deleteMany({});
        await Subscription.deleteMany({});

        console.log('🌱 Seeding Base Plans...');
        const createdPlans = await Plan.insertMany(basePlans);
        const proPlan = createdPlans.find(p => p.code === 'PRO');

        const users = await User.find({ username: { $in: ['admin', 'superadmin'] } });

        for (const user of users) {
            console.log(`🔗 Linking ${user.username} to PRO subscription...`);
            await Subscription.create({
                user: user._id,
                plan: proPlan._id,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            });
        }

        console.log('✅ Subscription data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
