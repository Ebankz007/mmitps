const TokenService = require('../services/TokenService');
const UserService = require('../services/UserService');
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

async function verify() {
    console.log('--- Verification Started ---');

    // 1. Verify TokenService.verifyToken
    console.log('Testing TokenService.verifyToken exists...');
    if (typeof TokenService.verifyToken === 'function') {
        console.log('✅ TokenService.verifyToken is a function');
    } else {
        console.log('❌ TokenService.verifyToken is NOT a function');
    }

    // 2. Verify UserService loading
    console.log('Testing UserService loading...');
    try {
        if (UserService) {
            console.log('✅ UserService loaded successfully');
        }
    } catch (error) {
        console.log('❌ UserService failed to load:', error.message);
    }

    // 3. Verify Plan model enum
    console.log('Testing Plan model enum...');
    try {
        const planSchema = Plan.schema;
        const nameEnum = planSchema.path('name').options.enum;
        console.log('Plan name enum values:', nameEnum);
        if (nameEnum.includes('Pro Plan')) {
            console.log('✅ "Pro Plan" is in the enum');
        } else {
            console.log('❌ "Pro Plan" is NOT in the enum');
        }
    } catch (error) {
        console.log('❌ Plan model check failed:', error.message);
    }

    console.log('--- Verification Complete ---');
    process.exit(0);
}

verify().catch(err => {
    console.error('Verification crashed:', err);
    process.exit(1);
});
