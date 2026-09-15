const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

class TokenService {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.accessExpirationMinutes = parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 60;
        this.refreshExpirationDays = parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30;
    }

    /**
     * Generate token
     * @param {ObjectId} userId 
     * @param {moment} expires 
     * @param {string} type 
     * @param {string} [secret] 
     * @returns {string}
     */
    generateToken(userId, expires, type, secret = this.secret) {
        const payload = {
            sub: userId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(expires.getTime() / 1000),
            type,
        };
        return jwt.sign(payload, secret);
    }

    /**
     * Generate access and refresh tokens
     * @param {User} user 
     * @returns {Promise<Object>}
     */
    async generateAuthTokens(user) {
        // Fetch global timeout override from DB
        const SystemConfig = require('../models/System/SystemConfig');
        const dbConfig = await SystemConfig.findOne({ key: 'session_duration_minutes' });
        const globalDuration = dbConfig && !isNaN(parseInt(dbConfig.value, 10)) 
            ? parseInt(dbConfig.value, 10) 
            : this.accessExpirationMinutes;

        const accessTokenExpires = new Date();
        const duration = user.preferences?.sessionDuration || globalDuration;
        accessTokenExpires.setMinutes(accessTokenExpires.getMinutes() + duration);

        const accessToken = this.generateToken(
            user._id,
            accessTokenExpires,
            'access'
        );

        const refreshTokenExpires = new Date();
        refreshTokenExpires.setDate(refreshTokenExpires.getDate() + this.refreshExpirationDays);

        const refreshToken = this.generateToken(
            user._id,
            refreshTokenExpires,
            'refresh'
        );

        return {
            access: {
                token: accessToken,
                expires: accessTokenExpires,
            },
            refresh: {
                token: refreshToken,
                expires: refreshTokenExpires,
            },
        };
    }

    /**
     * Verify token and return token doc (or payload)
     * @param {string} token 
     * @param {string} type 
     * @returns {Promise<Object>} payload
     */
    async verifyToken(token, type) {
        try {
            const payload = jwt.verify(token, this.secret);
            if (payload.type !== type) {
                throw new Error('Invalid token type');
            }
            return payload;
        } catch (error) {
            throw ApiError.unauthorized('Invalid or expired token');
        }
    }

    /**
     * Generate magic link token
     * @param {string} email 
     * @returns {string}
     */
    generateMagicLinkToken(email) {
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 15); // 15 mins expiry

        const payload = {
            email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(expires.getTime() / 1000),
            type: 'magic_link',
        };
        return jwt.sign(payload, this.secret);
    }

    /**
     * Verify magic link token
     * @param {string} token 
     * @returns {string} email
     */
    verifyMagicLinkToken(token) {
        try {
            const payload = jwt.verify(token, this.secret);
            if (payload.type !== 'magic_link') {
                throw new Error('Invalid token type');
            }
            return payload.email;
        } catch (error) {
            throw ApiError.unauthorized('Invalid or expired magic link');
        }
    }
}

module.exports = new TokenService();
