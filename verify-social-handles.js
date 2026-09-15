const mongoose = require('mongoose');
require('dotenv').config();
const SocialHandle = require('./backend/models/SocialHandle');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const handles = await SocialHandle.find().sort({ category: 1, order: 1 });
        console.log(`Total handles found: ${handles.length}`);

        const categories = {};
        handles.forEach(h => {
            if (!categories[h.category]) categories[h.category] = 0;
            categories[h.category]++;
            console.log(`[${h.category}] ${h.platform} - ${h.handle} (${h.isActive ? 'ACTIVE' : 'INACTIVE'})`);
        });

        console.log('\nSummary by category:');
        console.log(categories);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
