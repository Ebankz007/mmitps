/**
 * Seed Script: Registration Tier Plans
 * Run with: node backend/scripts/seedPlans.js
 *
 * Creates the 4 default membership (lifetime) registration tiers.
 * Will skip any that already exist (matched by code), and update price/description if changed.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const REGISTRATION_PLANS = [
    {
        name: 'Basic',
        code: 'BASIC',
        type: 'membership',
        price: 0,
        currency: 'USD',
        interval: 'lifetime',
        isActive: true,
        description: 'Free entry-level access to the platform. Get started with essential market tools.',
        features: {
            dashboard: true,
            news_calendar: true,
            education_hub: true,
            blogs: true,
            events: true,
            help_hub: true,
            kyc_verification: true,
            profile: true,
        },
        allowedMenus: ['Dashboard', 'News Calendar', 'Education', 'Blogs', 'Events', 'Help Hub', 'KYC Verification', 'Profile'],
    },
    {
        name: 'Advanced',
        code: 'ADVANCED',
        type: 'membership',
        price: 249,
        currency: 'USD',
        interval: 'lifetime',
        isActive: true,
        description: 'One-time registration fee. Access advanced market analytics and institutional tools.',
        features: {
            dashboard: true,
            social_handles: true,
            financial: true,
            my_wallet: true,
            markets: true,
            news_calendar: true,
            education: true,
            resources: true,
            genealogy: true,
            blogs: true,
            events: true,
            help_hub: true,
            portfolio: true,
            kyc_verification: true,
            profile: true,
        },
        allowedMenus: ['Dashboard', 'Social Handles', 'Financial', 'Markets', 'News Calendar', 'Education', 'Resources', 'Genealogy', 'Blogs', 'Events', 'Help Hub', 'Portfolio', 'KYC Verification', 'Profile'],
    },
    {
        name: 'Pro',
        code: 'PRO',
        type: 'membership',
        price: 499,
        currency: 'USD',
        interval: 'lifetime',
        isActive: true,
        description: 'One-time registration fee. Full access including AI tools, copy trading, and live streams.',
        features: {
            dashboard: true,
            social_handles: true,
            financial: true,
            my_wallet: true,
            markets: true,
            news_calendar: true,
            education: true,
            resources: true,
            ai_agent_analyst: true,
            trade_journal: true,
            copy_trading: true,
            live_stream: true,
            genealogy: true,
            blogs: true,
            events: true,
            help_hub: true,
            portfolio: true,
            kyc_verification: true,
            profile: true,
        },
        allowedMenus: ['Dashboard', 'Social Handles', 'Financial', 'Markets', 'News Calendar', 'Education', 'Resources', 'AI Agent Analyst', 'Trade Journal', 'Copy Trading', 'Live Stream', 'Genealogy', 'Blogs', 'Events', 'Help Hub', 'Portfolio', 'KYC Verification', 'Profile'],
    },
];

async function seedPlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        let created = 0, updated = 0, skipped = 0;
        
        // Delete any membership plans that are no longer in our approved list
        const allowedCodes = REGISTRATION_PLANS.map(p => p.code);
        const deleteResult = await Plan.deleteMany({ 
            code: { $nin: allowedCodes }, 
            type: 'membership' 
        });
        if (deleteResult.deletedCount > 0) {
            console.log(`  🗑️  Deleted ${deleteResult.deletedCount} obsolete membership plans`);
        }

        for (const planData of REGISTRATION_PLANS) {
            const existing = await Plan.findOne({ code: planData.code });

            if (!existing) {
                await Plan.create(planData);
                console.log(`  ➕ Created: ${planData.name} ($${planData.price})`);
                created++;
            } else {
                // Update price and description if changed, preserve other custom settings
                const changed = existing.price !== planData.price || existing.description !== planData.description;
                if (changed) {
                    await Plan.findByIdAndUpdate(existing._id, {
                        price: planData.price,
                        description: planData.description,
                        interval: planData.interval,
                        type: planData.type,
                    });
                    console.log(`  🔄 Updated: ${planData.name} ($${planData.price})`);
                    updated++;
                } else {
                    console.log(`  ⏭  Skipped: ${planData.name} (no changes)`);
                    skipped++;
                }
            }
        }

        console.log(`\n✅ Done! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seedPlans();
