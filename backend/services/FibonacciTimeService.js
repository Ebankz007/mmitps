/**
 * Fibonacci Time Zone Service
 * Calculates the time distance between historical major high/low pivots
 * and projects Fibonacci sequences forward to predict upcoming time nodes.
 */

class FibonacciTimeService {
    /**
     * Finds recent major pivots (Local Extrema) in price data
     * and projects future timestamps based on the Fibonacci time sequence.
     * @param {Array} ohlcv - Array of historical OHLCV objects {time, open, high, low, close, volume}
     * @returns {Array} Array of predicted future signal objects with {time, type, direction, confidence}
     */
    static generateProjections(ohlcv) {
        if (!ohlcv || ohlcv.length < 50) return [];

        const pivots = this.findPivots(ohlcv, 10); // Find pivots looking back/forward 10 candles
        if (pivots.length < 2) return [];

        // Get the two most recent significant pivots (e.g. latest High and preceding Low, or vice-versa)
        const p1 = pivots[pivots.length - 2];
        const p2 = pivots[pivots.length - 1];

        const getTimeMs = (t) => typeof t === 'number' && t < 10000000000 ? t * 1000 : new Date(t).getTime();

        // Measure time distance in ms
        const timeDiffMs = getTimeMs(p2.time) - getTimeMs(p1.time);

        // Fibonacci sequence for time projection
        const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

        const signals = [];
        const baseTime = getTimeMs(p2.time);
        const now = Date.now();

        // Project time zones forward from the second pivot
        fibSequence.forEach((fib, index) => {
            const projectedTimeMs = baseTime + (timeDiffMs * fib);
            const projectedDate = new Date(projectedTimeMs);

            // Only return projections that are somewhat recent or in the future
            if (projectedTimeMs > now - (7 * 24 * 60 * 60 * 1000)) {
                signals.push({
                    time: projectedDate.toISOString(),
                    timestamp: projectedTimeMs,
                    type: `Fibonacci Time (${fib})`,
                    // Mean reversion logic: if p2 was a HIGH, next pivot might be LOW -> UP signal.
                    direction: p2.type === 'HIGH' ? 'UP' : 'DOWN',
                    confidence: 70 + Math.min((index * 2), 20), // Higher fib numbers often have higher confluence
                    source: 'fibonacci'
                });
            }
        });

        return signals;
    }

    /**
     * Simple Local Extrema Pivot Finder
     */
    static findPivots(ohlcv, leftRightBars) {
        const pivots = [];
        for (let i = leftRightBars; i < ohlcv.length - leftRightBars; i++) {
            let isHigh = true;
            let isLow = true;

            const currentHigh = parseFloat(ohlcv[i].high);
            const currentLow = parseFloat(ohlcv[i].low);

            for (let j = 1; j <= leftRightBars; j++) {
                if (parseFloat(ohlcv[i - j].high) > currentHigh || parseFloat(ohlcv[i + j].high) > currentHigh) {
                    isHigh = false;
                }
                if (parseFloat(ohlcv[i - j].low) < currentLow || parseFloat(ohlcv[i + j].low) < currentLow) {
                    isLow = false;
                }
            }

            if (isHigh) pivots.push({ time: ohlcv[i].time, price: currentHigh, type: 'HIGH' });
            if (isLow) pivots.push({ time: ohlcv[i].time, price: currentLow, type: 'LOW' });
        }

        // Sort by time chronologically
        const getTimeMs = (t) => typeof t === 'number' && t < 10000000000 ? t * 1000 : new Date(t).getTime();
        return pivots.sort((a, b) => getTimeMs(a.time) - getTimeMs(b.time));
    }
}

module.exports = FibonacciTimeService;
