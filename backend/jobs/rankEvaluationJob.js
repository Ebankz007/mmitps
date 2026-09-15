const cron = require('node-cron');
const RankService = require('../services/pg/RankService');
const logger = require('../utils/logger');

// Run daily at 2:00 AM
const job = cron.schedule('0 2 * * *', async () => {
    try {
        logger.info('🕒 Starting daily rank evaluation job...');
        const result = await RankService.evaluateAllUsersRanks();
        logger.info(`✅ Rank evaluation complete. Evaluated: ${result.totalEvaluated}, Advanced: ${result.totalAdvanced}`);

        if (result.advancements.length > 0) {
            logger.info(`Users advanced: ${result.advancements.map(a => `${a.username} (${a.previousRank} -> ${a.newRank})`).join(', ')}`);
        }
    } catch (error) {
        logger.error('❌ Error in daily rank evaluation job:', error);
    }
}, {
    scheduled: false // Don't start automatically, wait for explicit start
});

module.exports = job;
