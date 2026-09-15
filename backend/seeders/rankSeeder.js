const mongoose = require('mongoose');
const MLMRank = require('../models/MLM/Rank');
const logger = require('../utils/logger');

/**
 * Seed default MLM rank configurations
 */
const seedRanks = async () => {
    try {
        logger.info('Starting rank seeding...');

        // Check if ranks already exist
        const existingCount = await MLMRank.countDocuments();
        if (existingCount > 0) {
            logger.info(`Ranks already seeded (${existingCount} ranks found). Skipping...`);
            return;
        }

        const ranks = [
            {
                name: 'Starter',
                level: 1,
                requirements: {
                    personalVolume: 0,
                    groupVolume: 0,
                    directReferrals: 0,
                    activeDirects: 0,
                    leftLegVolume: 0,
                    rightLegVolume: 0,
                    rankedDirectsRequired: []
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 5,
                    matchingBonus: 0,
                    matchingLevels: 0,
                    leadershipPoolShare: 0,
                    carOverride: 0,
                    travelFund: 0,
                    rankAdvancementBonus: 0
                },
                badge: '🌱',
                color: '#94a3b8',
                isActive: true
            },
            {
                name: 'Bronze',
                level: 2,
                requirements: {
                    personalVolume: 100,
                    groupVolume: 500,
                    directReferrals: 2,
                    activeDirects: 2,
                    leftLegVolume: 200,
                    rightLegVolume: 200,
                    rankedDirectsRequired: []
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 5,
                    matchingBonus: 5,
                    matchingLevels: 1,
                    leadershipPoolShare: 0,
                    carOverride: 0,
                    travelFund: 0,
                    rankAdvancementBonus: 50
                },
                badge: '🥉',
                color: '#cd7f32',
                isActive: true
            },
            {
                name: 'Silver',
                level: 3,
                requirements: {
                    personalVolume: 300,
                    groupVolume: 1500,
                    directReferrals: 3,
                    activeDirects: 3,
                    leftLegVolume: 600,
                    rightLegVolume: 600,
                    rankedDirectsRequired: [
                        { rank: 'Bronze', count: 2 }
                    ]
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 7,
                    matchingBonus: 10,
                    matchingLevels: 2,
                    leadershipPoolShare: 0,
                    carOverride: 0,
                    travelFund: 0,
                    rankAdvancementBonus: 150
                },
                badge: '🥈',
                color: '#c0c0c0',
                isActive: true
            },
            {
                name: 'Gold',
                level: 4,
                requirements: {
                    personalVolume: 500,
                    groupVolume: 3000,
                    directReferrals: 5,
                    activeDirects: 4,
                    leftLegVolume: 1200,
                    rightLegVolume: 1200,
                    rankedDirectsRequired: [
                        { rank: 'Bronze', count: 2 },
                        { rank: 'Silver', count: 1 }
                    ]
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 10,
                    matchingBonus: 15,
                    matchingLevels: 3,
                    leadershipPoolShare: 1,
                    carOverride: 100,
                    travelFund: 0,
                    rankAdvancementBonus: 300
                },
                badge: '🥇',
                color: '#ffd700',
                isActive: true
            },
            {
                name: 'Platinum',
                level: 5,
                requirements: {
                    personalVolume: 1000,
                    groupVolume: 6000,
                    directReferrals: 7,
                    activeDirects: 5,
                    leftLegVolume: 2500,
                    rightLegVolume: 2500,
                    rankedDirectsRequired: [
                        { rank: 'Silver', count: 2 },
                        { rank: 'Gold', count: 1 }
                    ]
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 12,
                    matchingBonus: 20,
                    matchingLevels: 4,
                    leadershipPoolShare: 2,
                    carOverride: 300,
                    travelFund: 1000,
                    rankAdvancementBonus: 600
                },
                badge: '💎',
                color: '#e5e4e2',
                isActive: true
            },
            {
                name: 'Diamond',
                level: 6,
                requirements: {
                    personalVolume: 2000,
                    groupVolume: 12000,
                    directReferrals: 10,
                    activeDirects: 7,
                    leftLegVolume: 5000,
                    rightLegVolume: 5000,
                    rankedDirectsRequired: [
                        { rank: 'Gold', count: 2 },
                        { rank: 'Platinum', count: 1 }
                    ]
                },
                benefits: {
                    binaryCommissionRate: 10,
                    binaryCapPercentage: 100,
                    directReferralBonus: 15,
                    matchingBonus: 25,
                    matchingLevels: 5,
                    leadershipPoolShare: 5,
                    carOverride: 500,
                    travelFund: 3000,
                    rankAdvancementBonus: 1200
                },
                badge: '💠',
                color: '#b9f2ff',
                isActive: true
            }
        ];

        // Insert ranks
        await MLMRank.insertMany(ranks);
        logger.info(`Successfully seeded ${ranks.length} ranks`);

        return ranks;
    } catch (error) {
        logger.error('Error seeding ranks:', error);
        throw error;
    }
};

// Run seeder if called directly
if (require.main === module) {
    const mongoose = require('mongoose'); // Added mongoose import
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

    mongoose.connect(MONGODB_URI)
        .then(async () => {
            await seedRanks();
            logger.info('Seeding complete. Disconnecting...');
            await mongoose.disconnect();
            process.exit(0);
        })
        .catch(error => {
            logger.error('Database connection failed:', error);
            process.exit(1);
        });
}

module.exports = seedRanks;
