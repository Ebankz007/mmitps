const mongoose = require('mongoose');
const Plan = require('./backend/models/Plan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

const plans = [
    {
        name: 'Basic',
        code: 'BASIC',
        price: 0,
        features: {
            'analytics_dashboard': true,
            'basic_charts': true,
            'agent_builder': true
        },
        limits: {
            'max_agents': 1
        }
    },
    {
        name: 'Pro',
        code: 'PRO',
        price: 99,
        features: {
            'analytics_dashboard': true,
            'advanced_charts': true,
            'agent_builder': true,
            'options_flow': true,
            'vps_hosting': true
        },
        limits: {
            'max_agents': 5
        }
    },
    {
        name: 'Institutional',
        code: 'INSTITUTIONAL',
        price: 499,
        features: {
            'analytics_dashboard': true,
            'institutional_tools': true,
            'agent_builder': true,
            'custom_scripting': true,
            'priority_execution': true,
            'api_access': true
        },
        limits: {
            'max_agents': 100
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Plan.deleteMany({}); // Clear existing
        await Plan.insertMany(plans);

        console.log('Subscription plans seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
