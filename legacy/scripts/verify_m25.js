const axios = require('axios');
const BASE_URL = 'http://localhost:5006/api/v1';

async function verifyMilestone25() {
    console.log('🚀 Starting Milestone 25 Verification: Advanced Features & Invoices');
    let token = '';

    try {
        // 1. Auth Admin
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@mmitps.com',
            password: 'password123'
        });
        token = loginRes.data.data.tokens.access.token;
        console.log('✅ Admin Authenticated');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Invoices API
        console.log('\n--- 1. Testing Invoices API ---');
        try {
            const invRes = await axios.get(`${BASE_URL}/invoices`, { headers });
            console.log(`✅ Invoices retrieved. Count: ${invRes.data.count}`);
        } catch (e) {
            console.error('❌ Invoices API failed:', e.response?.data || e.message);
        }

        // 3. Test AI Agent Feature
        console.log('\n--- 2. Testing AI Agent Feature ---');
        try {
            const aiRes = await axios.get(`${BASE_URL}/features/ai-agent`, { headers });
            console.log(`✅ AI Agent status: ${aiRes.data.data.agent_status}`);
        } catch (e) {
            console.error('❌ AI Agent API failed:', e.response?.data || e.message);
        }

        // 4. Test TradeControl Panel Feature
        console.log('\n--- 3. Testing TradeControl Feature ---');
        try {
            const tcpRes = await axios.get(`${BASE_URL}/features/trade-control`, { headers });
            console.log(`✅ TCP Data retrieved. Orders: ${tcpRes.data.data.open_orders.length}`);
        } catch (e) {
            console.error('❌ TCP API failed:', e.response?.data || e.message);
        }

        // 5. Test VPS Station Feature
        console.log('\n--- 4. Testing VPS Station Feature ---');
        try {
            const vpsRes = await axios.get(`${BASE_URL}/features/vps-station`, { headers });
            console.log(`✅ VPS Station status retrieved.`);
        } catch (e) {
            console.error('❌ VPS Station API failed:', e.response?.data || e.message);
        }

        console.log('\n---------------------------------------------------------');
        console.log('✅ Milestone 25 Verification Completed');
    } catch (error) {
        console.error('❌ Critical Verification Error:', error.message);
    }
}

verifyMilestone25();
