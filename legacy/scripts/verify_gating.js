const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Subscription = require('./backend/models/Subscription');
const Plan = require('./backend/models/Plan');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/v1';

async function verifyGating() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Login as 'basic_user' (Created in seedData)
        // Basic plan should NOT have 'tradingAgents'
        console.log('--- Testing Basic User ---');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'basic@example.com',
                password: 'password123'
            });
            const token = loginRes.data.token;
            console.log('Basic User Logged In');

            // Try to access AI Agent
            try {
                await axios.get(`${API_URL}/features/ai-agent`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.error('❌ Basic User ACCESSED AI Agent (Should be DENIED)');
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    console.log('✅ Basic User DENIED Access to AI Agent (Correct)');
                } else {
                    console.error('❌ Unexpected Error accessing AI Agent:', error.message);
                }
            }
        } catch (e) {
            console.log('⚠️ Could not login as basic user (maybe not seeded or server down). Skipping Basic User test.');
        }

        // Login as 'pro_user' (Created in seedData)
        // Pro plan SHOULD have 'tradingAgents'
        console.log('\n--- Testing Pro User ---');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'pro@example.com',
                password: 'password123'
            });
            const token = loginRes.data.token;
            console.log('Pro User Logged In');

            // Try to access AI Agent
            try {
                const res = await axios.get(`${API_URL}/features/ai-agent`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ Pro User ACCESSED AI Agent (Correct)');
            } catch (error) {
                console.error('❌ Pro User DENIED Access to AI Agent (Should be GRANTED):', error.response ? error.response.data : error.message);
            }

        } catch (e) {
            console.log('⚠️ Could not login as pro user. Skipping Pro User test.');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Check if server is running first
axios.get(API_URL.replace('/api/v1', ''))
    .then(() => verifyGating())
    .catch(() => console.log('❌ Server is NOT running. Please start the server first.'));
