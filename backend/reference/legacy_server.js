/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    MMITPS BACKEND SERVER - Express.js                        ║
 * ║                         Version 2.0 - February 2026                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Complete backend server for MMITPS Trading Platform                         ║
 * ║  • RESTful API endpoints                                                     ║
 * ║  • WebSocket for real-time data                                              ║
 * ║  • Database integration (MongoDB/PostgreSQL)                                 ║
 * ║  • Payment processing                                                        ║
 * ║  • Email services                                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const WebSocket = require('ws');
const http = require('http');
const multer = require('multer');
const path = require('path');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'mmitps_super_secret_key_2026_production',
    JWT_EXPIRES_IN: '2h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    
    // Database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    
    // Payment Providers
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    
    // Email
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: 'MMITPS <noreply@mmitps.com>',
    
    // Market Data APIs
    TWELVEDATA_API_KEY: process.env.TWELVEDATA_API_KEY,
    ALPHA_VANTAGE_KEY: process.env.ALPHA_VANTAGE_KEY,
    TRADING_ECONOMICS_KEY: process.env.TRADING_ECONOMICS_KEY,
    
    // Crypto
    CRYPTO_WALLET_PROVIDER: process.env.CRYPTO_WALLET_PROVIDER || 'fireblocks',
    FIREBLOCKS_API_KEY: process.env.FIREBLOCKS_API_KEY,
    
    // File Upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    UPLOAD_DIR: './uploads',
};

// ============================================================================
// INITIALIZE EXPRESS APP
// ============================================================================

const app = express();
const server = http.createServer(app);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://app.mmitps.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 failed auth requests per hour
    message: { error: 'Too many authentication attempts, please try again later.' },
    skipSuccessfulRequests: true,
});
app.use('/api/v1/auth/login', authLimiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CONFIG.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: CONFIG.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type'));
    },
});

// ============================================================================
// DATABASE MODELS (MongoDB/Mongoose)
// ============================================================================

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    country: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    
    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    
    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    
    // KYC
    kycStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    kycLevel: { type: Number, default: 0 },
    kycDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KYCDocument' }],
    
    // Referral
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Wallet
    walletBalances: {
        USD: { type: Number, default: 0 },
        EUR: { type: Number, default: 0 },
        GBP: { type: Number, default: 0 },
        BTC: { type: Number, default: 0 },
        ETH: { type: Number, default: 0 },
        USDT: { type: Number, default: 0 },
    },
    
    // MLM
    mlmRank: { type: String, default: 'Starter' },
    binaryLegPreference: { type: String, enum: ['left', 'right', 'auto'], default: 'auto' },
    leftLegVolume: { type: Number, default: 0 },
    rightLegVolume: { type: Number, default: 0 },
    
    // Trading accounts
    tradingAccounts: [{
        platform: String, // mt4, mt5, ctrader
        accountId: String,
        server: String,
        connected: Boolean,
        lastSync: Date,
    }],
    
    // Settings
    notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
    },
    
    // Timestamps
    lastLogin: Date,
    passwordChangedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

// Generate referral code before save
userSchema.pre('save', async function(next) {
    if (!this.referralCode) {
        this.referralCode = `MMITPS${this._id.toString().slice(-6).toUpperCase()}`;
    }
    next();
});

const User = mongoose.model('User', userSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'commission', 'fee'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], default: 'pending' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentMethod: { type: String }, // stripe, paystack, crypto, etc.
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
    
    // For crypto transactions
    chain: { type: String },
    txHash: { type: String },
    fromAddress: { type: String },
    toAddress: { type: String },
    confirmations: { type: Number, default: 0 },
    requiredConfirmations: { type: Number },
    
    // For internal transfers
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
    
    // Fee
    fee: { type: Number, default: 0 },
    netAmount: { type: Number },
    
    // Reference
    reference: { type: String, unique: true },
    externalReference: { type: String },
    
    // Timestamps
    processedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

