/**
 * TokenService — PostgreSQL edition.
 * Same interface as the Mongo version; uses user.id (UUID) instead of user._id
 * and reads session_duration_minutes from the system_configs table.
 */
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');
const SystemConfigRepository = require('../../repositories/pg/SystemConfigRepository');

class TokenService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.accessExpirationMinutes = parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 60;
    this.refreshExpirationDays = parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30;
  }

  generateToken(userId, expires, type, secret = this.secret) {
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires.getTime() / 1000),
      type,
    };
    return jwt.sign(payload, secret);
  }

  async generateAuthTokens(user) {
    // Fetch global timeout override from PG (non-fatal on failure)
    let globalDuration = this.accessExpirationMinutes;
    try {
      const dbConfig = await SystemConfigRepository.findByKey('session_duration_minutes');
      const raw = dbConfig?.value;
      const num = typeof raw === 'number' ? raw : parseInt(raw, 10);
      if (!isNaN(num)) globalDuration = num;
    } catch (e) {
      // config lookup failure is non-fatal — fall back to env default
    }

    const accessTokenExpires = new Date();
    const duration = user.preferences?.sessionDuration || globalDuration;
    accessTokenExpires.setMinutes(accessTokenExpires.getMinutes() + duration);

    const accessToken = this.generateToken(user.id, accessTokenExpires, 'access');

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + this.refreshExpirationDays);

    const refreshToken = this.generateToken(user.id, refreshTokenExpires, 'refresh');

    return {
      access: { token: accessToken, expires: accessTokenExpires },
      refresh: { token: refreshToken, expires: refreshTokenExpires },
    };
  }

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

  generateMagicLinkToken(email) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    const payload = {
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires.getTime() / 1000),
      type: 'magic_link',
    };
    return jwt.sign(payload, this.secret);
  }

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