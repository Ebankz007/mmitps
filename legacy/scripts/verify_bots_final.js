const axios = require('axios');
const mongoose = require('mongoose');
const TradingBotService = require('./backend/services/trading/TradingBotService');
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/v1';

async function verifyAll() {
    console.log('--- Final Milestone 30 Stage 2 Verification ---');

    try {
        // 1. Connect DB for the Service Layer
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // 2. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'trader@mmitps.com',
            password: 'Trader@123'
        });
        const token = loginRes.data.data.tokens.access.token;
        const header = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Login Successful');

        // 3. Create Bot
        console.log('Creating SENTIMENT_FOLLOWING bot...');
        const botRes = await axios.post(`${BASE_URL}/bot-system`, {
            name: 'Verification Bot',
            pair: 'EURUSD',
            strategy: 'SENTIMENT_FOLLOWING',
            allocation: 1500,
            settings: { stopLossPips: 20, takeProfitPips: 40, riskPerTrade: 1 }
        }, header);
        const botId = botRes.data.data._id;
        console.log('✅ Bot Created:', botId);

        // 4. Activate Bot
        await axios.patch(`${BASE_URL}/bot-system/${botId}/status`, { status: 'active' }, header);
        console.log('✅ Bot Activated');

        // 5. Force Execution Cycle
        console.log('Triggering AI Sentiment Execution Cycle...');
        await TradingBotService.runBotCycles();
        console.log('✅ Execution Cycle Complete');

        // 6. Verify Journal
        console.log('Verifying Trade Journal for automated bot entry...');
        const journalRes = await axios.get(`${BASE_URL}/journal/my`, header);
        const trades = journalRes.data.data.filter(t => t.notes.includes('Verification Bot'));

        if (trades.length > 0) {
            console.log('\n🌟 SUCCESS: Automated trade found!');
            console.log('Trade Direction:', trades[0].direction);
            console.log('Trade Detail:', trades[0].notes);
        } else {
            console.log('\n❌ FAILURE: No trades found in journal.');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifyAll();
