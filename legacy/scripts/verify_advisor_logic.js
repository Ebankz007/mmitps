const mongoose = require('mongoose');
const RecommendationService = require('./backend/services/ai/RecommendationService');
const User = require('./backend/models/User');
require('dotenv').config();

async function verifyLogic() {
    console.log('--- In-Process Logic Verification ---');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        const user = await User.findOne({ email: 'trader@mmitps.com' });
        if (!user) throw new Error('User not found');

        console.log('Running Recommendation Engine for user:', user._id);
        const result = await RecommendationService.getInsights(user._id);

        console.log('\n--- RESULTS ---');
        console.log('Insights found:', result.recommendations.length);

        result.recommendations.forEach(r => {
            console.log(`- [${r.priority}] ${r.title}: ${r.message}`);
        });

        console.log('\n--- DEBUG METRICS ---');
        console.log('WinRate EURUSD:', result.debug.performance.symbols['EURUSD']?.winRate);

        process.exit(0);
    } catch (err) {
        console.error('❌ Verification Failed:', err);
        process.exit(1);
    }
}

verifyLogic();
