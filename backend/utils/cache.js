const Redis = require('ioredis');
const logger = require('./logger');

class Cache {
    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);

            this.redis.on('connect', () => logger.info('✅ Redis Connected'));
            this.redis.on('error', (err) => logger.error('❌ Redis error:', err));
        } else {
            logger.warn('⚠️ REDIS_URL not found, caching will be disabled (mocked)');
            this.redis = null;
        }
    }

    async get(key) {
        if (!this.redis) return null;
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            logger.error('Cache Get Error:', err);
            return null;
        }
    }

    async set(key, value, ttlSeconds = 3600) {
        if (!this.redis) return false;
        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
            return true;
        } catch (err) {
            logger.error('Cache Set Error:', err);
            return false;
        }
    }

    async del(key) {
        if (!this.redis) return false;
        try {
            await this.redis.del(key);
            return true;
        } catch (err) {
            logger.error('Cache Del Error:', err);
            return false;
        }
    }

    async flush() {
        if (!this.redis) return false;
        try {
            await this.redis.flushall();
            return true;
        } catch (err) {
            logger.error('Cache Flush Error:', err);
            return false;
        }
    }
}

module.exports = new Cache();
