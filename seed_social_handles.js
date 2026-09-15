const mongoose = require('mongoose');
require('dotenv').config();
const SocialHandle = require('./backend/models/SocialHandle');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

const handles = [
    // Global
    { platform: "Facebook", handle: "@MMITPS", url: "https://facebook.com/MMITPS", category: "Global", icon: "Facebook", color: "#1877F2", order: 1 },
    { platform: "X (Twitter)", handle: "@MMITPS", url: "https://x.com/MMITPS", category: "Global", icon: "Twitter", color: "#000000", order: 2 },
    { platform: "Instagram", handle: "@MMITPS", url: "https://instagram.com/MMITPS", category: "Global", icon: "Instagram", color: "#E4405F", order: 3 },
    { platform: "LinkedIn", handle: "MMITPS INC.", url: "https://linkedin.com/company/mmitps", category: "Global", icon: "Linkedin", color: "#0077B5", order: 4 },
    { platform: "YouTube", handle: "MMITPS Official", url: "https://youtube.com/@MMITPS", category: "Global", icon: "Youtube", color: "#FF0000", order: 5 },
    { platform: "TikTok", handle: "@MMITPS", url: "https://tiktok.com/@MMITPS", category: "Global", icon: "Music2", color: "#000000", order: 6 },
    { platform: "Discord", handle: "MMITPS Community", url: "https://discord.gg/mmitps", category: "Global", icon: "MessageSquare", color: "#5865F2", order: 7 },
    { platform: "Telegram", handle: "MMITPS Signals", url: "https://t.me/mmitps", category: "Global", icon: "Send", color: "#26A5E4", order: 8 },
    { platform: "WhatsApp", handle: "MMITPS Support", url: "https://wa.me/mmitps", category: "Global", icon: "MessageCircle", color: "#25D366", order: 9 },

    // Asian
    { platform: "WeChat", handle: "MMITPS_Asia", url: "#", category: "Asian", icon: "MessageCircle", color: "#07C160", order: 1 },
    { platform: "Weibo", handle: "MMITPS_Official", url: "#", category: "Asian", icon: "Share2", color: "#E6162D", order: 2 },
    { platform: "Douyin", handle: "MMITPS", url: "#", category: "Asian", icon: "Music2", color: "#000000", order: 3 },
    { platform: "Bilibili", handle: "MMITPS_Academy", url: "#", category: "Asian", icon: "Tv", order: 4 },

    // European
    { platform: "VKontakte", handle: "MMITPS_EU", url: "#", category: "European", icon: "Share2", color: "#0077FF", order: 1 },
    { platform: "OK.ru", handle: "MMITPS", url: "#", category: "European", icon: "User", color: "#EE8208", order: 2 },

    // Middle East
    { platform: "Snapchat", handle: "MMITPS_Arabia", url: "#", category: "Middle East", icon: "Ghost", color: "#FFFC00", order: 1 },
    { platform: "X (Arabic)", handle: "MMITPS_Arabic", url: "#", category: "Middle East", icon: "Twitter", color: "#000000", order: 2 },

    // African
    { platform: "Ayoba", handle: "MMITPS_ZA", url: "#", category: "African", icon: "MessageCircle", color: "#FFCC00", order: 1 },
    { platform: "Telegram Africa", handle: "MMITPS_Africa", url: "#", category: "African", icon: "Send", color: "#26A5E4", order: 2 }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await SocialHandle.deleteMany({});
        console.log('Cleared existing handles');

        await SocialHandle.insertMany(handles);
        console.log('Seeded social handles successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
