const mongoose = require('mongoose');
require('dotenv').config();
const Plan = require('./backend/models/Plan');

async function dumpPlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const plans = await Plan.find({});
        console.log('--- ALL PLANS ---');
        plans.forEach(p => {
            console.log(`Name: ${p.name}, Code: ${p.code}, Type: ${p.type}, Allowed: ${p.allowedServices}`);
        });
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
dumpPlans();
