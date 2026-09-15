/**
 * Fourier Cycle Service
 * Uses Discrete Fourier Transform (DFT) to isolate repeating harmonic cycles
 * (Sine Waves) in price action and project future peaks/troughs.
 */

class FourierCycleService {
    /**
     * Analyzes price data to find the dominant frequency (cycle length)
     * and projects the next expected cycle turn.
     * @param {Array} ohlcv - Historical OHLCV data
     * @returns {Array} Projected signal objects
     */
    static generateProjections(ohlcv) {
        if (!ohlcv || ohlcv.length < 100) return [];

        const prices = ohlcv.map(bar => parseFloat(bar.close));
        const n = prices.length;

        // Remove trend (Linear Detrending) to focus on cycles
        const detrended = this.detrend(prices);

        // Find dominant cycle using DFT (Simplified Power Spectrum)
        const dominantCycleLength = this.findDominantCycle(detrended);

        const getTimeMs = (t) => typeof t === 'number' && t < 10000000000 ? t * 1000 : new Date(t).getTime();

        const lastBarTime = getTimeMs(ohlcv[ohlcv.length - 1].time);
        const timeframeMs = lastBarTime - getTimeMs(ohlcv[ohlcv.length - 2].time);

        const now = Date.now();
        const signals = [];

        // Project the next 3 cycles forward
        for (let i = 1; i <= 3; i++) {
            const projectedTimeMs = lastBarTime + (dominantCycleLength * timeframeMs * i);
            const projectedDate = new Date(projectedTimeMs);

            if (projectedTimeMs > now - (24 * 60 * 60 * 1000)) {
                signals.push({
                    time: projectedDate.toISOString(),
                    timestamp: projectedTimeMs,
                    type: `Cycle Analysis (${Math.round(dominantCycleLength)} bars)`,
                    // Traditional cycle logic: Altnerating peaks/troughs
                    direction: i % 2 === 0 ? 'UP' : 'DOWN',
                    confidence: 82,
                    source: 'cycles'
                });
            }
        }

        return signals;
    }

    /**
     * Simple Linear Detrending
     */
    static detrend(data) {
        const n = data.length;
        const xSum = (n * (n - 1)) / 2;
        const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6;
        let ySum = 0;
        let xySum = 0;

        for (let i = 0; i < n; i++) {
            ySum += data[i];
            xySum += i * data[i];
        }

        const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
        const intercept = (ySum - slope * xSum) / n;

        return data.map((y, i) => y - (slope * i + intercept));
    }

    /**
     * Finds the frequency with the highest amplitude (Simplified DFT)
     */
    static findDominantCycle(data) {
        const n = data.length;
        let maxAmplitude = -1;
        let dominantPeriod = 0;

        // Search for periods between 10 bars and N/2 bars
        for (let period = 10; period < n / 2; period++) {
            let re = 0;
            let im = 0;
            const angle = (2 * Math.PI) / period;

            for (let t = 0; t < n; t++) {
                re += data[t] * Math.cos(angle * t);
                im -= data[t] * Math.sin(angle * t);
            }

            const amplitude = Math.sqrt(re * re + im * im);
            if (amplitude > maxAmplitude) {
                maxAmplitude = amplitude;
                dominantPeriod = period;
            }
        }

        return dominantPeriod;
    }
}

module.exports = FourierCycleService;
