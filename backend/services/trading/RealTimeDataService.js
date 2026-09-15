const ApiServiceManager = require('../ApiServiceManager');

/**
 * Real-Time Data Service
 * Centralized service for fetching data from external market data providers
 */
class RealTimeDataService {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 3600000; // 1 hour in milliseconds
    }

    /**
     * Get cached data if available and not expired
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }
        return null;
    }

    /**
     * Set cached data with timestamp
     */
    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Fetch Economic Calendar Events
     * @param {Date} startDate - Start date for events
     * @param {Date} endDate - End date for events
     * @returns {Promise<Array>} Array of economic events
     */
    async fetchEconomicCalendar(startDate, endDate) {
        const cacheKey = `calendar_${startDate}_${endDate}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        // Mock data - replace with real API call when keys are available
        const mockEvents = this.generateMockCalendarEvents(startDate, endDate);

        this.setCachedData(cacheKey, mockEvents);
        return mockEvents;
    }

    /**
     * Get Economic Indicator for a country
     * @param {String} country - Country code (e.g., 'USD', 'EUR')
     * @param {String} indicator - Indicator name (e.g., 'GDP', 'CPI')
     * @returns {Promise<Object>} Indicator data
     */
    async getEconomicIndicator(country, indicator) {
        const cacheKey = `indicator_${country}_${indicator}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        // Mock data
        const mockData = {
            country,
            indicator,
            value: Math.random() * 100,
            previousValue: Math.random() * 100,
            forecastValue: Math.random() * 100,
            releaseDate: new Date(),
            impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };

        this.setCachedData(cacheKey, mockData);
        return mockData;
    }

    /**
     * Get Currency Pair Exchange Rate
     * @param {String} from - Base currency (e.g., 'USD')
     * @param {String} to - Quote currency (e.g., 'EUR')
     * @returns {Promise<Object>} Exchange rate data
     */
    async getCurrencyPair(from, to) {
        const cacheKey = `pair_${from}_${to}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        // Mock data - realistic forex rates
        const baseRates = {
            'EURUSD': 1.0850,
            'GBPUSD': 1.2650,
            'USDJPY': 149.50,
            'AUDUSD': 0.6550,
            'USDCAD': 1.3650,
            'USDCHF': 0.8750,
            'NZDUSD': 0.6150
        };

        const pair = `${from}${to}`;
        const inversePair = `${to}${from}`;

        let rate = baseRates[pair];
        if (!rate && baseRates[inversePair]) {
            rate = 1 / baseRates[inversePair];
        }
        if (!rate) {
            rate = 1 + (Math.random() * 0.5 - 0.25); // Random rate between 0.75 and 1.25
        }

        // Add realistic fluctuation
        const fluctuation = (Math.random() * 0.002 - 0.001); // ±0.1%
        rate = rate * (1 + fluctuation);

        const mockData = {
            from,
            to,
            rate: parseFloat(rate.toFixed(5)),
            timestamp: new Date(),
            bid: parseFloat((rate * 0.9999).toFixed(5)),
            ask: parseFloat((rate * 1.0001).toFixed(5))
        };

        this.setCachedData(cacheKey, mockData);
        return mockData;
    }

    /**
     * Get Currency Strength Scores
     * @param {Array<String>} currencies - Array of currency codes
     * @returns {Promise<Object>} Currency strength scores
     */
    async getCurrencyStrength(currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS']) {
        const cacheKey = `strength_${currencies.join('_')}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        // Mock data - generate strength scores based on fundamental data
        const scores = {};

        for (const currency of currencies) {
            // Base score between -100 and 100
            let score = (Math.random() * 200) - 100;

            // Add some correlation (USD tends to be stronger)
            if (currency === 'USD') score = Math.abs(score);
            if (currency === 'JPY') score = -Math.abs(score) * 0.5;

            scores[currency] = parseFloat(score.toFixed(2));
        }

        this.setCachedData(cacheKey, scores);
        return scores;
    }

    /**
     * Fetch Latest COT (Commitment of Traders) Report
     * @returns {Promise<Array>} COT report data
     */
    async fetchLatestCOT() {
        const cacheKey = 'cot_latest';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        // Mock COT data
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS'];
        const mockCOT = currencies.map(currency => ({
            currency,
            reportDate: new Date(),
            commercialLong: Math.floor(Math.random() * 100000),
            commercialShort: Math.floor(Math.random() * 100000),
            nonCommercialLong: Math.floor(Math.random() * 50000),
            nonCommercialShort: Math.floor(Math.random() * 50000),
            nonReportableLong: Math.floor(Math.random() * 10000),
            nonReportableShort: Math.floor(Math.random() * 10000)
        }));

        this.setCachedData(cacheKey, mockCOT);
        return mockCOT;
    }

    /**
     * Parse COT Report Data
     * @param {Array} data - Raw COT data
     * @returns {Array} Parsed and normalized COT data
     */
    async parseCOTReport(data) {
        return data.map(item => ({
            ...item,
            netCommercial: item.commercialLong - item.commercialShort,
            netNonCommercial: item.nonCommercialLong - item.nonCommercialShort,
            netNonReportable: item.nonReportableLong - item.nonReportableShort,
            sentiment: (item.commercialLong - item.commercialShort) > 0 ? 'bullish' : 'bearish'
        }));
    }

    /**
     * Generate Mock Economic Calendar Events
     * @private
     */
    generateMockCalendarEvents(startDate, endDate) {
        const events = [];
        const indicators = [
            { name: 'Non-Farm Payrolls', impact: 'high', countries: ['USD'] },
            { name: 'GDP Growth Rate', impact: 'high', countries: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'] },
            { name: 'CPI (Inflation)', impact: 'high', countries: ['USD', 'EUR', 'GBP', 'CHF'] },
            { name: 'Interest Rate Decision', impact: 'high', countries: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'] },
            { name: 'Unemployment Rate', impact: 'medium', countries: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'] },
            { name: 'Retail Sales', impact: 'medium', countries: ['USD', 'EUR', 'GBP'] },
            { name: 'PMI Manufacturing', impact: 'medium', countries: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CNY'] },
            { name: 'Trade Balance', impact: 'low', countries: ['USD', 'EUR', 'GBP', 'JPY'] },
            { name: 'Consumer Confidence', impact: 'medium', countries: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'] },
            { name: 'Debt-to-GDP Ratio', weight: 10, countries: ['USD', 'EUR'] },
            { name: 'Current Account', weight: 10, countries: ['USD', 'EUR', 'JPY'] }
        ];

        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const allCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'SGD', 'NOK', 'SEK', 'MXN', 'ZAR', 'TRY', 'BRL', 'INR', 'RUB', 'PLN', 'CZK', 'HUF', 'PEN'];

        // Generate 3-5 events per day
        for (let i = 0; i < daysDiff; i++) {
            const eventDate = new Date(start);
            eventDate.setDate(start.getDate() + i);

            const eventsPerDay = Math.floor(Math.random() * 3) + 3;

            for (let j = 0; j < eventsPerDay; j++) {
                const indicator = indicators[Math.floor(Math.random() * indicators.length)];
                const country = indicator.countries ? indicator.countries[Math.floor(Math.random() * indicator.countries.length)] : allCurrencies[Math.floor(Math.random() * allCurrencies.length)];

                const eventTime = new Date(eventDate);
                eventTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

                const actual = Math.random() * 10;
                const forecast = actual + (Math.random() * 2 - 1);
                const previous = forecast + (Math.random() * 2 - 1);

                events.push({
                    country,
                    event: indicator.name,
                    impact: indicator.impact || 'medium',
                    date: eventTime,
                    actual: parseFloat(actual.toFixed(2)),
                    forecast: parseFloat(forecast.toFixed(2)),
                    previous: parseFloat(previous.toFixed(2)),
                    currency: country
                });
            }
        }

        return events.sort((a, b) => a.date - b.date);
    }

    /**
     * Sync all data sources
     * @returns {Promise<Object>} Sync results
     */
    async syncAllData() {
        const results = {
            calendar: null,
            cot: null,
            strength: null,
            errors: []
        };

        try {
            // Sync economic calendar (next 30 days)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            results.calendar = await this.fetchEconomicCalendar(startDate, endDate);
        } catch (error) {
            results.errors.push({ source: 'calendar', error: error.message });
        }

        try {
            // Sync COT data
            results.cot = await this.fetchLatestCOT();
        } catch (error) {
            results.errors.push({ source: 'cot', error: error.message });
        }

        try {
            // Sync currency strength
            results.strength = await this.getCurrencyStrength();
        } catch (error) {
            results.errors.push({ source: 'strength', error: error.message });
        }

        return results;
    }
}

module.exports = new RealTimeDataService();
