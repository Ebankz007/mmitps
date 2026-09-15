const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 50, // Limit per IP+account per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    // Key by IP + account email so one attacker can't burn the whole IP budget
    // with many accounts, and one account can't be hammered from many IPs.
    keyGenerator: (req) => {
        const email = req.body && req.body.email ? String(req.body.email).trim().toLowerCase() : '';
        return email ? `${req.ip}:${email}` : req.ip;
    },
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    handler: (req, res, next, options) => {
        logger.warn(`Auth Rate limit exceeded for IP ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Increased to 300 for dashboard usage
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    }
});

const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 1 request per second average
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip, // Use real IP behind proxy
    message: {
        success: false,
        message: 'Too many webhook requests'
    }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit file uploads to 10 per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Upload limit exceeded, please try again later'
    }
});

module.exports = {
    authLimiter,
    apiLimiter,
    webhookLimiter,
    uploadLimiter
};
