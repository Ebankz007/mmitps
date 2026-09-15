/**
 * Gann Square Geometry Service
 * Projects critical geometric time and price angles (90°, 180°, 270°, 360°)
 * derived from the W.D. Gann Square of 9.
 */

class GannSquareService {
    /**
     * Finds major historical pivots and projects geometric time elapsed dates.
     * Gann prioritized 90, 180, 270, and 360 calendar day cycles from major turning points.
     * @param {Array} ohlcv - Historical OHLCV array
     * @returns {Array} List of projected signal dates
     */
    static generateProjections(ohlcv) {
        if (!ohlcv || ohlcv.length < 50) return [];

        // Find major pivots to act as Square of 9 time anchors
        const pivots = this.findMajorPivots(ohlcv);
        if (pivots.length === 0) return [];

        // Gann geometric time angles mapping to calendar days
        const gannAngles = [45, 90, 135, 180, 225, 270, 315, 360];

        const signals = [];
        const now = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const getTimeMs = (t) => typeof t === 'number' && t < 10000000000 ? t * 1000 : new Date(t).getTime();

        pivots.forEach(pivot => {
            const pivotTimeMs = getTimeMs(pivot.time);

            gannAngles.forEach(angle => {
                // Project 'angle' days forward from the pivot
                const projectedTimeMs = pivotTimeMs + (angle * ONE_DAY_MS);
                const projectedDate = new Date(projectedTimeMs);

                // Only keep signals that are recent or in the future
                if (projectedTimeMs > now - (7 * ONE_DAY_MS)) {
                    signals.push({
                        time: projectedDate.toISOString(),
                        timestamp: projectedTimeMs,
                        type: `Gann Square (${angle}°)`,
                        direction: pivot.type === 'HIGH' ? 'UP' : 'DOWN', // Expect reversal of origin
                        confidence: angle % 90 === 0 ? 85 : 65, // Cardinal cross angles (90,180,270,360) are stronger
                        source: 'gann'
                    });
                }
            });
        });

        return signals;
    }

    static findMajorPivots(ohlcv) {
        // Find the absolute highest and lowest points in the dataset (Macro pivots)
        let maxHigh = -Infinity;
        let minLow = Infinity;
        let maxHighBar = null;
        let minLowBar = null;

        ohlcv.forEach(bar => {
            if (bar.high > maxHigh) { maxHigh = bar.high; maxHighBar = bar; }
            if (bar.low < minLow) { minLow = bar.low; minLowBar = bar; }
        });

        const pivots = [];
        if (maxHighBar) pivots.push({ time: maxHighBar.time, price: maxHighBar.high, type: 'HIGH' });
        if (minLowBar) pivots.push({ time: minLowBar.time, price: minLowBar.low, type: 'LOW' });

        return pivots;
    }
}

module.exports = GannSquareService;
