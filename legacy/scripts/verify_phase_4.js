const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5055/api/v1';

async function verifyPhase4() {
    console.log('🚀 Starting Phase 4 Verification...\n');

    try {
        // 1. Basic Server Connectivity
        console.log('--- 1. Testing Connectivity ---');
        try {
            await axios.get('http://localhost:5055');
            console.log('✅ Landing page accessible');
        } catch (e) {
            console.error('❌ Landing page unreachable');
        }

        // 2. Auth Endpoints (Forgot Password)
        console.log('\n--- 2. Testing Auth (Forgot Password) ---');
        try {
            // Note: This requires a user to exist. We'll try with a dummy email.
            // Even if user not found, the endpoint should return 404 or a masked success message depending on implementation.
            // Our implementation in AuthService.forgotPassword throws 404 if user not found.
            const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: 'nonexistent@example.com' });
            console.log('✅ Forgot password endpoint returned:', res.status);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Forgot password correctly returned 404 for non-existent user');
            } else {
                console.error('❌ Forgot password test failed:', error.response ? error.response.data : error.message);
            }
        }

        // 3. Market Data Proxy
        console.log('\n--- 3. Testing Market Data Proxy ---');
        const marketEndpoints = ['quotes', 'history', 'calendar'];
        for (const endpoint of marketEndpoints) {
            try {
                const res = await axios.get(`${API_URL}/market-data/${endpoint}`);
                console.log(`✅ Market Data (${endpoint}): ${res.data.data ? 'Data Received' : 'No Data'}`);
                if (res.data.data) {
                    console.log(`   Sample: ${JSON.stringify(Array.isArray(res.data.data) ? res.data.data[0] : res.data.data).substring(0, 100)}...`);
                }
            } catch (error) {
                console.error(`❌ Market Data (${endpoint}) failed:`, error.response ? error.response.data : error.message);
            }
        }

        // 4. CMS Endpoints
        console.log('\n--- 4. Testing CMS Endpoints ---');
        try {
            const res = await axios.get(`${API_URL}/cms`);
            console.log(`✅ CMS Blocks: ${res.data.success ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('❌ CMS Fetch failed:', error.response ? error.response.status : error.message);
        }

        // 5. Certification Endpoints
        console.log('\n--- 5. Testing Certification Endpoints ---');
        try {
            const res = await axios.get(`${API_URL}/certificates/verify/INVALID-CODE`);
            console.log('✅ Certificate verify endpoint reached');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Certificate verify correctly returned 404 for invalid code');
            } else {
                console.error('❌ Certification test failed:', error.response ? error.response.status : error.message);
            }
        }

        console.log('\n--- 6. Testing Rate Limiting ---');
        console.log('Attempting multiple rapid requests to verify rate limiter...');
        let hitLimit = false;
        for (let i = 0; i < 10; i++) {
            try {
                await axios.get(`${API_URL}/market-data/quotes`);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    hitLimit = true;
                    console.log('✅ Rate limit (429) triggered as expected.');
                    break;
                }
            }
        }
        if (!hitLimit) console.log('ℹ️ Rate limit not triggered (maybe limit is higher than 10 or running from localhost whitelisted?)');

    } catch (error) {
        console.error('Unexpected Verification Error:', error);
    }

    console.log('\n✅ Verification Script Finished.');
}

verifyPhase4();
