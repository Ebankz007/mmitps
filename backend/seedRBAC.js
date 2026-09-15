const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Load Models from monolithic index
const db = require('./models/index');
const User = db.User;

const rbacUsers = [
    {
        username: 'superadmin',
        email: 'superadmin@mmitps.com',
        password: 'Mmitps@2026',
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin',
        address: { country: 'United States' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'admin',
        email: 'admin@mmitps.com',
        password: 'Mmitps@2026',
        role: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        address: { country: 'United States' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'manager',
        email: 'manager@mmitps.com',
        password: 'Mmitps@2026',
        role: 'manager',
        firstName: 'Portfolio',
        lastName: 'Manager',
        address: { country: 'United Kingdom' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'trader',
        email: 'trader@mmitps.com',
        password: 'Mmitps@2026',
        role: 'trader',
        firstName: 'Active',
        lastName: 'Trader',
        address: { country: 'Nigeria' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'analyst',
        email: 'analyst@mmitps.com',
        password: 'Mmitps@2026',
        role: 'analyst',
        firstName: 'Market',
        lastName: 'Analyst',
        address: { country: 'Germany' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'support',
        email: 'support@mmitps.com',
        password: 'Mmitps@2026',
        role: 'support',
        firstName: 'Customer',
        lastName: 'Support',
        address: { country: 'India' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'standard_user',
        email: 'user@mmitps.com',
        password: 'Mmitps@2026',
        role: 'user',
        firstName: 'Standard',
        lastName: 'User',
        address: { country: 'Canada' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    },
    {
        username: 'guest',
        email: 'guest@mmitps.com',
        password: 'Mmitps@2026',
        role: 'guest',
        firstName: 'Guest',
        lastName: 'Visitor',
        address: { country: 'Brazil' },
        isActive: true,
        emailVerified: true,
        accountStatus: 'active'
    }
];

const seedRBAC = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log('🗑️  Clearing existing RBAC test users...');
        const usernames = rbacUsers.map(u => u.username);
        const emails = rbacUsers.map(u => u.email);

        await User.deleteMany({
            $or: [
                { username: { $in: usernames } },
                { email: { $in: emails } }
            ]
        });

        console.log('🌱 Seeding RBAC Users...');
        for (const userData of rbacUsers) {
            // Using User.create to ensure pre-save hooks (hashing) run
            const user = await User.create(userData);
            console.log(`Created: ${user.username} [${user.role}]`);
        }

        console.log('✅ RBAC Seeding Successful!');
        console.log('   Default Password: Mmitps@2026');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding RBAC: ${error.message}`);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
};

seedRBAC();
