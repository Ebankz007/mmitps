const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const AuthService = require('../services/AuthService');
const SubscriptionService = require('../services/SubscriptionService');
const WalletService = require('../services/financial/WalletService');
const CommissionRepository = require('../repositories/CommissionRepository');
const GenealogyService = require('../services/mlm/GenealogyService');
const Plan = require('../models/Plan');
const User = require('../models/User');
require('../models/MLM/TreeNode');
require('../models/MLM/Commission');
require('../models/Financial/Wallet');
require('../models/Financial/Transaction');
require('../models/Subscription');

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 0. Ensure Plans exist and are configured correctly
        console.log('Configuring plans for test...');
        await Plan.deleteOne({ code: 'ADVANCED' });
        await Plan.create({
            name: 'Advanced',
            code: 'ADVANCED',
            price: 249,
            type: 'membership',
            allowedServices: ['signal_service']
        });

        await Plan.deleteOne({ code: 'SIGNAL_SVC' });
        await Plan.create({
            name: 'Signal Service',
            code: 'SIGNAL_SVC',
            price: 100,
            type: 'service',
            interval: 'month'
        });

        // Clear previous test users
        for (let i = 1; i <= 7; i++) {
            const user = await User.findOne({ email: `testuser${i}@example.com` });
            if (user) {
                const Genealogy = require('../models/MLM/TreeNode');
                await Genealogy.deleteOne({ user: user._id });
                await User.deleteOne({ _id: user._id });
            }
        }

        // 1. Create a chain of 6 users
        const users = [];
        let sponsorId = null;

        console.log('Creating sponsor chain (6 levels deep)...');
        for (let i = 1; i <= 6; i++) {
            const email = `testuser${i}@example.com`;
            const { user } = await AuthService.register({
                email,
                username: `testuser${i}`,
                password: 'password123',
                sponsorId: sponsorId
            });

            if (i === 1) await GenealogyService.createRoot(user._id);
            
            users.push(user);
            sponsorId = user._id;
            console.log(`Created user ${i}: ${user.username}`);
        }

        // 2. The 6th user (testuser6) registers testuser7
        console.log('Registering testuser7 sponsored by testuser6...');
        const { user: testuser7 } = await AuthService.register({
            email: 'testuser7@example.com',
            username: 'testuser7',
            password: 'password123',
            sponsorId: users[5]._id
        });

        // 3. testuser7 purchases membership AND service
        console.log('testuser7 purchasing Advanced membership ($249)...');
        await SubscriptionService.subscribe(testuser7._id, 'ADVANCED');

        console.log('testuser7 subscribing to Signal Service ($100)...');
        await SubscriptionService.subscribe(testuser7._id, 'SIGNAL_SVC', 'signal_service');

        // 4. Verification
        console.log('\n--- VERIFICATION RESULTS ---');
        const regPrice = 249;
        const subPrice = 100;
        const expectedCommission = (regPrice + subPrice) * 0.10; // $24.9 + $10 = $34.9

        for (let i = 1; i <= 6; i++) {
            const user = users[i-1];
            const balance = await WalletService.getBalance(user._id, 'USD');
            const commissions = await CommissionRepository.findAll({ user: user._id });
            const totalComm = commissions.reduce((sum, c) => sum + c.amount, 0);

            const levelFromNew = 7 - i; 
            console.log(`User ${i} (${user.username}):`);
            console.log(`  Balance: ${balance.toFixed(2)} USD`);
            console.log(`  Commissions Total: ${totalComm.toFixed(2)} USD`);
            
            if (levelFromNew >= 1 && levelFromNew <= 5) {
                if (Math.abs(balance - expectedCommission) < 0.01) {
                    console.log(`  ✅ SUCCESS: Received combined level ${levelFromNew} commission of ${expectedCommission.toFixed(2)}`);
                } else {
                    console.log(`  ❌ FAILURE: Expected ${expectedCommission.toFixed(2)}, but got ${balance.toFixed(2)}`);
                }
            } else {
                if (balance === 0) {
                    console.log(`  ✅ SUCCESS: Level ${levelFromNew} received nothing.`);
                } else {
                    console.log(`  ❌ FAILURE: Level ${levelFromNew} should have received nothing, but got ${balance.toFixed(2)}`);
                }
            }
        }

        console.log('\nVerification complete.');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