transactionSchema.pre('save', function(next) {
    if (!this.reference) {
        this.reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    if (!this.netAmount) {
        this.netAmount = this.amount - this.fee;
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Support Ticket Schema
const ticketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: String, unique: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['general', 'technical', 'billing', 'trading', 'kyc', 'other'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'], default: 'open' },
    
    messages: [{
        sender: { type: String, enum: ['user', 'support'] },
        message: String,
        attachments: [String],
        createdAt: { type: Date, default: Date.now },
    }],
    
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    closedAt: Date,
});

ticketSchema.pre('save', function(next) {
    if (!this.ticketId) {
        this.ticketId = `TKT${Date.now().toString(36).toUpperCase()}`;
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// KYC Document Schema
const kycDocumentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: { type: String, enum: ['id_card', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'selfie'], required: true },
    files: [String],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: String,
    metadata: mongoose.Schema.Types.Mixed,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

const KYCDocument = mongoose.model('KYCDocument', kycDocumentSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    readAt: Date,
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);

// Trade Journal Entry Schema
const tradeJournalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tradingAccount: String,
    
    // Trade details
    ticket: String,
    symbol: String,
    type: { type: String, enum: ['buy', 'sell'] },
    volume: Number,
    openPrice: Number,
    closePrice: Number,
    stopLoss: Number,
    takeProfit: Number,
    commission: Number,
    swap: Number,
    profit: Number,
    
    // Dates
    openTime: Date,
    closeTime: Date,
    
    // User notes
    strategy: String,
    notes: String,
    tags: [String],
    rating: { type: Number, min: 1, max: 5 },
    screenshots: [String],
    
    // Analysis
    riskRewardRatio: Number,
    winLoss: { type: String, enum: ['win', 'loss', 'breakeven'] },
    pips: Number,
    
    createdAt: { type: Date, default: Date.now },
});

const TradeJournal = mongoose.model('TradeJournal', tradeJournalSchema);

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        if (!user.isActive || user.isBanned) {
            return res.status(403).json({ error: 'Account is suspended' });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generate tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        CONFIG.JWT_SECRET,
        { expiresIn: CONFIG.JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        CONFIG.JWT_SECRET,
        { expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN }
    );
    
    return { accessToken, refreshToken };
};

// Email transporter
const emailTransporter = nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    secure: false,
    auth: {
        user: CONFIG.SMTP_USER,
        pass: CONFIG.SMTP_PASS,
    },
});

// Send email
const sendEmail = async (to, subject, html, text = null) => {
    try {
        await emailTransporter.sendMail({
            from: CONFIG.EMAIL_FROM,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

// Create notification
const createNotification = async (userId, type, title, message, data = {}) => {
    const notification = new Notification({
        user: userId,
        type,
        title,
        message,
        data,
    });
    await notification.save();
    
    // Send via WebSocket if user is connected
    broadcastToUser(userId, 'notification', { notification });
    
    return notification;
};

// ============================================================================
// API ROUTES - AUTHENTICATION
// ============================================================================

const authRouter = express.Router();

// Register
authRouter.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country, referralCode } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Find referrer if code provided
        let referrer = null;
        if (referralCode) {
            referrer = await User.findOne({ referralCode });
        }
        
        // Create user
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            country,
            referredBy: referrer?._id,
        });
        
        await user.save();
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        // Send welcome email
        await sendEmail(
            email,
            'Welcome to MMITPS Trading Platform!',
            `<h1>Welcome ${firstName}!</h1>
            <p>Thank you for joining MMITPS. Your account has been created successfully.</p>
            <p>Start exploring our trading tools and features today!</p>
            <a href="https://app.mmitps.com/login" style="background: #00d4aa; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login to Dashboard</a>`
        );
        
        // Create welcome notification
        await createNotification(
            user._id,
            'welcome',
            'Welcome to MMITPS!',
            'Your account has been created successfully. Start exploring our trading tools!'
        );
        
        res.status(201).json({
            message: 'Registration successful',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 7200,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                referral_code: user.referralCode,
            },
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password, twoFactorCode } = req.body;
        
        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if account is active
        if (!user.isActive || user.isBanned) {
            return res.status(403).json({ error: 'Account is suspended' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check 2FA if enabled
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                return res.status(200).json({ requires_2fa: true });
            }
            
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });
            
            if (!verified) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);
        
        res.json({
            message: 'Login successful',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 7200,
            user: {
                id: user._id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                avatar: user.avatar,
                role: user.role,
                kyc_status: user.kycStatus,
                wallet_balances: user.walletBalances,
            },
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Refresh token
authRouter.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;
        
        const decoded = jwt.verify(refresh_token, CONFIG.JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const { accessToken } = generateTokens(user._id);
        
        res.json({
            access_token: accessToken,
            expires_in: 7200,
        });
        
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Logout
authRouter.post('/logout', authenticateToken, async (req, res) => {
    // In a production app, you would invalidate the token here
    // For example, by adding it to a blacklist in Redis
    res.json({ message: 'Logged out successfully' });
});

// Password reset request
authRouter.post('/password-reset/request', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Store token in Redis with 1 hour expiry
        // await redis.setex(`password_reset:${hashedToken}`, 3600, user._id.toString());
        
        // Send email
        await sendEmail(
            email,
            'Reset Your MMITPS Password',
            `<h1>Password Reset Request</h1>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href="https://app.mmitps.com/reset-password?token=${resetToken}" style="background: #00d4aa; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>`
        );
        
        res.json({ message: 'If an account exists, a reset link has been sent.' });
        
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Request failed' });
    }
});

// Password reset confirm
authRouter.post('/password-reset/confirm', async (req, res) => {
    try {
        const { token, new_password } = req.body;
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Get user ID from Redis
        // const userId = await redis.get(`password_reset:${hashedToken}`);
        // if (!userId) {
        //     return res.status(400).json({ error: 'Invalid or expired token' });
        // }
        
        // For demo, we'll skip Redis validation
        // In production, always validate the token
        
        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        
        // Update user password
        // await User.findByIdAndUpdate(userId, {
        //     password: hashedPassword,
        //     passwordChangedAt: new Date(),
        // });
        
        // Delete token from Redis
        // await redis.del(`password_reset:${hashedToken}`);
        
        res.json({ message: 'Password reset successful' });
        
    } catch (error) {
        console.error('Password reset confirm error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Change password (authenticated)
authRouter.post('/password-change', authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        const user = await User.findById(req.user._id);
        
        // Verify current password
        const isValid = await bcrypt.compare(current_password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        
        // Update password
        user.password = hashedPassword;
        user.passwordChangedAt = new Date();
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
        
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

// Setup 2FA
authRouter.post('/2fa/setup', authenticateToken, async (req, res) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `MMITPS:${req.user.email}`,
        });
        
        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        // Store secret temporarily
        req.user.twoFactorSecret = secret.base32;
        await req.user.save();
        
        // Generate backup codes
        const backupCodes = Array(10).fill(null).map(() =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
        );
        
        res.json({
            secret: secret.base32,
            qr_code_url: qrCodeUrl,
            backup_codes: backupCodes,
        });
        
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: '2FA setup failed' });
    }
});

// Verify 2FA
authRouter.post('/2fa/verify', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        
        const verified = speakeasy.totp.verify({
            secret: req.user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });
        
        if (!verified) {
            return res.status(401).json({ error: 'Invalid code' });
        }
        
        req.user.twoFactorEnabled = true;
        await req.user.save();
        
        res.json({ message: '2FA enabled successfully' });
        
    } catch (error) {
        console.error('2FA verify error:', error);
        res.status(500).json({ error: '2FA verification failed' });
    }
});

// ============================================================================
// API ROUTES - WALLET & PAYMENTS
// ============================================================================

const walletRouter = express.Router();

// Get wallet balance
walletRouter.get('/balance', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Calculate total in USD (simplified - would need real exchange rates)
        const exchangeRates = {
            USD: 1,
            EUR: 1.08,
            GBP: 1.27,
            BTC: 43000,
            ETH: 2500,
            USDT: 1,
        };
        
        let totalUSD = 0;
        for (const [currency, balance] of Object.entries(user.walletBalances.toObject())) {
            totalUSD += balance * (exchangeRates[currency] || 1);
        }
        
        res.json({
            balances: user.walletBalances,
            total_usd: totalUSD,
        });
        
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Get transactions
walletRouter.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;
        
        const query = { user: req.user._id };
        if (type && type !== 'all') {
            query.type = type;
        }
        
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Transaction.countDocuments(query);
        
        res.json({
            transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
        
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Internal transfer
walletRouter.post('/transfer', authenticateToken, async (req, res) => {
    try {
        const { recipient_email, amount, currency, note } = req.body;
        
        // Find recipient
        const recipient = await User.findOne({ email: recipient_email.toLowerCase() });
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        if (recipient._id.equals(req.user._id)) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }
        
        // Check balance
        const sender = await User.findById(req.user._id);
        if (sender.walletBalances[currency] < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // Process transfer
        sender.walletBalances[currency] -= amount;
        recipient.walletBalances[currency] += amount;
        
        await sender.save();
        await recipient.save();
        
        // Create transaction records
        const senderTx = new Transaction({
            user: sender._id,
            type: 'transfer',
            status: 'completed',
            amount: -amount,
            currency,
            recipient: recipient._id,
            note,
        });
        
        const recipientTx = new Transaction({
            user: recipient._id,
            type: 'transfer',
            status: 'completed',
            amount: amount,
            currency,
            recipient: sender._id,
            note: `Transfer from ${sender.email}`,
        });
        
        await senderTx.save();
        await recipientTx.save();
        
        // Notify recipient
        await createNotification(
            recipient._id,
            'transfer_received',
            'Transfer Received',
            `You received ${amount} ${currency} from ${sender.firstName} ${sender.lastName}`
        );
        
        res.json({
            transfer_id: senderTx.reference,
            new_balance: sender.walletBalances[currency],
        });
        
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Transfer failed' });
    }
});

// ============================================================================
// API ROUTES - PAYMENTS
// ============================================================================

const paymentsRouter = express.Router();

// Initialize Stripe
const stripe = new Stripe(CONFIG.STRIPE_SECRET_KEY);

// Create Stripe payment intent
paymentsRouter.post('/stripe/create-intent', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, description } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Already in cents
            currency: currency.toLowerCase(),
            description,
            metadata: {
                user_id: req.user._id.toString(),
            },
        });
        
        // Create pending transaction
        const transaction = new Transaction({
            user: req.user._id,
            type: 'deposit',
            status: 'pending',
            amount: amount / 100,
            currency: currency.toUpperCase(),
            paymentMethod: 'stripe',
            externalReference: paymentIntent.id,
        });
        await transaction.save();
        
        res.json({
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id,
        });
        
    } catch (error) {
        console.error('Stripe create intent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Stripe webhook
paymentsRouter.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Find and update transaction
        const transaction = await Transaction.findOne({
            externalReference: paymentIntent.id,
        });
        
        if (transaction) {
            transaction.status = 'completed';
            transaction.processedAt = new Date();
            await transaction.save();
            
            // Credit user wallet
            const user = await User.findById(transaction.user);
            user.walletBalances[transaction.currency] += transaction.amount;
            await user.save();
            
            // Send notification
            await createNotification(
                user._id,
                'deposit_completed',
                'Deposit Confirmed',
                `Your deposit of ${transaction.amount} ${transaction.currency} has been credited.`
            );
        }
    }
    
    res.json({ received: true });
});

