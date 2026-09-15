/**
 * VolumeAnalyticsService
 * 
 * Mathematical engine for calculating volumetric anomalies (Z-Scores & ROC) 
 * to trigger institutional Accumulation or Distribution alerts.
 */

class VolumeAnalyticsService {
    constructor() {
        // Configuration thresholds
        this.Z_SCORE_THRESHOLD = 2.0; // Trigger alert if Z-Score exceeds 2.0 (or < -2.0)
        this.ROC_PERIOD = 14;         // Periods used for Rate of Change calculation
        this.SMA_PERIOD = 50;         // Periods for rolling mean/std calculation

        // In-memory state holding rolling OHLCV historical arrays per instrument
        // e.g. { 'EURUSD': { closes: [], volumes: [] } }
        this.timeSeriesData = {};
    }

    /**
     * Initializes or gets the rolling array for a specific instrument
     */
    _getInstrumentData(instrument) {
        if (!this.timeSeriesData[instrument]) {
            this.timeSeriesData[instrument] = { closes: [], volumes: [] };
        }
        return this.timeSeriesData[instrument];
    }

    /**
     * Calculates the Simple Moving Average (SMA) of an array
     */
    _calculateSMA(dataArray, period) {
        if (dataArray.length < period) return null;
        const slice = dataArray.slice(-period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * Calculates the Standard Deviation of an array
     */
    _calculateStandardDeviation(dataArray, period, mean) {
        if (dataArray.length < period) return null;
        const slice = dataArray.slice(-period);
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        return Math.sqrt(variance);
    }

    /**
     * Calculates Volume Rate of Change (ROC)
     * ROC = ((Current Volume - Volume n periods ago) / Volume n periods ago) * 100
     */
    _calculateVolumeROC(volumes) {
        if (volumes.length <= this.ROC_PERIOD) return 0;

        const currentVol = volumes[volumes.length - 1];
        const pastVol = volumes[volumes.length - 1 - this.ROC_PERIOD];

        if (pastVol === 0) return 0; // Prevent division by zero
        return ((currentVol - pastVol) / pastVol) * 100;
    }

    /**
     * Calculates the current Statistical Z-Score of Volume
     * Z = (Current Volume - Mean Volume) / Standard Deviation
     */
    _calculateZScore(volumes) {
        if (volumes.length < this.SMA_PERIOD) return { zScore: 0, mean: 0 };

        const mean = this._calculateSMA(volumes, this.SMA_PERIOD);
        const stdDev = this._calculateStandardDeviation(volumes, this.SMA_PERIOD, mean);

        if (stdDev === 0) return { zScore: 0, mean }; // Prevent division by zero

        const currentVol = volumes[volumes.length - 1];
        const zScore = (currentVol - mean) / stdDev;

        return { zScore, mean };
    }

    /**
     * Main entry point: Process a new incoming candle/tick
     * @param {string} instrument 
     * @param {Object} tickData { close: number, volume: number }
     * @returns {Object|null} Alert object if threshold breached, otherwise null
     */
    analyzeVolumeFlow(instrument, tickData) {
        const data = this._getInstrumentData(instrument);

        // Push latest data into our rolling arrays
        data.closes.push(tickData.close);
        data.volumes.push(tickData.volume);

        // Keep memory lean (only store what we need + buffer)
        const maxMemory = this.SMA_PERIOD * 2;
        if (data.volumes.length > maxMemory) {
            data.closes.shift();
            data.volumes.shift();
        }

        // We need enough historical data before we can run the math
        if (data.volumes.length < this.SMA_PERIOD) {
            return null; // Warming up
        }

        // 1. Calculate Core Metrics
        const { zScore, mean } = this._calculateZScore(data.volumes);
        const volumeROC = this._calculateVolumeROC(data.volumes);

        // Calculate a simple price delta to determine direction (Accumulation vs Distribution)
        const currentClose = data.closes[data.closes.length - 1];
        const previousClose = data.closes[data.closes.length - 2];
        const isUpCandle = currentClose > previousClose;

        // 2. Check Logic Thresholds
        // Absolute value of Z-Score tells us the magnitude of the anomaly
        if (Math.abs(zScore) >= this.Z_SCORE_THRESHOLD) {

            // We have a statistical anomaly! Now determine the narrative.
            let type = "";
            let description = "";

            if (isUpCandle) {
                type = "Accumulation";
                description = `Massive buying footprint detected. Volume is ${zScore.toFixed(1)} standard deviations above normal.`;
            } else {
                type = "Distribution";
                description = `Heavy institutional offloading. Volume is ${zScore.toFixed(1)} standard deviations above normal on a down tick.`;
            }

            // Calculate a pseudo "confidence score" based on how extreme the Z-Score is
            // Caps at 99%. A Z-score of 2 is ~75%, Z-score of 3+ is 90%+
            let strength = Math.min(99, Math.round((Math.abs(zScore) / 3) * 100));
            if (strength < 50) strength = 50; // Baseline for triggering

            // Generate and return the Alert payload to be emitted via WebSockets
            const alert = {
                instrument: instrument,
                time: Math.floor(Date.now() / 1000),
                type: type, // "Accumulation" | "Distribution"
                strength: strength,
                zScore: parseFloat(zScore.toFixed(2)),
                volumeROC: parseFloat(volumeROC.toFixed(2)),
                description: description
            };

            console.log(`[ALERT TRIGGERED] ${instrument} | ${type} | Z-Score: ${alert.zScore}`);
            return alert;
        }

        // No threshold breached, return regular status
        return null;
    }
}

module.exports = new VolumeAnalyticsService();
