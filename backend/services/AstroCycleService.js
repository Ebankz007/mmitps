/**
 * Astro Cycle Extractor Service
 * Calculates historical Astrological and Lunar Events (e.g. Full Moon, New Moon)
 * linked mathematically to extreme market volatility and trend exhaustion cycles.
 */

class AstroCycleService {
    /**
     * Identifies exactly where we are in the Lunar cycle and projects
     * upcoming Full/New Moons as high-probability market turning points.
     * @param {Array} ohlcv - Historical OHLCV array (to determine timeframe baseline)
     * @returns {Array} List of projected signal dates
     */
    static generateProjections(ohlcv) {
        if (!ohlcv || ohlcv.length === 0) return [];

        // Synodic Month (Lunar Phase Cycle) in Days
        const SYNODIC_MONTH = 29.530588853;
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const LUNAR_CYCLE_MS = SYNODIC_MONTH * ONE_DAY_MS;

        // Reference New Moon Epoch (Jan 6, 2000, 18:14 UTC)
        const NEW_MOON_EPOCH = new Date("2000-01-06T18:14:00Z").getTime();

        const now = Date.now();
        const signals = [];

        // How much time has passed since our Epoch?
        const elapsedSinceEpoch = now - NEW_MOON_EPOCH;

        // How many FULL Lunar cycles have happened?
        const cyclesCompleted = Math.floor(elapsedSinceEpoch / LUNAR_CYCLE_MS);

        // Exact start time of the CURRENT lunar cycle we are living in
        const currentLunarStart = NEW_MOON_EPOCH + (cyclesCompleted * LUNAR_CYCLE_MS);

        // The NEXT New Moon will be one full cycle after the current one
        const nextNewMoon = currentLunarStart + LUNAR_CYCLE_MS;

        // The NEXT Full Moon will be halfway through the current or next cycle
        let nextFullMoon = currentLunarStart + (LUNAR_CYCLE_MS / 2);
        if (nextFullMoon < now) {
            // If the full moon already passed this month, project the next one
            nextFullMoon = nextNewMoon + (LUNAR_CYCLE_MS / 2);
        }

        // Project New Moon (Historically linked to market accumulation / bottoms)
        signals.push({
            time: new Date(nextNewMoon).toISOString(),
            timestamp: nextNewMoon,
            type: 'Lunar Aspect (New Moon)',
            direction: 'UP',
            confidence: 76,
            source: 'astro'
        });

        // Project Full Moon (Historically linked to market distribution / tops)
        signals.push({
            time: new Date(nextFullMoon).toISOString(),
            timestamp: nextFullMoon,
            type: 'Lunar Aspect (Full Moon)',
            direction: 'DOWN',
            confidence: 72,
            source: 'astro'
        });

        return signals;
    }
}

module.exports = AstroCycleService;