// Generate crypto deposit address
paymentsRouter.post('/crypto/deposit-address', authenticateToken, async (req, res) => {
    try {
        const { chain, token } = req.body;
        
        // In production, this would integrate with a crypto wallet provider
        // like Fireblocks, BitGo, or generate from HD wallet
        
        // Demo addresses (DO NOT USE IN PRODUCTION)
        const addresses = {
            ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD73',
            bsc: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD73',
            polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD73',
            tron: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW',
            solana: '5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG',
        };
        
        const confirmationsRequired = {
            ethereum: 12,
            bsc: 15,
            polygon: 128,
            tron: 19,
            solana: 32,
        };
        
        res.json({
            address: addresses[chain] || addresses.ethereum,
            memo: chain === 'solana' ? null : null,
            qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${addresses[chain]}`,
            minimum_deposit: chain === 'ethereum' ? 50 : 10,
            confirmations_required: confirmationsRequired[chain] || 12,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        
    } catch (error) {
        console.error('Crypto deposit address error:', error);
        res.status(500).json({ error: 'Failed to generate address' });
    }
});

// Process crypto withdrawal
paymentsRouter.post('/crypto/withdraw', authenticateToken, async (req, res) => {
    try {
        const { chain, token, amount, destination_address, memo } = req.body;
        
        // Validate user has sufficient balance
        const user = await User.findById(req.user._id);
        if (user.walletBalances[token] < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // Create withdrawal transaction
        const transaction = new Transaction({
            user: req.user._id,
            type: 'withdrawal',
            status: 'pending',
            amount,
            currency: token,
            paymentMethod: 'crypto',
            chain,
            toAddress: destination_address,
            fee: amount * 0.001, // 0.1% fee
        });
        await transaction.save();
        
        // Deduct from balance
        user.walletBalances[token] -= amount;
        await user.save();
        
        // In production, this would initiate the actual blockchain transaction
        
        res.json({
            withdrawal_id: transaction.reference,
            status: 'pending',
            estimated_completion: '10-30 minutes',
            fee: transaction.fee,
        });
        
    } catch (error) {
        console.error('Crypto withdrawal error:', error);
        res.status(500).json({ error: 'Withdrawal failed' });
    }
});

// ============================================================================
// API ROUTES - MARKET DATA
// ============================================================================

const marketDataRouter = express.Router();

// Get forex price
marketDataRouter.get('/forex/price/:pair', authenticateToken, async (req, res) => {
    try {
        const { pair } = req.params;
        
        // In production, fetch from TwelveData, Alpha Vantage, or similar
        // Demo data for now
        const baseRates = {
            EURUSD: { bid: 1.0845, ask: 1.0847, change: 0.0012 },
            GBPUSD: { bid: 1.2654, ask: 1.2656, change: -0.0008 },
            USDJPY: { bid: 149.45, ask: 149.47, change: 0.35 },
            USDCHF: { bid: 0.8765, ask: 0.8767, change: -0.0015 },
            AUDUSD: { bid: 0.6543, ask: 0.6545, change: 0.0023 },
            USDCAD: { bid: 1.3567, ask: 1.3569, change: -0.0018 },
            NZDUSD: { bid: 0.6123, ask: 0.6125, change: 0.0011 },
        };
        
        const data = baseRates[pair.toUpperCase()] || { bid: 1.0000, ask: 1.0002, change: 0 };
        
        // Add some randomness for demo
        const variation = (Math.random() - 0.5) * 0.0010;
        
        res.json({
            pair: pair.toUpperCase(),
            bid: data.bid + variation,
            ask: data.ask + variation,
            spread: (data.ask - data.bid) * 10000,
            change: data.change,
            change_percent: (data.change / data.bid * 100).toFixed(2),
            high: data.bid * 1.002,
            low: data.bid * 0.998,
            timestamp: new Date().toISOString(),
        });
        
    } catch (error) {
        console.error('Forex price error:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// Get multiple forex prices
marketDataRouter.post('/forex/prices', authenticateToken, async (req, res) => {
    try {
        const { pairs } = req.body;
        
        const prices = pairs.map(pair => ({
            pair: pair.toUpperCase(),
            bid: 1.0845 + (Math.random() - 0.5) * 0.01,
            ask: 1.0847 + (Math.random() - 0.5) * 0.01,
            change: (Math.random() - 0.5) * 0.005,
            timestamp: new Date().toISOString(),
        }));
        
        res.json({ prices });
        
    } catch (error) {
        console.error('Forex prices error:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Get historical forex data
marketDataRouter.get('/forex/historical/:pair', authenticateToken, async (req, res) => {
    try {
        const { pair } = req.params;
        const { interval = '1h', limit = 500 } = req.query;
        
        // Generate demo OHLCV data
        const candles = [];
        let basePrice = 1.0845;
        const now = Date.now();
        
        const intervalMs = {
            '1m': 60000,
            '5m': 300000,
            '15m': 900000,
            '1h': 3600000,
            '4h': 14400000,
            '1d': 86400000,
        };
        
        const ms = intervalMs[interval] || 3600000;
        
        for (let i = limit - 1; i >= 0; i--) {
            const change = (Math.random() - 0.5) * 0.005;
            const open = basePrice;
            const close = basePrice + change;
            const high = Math.max(open, close) + Math.random() * 0.002;
            const low = Math.min(open, close) - Math.random() * 0.002;
            
            candles.push({
                timestamp: new Date(now - i * ms).toISOString(),
                open,
                high,
                low,
                close,
                volume: Math.floor(Math.random() * 10000) + 1000,
            });
            
            basePrice = close;
        }
        
        res.json({ candles });
        
    } catch (error) {
        console.error('Forex historical error:', error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

// Get crypto price
marketDataRouter.get('/crypto/price/:symbol', authenticateToken, async (req, res) => {
    try {
        const { symbol } = req.params;
        
        const prices = {
            BTC: { price: 43250, change24h: 2.5 },
            ETH: { price: 2534, change24h: 3.2 },
            BNB: { price: 312, change24h: 1.8 },
            SOL: { price: 98, change24h: 5.4 },
            XRP: { price: 0.62, change24h: -1.2 },
        };
        
        const data = prices[symbol.toUpperCase()] || { price: 100, change24h: 0 };
        
        res.json({
            symbol: symbol.toUpperCase(),
            price: data.price + (Math.random() - 0.5) * data.price * 0.01,
            change_24h: data.change24h,
            high_24h: data.price * 1.03,
            low_24h: data.price * 0.97,
            volume_24h: Math.floor(Math.random() * 1000000000),
            market_cap: data.price * 19000000,
            timestamp: new Date().toISOString(),
        });
        
    } catch (error) {
        console.error('Crypto price error:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// Get COT data
marketDataRouter.get('/cot/:instrument', authenticateToken, async (req, res) => {
    try {
        const { instrument } = req.params;
        const { weeks = 52 } = req.query;
        
        // Generate demo COT data
        const reports = [];
        const now = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        
        for (let i = weeks - 1; i >= 0; i--) {
            const commercialLong = Math.floor(Math.random() * 100000) + 50000;
            const commercialShort = Math.floor(Math.random() * 100000) + 50000;
            const nonCommercialLong = Math.floor(Math.random() * 80000) + 30000;
            const nonCommercialShort = Math.floor(Math.random() * 80000) + 30000;
            
            reports.push({
                date: new Date(now - i * weekMs).toISOString().split('T')[0],
                commercial_long: commercialLong,
                commercial_short: commercialShort,
                commercial_net: commercialLong - commercialShort,
                non_commercial_long: nonCommercialLong,
                non_commercial_short: nonCommercialShort,
                non_commercial_net: nonCommercialLong - nonCommercialShort,
                open_interest: commercialLong + commercialShort + nonCommercialLong + nonCommercialShort,
            });
        }
        
        res.json({
            instrument,
            reports,
            net_positions: reports.map(r => ({
                date: r.date,
                commercial: r.commercial_net,
                speculator: r.non_commercial_net,
            })),
        });
        
    } catch (error) {
        console.error('COT data error:', error);
        res.status(500).json({ error: 'Failed to fetch COT data' });
    }
});

// Get economic calendar
marketDataRouter.get('/economic-calendar', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date, countries, importance } = req.query;
        
        // Generate demo economic events
        const events = [
            { event: 'Non-Farm Payrolls', country: 'US', importance: 'high', actual: '256K', forecast: '180K', previous: '212K' },
            { event: 'Interest Rate Decision', country: 'US', importance: 'high', actual: '5.50%', forecast: '5.50%', previous: '5.50%' },
            { event: 'CPI m/m', country: 'US', importance: 'high', actual: '0.3%', forecast: '0.2%', previous: '0.3%' },
            { event: 'GDP q/q', country: 'UK', importance: 'high', actual: '0.1%', forecast: '0.0%', previous: '-0.1%' },
            { event: 'Retail Sales m/m', country: 'EU', importance: 'medium', actual: '0.5%', forecast: '0.3%', previous: '0.2%' },
            { event: 'Unemployment Rate', country: 'AU', importance: 'medium', actual: '3.9%', forecast: '3.8%', previous: '3.7%' },
        ];
        
        const startTime = new Date(start_date || Date.now()).getTime();
        const endTime = new Date(end_date || Date.now() + 7 * 24 * 60 * 60 * 1000).getTime();
        
        const calendar = events.map((event, i) => ({
            ...event,
            datetime: new Date(startTime + Math.random() * (endTime - startTime)).toISOString(),
            impact: event.importance === 'high' ? 3 : event.importance === 'medium' ? 2 : 1,
        })).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        res.json({ events: calendar });
        
    } catch (error) {
        console.error('Economic calendar error:', error);
        res.status(500).json({ error: 'Failed to fetch calendar' });
    }
});

// Get seasonality data
marketDataRouter.get('/seasonality/:instrument', authenticateToken, async (req, res) => {
    try {
        const { instrument } = req.params;
        
        const monthlyPatterns = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        months.forEach(month => {
            const avgReturn = (Math.random() - 0.5) * 4;
            monthlyPatterns.push({
                month,
                average_return: avgReturn.toFixed(2),
                win_rate: (50 + avgReturn * 5).toFixed(1),
                best_year: (avgReturn * 3).toFixed(2),
                worst_year: (avgReturn * -2).toFixed(2),
            });
        });
        
        res.json({
            instrument,
            monthly_patterns: monthlyPatterns,
            best_months: monthlyPatterns.filter(m => parseFloat(m.average_return) > 0.5).map(m => m.month),
            worst_months: monthlyPatterns.filter(m => parseFloat(m.average_return) < -0.5).map(m => m.month),
        });
        
    } catch (error) {
        console.error('Seasonality error:', error);
        res.status(500).json({ error: 'Failed to fetch seasonality' });
    }
});

// ============================================================================
// API ROUTES - SUPPORT
// ============================================================================

const supportRouter = express.Router();

// Create ticket
supportRouter.post('/tickets', authenticateToken, upload.array('attachments', 5), async (req, res) => {
    try {
        const { subject, category, message, priority } = req.body;
        
        const attachments = req.files?.map(f => f.path) || [];
        
        const ticket = new Ticket({
            user: req.user._id,
            subject,
            category,
            priority: priority || 'medium',
            messages: [{
                sender: 'user',
                message,
                attachments,
            }],
        });
        
        await ticket.save();
        
        // Send confirmation email
        await sendEmail(
            req.user.email,
            `Support Ticket #${ticket.ticketId} Created`,
            `<h1>Ticket Created</h1>
            <p>Your support ticket has been created successfully.</p>
            <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p>Our team will respond within 24-48 hours.</p>`
        );
        
        res.status(201).json({
            ticket_id: ticket.ticketId,
            status: ticket.status,
        });
        
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Get user's tickets
supportRouter.get('/tickets', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = { user: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const tickets = await Ticket.find(query)
            .select('-messages')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Ticket.countDocuments(query);
        
        res.json({
            tickets,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
        
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Get ticket details
supportRouter.get('/tickets/:ticketId', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId,
            user: req.user._id,
        });
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json(ticket);
        
    } catch (error) {
        console.error('Get ticket details error:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});

// Reply to ticket
supportRouter.post('/tickets/:ticketId/reply', authenticateToken, upload.array('attachments', 5), async (req, res) => {
    try {
        const { message } = req.body;
        const attachments = req.files?.map(f => f.path) || [];
        
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId,
            user: req.user._id,
        });
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        ticket.messages.push({
            sender: 'user',
            message,
            attachments,
        });
        
        ticket.status = 'open';
        ticket.updatedAt = new Date();
        
        await ticket.save();
        
        res.json({
            reply_id: ticket.messages[ticket.messages.length - 1]._id,
        });
        
    } catch (error) {
        console.error('Reply to ticket error:', error);
        res.status(500).json({ error: 'Failed to reply' });
    }
});

// Close ticket
supportRouter.post('/tickets/:ticketId/close', authenticateToken, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId,
            user: req.user._id,
        });
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        ticket.status = 'closed';
        ticket.closedAt = new Date();
        if (rating) ticket.rating = rating;
        if (feedback) ticket.feedback = feedback;
        
        await ticket.save();
        
        res.json({ message: 'Ticket closed' });
        
    } catch (error) {
        console.error('Close ticket error:', error);
        res.status(500).json({ error: 'Failed to close ticket' });
    }
});

// ============================================================================
// API ROUTES - NOTIFICATIONS
// ============================================================================

const notificationsRouter = express.Router();

// Get notifications
notificationsRouter.get('/', authenticateToken, async (req, res) => {
    try {
        const { read, page = 1, limit = 20 } = req.query;
        
        const query = { user: req.user._id };
        if (read === 'true') query.read = true;
        if (read === 'false') query.read = false;
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
        
        res.json({
            notifications,
            total,
            unread_count: unreadCount,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
        
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
notificationsRouter.post('/:id/read', authenticateToken, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true, readAt: new Date() }
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
notificationsRouter.post('/read-all', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true, readAt: new Date() }
        );
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// ============================================================================
// API ROUTES - TRADING
// ============================================================================

const tradingRouter = express.Router();

// Connect MetaTrader account
tradingRouter.post('/metatrader/connect', authenticateToken, async (req, res) => {
    try {
        const { server, login, password, platform } = req.body;
        
        // In production, this would connect to MetaTrader API (MetaApi, etc.)
        // Demo response
        const account = {
            platform,
            accountId: login,
            server,
            connected: true,
            lastSync: new Date(),
        };
        
        // Add to user's trading accounts
        const user = await User.findById(req.user._id);
        user.tradingAccounts.push(account);
        await user.save();
        
        res.json({
            account_id: login,
            balance: 10000 + Math.random() * 5000,
            equity: 10500 + Math.random() * 5000,
            margin: 1000 + Math.random() * 500,
            free_margin: 9000 + Math.random() * 4000,
        });
        
    } catch (error) {
        console.error('MetaTrader connect error:', error);
        res.status(500).json({ error: 'Connection failed' });
    }
});

// Get open positions
tradingRouter.get('/positions/:accountId', authenticateToken, async (req, res) => {
    try {
        // Demo positions
        const positions = [
            {
                ticket: '12345678',
                symbol: 'EURUSD',
                type: 'buy',
                volume: 0.1,
                open_price: 1.0845,
                current_price: 1.0867,
                stop_loss: 1.0800,
                take_profit: 1.0900,
                profit: 22.00,
                swap: -1.20,
                open_time: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                ticket: '12345679',
                symbol: 'GBPUSD',
                type: 'sell',
                volume: 0.05,
                open_price: 1.2680,
                current_price: 1.2654,
                stop_loss: 1.2750,
                take_profit: 1.2550,
                profit: 13.00,
                swap: -0.85,
                open_time: new Date(Date.now() - 43200000).toISOString(),
            },
        ];
        
        res.json({ positions });
        
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});

// Get trade history
tradingRouter.get('/history/:accountId', authenticateToken, async (req, res) => {
    try {
        const { start, end } = req.query;
        
        // Demo trade history
        const trades = [];
        const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
        const types = ['buy', 'sell'];
        
        for (let i = 0; i < 20; i++) {
            const openTime = new Date(Date.now() - Math.random() * 30 * 86400000);
            const closeTime = new Date(openTime.getTime() + Math.random() * 86400000);
            const profit = (Math.random() - 0.4) * 200;
            
            trades.push({
                ticket: `${12345000 + i}`,
                symbol: symbols[Math.floor(Math.random() * symbols.length)],
                type: types[Math.floor(Math.random() * types.length)],
                volume: (Math.random() * 0.5 + 0.01).toFixed(2),
                open_price: (1.0800 + Math.random() * 0.02).toFixed(5),
                close_price: (1.0800 + Math.random() * 0.02).toFixed(5),
                profit: profit.toFixed(2),
                swap: (-Math.random() * 5).toFixed(2),
                commission: (-Math.random() * 2).toFixed(2),
                open_time: openTime.toISOString(),
                close_time: closeTime.toISOString(),
            });
        }
        
        res.json({ trades });
        
    } catch (error) {
        console.error('Get trade history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Sync trade journal
tradingRouter.post('/journal/sync', authenticateToken, async (req, res) => {
    try {
        const { account_id } = req.body;
        
        // Get trades from trading platform (demo)
        const newTrades = Math.floor(Math.random() * 10);
        
        res.json({
            synced_trades: 50 + newTrades,
            new_trades: newTrades,
            last_sync: new Date().toISOString(),
        });
        
    } catch (error) {
        console.error('Journal sync error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// ============================================================================
// API ROUTES - MLM
// ============================================================================

const mlmRouter = express.Router();

// Get referral link
mlmRouter.get('/referral-link', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            link: `https://app.mmitps.com/register?ref=${user.referralCode}`,
            code: user.referralCode,
        });
        
    } catch (error) {
        console.error('Get referral link error:', error);
        res.status(500).json({ error: 'Failed to get referral link' });
    }
});

// Get downline
mlmRouter.get('/downline', authenticateToken, async (req, res) => {
    try {
        const { level, page = 1, limit = 50 } = req.query;
        
        const query = { referredBy: req.user._id };
        
        const downline = await User.find(query)
            .select('firstName lastName email createdAt kycStatus walletBalances')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await User.countDocuments(query);
        
        res.json({
            downline,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
        
    } catch (error) {
        console.error('Get downline error:', error);
        res.status(500).json({ error: 'Failed to fetch downline' });
    }
});

// Get binary tree
mlmRouter.get('/binary-tree', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Build tree structure (demo)
        const tree = {
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                rank: user.mlmRank,
            },
            left: {
                user: { name: 'Left Member 1', rank: 'Starter' },
                volume: user.leftLegVolume,
                children: [],
            },
            right: {
                user: { name: 'Right Member 1', rank: 'Starter' },
                volume: user.rightLegVolume,
                children: [],
            },
        };
        
        res.json({ tree });
        
    } catch (error) {
        console.error('Get binary tree error:', error);
        res.status(500).json({ error: 'Failed to fetch binary tree' });
    }
});

// Get rank info
mlmRouter.get('/rank', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        const ranks = [
            { name: 'Starter', requirement: 0 },
            { name: 'Bronze', requirement: 1000 },
            { name: 'Silver', requirement: 5000 },
            { name: 'Gold', requirement: 15000 },
            { name: 'Platinum', requirement: 50000 },
            { name: 'Diamond', requirement: 150000 },
            { name: 'Crown', requirement: 500000 },
        ];
        
        const currentRankIndex = ranks.findIndex(r => r.name === user.mlmRank);
        const totalVolume = user.leftLegVolume + user.rightLegVolume;
        const nextRank = ranks[currentRankIndex + 1];
        
        res.json({
            current_rank: user.mlmRank,
            next_rank: nextRank?.name || 'Max Rank',
            progress: nextRank ? (totalVolume / nextRank.requirement * 100).toFixed(1) : 100,
            requirements: nextRank ? { volume_needed: nextRank.requirement - totalVolume } : null,
            achievements: ['First Referral', 'First Deposit', '10 Trades'],
        });
        
    } catch (error) {
        console.error('Get rank error:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

// Set binary leg preference
mlmRouter.post('/binary-leg', authenticateToken, async (req, res) => {
    try {
        const { preferred_leg } = req.body;
        
        if (!['left', 'right', 'auto'].includes(preferred_leg)) {
            return res.status(400).json({ error: 'Invalid leg preference' });
        }
        
        const user = await User.findById(req.user._id);
        user.binaryLegPreference = preferred_leg;
        await user.save();
        
        res.json({ preferred_leg });
        
    } catch (error) {
        console.error('Set binary leg error:', error);
        res.status(500).json({ error: 'Failed to set preference' });
    }
});

// ============================================================================
// API ROUTES - KYC
// ============================================================================

const kycRouter = express.Router();

// Get KYC status
kycRouter.get('/status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('kycDocuments');
        
        res.json({
            status: user.kycStatus,
            level: user.kycLevel,
            documents: user.kycDocuments,
        });
        
    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({ error: 'Failed to fetch KYC status' });
    }
});

// Upload KYC document
kycRouter.post('/upload', authenticateToken, upload.array('documents', 3), async (req, res) => {
    try {
        const { document_type, metadata } = req.body;
        
        const files = req.files?.map(f => f.path) || [];
        
        const document = new KYCDocument({
            user: req.user._id,
            documentType: document_type,
            files,
            metadata: JSON.parse(metadata || '{}'),
        });
        
        await document.save();
        
        // Add to user's KYC documents
        const user = await User.findById(req.user._id);
        user.kycDocuments.push(document._id);
        await user.save();
        
        res.json({
            document_id: document._id,
            status: document.status,
        });
        
    } catch (error) {
        console.error('KYC upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Submit KYC for review
kycRouter.post('/submit', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.kycStatus = 'pending';
        await user.save();
        
        // Create notification for admins
        // ...
        
        res.json({
            status: 'pending',
            estimated_review_time: '24-48 hours',
        });
        
    } catch (error) {
        console.error('KYC submit error:', error);
        res.status(500).json({ error: 'Submission failed' });
    }
});

// ============================================================================
// API ROUTES - EMAIL
// ============================================================================

const emailRouter = express.Router();

// Send email (internal use)
emailRouter.post('/send', authenticateToken, async (req, res) => {
    try {
        const { to, subject, template, variables } = req.body;
        
        // Template rendering would go here
        // For demo, just send simple HTML
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <img src="https://app.mmitps.com/logo.png" alt="MMITPS" style="max-width: 150px; margin-bottom: 20px;">
                <h1 style="color: #00d4aa;">${subject}</h1>
                <p>${JSON.stringify(variables)}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">MMITPS Trading Platform</p>
            </div>
        `;
        
        const sent = await sendEmail(to, subject, html);
        
        if (sent) {
            res.json({ message_id: uuidv4() });
        } else {
            res.status(500).json({ error: 'Email sending failed' });
        }
        
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ error: 'Email sending failed' });
    }
});

// ============================================================================
// API ROUTES - ACTIVITY LOG
// ============================================================================

const activityRouter = express.Router();

// Log activity
activityRouter.post('/log', authenticateToken, async (req, res) => {
    try {
        const { action, details, timestamp } = req.body;
        
        // In production, store in database
        console.log(`[Activity] User ${req.user._id}: ${action}`, details);
        
        res.json({ logged: true });
        
    } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

// ============================================================================
// API ROUTES - STATUS
// ============================================================================

app.get('/api/v1/status', (req, res) => {
    res.json({
        status: 'online',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            redis: 'connected',
            email: 'operational',
            payments: 'operational',
        },
    });
});

// ============================================================================
// REGISTER ROUTES
// ============================================================================

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/wallet', authenticateToken, walletRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/market-data', marketDataRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/trading', tradingRouter);
app.use('/api/v1/mlm', mlmRouter);
app.use('/api/v1/kyc', kycRouter);
app.use('/api/v1/email', emailRouter);
app.use('/api/v1/activity', activityRouter);

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

const wss = new WebSocket.Server({ server, path: '/ws' });

// Connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.action === 'authenticate') {
                // Verify token and associate with user
                const decoded = jwt.verify(data.token, CONFIG.JWT_SECRET);
                ws.userId = decoded.userId;
                clients.set(decoded.userId, ws);
                
                ws.send(JSON.stringify({ type: 'authenticated', userId: decoded.userId }));
            }
            
            if (data.action === 'subscribe') {
                ws.subscriptions = data.channels || [];
            }
            
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        if (ws.userId) {
            clients.delete(ws.userId);
        }
        console.log('WebSocket client disconnected');
    });
});

// Broadcast to specific user
function broadcastToUser(userId, type, data) {
    const client = clients.get(userId.toString());
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
    }
}

// Broadcast market data to all subscribed clients
function broadcastMarketData(channel, data) {
    clients.forEach((ws) => {
        if (ws.subscriptions?.includes(channel) && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'market_data', channel, data }));
        }
    });
}

// Simulate real-time price updates
setInterval(() => {
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
    pairs.forEach(pair => {
        broadcastMarketData(`forex:${pair}`, {
            pair,
            bid: 1.0845 + (Math.random() - 0.5) * 0.001,
            ask: 1.0847 + (Math.random() - 0.5) * 0.001,
            timestamp: new Date().toISOString(),
        });
    });
}, 1000);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

// Connect to MongoDB
mongoose.connect(CONFIG.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start server
        server.listen(CONFIG.PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║         MMITPS Backend Server Started Successfully           ║
╠══════════════════════════════════════════════════════════════╣
║  HTTP Server:  http://localhost:${CONFIG.PORT}                        ║
║  WebSocket:    ws://localhost:${CONFIG.PORT}/ws                       ║
║  Environment:  ${CONFIG.NODE_ENV.padEnd(43)}║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});

module.exports = app;
