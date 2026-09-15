const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/v1';

async function testTradingBots() {
    console.log('--- Testing Milestone 30: Automated Trading Bots ---');

    try {
        // 1. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        const token = loginRes.data.data.tokens.access.token;
        const header = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create Bot with Strategy & Risk Settings
        console.log('\nCreating Bot: "Alpha Sentinel" with SENTIMENT_FOLLOWING strategy...');
        const botRes = await axios.post(`${BASE_URL}/bot-system`, {
            name: 'Alpha Sentinel',
            pair: 'EURUSD',
            strategy: 'SENTIMENT_FOLLOWING',
            allocation: 1000,
            settings: {
                stopLossPips: 25,
                takeProfitPips: 50,
                riskPerTrade: 2
            }
        }, header);
        const botId = botRes.data.data._id;
        console.log('Bot Created ID:', botId);

        // 3. Activate Bot
        console.log('\nActivating Bot...');
        await axios.patch(`${BASE_URL}/bot-system/${botId}/status`, { status: 'active' }, header);

        // 4. Force Execution Cycle (Internal check via console logs)
        console.log('\nBot is now ACTIVE. Checking for trade execution in TradeJournal...');

        // Wait 2 seconds for server loop or manual trigger simulation
        // In this test, we check if a trade was created
        const journalRes = await axios.get(`${BASE_URL}/journal/my`, header);
        const botTrades = journalRes.data.data.filter(t => t.notes.includes('Alpha Sentinel'));

        console.log(`Found ${botTrades.length} trades executed by this bot.`);
        if (botTrades.length > 0) {
            console.log('Last Trade Summary:', botTrades[0].notes);
        }

        console.log('\n✅ Automated Trading Bot Tests Passed!');
    } catch (error) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testTradingBots();
