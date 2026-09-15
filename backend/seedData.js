const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') }); // repo-root .env (D1 fix: dead ./config/config.env removed)

// Load Models
const User = require('./models/User');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Data to Seed
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
            communityAccess: true
        },
        limits: {
            tradingAgents: 1
        },
        type: 'membership',
        isActive: true
    },
    {
        name: 'Pro',
        code: 'PRO',
        description: 'For serious traders who need advanced analytics and tools',
        price: 99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
            analytics: true,
            basicCharts: true,
            communityAccess: true,
            advancedCharts: true,
            optionsFlowData: true
        },
        limits: {
            tradingAgents: 5
        },
        type: 'membership',
        isActive: true
    },
    {
        name: 'Institutional',
        code: 'INSTITUTIONAL',
        description: 'Enterprise-grade platform for professional trading operations',
        price: 499,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
            analytics: true,
            basicCharts: true,
            communityAccess: true,
            advancedCharts: true,
            optionsFlowData: true,
            apiAccess: true,
            priorityExecution: true
        },
        limits: {
            tradingAgents: 100
        },
        type: 'membership',
        isActive: true
    }
];

const users = [
    {
        username: 'admin',
        email: 'admin@mmitps.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        referralCode: 'ADMIN_REF'
    },
    {
        username: 'superadmin',
        email: 'superadmin@mmitps.com',
        password: 'password123',
        role: 'super_admin',
        isActive: true,
        emailVerified: true,
        referralCode: 'SUPER_REF'
    },
    {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        isActive: true,
        emailVerified: true,
        referralCode: 'JOHN_REF'
    },
    {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        isActive: true,
        emailVerified: true,
        referralCode: 'JANE_REF'
    },
    {
        username: 'trader_mike',
        email: 'mike@trading.com',
        password: 'password123',
        role: 'user',
        isActive: true, // Inactive user
        emailVerified: true,
        referralCode: 'MIKE_REF'
    },
    {
        username: 'crypto_king',
        email: 'king@crypto.com',
        password: 'password123',
        role: 'user',
        isActive: true,
        emailVerified: false,
        referralCode: 'KING_REF'
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // CLEAR DATA
        console.log('🗑️  Clearing database...');
        await User.deleteMany({});
        await Plan.deleteMany({});
        await Subscription.deleteMany({});

        // SEED PLANS
        console.log('🌱 Seeding Plans...');
        const createdPlans = await Plan.insertMany(plans);
        const basicPlan = createdPlans.find(p => p.code === 'BASIC');
        const proPlan = createdPlans.find(p => p.code === 'PRO');
        const instPlan = createdPlans.find(p => p.code === 'INSTITUTIONAL');

        // SEED USERS
        console.log('🌱 Seeding Users...');
        // Hash passwords manually since insertMany might skip pre-save hooks depending on mongoose version/setup, 
        // but let's use a loop to be safe and use User.create/save if needed, or just hash here.
        // Actually, insertMany skips pre-save hooks. So we must hash.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const usersWithHashedPasswords = users.map(user => ({
            ...user,
            password: hashedPassword
        }));

        const createdUsers = await User.insertMany(usersWithHashedPasswords);

        const john = createdUsers.find(u => u.username === 'johndoe');
        const jane = createdUsers.find(u => u.username === 'janedoe');
        const mike = createdUsers.find(u => u.username === 'trader_mike');
        const king = createdUsers.find(u => u.username === 'crypto_king');

        // SEED SUBSCRIPTIONS
        console.log('🌱 Seeding Subscriptions...');
        const subscriptions = [
            {
                user: john._id,
                plan: proPlan._id,
                status: 'active',
                startDate: new Date(),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                paymentMethod: 'stripe',
                price: proPlan.price,
                billingCycle: 'monthly'
            },
            {
                user: jane._id,
                plan: basicPlan._id, // Free plan
                status: 'active',
                startDate: new Date(),
                currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // long expiry for free
                paymentMethod: 'system',
                price: basicPlan.price,
                billingCycle: 'monthly'
            },
            {
                user: mike._id,
                plan: instPlan._id,
                status: 'past_due', // Issue with payment
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                paymentMethod: 'stripe',
                price: instPlan.price,
                billingCycle: 'monthly'
            },
            {
                user: king._id,
                plan: proPlan._id,
                status: 'canceled',
                startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() - 4)),
                canceledAt: new Date(new Date().setMonth(new Date().getMonth() - 4)),
                paymentMethod: 'crypto',
                price: proPlan.price,
                billingCycle: 'monthly'
            }
        ];

        const createdSubs = await Subscription.insertMany(subscriptions);

        // Link Subscriptions to Users
        // Ideally we should update the users to reference these subscriptions if the schema requires it
        // The User schema likely has a 'subscription' field based on previous audits.
        // Let's update them.

        for (const sub of createdSubs) {
            const planDetails = createdPlans.find(p => p._id.toString() === sub.plan.toString());
            await User.findByIdAndUpdate(sub.user, {
                subscription: {
                    plan: planDetails.name,
                    status: sub.status,
                    startDate: sub.startDate,
                    endDate: sub.currentPeriodEnd
                }
            });
        }

        console.log('✅ Data Imported Successfully!');
        console.log('   - Admin: admin@mmitps.com / password123');
        console.log('   - Super Admin: superadmin@mmitps.com / password123');
        console.log('   - 4 Regular Users created');
        console.log('   - 4 Subscriptions created');

        process.exit();
    } catch (error) {
        console.error(`❌ Error import data: ${error}`);
        process.exit(1);
    }
};

seedData();
