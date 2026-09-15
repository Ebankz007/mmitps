const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const TokenService = require('../services/TokenService');

async function generateToken() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'test@example.com' }) || await User.findOne({});
    if (!user) {
        console.error('No user found in database');
        process.exit(1);
    }

    const tokens = await TokenService.generateAuthTokens(user);
    console.log('--- TEST TOKEN GENERATED ---');
    console.log('User Email:', user.email);
    console.log('Access Token:', tokens.access.token);
    console.log('-----------------------------');

    await mongoose.disconnect();
    process.exit(0);
}

generateToken().catch(err => {
    console.error(err);
    process.exit(1);
});
