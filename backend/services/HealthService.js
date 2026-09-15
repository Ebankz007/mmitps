const { pool } = require('../../db');
const logger = require('../utils/logger');

class HealthService {
    /**
     * Get detailed database health status (PostgreSQL edition)
     */
    async getDatabaseStatus() {
        let status = 'connected';
        let latency = null;
        let lastError = null;

        try {
            const start = Date.now();
            await pool.query('SELECT 1');
            latency = Date.now() - start;
        } catch (error) {
            status = 'error';
            lastError = error.message;
        }

        return {
            status,
            latency: latency !== null ? `${latency}ms` : 'N/A',
            database: process.env.PGDATABASE || 'mmitps_dev',
            host: process.env.PGHOST || 'localhost',
            port: process.env.PGPORT || 5433,
            lastError,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Attempt to repair/re-establish the database connection (PostgreSQL edition)
     */
    async repairConnection() {
        logger.info('[HEALTH] Manual DB repair initiated...');
        try {
            await pool.query('SELECT 1');
            logger.info('[HEALTH] DB repair successful. PG pool is alive.');
            return { success: true, message: 'Database connection verified.' };
        } catch (error) {
            logger.error(`[HEALTH] DB repair failed: ${error.message}`);
            return { success: false, message: `Repair failed: ${error.message}` };
        }
    }

    /**
     * Watchdog function — checks PG pool health
     */
    async checkAndFix() {
        const status = await this.getDatabaseStatus();
        if (status.status !== 'connected') {
            logger.warn(`[WATCHDOG] DB is ${status.status}. Attempting auto-fix...`);
            await this.repairConnection();
        }
    }
}

module.exports = new HealthService();
