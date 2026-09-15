const FundamentalData = require('../../models/Trading/FundamentalData');
const RealTimeDataService = require('./RealTimeDataService');

class FundamentalService {
    async getCountryMacro(country) {
        return await FundamentalData.aggregate([
            { $match: { country } },
            { $sort: { indicator: 1, releaseDate: -1 } },
            {
                $group: {
                    _id: '$indicator',
                    latestValue: { $first: '$value' },
                    previousValue: { $first: '$previousValue' },
                    forecastValue: { $first: '$forecastValue' },
                    impact: { $first: '$impact' },
                    releaseDate: { $first: '$releaseDate' }
                }
            }
        ]);
    }

    async getStrengthScores() {
        const apiConfig = await require('../ApiServiceManager').getConfig();
        const currencies = apiConfig.fundamentalAnalysis?.currencies || ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS', 'THB', 'RON'];
        let rawScores = {};

        // Try to get from RealTimeDataService first
        try {
            const liveScores = await RealTimeDataService.getCurrencyStrength(currencies);
            if (liveScores) {
                rawScores = liveScores;
            }
        } catch (error) {
            console.warn('Failed to fetch live strength scores, falling back to database:', error.message);

            // Fallback to database calculation
            for (const country of currencies) {
                const data = await this.getCountryMacro(country);
                let score = 0;
                data.forEach(item => {
                    const change = item.latestValue - (item.previousValue || 0);
                    if (change > 0) score += 10; else if (change < 0) score -= 10;
                });
                rawScores[country] = Math.min(Math.max(score, -100), 100);
            }
        }

        // Normalize to Array format for frontend consumption
        const normalized = Object.entries(rawScores).map(([symbol, score]) => ({
            symbol,
            score: Math.round(score / 10), // Scaling down to -10 to +10 range
            sentiment: score >= 20 ? 'bullish' : score <= -20 ? 'bearish' : 'neutral',
            lastUpdated: new Date()
        }));

        console.log(`[FundamentalService] Returning ${normalized.length} strength scores as array.`);
        return normalized;
    }

    /**
     * Get Strength Matrix for the new pro-level UI
     * Includes all indicators and currency rankings
     */
    async getStrengthMatrix() {
        const apiConfig = await require('../ApiServiceManager').getConfig();
        const currencies = apiConfig.fundamentalAnalysis?.currencies || ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS', 'THB', 'RON'];
        const indicators = apiConfig.fundamentalAnalysis?.indicators || [
            { name: 'Interest Rate', weight: 15 },
            { name: 'Inflation Rate (CPI YoY)', weight: 10 }
        ];

        // Fetch values for all pairs (Indicator, Currency)
        const matrix = [];

        for (const indicator of indicators) {
            const row = {
                indicator: indicator.name,
                weight: indicator.weight,
                values: {}
            };

            for (const currency of currencies) {
                const data = await RealTimeDataService.getEconomicIndicator(currency, indicator.name);
                row.values[currency] = data.value;
            }

            // Calculate Rankings (1-21) for this indicator row
            const sortedCurrencies = [...currencies].sort((a, b) => row.values[b] - row.values[a]);
            row.rankings = {};
            sortedCurrencies.forEach((curr, index) => {
                row.rankings[curr] = index + 1;
            });

            matrix.push(row);
        }

        return {
            currencies,
            indicators,
            matrix,
            lastUpdated: new Date()
        };
    }

    async syncData(dataArray) {
        const operations = dataArray.map(item => ({
            updateOne: {
                filter: { country: item.country, indicator: item.indicator, releaseDate: new Date(item.releaseDate) },
                update: { $set: item },
                upsert: true
            }
        }));
        return await FundamentalData.bulkWrite(operations);
    }

    /**
     * Sync Economic Calendar from external source
     */
    async syncEconomicCalendar() {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            const events = await RealTimeDataService.fetchEconomicCalendar(startDate, endDate);

            // Transform events to FundamentalData format
            const dataArray = events.map(event => ({
                country: event.country,
                indicator: event.event,
                value: event.actual,
                previousValue: event.previous,
                forecastValue: event.forecast,
                impact: event.impact,
                releaseDate: event.date,
                currency: event.currency
            }));

            await this.syncData(dataArray);
            return { success: true, count: dataArray.length };
        } catch (error) {
            console.error('Error syncing economic calendar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync COT (Commitment of Traders) Data
     */
    async syncCOTData() {
        try {
            const cotData = await RealTimeDataService.fetchLatestCOT();
            const parsedData = await RealTimeDataService.parseCOTReport(cotData);

            // Store COT data (you may want to create a separate COT model)
            // For now, we'll store it as fundamental data
            const dataArray = parsedData.map(item => ({
                country: item.currency,
                indicator: 'COT_NET_POSITION',
                value: item.netCommercial,
                previousValue: 0, // Would need historical data
                forecastValue: 0,
                impact: 'medium',
                releaseDate: item.reportDate,
                currency: item.currency,
                metadata: {
                    netNonCommercial: item.netNonCommercial,
                    sentiment: item.sentiment
                }
            }));

            await this.syncData(dataArray);
            return { success: true, count: dataArray.length };
        } catch (error) {
            console.error('Error syncing COT data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update Currency Strength Data
     */
    async updateCurrencyStrength() {
        try {
            const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS', 'THB', 'RON'];
            const strength = await RealTimeDataService.getCurrencyStrength(currencies);

            // Store strength scores as fundamental data
            const dataArray = Object.entries(strength).map(([currency, score]) => ({
                country: currency,
                indicator: 'CURRENCY_STRENGTH',
                value: score,
                previousValue: score, // Would need historical tracking
                forecastValue: score,
                impact: 'high',
                releaseDate: new Date(),
                currency
            }));

            await this.syncData(dataArray);

            // Normalize for return
            const normalizedScores = Object.entries(strength).map(([symbol, score]) => ({
                symbol,
                score,
                sentiment: score >= 20 ? 'bullish' : score <= -20 ? 'bearish' : 'neutral',
                lastUpdated: new Date()
            }));

            return { success: true, scores: normalizedScores };
        } catch (error) {
            console.error('Error updating currency strength:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync all external data sources
     */
    async syncFromExternalSources() {
        const results = {
            calendar: await this.syncEconomicCalendar(),
            cot: await this.syncCOTData(),
            strength: await this.updateCurrencyStrength()
        };

        return results;
    }
}

module.exports = new FundamentalService();
