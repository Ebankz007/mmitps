const mongoose = require('mongoose');
const dotenv = require('dotenv');
const COTReport = require('./models/Trading/COTReport');
const FundamentalData = require('./models/Trading/FundamentalData');

dotenv.config();

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps');
        console.log('🗑️  Clearing Resources data...');
        await COTReport.deleteMany({});
        await FundamentalData.deleteMany({});

        console.log('🌱 Seeding COT data...');
        await COTReport.insertMany([
            {
                asset: 'EURUSD',
                reportingDate: new Date('2026-02-06'),
                nonCommercialLong: 250000,
                nonCommercialShort: 180000,
                commercialLong: 120000,
                commercialShort: 190000,
                netPosition: 70000,
                sentimentScore: 65,
                source: 'CFTC'
            },
            {
                asset: 'GBPUSD',
                reportingDate: new Date('2026-02-06'),
                nonCommercialLong: 150000,
                nonCommercialShort: 140000,
                commercialLong: 80000,
                commercialShort: 90000,
                netPosition: 10000,
                sentimentScore: 52,
                source: 'CFTC'
            }
        ]);

        console.log('🌱 Seeding Fundamental data...');
        await FundamentalData.insertMany([
            {
                country: 'USD',
                indicator: 'Interest Rate',
                value: 5.5,
                previousValue: 5.5,
                forecastValue: 5.5,
                impact: 'High',
                releaseDate: new Date('2026-02-01'),
                period: 'Feb 2026',
                unit: '%'
            },
            {
                country: 'EUR',
                indicator: 'GDP Growth',
                value: 0.1,
                previousValue: -0.1,
                forecastValue: 0.0,
                impact: 'High',
                releaseDate: new Date('2026-01-30'),
                period: 'Q4 2025',
                unit: '%'
            }
        ]);

        console.log('✅ Resources Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding resources: ${error.message}`);
        process.exit(1);
    }
};

seedResources();
