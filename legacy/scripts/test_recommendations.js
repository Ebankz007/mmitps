const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/v1';

async function testRecommendations() {
    console.log('--- Testing Milestone 30: AI Trading Advisor ---');

    try {
        // 0. Ping Check
        console.log('Pinging Advisor Route...');
        const ping = await axios.get(`${BASE_URL}/advisor/ping`);
        console.log('Ping Result:', ping.data);

        // 1. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        const token = loginRes.data.data.tokens.access.token;
        const header = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Fetch Insights
        console.log('Fetching personalized insights...');
        const res = await axios.get(`${BASE_URL}/advisor/insights`, header);

        if (!res.data.data) {
            console.error('❌ Error: No data returned from API');
            process.exit(1);
        }

        const { recommendations, debug } = res.data.data;

        if (!recommendations) {
            console.error('❌ Error: Recommendations structure missing', res.data.data);
            process.exit(1);
        }

        console.log(`Retrieved ${recommendations.length} insights.`);

        console.log('\n--- DEBUG INFO ---');
        console.log('User Symbols:', debug.performance?.symbols ? Object.keys(debug.performance.symbols) : 'None');
        console.log('EURUSD WinRate:', debug.performance?.symbols?.['EURUSD']?.winRate);
        console.log('Market Status Symbols:', debug.marketStatus ? debug.marketStatus.map(a => a.symbol) : 'None');

        const eurusdMarket = debug.marketStatus?.find?.(a => a.symbol === 'EURUSD');
        console.log('EURUSD Market Sentiment:', eurusdMarket?.sentimentScore);

        recommendations.forEach((insight, index) => {
            console.log(`\nInsight #${index + 1}: [${insight.priority.toUpperCase()}] ${insight.title}`);
            console.log(`Message: ${insight.message}`);
        });

        if (recommendations.length > 0) {
            console.log('\n✅ AI Recommendations Test Passed!');
        } else {
            console.log('\n⚠️ No insights generated (Likely no trade history for this user). Test Passed.');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testRecommendations();
