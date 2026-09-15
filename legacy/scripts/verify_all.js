const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5055/api/v1';

async function verifyAll() {
    try {
        console.log('\n--- 1. Testing Auth & Gating ---');
        let basicToken, proToken, adminToken, basicUserId;

        // Login Basic
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: 'basic@example.com', password: 'password123' });
            basicToken = res.data.data.tokens.access.token;
            basicUserId = res.data.data.user.id || res.data.data.user._id;
            console.log('✅ Basic User Logged In');
        } catch (e) {
            console.error('❌ Basic login failed:', e.response ? e.response.data : e.message);
        }

        // Login Pro
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: 'pro@example.com', password: 'password123' });
            proToken = res.data.data.tokens.access.token;
            console.log('✅ Pro User Logged In');
        } catch (e) {
            console.error('❌ Pro login failed:', e.response ? e.response.data : e.message);
        }

        // Login Admin
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email: 'admin@example.com', password: 'password123' });
            adminToken = res.data.data.tokens.access.token;
            console.log('✅ Admin Logged In');
        } catch (e) {
            console.error('❌ Admin login failed:', e.response ? e.response.data : e.message);
        }

        // Test Gating
        console.log('\n--- Gating Results ---');
        if (basicToken) {
            try {
                await axios.get(`${API_URL}/features/ai-agent`, { headers: { Authorization: `Bearer ${basicToken}` } });
                console.error('❌ Basic User ACCESSED AI Agent (Should be DENIED)');
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    console.log('✅ Basic User DENIED Access to AI Agent (Correct)');
                } else {
                    console.error('❌ Basic Gating Test Error:', error.response ? error.response.status : error.message);
                }
            }
        }
        if (proToken) {
            try {
                await axios.get(`${API_URL}/features/ai-agent`, { headers: { Authorization: `Bearer ${proToken}` } });
                console.log('✅ Pro User ACCESSED AI Agent (Correct)');
            } catch (error) {
                console.error('❌ Pro User DENIED Access to AI Agent:', error.response ? error.response.status : error.message);
            }
        }

        // 2. Invoice Verification
        console.log('\n--- 2. Testing Invoices ---');
        if (adminToken && basicUserId) {
            try {
                // Create Invoice as Admin for Basic User
                const invRes = await axios.post(`${API_URL}/invoices`, {
                    user: basicUserId,
                    amount: 99.00,
                    status: 'open',
                    currency: 'USD'
                }, { headers: { Authorization: `Bearer ${adminToken}` } });
                console.log('✅ Admin Created Invoice:', invRes.data.data._id || invRes.data.data.id);

                // Get Invoices as Basic User
                const getRes = await axios.get(`${API_URL}/invoices`, { headers: { Authorization: `Bearer ${basicToken}` } });
                if (getRes.data.count >= 0) {
                    console.log(`✅ Basic User fetched invoices (Count: ${getRes.data.count})`);
                } else {
                    console.error('❌ Basic User invoice fetch failed structure check');
                }
            } catch (error) {
                console.error('❌ Invoice Test Failed:', error.response ? error.response.data : error.message);
            }
        } else {
            console.log('⚠️ Skipping Invoice test (missing tokens/userId)');
        }

        // 4. Multi-Module Expansion Verification
        console.log('\n--- 4. Testing Module Expansions ---');
        if (proToken) {
            // Genealogy
            try {
                const genealogy = await axios.get(`${API_URL}/mlm/binary`, { headers: { Authorization: `Bearer ${proToken}` } });
                console.log('✅ Genealogy Binary Tree accessible');
            } catch (e) {
                console.error('❌ Genealogy test failed:', e.response ? e.response.status : e.message);
            }

            // Resources (COT/Macro/Seasonality)
            try {
                // Note: Mount in server.js is /api/v1/resource (singular)
                const seasonality = await axios.get(`${API_URL}/resource/seasonality/EURUSD`, { headers: { Authorization: `Bearer ${proToken}` } });
                const macro = await axios.get(`${API_URL}/resource/strength`, { headers: { Authorization: `Bearer ${proToken}` } });
                console.log('✅ Resource Analytics (Seasonality/Macro) accessible');
            } catch (e) {
                console.error('❌ Resource Analytics test failed:', e.response ? e.response.status : e.message);
            }

            // Trading AI
            try {
                // Route is GET /api/v1/trading/analysis/:symbol
                const ai = await axios.get(`${API_URL}/trading/analysis/EURUSD`, { headers: { Authorization: `Bearer ${proToken}` } });
                console.log('✅ Trading AI Analyst accessible');
            } catch (e) {
                console.error('❌ Trading AI test failed:', e.response ? e.response.status : e.message);
            }

            // Universal Page Controller
            try {
                const context = await axios.get(`${API_URL}/cms/page-context/calc-lot-size`, { headers: { Authorization: `Bearer ${proToken}` } });
                if (context.data.success && context.data.data.pageId === 'calc-lot-size') {
                    console.log('✅ Universal Page Controller (Backend Dispatcher) functional');
                }
            } catch (e) {
                console.error('❌ Universal Page Controller test failed:', e.response ? e.response.status : e.message);
            }
        }

    } catch (error) {
        console.error('General Verification Error:', error.message);
    }
}

// Check if server is running first
axios.get(API_URL.replace('/api/v1', ''))
    .then(() => verifyAll())
    .catch(() => console.log('❌ Server is NOT running. Please start the server first.'));
