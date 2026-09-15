const mongoose = require('mongoose');
const NewsArticle = require('./backend/models/News/NewsArticle');
const COTReport = require('./backend/models/Trading/COTReport');
require('dotenv').config();

async function seedSentimentData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Seed Bullish News
        const news = await NewsArticle.create({
            title: 'EUR/USD Sees Massive Growth as ECB Hints at Hawkish Shift',
            content: 'The Euro gains strength as industrial output exceeds forecasts. Bullish momentum continues...',
            summary: 'Bullish outlook for EUR as ECB turns hawkish.',
            category: 'forex',
            isPublished: true,
            publishedAt: new Date()
        });
        console.log('Seed News created');

        // 2. Seed Bullish COT
        const cot = await COTReport.create({
            asset: 'EUR',
            reportingDate: new Date(),
            nonCommercialLong: 250000,
            nonCommercialShort: 100000,
            netPosition: 150000,
            sentimentScore: 75,
            source: 'CFTC'
        });
        console.log('Seed COT created');

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Seed Failed:', error);
        process.exit(1);
    }
}

seedSentimentData();
