const mongoose = require('mongoose');
const TradeJournal = require('./backend/models/Trading/TradeJournal');
const User = require('./backend/models/User');
require('dotenv').config();

async function seedHistory() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const user = await User.findOne({ email: 'trader@mmitps.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        // Add 5 winning trades for EURUSD
        console.log('Seeding 5 winning EURUSD trades for pattern recognition...');
        const trades = [];
        for (let i = 0; i < 5; i++) {
            trades.push({
                user: user._id,
                symbol: 'EURUSD',
                direction: 'buy',
                entryPrice: 1.0800 + (i * 0.001),
                exitPrice: 1.0810 + (i * 0.001),
                netProfitLoss: 50,
                status: 'closed',
                entryTime: new Date(Date.now() - (i * 86400000)), // Daily
                exitTime: new Date(Date.now() - (i * 86400000) + 3600000)
            });
        }

        await TradeJournal.insertMany(trades);
        console.log('✅ History Seeded Successfully');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seedHistory();
