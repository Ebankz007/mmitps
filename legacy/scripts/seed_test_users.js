const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
const Plan = require('./backend/models/Plan');
const Subscription = require('./backend/models/Subscription');
require('dotenv').config();

async function seedTestUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create Plans if they don't exist
        const plans = [
            { name: 'Basic', code: 'BASIC', price: 0, features: { 'dashboard': true, 'charts': true } },
            { name: 'Pro', code: 'PRO', price: 99, features: { 'dashboard': true, 'charts': true, 'tradingAgents': true, 'advancedCharts': true } }
        ];

        for (const p of plans) {
            await Plan.findOneAndUpdate({ code: p.code }, p, { upsert: true });
        }
        console.log('Plans seeded');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        // 2. Create Users
        const users = [
            { email: 'basic@example.com', username: 'basicuser', password, role: 'user', referralCode: 'BASICREF' },
            { email: 'pro@example.com', username: 'prouser', password, role: 'user', referralCode: 'PROREF' },
            { email: 'admin@example.com', username: 'adminuser', password, role: 'admin', referralCode: 'ADMINREF' }
        ];

        for (const u of users) {
            const user = await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });

            // Assign Subscriptions
            if (u.email === 'basic@example.com') {
                const plan = await Plan.findOne({ code: 'BASIC' });
                await Subscription.findOneAndUpdate(
                    { user: user._id },
                    { plan: plan._id, status: 'active', startDate: new Date() },
                    { upsert: true }
                );
            } else if (u.email === 'pro@example.com') {
                const plan = await Plan.findOne({ code: 'PRO' });
                await Subscription.findOneAndUpdate(
                    { user: user._id },
                    { plan: plan._id, status: 'active', startDate: new Date() },
                    { upsert: true }
                );
            }
        }
        console.log('Test users and subscriptions seeded');

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedTestUsers();
