const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ContentBlock = require(path.join(__dirname, 'backend/models/ContentBlock'));

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`[SEED] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[SEED] Error: ${error.message}`);
        process.exit(1);
    }
};

const eventsToSeed = [
    {
        title: "Portugal Institutional Summit 2026",
        slug: "event-portugal-2026",
        type: "event",
        content: "Our flagship European summit returns to Lisbon. A three-day deep dive into quantitative easing, interest rate differentials, and institutional order flow with elite European desks.",
        data: {
            startDate: "2026-06-15T09:00:00Z",
            time: "09:00 - 17:00 GMT",
            link: "/events/portugal-2026",
            region: "Europe",
            country: "Portugal",
            category: "Seminar",
            isMajor: true,
            banner: "https://images.unsplash.com/photo-1513745405825-ee49807fe444?q=80&w=1200&auto=format&fit=crop"
        },
        isActive: true,
        order: 1
    },
    {
        title: "Dubai Institutional Classic 2024",
        slug: "event-dubai-2024",
        type: "event",
        content: "The premier MENA trading event focusing on emerging market liquidity and oil-market correlation strategies. Access archives from our most successful summit yet.",
        data: {
            startDate: "2024-11-20T10:00:00Z",
            time: "10:00 - 18:00 GST",
            link: "/events/dubai-2024",
            region: "Middle East",
            country: "UAE",
            category: "Seminar",
            isMajor: true,
            banner: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop"
        },
        isActive: true,
        order: 2
    },
    {
        title: "Weekly Macro Triggers Live",
        slug: "event-weekly-macro",
        type: "event",
        content: "Weekly interactive webinar series covering G7 economic data, NFP positioning, and COT report analysis for the upcoming trading week.",
        data: {
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            time: "14:00 GMT",
            link: "https://zoom.us/webinar/weekly",
            region: "Global",
            category: "Webinar",
            isMajor: false
        },
        isActive: true,
        order: 3
    },
    {
        title: "London Liquidity Workshop",
        slug: "event-london-2025",
        type: "event",
        content: "Exclusive hands-on workshop in London's financial district. Master the MMITPS volumetric toolset and institutional risk management frameworks.",
        data: {
            startDate: "2025-03-12T09:00:00Z",
            time: "09:00 - 16:00 GMT",
            link: "/events/london-2025",
            region: "Europe",
            country: "UK",
            category: "Seminar",
            isMajor: false
        },
        isActive: true,
        order: 4
    },
    {
        title: "Nigeria Institutional Workshop 2025",
        slug: "event-nigeria-2025",
        type: "event",
        content: "Our first major West African workshop focused on local liquidity and frontier market strategies.",
        data: {
            startDate: "2025-08-10T09:00:00Z",
            time: "09:00 - 16:00 WAT",
            link: "/events/nigeria-2025",
            region: "Africa",
            country: "Nigeria",
            category: "Workshop",
            isMajor: false
        },
        isActive: true,
        order: 5
    },
    {
        title: "Asia-Pacific Trading Summit 2025",
        slug: "event-asia-2025",
        type: "event",
        content: "Exploring the JPY nexus and APAC institutional order flow patterns.",
        data: {
            startDate: "2025-10-05T10:00:00Z",
            time: "10:00 - 17:00 JST",
            link: "/events/asia-2025",
            region: "Asia",
            country: "Japan",
            category: "Summit",
            isMajor: true,
            banner: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop"
        },
        isActive: true,
        order: 6
    }
];

const testimonialsToSeed = [
    {
        title: "Michael R.",
        slug: "testimonial-michael-r",
        type: "testimonial",
        content: "The institutional intelligence provided here completely reorganized my approach to risk management. The AI execution is unmatched in the retail space.",
        data: { role: "Proprietary Trader" },
        isActive: true,
        order: 1
    },
    {
        title: "Sarah L.",
        slug: "testimonial-sarah-l",
        type: "testimonial",
        content: "Using the COT data aggregation dashboard gave me the macro edge I needed. It's like having a team of quantitative analysts working for you 24/7.",
        data: { role: "Portfolio Manager" },
        isActive: true,
        order: 2
    },
    {
        title: "David J.",
        slug: "testimonial-david-j",
        type: "testimonial",
        content: "I migrated my entire strategy to MMITPS. The combination of the academy insights and the immediate news sentiment scanning is a game-changer for my fund.",
        data: { role: "Hedge Fund Analyst" },
        isActive: true,
        order: 3
    }
];

const seedData = async () => {
    await connectDB();
    try {
        console.log("[SEED] Deleting old events and testimonials...");
        await ContentBlock.deleteMany({ type: { $in: ['event', 'testimonial'] } });

        console.log("[SEED] Inserting new events...");
        await ContentBlock.insertMany(eventsToSeed);
        
        console.log("[SEED] Inserting new testimonials...");
        await ContentBlock.insertMany(testimonialsToSeed);

        console.log("[SEED] Successfully seeded Events and Testimonials!");
        process.exit(0);
    } catch (err) {
        console.error("[SEED] Failed to seed:", err);
        process.exit(1);
    }
};

seedData();
