const cron = require('node-cron');
const logger = require('./utils/logger');
const COTDataMinerService = require('./services/trading/COTDataMinerService');

/**
 * MMITPS Cron Job Orchestrator
 * Schedules automated backend tasks (Data mining, User Ranking updates, Subscription checks)
 */
class JobScheduler {

    init() {
        logger.info('⏰ Job Scheduler: Initializing core cron routines...');
        this.scheduleCOTDownload();
    }

    /**
     * CFTC Commitments of Traders (COT) Downloader
     * The CFTC officially publishes the weekly Legacy report every Friday at 3:30 PM EST.
     * We schedule our miner to run at 4:00 PM EST (21:00 UTC) every Friday to ensure 
     * the US Government's Socrata API has fully propagated the new JSON dataset.
     */
    scheduleCOTDownload() {
        // Cron Format: Minute Hour DayOfMonth Month DayOfWeek
        // '0 21 * * 5' = Every Friday at 21:00 UTC
        cron.schedule('0 21 * * 5', async () => {
            try {
                logger.info('⏰ Cron Executing: COT Weekly Socrata Download initiated.');

                // Triggers the API fetch to the US Gov portal, parses the commercial/non-commercial 
                // legacy positioning for our tracked forex assets, and prepares them for the Database.
                await COTDataMinerService.updateAllCOTData();

            } catch (error) {
                logger.error(`❌ Cron Failed: COT Weekly Download. ${error.message}`);
            }
        });

        logger.info('⏰ Job Scheduled: COT Weekly Miner (Fridays @ 21:00 UTC)');
    }
}

module.exports = new JobScheduler();
