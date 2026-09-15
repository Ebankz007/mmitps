const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/v1';

async function testSentiment() {
    console.log('--- Testing AI Sentiment Analysis ---');

    try {
        // 1. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        const token = loginRes.data.data.tokens.access.token;
        const header = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Test Single Symbol
        console.log('\nTesting Symbol Analysis: EURUSD...');
        const eurRes = await axios.get(`${BASE_URL}/sentiment/EURUSD`, header);
        console.log('Result:', JSON.stringify(eurRes.data.data, null, 2));

        // 3. Test Market Overview
        console.log('\nTesting Market Overview...');
        const overviewRes = await axios.get(`${BASE_URL}/sentiment/overview/market`, header);
        console.log(`Retrieved ${overviewRes.data.data.length} asset reports.`);
        console.log('First Asset Summary:', overviewRes.data.data[0].summary);

        console.log('\n✅ AI Sentiment Tests Passed!');
    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testSentiment();
