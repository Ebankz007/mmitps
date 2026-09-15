const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/config/.env') });

const User = require('./backend/models/User');

async function verify() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected.');

        const userCount = await User.countDocuments();
        console.log('Total Users:', userCount);

        const trader = await User.findOne({ email: 'trader@mmitps.com' }).select('+password');
        if (trader) {
            console.log('Trader found:', trader.email);
            console.log('Trader hashed password:', trader.password);

            const bcrypt = require('bcryptjs');
            const isMatch = await bcrypt.compare('Trader@123', trader.password);
            console.log('Password "Trader@123" matches:', isMatch);
        } else {
            console.log('Trader NOT found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
