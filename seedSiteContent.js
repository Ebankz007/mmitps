/**
 * Seed script for SiteContent — populates all landing page sections
 * Run: node seedSiteContent.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';

const sections = [
    // ═══ HERO ═══
    {
        slug: "landing-hero",
        page: "landing",
        section: "Hero",
        type: "hero",
        sortOrder: 10,
        data: {
            badge: "v2.0 Beta Now Live",
            heading: "Market Makers & Institutional Traders Patterns and Strategies INC.",
            subheading: "The next-generation AI trading platform that handles institutional analytics, COT data intelligence, and algorithmic execution—built for serious traders who demand precision.",
            authenticatedSubheading: "Welcome back. Your dashboard awaits.",
            primaryCta: { label: "Start Trading Now", href: "/register" },
            secondaryCta: { label: "View Performance", href: "/performance" },
            videoUrl: "https://assets.mixkit.co/videos/47213/47213-720.mp4",
            videoOpacity: 0.6
        }
    },

    // ═══ PILLARS ═══
    {
        slug: "landing-pillars",
        page: "landing",
        section: "Core Pillars",
        type: "cards",
        sortOrder: 20,
        data: {
            pillars: [
                {
                    title: "Institutional Intelligence",
                    subtitle: "The Edge of Data",
                    description: "Harness the power of Commitment of Traders data, algorithmic pattern recognition, and institutional flow analysis.",
                    iconName: "Brain",
                    color: "from-emerald-500/20 to-emerald-500/5"
                },
                {
                    title: "Algorithmic Precision",
                    subtitle: "The Edge of Logic",
                    description: "Every signal processed through institutional-grade algorithms designed to identify high-probability setups.",
                    iconName: "Cpu",
                    color: "from-emerald-400/20 to-emerald-400/5"
                },
                {
                    title: "Network Intelligence",
                    subtitle: "The Edge of People",
                    description: "Access a curated network of institutional traders sharing real-time insights and verified performance data.",
                    iconName: "Users",
                    color: "from-emerald-300/20 to-emerald-300/5"
                },
                {
                    title: "Risk Architecture",
                    subtitle: "The Edge of Safety",
                    description: "Institutional risk management frameworks protecting capital through advanced drawdown controls and position sizing.",
                    iconName: "Shield",
                    color: "from-emerald-600/20 to-emerald-600/5"
                }
            ]
        }
    },

    // ═══ MISSION ═══
    {
        slug: "landing-mission",
        page: "landing",
        section: "Mission & Vision",
        type: "text",
        sortOrder: 30,
        data: {
            badge: "Our Vision",
            heading: "Trading is a pursuit of knowledge.",
            body: "Built on a foundation of practical market experience and institutional research, MMITPS INC bridges the gap between retail traders and institutional-grade market intelligence.",
            aboutHeading: "About MMITPS INC",
            blockquote: "MMITPS INC Analytics is a curated collection of institutional market research, designed to decode the behavior of large-scale market participants.",
            tagline: "Institutional Efficiency"
        }
    },

    // ═══ SPOTLIGHT SLIDES ═══
    {
        slug: "landing-spotlight",
        page: "landing",
        section: "Dashboard Spotlight",
        type: "slides",
        sortOrder: 40,
        data: {
            slides: [
                { name: "Command Center", title: "Institutional Control", description: "Monitor your entire network from a single unified dashboard." },
                { name: "COT Intelligence", title: "Commitment Decoded", description: "Real-time COT data visualization and institutional positioning." },
                { name: "Geometry Scanner", title: "Pattern Recognition", description: "AI-powered institutional pattern detection across all markets." },
                { name: "Seasonality Engine", title: "Cyclical Alpha", description: "Historical seasonal patterns with institutional timing overlays." },
                { name: "PTD Analytics", title: "Performance Analytics", description: "Professional-grade performance tracking and drawdown analysis." },
                { name: "VMID Dashboard", title: "Volume Intelligence", description: "Volume-based market intelligence for institutional flow detection." },
                { name: "Copy Trading", title: "Mirror Masters", description: "Follow verified institutional providers with real-time execution." },
                { name: "Education Hub", title: "Mastery Pipeline", description: "168+ pages of institutional research and market methodology." },
                { name: "Token Pool", title: "Staking Intelligence", description: "Token staking pools with institutional-grade yield strategies." },
                { name: "News Feed", title: "Market Intelligence", description: "Curated institutional news with AI-powered sentiment analysis." },
                { name: "Risk Monitor", title: "Capital Protection", description: "Real-time risk metrics and drawdown protection systems." }
            ]
        }
    },

    // ═══ ACADEMY ═══
    {
        slug: "landing-academy",
        page: "landing",
        section: "Academy Preview",
        type: "grid",
        sortOrder: 50,
        data: {
            badge: "Mastery Hub",
            heading: "MMITPS Academy.",
            description: "Over 168+ pages of institutional research, market methodology, and algorithmic strategy development.",
            stats: [
                { value: "168+", label: "Curriculum Pages" },
                { value: "24/7", label: "Expert Mentorship" }
            ],
            modules: [
                "Section 1: Global Macro Framework",
                "Section 2: COT Data Interpretation",
                "Section 3: Algorithmic Strategy Design",
                "Section 4: Risk Architecture & Capital Management",
                "Section 5: AI Bias and Signal Execution"
            ],
            ctaLabel: "Unlock Full Curriculum"
        }
    },

    // ═══ FEATURES ═══
    {
        slug: "landing-features",
        page: "landing",
        section: "Features Grid",
        type: "features",
        sortOrder: 60,
        data: {
            heading: "Institutional tools, Simplified for you.",
            subheading: "Everything you need to master the markets, powered by institutional-grade intelligence.",
            features: [
                { title: "COT Intelligence", description: "Real-time Commitment of Traders data analysis with institutional positioning insights.", href: "/dashboard/resources/cot", isResource: true },
                { title: "Geometry Scanner", description: "AI-powered pattern recognition identifying institutional formations across all markets.", href: "/dashboard/resources/geometry" },
                { title: "Seasonality Engine", description: "Historical seasonal patterns with institutional timing overlays and cyclical analysis.", href: "/dashboard/resources/seasonality" },
                { title: "PTD Analytics", description: "Professional-grade performance tracking with drawdown analysis and equity curves.", href: "/dashboard/resources/ptd" },
                { title: "VMID Dashboard", description: "Volume-based market intelligence for institutional flow detection and analysis.", href: "/dashboard/resources/vmid" },
                { title: "Copy Trading", description: "Follow verified institutional providers with real-time execution mirroring.", href: "/dashboard/resources/copy-trading" },
                { title: "Macro Strength", description: "Currency strength matrices and institutional macro flow analysis.", href: "/dashboard/resources/macro" },
                { title: "Contract Calendar", description: "Institutional-grade contract expiry tracking and roll schedules.", href: "/dashboard/resources/contracts" },
                { title: "Education Hub", description: "168+ pages of institutional research and methodology courses.", href: "/dashboard/education" },
                { title: "Risk Monitor", description: "Real-time portfolio risk metrics with institutional drawdown protection.", href: "/dashboard/resources/risk" }
            ]
        }
    },

    // ═══ METHODOLOGY ═══
    {
        slug: "landing-methodology",
        page: "landing",
        section: "Institutional Methodology",
        type: "cards",
        sortOrder: 70,
        data: {
            heading: "Institutional Methodology",
            subheading: "Decoding the framework of professional market participants.",
            cards: [
                {
                    title: "Institutional Market Concepts",
                    body: "MMITPS INC provides complimentary educational articles focused on institutional market participants, designed to elevate your trading methodology.",
                    iconName: "BookOpen"
                },
                {
                    title: "A Multi-Timeframe Approach",
                    body: "Market dynamics can be analyzed across various timeframes, each revealing unique patterns in institutional behavior and market structure.",
                    iconName: "Clock"
                }
            ]
        }
    },

    // ═══ PRICING ═══
    {
        slug: "landing-pricing",
        page: "landing",
        section: "Pricing",
        type: "grid",
        sortOrder: 80,
        data: {
            heading: "Pricing for everyone.",
            subheading: "Choose the membership that fits your institutional ambition.",
            emptyState: {
                title: "No active plans available at the moment.",
                subtitle: "Please check back later or contact support."
            },
            fallbackFeatureText: "Features will be configured by administrator.",
            popularBadgeLabel: "Most Popular",
            freeButtonLabel: "Join Free",
            paidButtonLabel: "Get Started"
        }
    },

    // ═══ EVENTS ═══
    {
        slug: "landing-events",
        page: "landing",
        section: "Events",
        type: "grid",
        sortOrder: 90,
        data: {
            heading: "Institutional Roadmap",
            badge: "Live Events & Summits",
            browseAllLabel: "Browse All Regions",
            ctaLabel: "Reserve Your Seat"
        }
    },

    // ═══ TESTIMONIALS ═══
    {
        slug: "landing-testimonials",
        page: "landing",
        section: "Testimonials",
        type: "testimonials",
        sortOrder: 100,
        data: {
            heading: "Institutional Trust.",
            subheading: "Hear from the traders utilizing our intelligence.",
            verifiedBadgeLabel: "Verified Trader"
        }
    },

    // ═══ TRANSPARENCY ═══
    {
        slug: "landing-transparency",
        page: "landing",
        section: "Risk & Transparency",
        type: "cards",
        sortOrder: 110,
        data: {
            cards: [
                {
                    title: "Market Data Sources",
                    body: "MMITPS INC is an informational platform dedicated to institutional market research and educational analytics.",
                    iconName: "Database"
                },
                {
                    title: "Risk & Statistics Explained",
                    body: "Win rate, drawdown, and expectancy are fundamental metrics that define the quality of any institutional trading strategy.",
                    iconName: "BarChart3"
                },
                {
                    title: "A Long-Term Perspective",
                    body: "Navigating financial markets involves inherent uncertainty. Institutional-grade risk management is the cornerstone of sustainable performance.",
                    iconName: "TrendingUp"
                }
            ]
        }
    },

    // ═══ FAQ ═══
    {
        slug: "landing-faq",
        page: "landing",
        section: "FAQ",
        type: "faq",
        sortOrder: 120,
        data: {
            heading: "Frequently Asked Questions",
            items: [
                {
                    question: "Is MMITPS a broker?",
                    answer: "No. MMITPS INC is an informational and educational platform. We provide institutional-grade market research, analytics tools, and educational resources. We do not execute trades or hold client funds."
                },
                {
                    question: "What data sources does COT follow?",
                    answer: "Our COT Intelligence engine processes data directly from the CFTC's Commitment of Traders reports, supplemented with proprietary institutional flow analysis and algorithmic pattern recognition."
                },
                {
                    question: "Can I cancel my subscription any time?",
                    answer: "Yes. All subscriptions can be cancelled at any time from your dashboard. There are no long-term lock-in contracts. Your access continues until the end of your current billing period."
                },
                {
                    question: "Do you offer education for beginners?",
                    answer: "MMITPS Academy is designed to bridge the gap between beginner and institutional-level understanding. Our curriculum starts with foundational concepts and progresses to advanced institutional methodology."
                }
            ]
        }
    },

    // ═══ NEWSLETTER CTA ═══
    {
        slug: "landing-newsletter",
        page: "landing",
        section: "Newsletter CTA",
        type: "cta",
        sortOrder: 130,
        data: {
            heading: "Join the 1% of institutional traders.",
            subheading: "Get our weekly alpha report delivered to your inbox every Sunday.",
            inputPlaceholder: "Enter your email",
            buttonLabel: "Secure Access",
            watermarkText: "MMITPS ALPHA MMITPS ALPHA"
        }
    },

    // ═══ FOOTER ═══
    {
        slug: "landing-footer",
        page: "landing",
        section: "Footer",
        type: "footer",
        sortOrder: 140,
        data: {
            tagline: "High-performance trading signals, COT data aggregation, and institutional market intelligence—engineered for the serious trader.",
            socialLinks: [
                { platform: "Twitter", url: "#" },
                { platform: "LinkedIn", url: "#" },
                { platform: "Discord", url: "#" }
            ],
            columns: [
                {
                    heading: "Resources",
                    links: [
                        { label: "Pricing Tiers", href: "/#pricing" },
                        { label: "Academy Hub", href: "/#academy" },
                        { label: "Performance Audit", href: "/performance" },
                        { label: "Join Platform", href: "/register" }
                    ]
                },
                {
                    heading: "Legal",
                    links: [
                        { label: "Privacy Policy", href: "/privacy" },
                        { label: "Terms of Service", href: "/terms" },
                        { label: "Contact Us", href: "/contact" }
                    ]
                }
            ],
            disclaimer: "The information on MMITPS INC is provided for general informational purposes only. Trading involves substantial risk of loss and is not suitable for every investor.",
            copyright: "© 2026 MMITPS Institutional Trading Platform. All rights reserved.",
            statusLabel: "Systems Functional"
        }
    },

    // ═══ CONTACT PAGE ═══
    {
        slug: "page-contact",
        page: "contact",
        section: "Hero",
        type: "hero",
        sortOrder: 10,
        data: {
            heading: "Contact Our Team",
            subheading: "Reach out to MMITPS INC for partnerships, support, or general inquiries.",
            channels: [
                { label: "Email", value: "mmitpsinc@gmail.com", iconName: "Mail" },
                { label: "Headquarters", value: "MMITPS INC Global Infrastructure", iconName: "Building2" }
            ],
            partnership: {
                heading: "Partnership Opportunities",
                body: "We collaborate with institutional partners, brokerages, and educational organizations to expand access to institutional-grade market intelligence.",
                ctaLabel: "Discuss Partnership"
            }
        }
    },

    // ═══ PRIVACY PAGE ═══
    {
        slug: "page-privacy",
        page: "privacy",
        section: "Content",
        type: "text",
        sortOrder: 10,
        data: {
            lastUpdated: "March 23, 2026",
            sections: [
                {
                    title: "Data Collection",
                    iconName: "Database",
                    body: "MMITPS INC collects only the data necessary to provide our services. This includes account registration information, usage analytics, and payment processing data.",
                    listItems: ["Account registration details", "Trading activity analytics", "Payment processing information", "Device and browser metadata"]
                },
                {
                    title: "How We Use Data",
                    iconName: "Eye",
                    body: "Your data is used exclusively to operate and improve our platform, process transactions, and communicate important account information.",
                    listItems: ["Platform service delivery", "Account security verification", "Service improvement analytics", "Regulatory compliance"]
                },
                {
                    title: "Security Standards",
                    iconName: "Shield",
                    body: "We employ institutional-grade security measures including encryption, access controls, and regular security audits to protect your data.",
                    listItems: ["AES-256 encryption at rest", "TLS 1.3 in transit", "SOC 2 Type II compliance", "Regular penetration testing"]
                }
            ],
            contactCard: {
                title: "Data Protection Officer",
                body: "For privacy-related inquiries, contact our Data Protection Officer.",
                ctaLabel: "Contact DPO"
            }
        }
    },

    // ═══ TERMS PAGE ═══
    {
        slug: "page-terms",
        page: "terms",
        section: "Content",
        type: "text",
        sortOrder: 10,
        data: {
            lastUpdated: "March 23, 2026",
            sections: [
                {
                    title: "Acceptance of Terms",
                    iconName: "FileCheck",
                    body: "By accessing MMITPS INC, you agree to these terms. Our platform provides educational and informational services related to financial markets.",
                    variant: "default"
                },
                {
                    title: "Risk Disclosure",
                    iconName: "AlertTriangle",
                    body: "Trading financial instruments involves substantial risk of loss. Past performance is not indicative of future results. You should never trade with money you cannot afford to lose.",
                    variant: "warning"
                },
                {
                    title: "Access & Eligibility",
                    iconName: "Lock",
                    body: "You must be at least 18 years old and legally permitted to access financial information services in your jurisdiction.",
                    variant: "default"
                }
            ],
            contactCard: {
                title: "Legal Inquiries",
                body: "For legal questions regarding these terms, contact our legal department.",
                ctaLabel: "Contact Legal"
            }
        }
    },

    // ═══ PERFORMANCE PAGE ═══
    {
        slug: "page-performance",
        page: "performance",
        section: "Hero",
        type: "stats",
        sortOrder: 10,
        data: {
            heading: "Verified Alpha Generation.",
            subheading: "MMITPS utilizes proprietary Institutional algorithms to identify and execute high-probability market setups across global asset classes.",
            stats: [
                { label: "Success Rate", value: "74.2%", iconName: "Target" },
                { label: "Monthly Alpha", value: "+12.4%", iconName: "TrendingUp" },
                { label: "Risk Factor", value: "Low-Med", iconName: "Shield" },
                { label: "Active Signals", value: "1.2k+", iconName: "Activity" }
            ],
            chart: {
                title: "Aggregate Equity Curve",
                description: "Institutional performance metrics audited across all active signal providers.",
                tags: ["Equity Growth", "Drawdown: 4.2% Max"]
            },
            sectors: [
                { sector: "Global Forex", alpha: "+18.4%", description: "Major and cross-currency pairs" },
                { sector: "Crypto Indices", alpha: "+24.1%", description: "Digital asset market indices" },
                { sector: "Commodities", alpha: "+9.8%", description: "Energy, metals, and agricultural" }
            ]
        }
    },

    // ═══ EVENTS PAGE ═══
    {
        slug: "page-events",
        page: "events",
        section: "Content",
        type: "grid",
        sortOrder: 10,
        data: {
            regions: ["All Regions", "Africa", "Asia", "Europe", "Middle East", "America", "North America", "Global"],
            categories: ["All Types", "Webinar", "Seminar", "Summit", "Workshop"],
            hero: {
                heading: "Institutional Events Hub",
                description: "Connect with institutional traders and market researchers at events worldwide."
            },
            ctaFooter: {
                heading: "Host Your Local Institutional Meetup",
                body: "Partner with MMITPS INC to host educational seminars and networking events in your region.",
                buttonLabel: "Apply to Host"
            }
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const SiteContent = require('./backend/models/SiteContent');

        // Clear existing
        await SiteContent.deleteMany({});
        console.log('🗑️  Cleared existing site content');

        // Insert all sections
        const result = await SiteContent.insertMany(sections);
        console.log(`✅ Seeded ${result.length} content sections`);

        // Summary by page
        const pages = {};
        result.forEach(s => {
            pages[s.page] = (pages[s.page] || 0) + 1;
        });
        console.log('\n📊 Sections per page:');
        Object.entries(pages).forEach(([page, count]) => {
            console.log(`   ${page}: ${count} sections`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seed();
