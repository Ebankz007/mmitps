/**
 * CorrelationAnalyticsService
 * 
 * Mathematical engine for calculating the Pearson Correlation Coefficient 
 * between multiple interactive assets to uncover hidden volumetric clusters.
 */

class CorrelationAnalyticsService {

    /**
     * Calculates the mean (average) of an array of numbers.
     * @param {number[]} arr
     * @returns {number}
     */
    _getMean(arr) {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((acc, val) => acc + val, 0);
        return sum / arr.length;
    }

    /**
     * Calculates the Pearson Correlation Coefficient between two perfect-length time series.
     * Formula: r = Σ((X - μX)(Y - μY)) / √[Σ(X - μX)² * Σ(Y - μY)²]
     * 
     * @param {number[]} seriesX - Array of recent closing prices for Asset A
     * @param {number[]} seriesY - Array of recent closing prices for Asset B
     * @returns {number} A value between -1.0 (perfect inverse) and 1.0 (perfect correlation)
     */
    _calculatePearsonCorrelation(seriesX, seriesY) {
        // Essential validation
        if (seriesX.length !== seriesY.length || seriesX.length === 0) {
            return 0; // Data mismatch or empty
        }

        const meanX = this._getMean(seriesX);
        const meanY = this._getMean(seriesY);

        let sumCrossProduct = 0;
        let sumSquaredDevX = 0;
        let sumSquaredDevY = 0;

        for (let i = 0; i < seriesX.length; i++) {
            const devX = seriesX[i] - meanX;
            const devY = seriesY[i] - meanY;

            sumCrossProduct += (devX * devY);
            sumSquaredDevX += (devX * devX);
            sumSquaredDevY += (devY * devY);
        }

        const denominator = Math.sqrt(sumSquaredDevX * sumSquaredDevY);

        // Prevent division by zero (e.g., if a price never moved - flatline)
        if (denominator === 0) return 0;

        return sumCrossProduct / denominator;
    }

    /**
     * Main Entry Point: 
     * Takes an object of historical price arrays and returns a complete 
     * square correlation matrix for all provided assets.
     * 
     * @param {Object} historicalDataMap 
     * Example input: 
     * {
     *   "EURUSD": [1.08, 1.09, 1.10...],
     *   "GBPUSD": [1.25, 1.26, 1.27...],
     *   "US30": [39000, 39100, 39200...]
     * }
     * 
     * @returns {Array} A matrix structure consumable by the frontend Heatmap
     */
    generateMatrix(historicalDataMap) {
        const assets = Object.keys(historicalDataMap);
        const matrix = [];

        // Build the N x N grid
        for (let i = 0; i < assets.length; i++) {
            const assetA = assets[i];
            const row = { name: assetA }; // Name acts as the row header for the frontend table

            for (let j = 0; j < assets.length; j++) {
                const assetB = assets[j];

                // If comparing the asset to itself, correlation is always perfect (1.0)
                if (assetA === assetB) {
                    row[assetB] = 1.0;
                } else {
                    // Compare the two arrays
                    const seriesA = historicalDataMap[assetA];
                    const seriesB = historicalDataMap[assetB];

                    const correlation = this._calculatePearsonCorrelation(seriesA, seriesB);
                    row[assetB] = correlation;
                }
            }
            matrix.push(row);
        }

        return matrix;
    }
}

module.exports = new CorrelationAnalyticsService();
