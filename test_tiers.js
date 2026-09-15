const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./backend/models/User');
const Tier = require('./backend/models/Financial/Tier');
const MLMCommission = require('./backend/models/MLM/Commission');

// Services
const MLMService = require('./backend/services/mlm/CommissionService');
const TierService = require('./backend/services/TierService');

async function runTests() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps');
    console.log("Connected to MongoDB");

    try {
        // 1. Ensure Tiers exist
        await Tier.seedDefaultTiers();
        const basicTier = await Tier.findOne({ code: 'basic' });
        const advanceTier = await Tier.findOne({ code: 'advance' });
        const proTier = await Tier.findOne({ code: 'pro' });

        console.log(`[+] Found Tiers: Basic(${basicTier.commissions.directReferralPercent}%), Advance(${advanceTier.commissions.directReferralPercent}%), Pro(${proTier.commissions.directReferralPercent}%)`);

        // 2. Create Mock Users
        const sponsor = await User.create({
            email: `sponsor_${Date.now()}@test.com`,
            password: 'password123',
            preferences: { tier: basicTier._id, lockedWalletBalance: 0 }
        });

        const downline1 = await User.create({
            email: `downline1_${Date.now()}@test.com`,
            password: 'password123',
            preferences: { tier: basicTier._id }
        });

        console.log(`[+] Created Sponsor (Basic Tier) and Downline 1`);

        // 3. Test 1: Direct Referral (Downline buys Advance Tier - $100)
        // Since Sponsor is Basic (Level 0) and Downline buys Advance (Level 1), it should LOCK.
        console.log(`\n--- Test 1: Commission Generation & Locking ---`);
        const purchaseAmount1 = 100;
        const comm1 = await MLMService.calculateDirectReferral(
            sponsor._id,
            purchaseAmount1,
            'Advance Tier Upgrade',
            advanceTier.level
        );
        console.log(`Commission computed: $${comm1} (Expected 5% of 100 = 5)`);

        let lockedComms = await MLMCommission.find({ user: sponsor._id, status: 'locked' });
        console.log(`Locked Commissions count: ${lockedComms.length} (Expected 1)`);
        console.log(`Locked Commission Amount: $${lockedComms[0]?.amount} (Expected 5)`);

        // 4. Test 2: Another Referral (Downline buys Pro Tier - $300)
        // Sponsor is Basic (Level 0), purchase is Pro (Level 2). Should LOCK.
        console.log(`\n--- Test 2: Multiple Locked Commissions ---`);
        const purchaseAmount2 = 300;
        const comm2 = await MLMService.calculateDirectReferral(
            sponsor._id,
            purchaseAmount2,
            'Pro Tier Upgrade',
            proTier.level
        );
        console.log(`Commission computed: $${comm2} (Expected 5% of 300 = 15)`);

        lockedComms = await MLMCommission.find({ user: sponsor._id, status: 'locked' });
        console.log(`Total Locked Commissions count: ${lockedComms.length} (Expected 2)`);

        // Give sponsor some fake locked balance to simulate Wallet sync
        sponsor.preferences.lockedWalletBalance = 20; // 5 + 15
        await sponsor.save();

        console.log(`Sponsor Locked Balance: $${sponsor.preferences.lockedWalletBalance}`);

        // 5. Test 3: Upgrade Via Locked Balance
        // Sponsor (Basic) wants to upgrade to Advance ($100).
        // Cost is 100 - 0 = 100. But locked balance is only 20! Should fail.
        console.log(`\n--- Test 3: Upgrade Attempt (Insufficient) ---`);
        try {
            await TierService.upgradeViaLockedBalance(sponsor._id, advanceTier._id);
            console.log("ERROR: Upgrade succeeded but should have failed!");
        } catch (e) {
            console.log(`Expected Failure: ${e.message}`);
        }

        // Give sponsor enough fake balance to succeed
        console.log(`\n--- Test 4: Upgrade Attempt (Sufficient) ---`);

        // Create a massive locked commission so they can afford Pro ($300)
        await MLMCommission.create({
            user: sponsor._id,
            type: 'direct_referral',
            amount: 350,
            status: 'locked',
            unlocksAtTierLevel: proTier.level,
            description: `A massive enterprise signup`
        });
        sponsor.preferences.lockedWalletBalance += 350; // Total 370
        await sponsor.save();

        console.log(`Sponsor Locked Balance increased to: $${sponsor.preferences.lockedWalletBalance}`);

        // Upgrade Basic -> Pro (Cost $300)
        const upgradeRes = await TierService.upgradeViaLockedBalance(sponsor._id, proTier._id);
        console.log(`Upgrade result:`, upgradeRes.success ? "Success" : "Failed");

        // Verify Consumption
        const updatedSponsor = await User.findById(sponsor._id).populate('preferences.tier');
        console.log(`Sponsor New Tier: ${updatedSponsor.preferences.tier.name} (Expected Pro Tier)`);
        console.log(`Sponsor Remaining Locked Balance: $${updatedSponsor.preferences.lockedWalletBalance} (Expected 70)`);

        // Check if the other commissions got unlocked!
        // The first two were unlockedAtTierLevel 1 and 2. Sponsor is now Level 2. So they should be approved!
        const remainingLocked = await MLMCommission.find({ user: sponsor._id, status: 'locked' });
        const approvedComms = await MLMCommission.find({ user: sponsor._id, status: 'approved' });

        console.log(`Remaining Locked Commissions: ${remainingLocked.length} (Expected 1 - the remainder of the 350 chunk, since 300 was consumed)`);
        console.log(`Approved/Unlocked Commissions: ${approvedComms.length}`);

        console.log("\n✅ All core scenarios executed successfully.");

        // Cleanup
        await User.deleteMany({ email: { $in: [sponsor.email, downline1.email] } });
        await MLMCommission.deleteMany({ user: sponsor._id });

    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();
