const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/config/.env') });

const Plan = require('./backend/models/Plan');

async function listPlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps');
        console.log('Connected to DB');
        const plans = await Plan.find({});
        console.log('PLANS_START');
        console.log(JSON.stringify(plans, null, 2));
        console.log('PLANS_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listPlans();
