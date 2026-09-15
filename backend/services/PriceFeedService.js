const ApiServiceManager = require('./ApiServiceManager');
const RealTimeDataService = require('./trading/RealTimeDataService');
const VolumeAnalyticsService = require('./trading/VolumeAnalyticsService');
const logger = require('../utils/logger');

/**
 * Price Feed Service
 * Handles periodic fetching of market data and broadcasting via Socket.io
 */
class PriceFeedService {
    constructor() {
        this.interval = null;
        this.isRunning = false;
        this.io = null;
        this.symbols = ['EURUSD', 'XAUUSD', 'BTCUSD', 'GBPUSD', 'NDX100'];
    }

    /**
     * Initialize with Socket.io instance
     */
    init(io) {
        this.io = io;
        logger.info('📡 Price Feed: Initialized with Socket.io');
    }

    /**
     * Start the price feed routine
     */
    async start() {
        if (this.isRunning) return;

        const config = await ApiServiceManager.getConfig();
        const feedConfig = config.marketFeeds;

        if (!feedConfig || !feedConfig.enableSocketUpdates) {
            logger.info('📡 Price Feed: Socket updates disabled in config.');
            return;
        }

        this.isRunning = true;
        logger.info(`📡 Price Feed: Starting broadcaster (Interval: ${feedConfig.refreshInterval}ms)`);

        // Run immediately on start
        this.broadcastPrices();

        // Setup interval
        this.interval = setInterval(() => {
            this.broadcastPrices();
        }, feedConfig.refreshInterval || 60000);
    }

    /**
     * Stop the price feed routine
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        logger.info('📡 Price Feed: Broadcaster stopped.');
    }

    async broadcastPrices() {
        if (!this.io) {
            logger.warn('📡 Price Feed: Cannot broadcast, IO not initialized.');
            return;
        }

        try {
            for (const symbol of this.symbols) {
                // Determine pair components (MVP assumption)
                const from = symbol.substring(0, 3);
                const to = symbol.substring(3);

                const data = await RealTimeDataService.getCurrencyPair(from, to);

                // Construct standard price update packet
                const update = {
                    symbol,
                    price: data.rate,
                    change: data.rate * (Math.random() * 0.002 - 0.001),
                    changePercent: (Math.random() * 2 - 1),
                    timestamp: new Date()
                };

                // Emit to legacy 'price_update' for global components (Ticker)
                this.io.emit('price_update', update);

                // Emit to room-based 'market:update' for specific charts/depth
                this.io.to(`market:${symbol}`).emit('market:update', {
                    symbol,
                    data: update,
                    timestamp: update.timestamp
                });

                // --- INTEGRATE VOLUME ANALYTICS ENGINE ---
                // Simulate a volume number (usually 100 to 5000) for testing
                // Occasionally spike it to trigger the Z-Score algorithm
                let simulatedVolume = Math.floor(Math.random() * 5000) + 100;
                if (Math.random() > 0.95) {
                    simulatedVolume += 15000; // 5% chance of a massive volume spike
                }

                const alert = VolumeAnalyticsService.analyzeVolumeFlow(symbol, {
                    close: update.price,
                    volume: simulatedVolume
                });

                if (alert) {
                    this.io.emit('volume:alert', alert); // Broadcast to the VMID Dashboard
                }
            }
        } catch (error) {
            logger.error(`❌ Price Feed Broadcast Error: ${error.message}`);
        }
    }

    /**
     * Restart the service with new configuration
     */
    async restart() {
        this.stop();
        await this.start();
    }
}

module.exports = new PriceFeedService();
