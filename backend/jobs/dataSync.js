const cron = require('node-cron');
const FundamentalService = require('../services/trading/FundamentalService');

/**
 * Data Synchronization Job
 * Automatically syncs external market data on a schedule
 */
class DataSyncJob {
    constructor() {
        this.isRunning = false;
        this.lastSync = null;
        this.syncHistory = [];
    }

    /**
     * Start the scheduled data sync job
     */
    start() {
        console.log('📊 Data Sync Job: Starting...');

        // Daily sync at midnight UTC
        cron.schedule('0 0 * * *', async () => {
            console.log('⏰ Scheduled data sync triggered');
            await this.runSync();
        });

        // Hourly currency strength update
        cron.schedule('0 * * * *', async () => {
            console.log('⏰ Hourly currency strength update triggered');
            await this.updateCurrencyStrength();
        });

        console.log('✅ Data Sync Job: Scheduled');
        console.log('   - Full sync: Daily at 00:00 UTC');
        console.log('   - Currency strength: Hourly');
    }

    /**
     * Run full data synchronization
     */
    async runSync() {
        if (this.isRunning) {
            console.log('⚠️  Data sync already in progress, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        console.log('\n🔄 Starting data synchronization...');

        try {
            const results = await FundamentalService.syncFromExternalSources();

            const duration = Date.now() - startTime;
            const syncResult = {
                timestamp: new Date(),
                duration,
                results,
                success: this.checkSyncSuccess(results)
            };

            this.lastSync = syncResult;
            this.syncHistory.push(syncResult);

            // Keep only last 30 sync records
            if (this.syncHistory.length > 30) {
                this.syncHistory.shift();
            }

            console.log('\n✅ Data synchronization complete');
            console.log(`   Duration: ${duration}ms`);
            console.log(`   Calendar: ${results.calendar.success ? '✓' : '✗'} (${results.calendar.count || 0} events)`);
            console.log(`   COT Data: ${results.cot.success ? '✓' : '✗'} (${results.cot.count || 0} records)`);
            console.log(`   Currency Strength: ${results.strength.success ? '✓' : '✗'}`);

            if (!syncResult.success) {
                console.warn('⚠️  Some sync operations failed');
                // In production, send admin notification here
            }

        } catch (error) {
            console.error('❌ Data sync failed:', error);

            const syncResult = {
                timestamp: new Date(),
                duration: Date.now() - startTime,
                error: error.message,
                success: false
            };

            this.lastSync = syncResult;
            this.syncHistory.push(syncResult);

            // In production, send admin notification here
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Update currency strength only (hourly)
     */
    async updateCurrencyStrength() {
        try {
            console.log('💹 Updating currency strength...');
            const result = await FundamentalService.updateCurrencyStrength();

            if (result.success) {
                console.log('✅ Currency strength updated');
            } else {
                console.warn('⚠️  Currency strength update failed:', result.error);
            }
        } catch (error) {
            console.error('❌ Currency strength update error:', error);
        }
    }

    /**
     * Check if sync was successful
     */
    checkSyncSuccess(results) {
        return results.calendar.success &&
            results.cot.success &&
            results.strength.success;
    }

    /**
     * Get sync status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSync: this.lastSync,
            history: this.syncHistory.slice(-10) // Last 10 syncs
        };
    }

    /**
     * Manually trigger sync (for testing or admin panel)
     */
    async triggerManualSync() {
        console.log('🔧 Manual sync triggered');
        await this.runSync();
    }
}

// Create singleton instance
const dataSyncJob = new DataSyncJob();

// Auto-start if DATA_SYNC_ENABLED is true
if (process.env.DATA_SYNC_ENABLED === 'true') {
    dataSyncJob.start();
}

module.exports = dataSyncJob;
