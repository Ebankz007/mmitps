const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import WebSocket server
const WebSocketServer = require('./websocket');

// Import custom modules
const logger = require('./utils/logger');
const ApiError = require('./utils/ApiError');
const ApiResponse = require('./utils/ApiResponse');

// Load environment variables
const PORT = process.env.PORT || 5066;

// Initialize App
const app = express();

// Trust proxy — required for express-rate-limit behind Nginx/load balancer
// Without this, ERR_ERL_UNEXPECTED_X_FORWARDED_FOR is thrown in production
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

const { authLimiter, apiLimiter, webhookLimiter } = require('./middleware/rateLimit');

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5066',
    'https://app.mmitps.com',
    'https://www.mmitps.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn(`[CORS REJECTED] Origin: ${origin}`);
            callback(new ApiError(403, `CORS Error: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "wss:"],
            frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Production HTTPS Redirect
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Prevent http param pollution 
// NOTE: xss-clean removed (deprecated + bypassable). Input defense is now:
// express-validator on routes + sanitize-html on CMS write paths. 
// Standard Middleware 
// `verify` hooks capture the raw body for webhook signature verification.
app.use(express.json({ limit: '10mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '10mb', verify: (req, res, buf) => { req.rawBody = req.rawBody || buf; } }));

// Rate Limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/webhooks', webhookLimiter || ((req, res, next) => next())); // Allow webhookLimiter to be optional if not yet implemented
app.use('/api', apiLimiter);

// Use morgan for HTTP request logging (pipe to winston)
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Database Connection (PostgreSQL)
const { pool } = require('../db');
const connectPG = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        logger.info(`✅ PostgreSQL Connected — ${result.rows[0].now}`);
    } catch (err) {
        logger.error(`❌ PostgreSQL Connection Error: ${err.message}`);
        if (process.env.NODE_ENV === 'production') {
            logger.error('💥 Database connection failed in production. Exiting process to allow PM2 reload...');
            process.exit(1);
        }
    }
};
connectPG();

// Health Check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const financialRoutes = require('./routes/financialRoutes');
const mlmRoutes = require('./routes/mlmRoutes');
const educationRoutes = require('./routes/educationRoutes');
const tokenizationRoutes = require('./routes/tokenizationRoutes');
const tradingRoutes = require('./routes/tradingRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const newsRoutes = require('./routes/newsRoutes');
const journalRoutes = require('./routes/journalRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const kycRoutes = require('./routes/kycRoutes');
const supportRoutes = require('./routes/supportRoutes');
const macroRoutes = require('./routes/macroRoutes');
const featureRoutes = require('./routes/featureRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');
const tradingBotRoutes = require('./routes/tradingBotRoutes');
const socialRoutes = require('./routes/socialRoutes');
const socialHandleRoutes = require('./routes/socialHandleRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const adminCMSRoutes = require('./routes/adminCMSRoutes');
const ptdRoutes = require('./routes/ptdRoutes');
const vmidRoutes = require('./routes/vmidRoutes');
const alertRoutes = require('./routes/alertRoutes');
const adminTierRoutes = require('./routes/admin/tierRoutes');
const adminModuleRoutes = require('./routes/admin/moduleRoutes');
const menuConfigRoutes = require('./routes/menuConfigRoutes');
const upgradeRoutes = require('./routes/finance/upgradeRoutes');
const publicTierRoutes = require('./routes/publicTierRoutes');
const helpCenterRoutes = require('./routes/helpCenterRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/help-center', helpCenterRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/bonuses', require('./routes/adminBonusRoutes'));
app.use('/api/v1/bonuses', require('./routes/bonusRoutes'));
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/financial/payouts', require('./routes/payoutRoutes'));
app.use('/api/v1/mlm', mlmRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/tokenization', tokenizationRoutes);
app.use('/api/v1/bot-system', tradingBotRoutes);
app.use('/api/v1/advisor', advisorRoutes);
app.use('/api/v1/trading', tradingRoutes);
app.use('/api/v1/trading', require('./routes/tradingMiscRoutes'));
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/journal', journalRoutes);
app.use('/api/v1/resource', resourceRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/macro', macroRoutes);
app.use('/api/v1/features', featureRoutes);
app.use('/api/v1/system', require('./routes/systemRoutes'));
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/sentiment', sentimentRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/social-handles', socialHandleRoutes);
app.use('/api/v1/cms', require('./routes/cmsRoutes'));
app.use('/api/v1/certification', require('./routes/certificationRoutes'));
app.use('/api/v1/market-data', require('./routes/marketDataRoutes'));
app.use('/api/v1/admin/cms', adminCMSRoutes);
app.use('/api/v1/ptd', ptdRoutes);
app.use('/api/v1/vmid', vmidRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/admin/tiers', adminTierRoutes);
app.use('/api/v1/admin/modules', adminModuleRoutes);
app.use('/api/v1/admin/menu-config', menuConfigRoutes);
app.use('/api/v1/financial/upgrade', upgradeRoutes);
app.use('/api/v1/tiers', publicTierRoutes);
app.use('/api/v1/help-center', helpCenterRoutes);
app.use('/api/v1/site-content', require('./routes/siteContentRoutes'));
app.use('/api/v1/webhooks', webhookRoutes);

// Public plans endpoint (no auth required - for landing page pricing)
app.get('/api/v1/plans', async (req, res) => {
    try {
        const PlanRepository = require('./repositories/pg/PlanRepository');
        const plans = await PlanRepository.findAll({ isActive: true }, { sort: 'price' });
        res.status(200).json({ success: true, data: plans });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/cms', express.static(path.join(__dirname, 'uploads/cms')));

console.log('✅ Milestone 25: Financial & Social Routes Mounted');
console.log('✅ Milestone 30: AI Advisor, Sentiment & Bot Routes Mounted');

// Bot Execution Scheduler — PG edition
const TradingBotService = require('./services/pg/TradingBotService');
// Note: PG TradingBotService does not yet implement runBotCycles (demo-only bot runner).
// Re-enable when the PG bot cycle is ported. For now, the scheduler is disabled.
// setInterval(() => {
//     TradingBotService.runBotCycles().catch(err => console.error('Bot Cycle Error:', err));
// }, 60000);

// Notification TTL sweeper (PG) — purge expired notifications hourly
// (pg_cron is unavailable on Windows; node-cron is the portable equivalent.)
const cron = require('node-cron');
const NotificationRepository = require('./repositories/pg/NotificationRepository');
cron.schedule('0 * * * *', async () => {
    try {
        const purged = await NotificationRepository.deleteExpired();
        if (purged > 0) console.log(`Notification TTL: purged ${purged} expired notifications`);
    } catch (err) {
        console.error('Notification TTL sweep error:', err.message);
    }
});


// Serve runtime environment configuration
app.get('/env-config.js', (req, res) => {
    const config = {
        API_BASE_URL: process.env.API_BASE_URL || 'https://app.mmitps.com/api/v1',
        WS_URL: process.env.WS_URL || 'wss://app.mmitps.com',
        ENV: process.env.NODE_ENV || 'development'
    };
    res.set('Content-Type', 'application/javascript');
    res.send(`window.MMITPS_ENV = ${JSON.stringify(config)};`);
});

// 404 Handler - API
app.use('/api', (req, res, next) => {
    next(new ApiError(404, `API Route Not Found - ${req.originalUrl}`));
});

// Global 404 Handler
app.use((req, res, next) => {
    next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const isOperational = err.isOperational || false;

    // Log the error
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        logger.error(err.stack);
    } else {
        logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        // DEBUG 401 dumps the request body — it can contain credentials, so it
        // must never run outside development.
        if (statusCode === 401 && process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG 401] ${message} - Request Body:`, req.body);
            console.log(`[DEBUG 401] Stack:`, err.stack);
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Initialize Cron Jobs
const rankEvaluationJob = require('./jobs/rankEvaluationJob');
rankEvaluationJob.start();
logger.info('⏰ Rank evaluation job scheduled for daily execution at 2:00 AM');

// Initialize Global Task Scheduler (COT Weekly Miner, etc.)
const jobScheduler = require('./cronJobs');
jobScheduler.init();

// Database Integrity Watchdog
// Automatically detects and attempts to repair connection timeouts
const HealthService = require('./services/HealthService');
setInterval(() => {
    HealthService.checkAndFix().catch(err => logger.error(`[WATCHDOG ERROR] ${err.message}`));
}, 60000); // Check every 60 seconds

// Settlement Overdue Watchdog (Check every hour) — PG edition
const SettlementService = require('./services/pg/SettlementService');
setInterval(() => {
    SettlementService.checkOverdueSettlements().catch(err => logger.error(`[SETTLEMENT WATCHDOG ERROR] ${err.message}`));
}, 3600000); // 1 hour

// Start Server with HTTP and WebSocket
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);
app.set('wsServer', wsServer);

// Initialize and start Price Feed Service
const PriceFeedService = require('./services/PriceFeedService');
PriceFeedService.init(wsServer.io);
PriceFeedService.start().catch(err => logger.error(`[PRICE FEED ERROR] ${err.message}`));

server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🏠 Landing Page: http://localhost:${PORT}`);
    logger.info(`📊 Dashboard:    http://localhost:${PORT}/dashboard`);
    logger.info(`🔌 WebSocket server ready for real-time communication`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
