const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * ContractDataService
 * Fetches live futures contract data from Barchart OnDemand API.
 * Falls back to curated static data if API key is missing or request fails.
 * 
 * API Docs: https://www.barchart.com/ondemand/api
 * Sign up for a FREE key at: https://www.barchart.com/ondemand/free-market-data-api
 */
class ContractDataService {
    constructor() {
        this.apiManager = require('../ApiServiceManager');
        this.baseUrl = 'https://marketdata.websol.barchart.com';
        this.cacheTimeout = 3600 * 1000; // 1 hour cache
        this._cache = {};

        // Core futures symbols to track
        this.TRACKED_SYMBOLS = ['ES', 'NQ', 'GC', 'CL', 'SI', 'NG', 'YM', 'RTY', '6E', '6B', '6J', '6A', 'ZN', 'ZB'];
    }

    /**
     * Get API key from database (primary) or .env (fallback)
     */
    async _getApiKey() {
        try {
            const dbKey = await this.apiManager.getProviderKey('barchart');
            return dbKey || process.env.BARCHART_API_KEY || '';
        } catch (err) {
            return process.env.BARCHART_API_KEY || '';
        }
    }

    /**
     * Check if we have a valid API key configured
     */
    async isLiveMode() {
        const key = await this._getApiKey();
        return !!key && key.length > 8;
    }

    /**
     * Simple in-memory cache wrapper
     */
    _getCached(key) {
        const entry = this._cache[key];
        if (!entry) return null;
        if (Date.now() - entry.timestamp > this.cacheTimeout) {
            delete this._cache[key];
            return null;
        }
        return entry.data;
    }

    _setCached(key, data) {
        this._cache[key] = { data, timestamp: Date.now() };
    }

    /**
     * GET live futures specifications from Barchart
     * Returns: tick size, tick value, margin, contract size, exchange
     */
    async getFuturesSpecifications(symbols = null) {
        const targetSymbols = symbols || this.TRACKED_SYMBOLS;
        const cacheKey = `specs_${targetSymbols.join(',')}`;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        const liveMode = await this.isLiveMode();
        if (!liveMode) {
            logger.info('[ContractDataService] No API key — using curated static specs');
            return this._getStaticSpecs();
        }

        const apiKey = await this._getApiKey();
        try {
            const symbolList = targetSymbols.join(',');
            const url = `${this.baseUrl}/getFuturesSpecifications.json?key=${apiKey}&symbol=${symbolList}`;
            const response = await axios.get(url, { timeout: 8000 });

            if (response.data?.status?.code !== 200) {
                throw new Error(`Barchart API error: ${response.data?.status?.message}`);
            }

            const results = response.data.results || [];
            const normalized = results.map(c => this._normalizeSpec(c));

            this._setCached(cacheKey, normalized);
            logger.info(`[ContractDataService] Fetched ${normalized.length} specs from Barchart LIVE`);
            return normalized;

        } catch (err) {
            logger.warn(`[ContractDataService] Live fetch failed: ${err.message} — falling back to static`);
            return this._getStaticSpecs();
        }
    }

    /**
     * GET live quotes/prices for tracked contracts
     */
    async getContractQuotes(symbols = null) {
        const targetSymbols = symbols || this.TRACKED_SYMBOLS;
        const cacheKey = `quotes_${targetSymbols.join(',')}`;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        const liveMode = await this.isLiveMode();
        if (!liveMode) {
            return this._getStaticQuotes();
        }

        const apiKey = await this._getApiKey();
        try {
            // Barchart continuous front-month uses ^{SYMBOL}* convention
            const cmcSymbols = targetSymbols.map(s => `^${s}*`).join(',');
            const url = `${this.baseUrl}/getQuote.json?key=${apiKey}&symbols=${cmcSymbols}&fields=lastPrice,previousClose,openInterest,volume,tradeTime`;
            const response = await axios.get(url, { timeout: 8000 });

            if (response.data?.status?.code !== 200) {
                throw new Error(`Barchart quote error: ${response.data?.status?.message}`);
            }

            const results = response.data.results || [];
            const normalized = results.map(q => this._normalizeQuote(q));

            this._setCached(cacheKey, normalized);
            logger.info(`[ContractDataService] Fetched ${normalized.length} quotes from Barchart LIVE`);
            return normalized;

        } catch (err) {
            logger.warn(`[ContractDataService] Live quotes failed: ${err.message} — using static`);
            return this._getStaticQuotes();
        }
    }

    /**
     * GET upcoming expiration events (contract calendar markers)
     */
    async getExpirationCalendar(year, month) {
        const cacheKey = `calendar_${year}_${month}`;
        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        const liveMode = await this.isLiveMode();
        if (!liveMode) {
            return this._getStaticCalendar(year, month);
        }

        const apiKey = await this._getApiKey();
        try {
            // Barchart expiration data via getFuturesContracts
            const url = `${this.baseUrl}/getFuturesContracts.json?key=${apiKey}&symbol=${this.TRACKED_SYMBOLS.join(',')}&expired=0`;
            const response = await axios.get(url, { timeout: 8000 });

            if (response.data?.status?.code !== 200) {
                throw new Error(`Barchart contract calendar error`);
            }

            const contracts = response.data.results || [];
            const markers = this._buildCalendarMarkers(contracts, year, month);

            this._setCached(cacheKey, markers);
            return markers;

        } catch (err) {
            logger.warn(`[ContractDataService] Calendar fetch failed: ${err.message} — using static`);
            return this._getStaticCalendar(year, month);
        }
    }

    /**
     * Status report — tells admin the current data source
     */
    async getDataSourceStatus() {
        const liveMode = await this.isLiveMode();
        return {
            mode: liveMode ? 'LIVE (Barchart OnDemand)' : 'STATIC (Demo Data)',
            apiKeyConfigured: liveMode,
            cacheEntries: Object.keys(this._cache).length,
            trackedSymbols: this.TRACKED_SYMBOLS.length,
            signupUrl: 'https://www.barchart.com/ondemand/free-market-data-api',
            envKey: 'BARCHART_API_KEY'
        };
    }

    // ─────────────────────────────────────────────────────────
    // NORMALIZERS
    // ─────────────────────────────────────────────────────────

    _normalizeSpec(raw) {
        return {
            symbol: raw.symbol,
            name: raw.futuresName || raw.name,
            exchange: raw.exchange,
            tickSize: raw.minTick || raw.tickSize,
            tickValue: raw.tickValue,
            contractSize: raw.contractSize,
            marginInitial: raw.marginMaintenance, // Barchart provides maintenance; use as initial
            marginMaintenance: raw.marginMaintenance,
            currency: raw.tradingCurrency || 'USD',
            tradingHours: raw.tradingHours,
            settlementType: raw.settlementType,
            sector: raw.exchangeCode === 'F' ? 'Financials' : 'Commodities',
            dataSource: 'barchart_live'
        };
    }

    _normalizeQuote(raw) {
        const baseSymbol = raw.symbol?.replace('^', '').replace('*', '');
        return {
            symbol: baseSymbol,
            lastPrice: raw.lastPrice,
            previousClose: raw.previousClose,
            change: raw.netChange,
            changePercent: raw.percentChange,
            openInterest: raw.openInterest,
            volume: raw.volume,
            tradeTime: raw.tradeTime,
            dataSource: 'barchart_live'
        };
    }

    _buildCalendarMarkers(contracts, year, month) {
        const markers = {};
        contracts.forEach(c => {
            if (!c.expirationDate) return;
            const expDate = new Date(c.expirationDate);
            if (expDate.getFullYear() !== parseInt(year) || expDate.getMonth() + 1 !== parseInt(month)) return;
            const day = expDate.getDate();
            if (!markers[day]) markers[day] = [];
            markers[day].push({
                type: 'exp',
                label: 'Expiration',
                symbol: c.symbol?.replace('^', '').replace('*', ''),
                name: c.futuresName,
                daysUntil: Math.ceil((expDate - Date.now()) / (1000 * 60 * 60 * 24))
            });
        });
        return { year, month, markers };
    }

    // ─────────────────────────────────────────────────────────
    // STATIC FALLBACK DATA (curated — always up to date in principle)
    // ─────────────────────────────────────────────────────────

    _getStaticSpecs() {
        return [
            { symbol: 'ES', name: 'E-mini S&P 500', exchange: 'CME', tickSize: 0.25, tickValue: 12.50, contractSize: '$50 × Index', marginInitial: 12650, marginMaintenance: 11500, currency: 'USD', sector: 'Indices', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Cash', dataSource: 'static' },
            { symbol: 'NQ', name: 'E-mini Nasdaq-100', exchange: 'CME', tickSize: 0.25, tickValue: 5.00, contractSize: '$20 × Index', marginInitial: 17600, marginMaintenance: 16000, currency: 'USD', sector: 'Indices', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Cash', dataSource: 'static' },
            { symbol: 'GC', name: 'Gold', exchange: 'COMEX', tickSize: 0.10, tickValue: 10.00, contractSize: '100 Troy Oz', marginInitial: 9900, marginMaintenance: 9000, currency: 'USD', sector: 'Metals', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'CL', name: 'Crude Oil (WTI)', exchange: 'NYMEX', tickSize: 0.01, tickValue: 10.00, contractSize: '1,000 Barrels', marginInitial: 7700, marginMaintenance: 7000, currency: 'USD', sector: 'Energy', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'SI', name: 'Silver', exchange: 'COMEX', tickSize: 0.005, tickValue: 25.00, contractSize: '5,000 Troy Oz', marginInitial: 14300, marginMaintenance: 13000, currency: 'USD', sector: 'Metals', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'NG', name: 'Natural Gas', exchange: 'NYMEX', tickSize: 0.001, tickValue: 10.00, contractSize: '10,000 MMBtu', marginInitial: 5500, marginMaintenance: 5000, currency: 'USD', sector: 'Energy', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'YM', name: 'E-mini Dow Jones', exchange: 'CBOT', tickSize: 1, tickValue: 5.00, contractSize: '$5 × Index', marginInitial: 9350, marginMaintenance: 8500, currency: 'USD', sector: 'Indices', tradingHours: 'Sun-Fri 6pm-5pm ET', settlementType: 'Cash', dataSource: 'static' },
            { symbol: '6E', name: 'Euro FX', exchange: 'CME', tickSize: 0.00005, tickValue: 6.25, contractSize: '€125,000', marginInitial: 2530, marginMaintenance: 2300, currency: 'USD', sector: 'Currencies', tradingHours: 'Sun-Fri 5pm-4pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: '6B', name: 'British Pound', exchange: 'CME', tickSize: 0.0001, tickValue: 6.25, contractSize: '£62,500', marginInitial: 2800, marginMaintenance: 2550, currency: 'USD', sector: 'Currencies', tradingHours: 'Sun-Fri 5pm-4pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: '6J', name: 'Japanese Yen', exchange: 'CME', tickSize: 0.0000005, tickValue: 6.25, contractSize: '¥12,500,000', marginInitial: 3300, marginMaintenance: 3000, currency: 'USD', sector: 'Currencies', tradingHours: 'Sun-Fri 5pm-4pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'ZN', name: '10-Year Treasury Note', exchange: 'CBOT', tickSize: 0.015625, tickValue: 15.625, contractSize: '$100,000', marginInitial: 1650, marginMaintenance: 1500, currency: 'USD', sector: 'Rates', tradingHours: 'Sun-Fri 5pm-4pm ET', settlementType: 'Physical', dataSource: 'static' },
            { symbol: 'ZB', name: '30-Year Treasury Bond', exchange: 'CBOT', tickSize: 0.03125, tickValue: 31.25, contractSize: '$100,000', marginInitial: 4400, marginMaintenance: 4000, currency: 'USD', sector: 'Rates', tradingHours: 'Sun-Fri 5pm-4pm ET', settlementType: 'Physical', dataSource: 'static' },
        ];
    }

    _getStaticQuotes() {
        return [
            { symbol: 'ES', lastPrice: 5842.25, previousClose: 5815.00, change: 27.25, changePercent: 0.47, openInterest: 2380000, volume: 1250000, dataSource: 'static' },
            { symbol: 'NQ', lastPrice: 20340.50, previousClose: 20185.75, change: 154.75, changePercent: 0.77, openInterest: 580000, volume: 450000, dataSource: 'static' },
            { symbol: 'GC', lastPrice: 2915.40, previousClose: 2892.10, change: 23.30, changePercent: 0.81, openInterest: 420000, volume: 180000, dataSource: 'static' },
            { symbol: 'CL', lastPrice: 67.42, previousClose: 68.10, change: -0.68, changePercent: -1.00, openInterest: 1840000, volume: 750000, dataSource: 'static' },
        ];
    }

    _getStaticCalendar(year, month) {
        return {
            year, month,
            markers: {
                12: [{ type: 'roll', label: 'Rollover', symbol: 'ES/NQ' }],
                20: [{ type: 'fnd', label: 'First Notice Day', symbol: 'CL', daysUntil: 8 }],
                21: [
                    { type: 'exp', label: 'Expiration', symbol: 'ES', daysUntil: 9 },
                    { type: 'exp', label: 'Expiration', symbol: 'NQ', daysUntil: 9 }
                ],
                26: [{ type: 'exp', label: 'Expiration', symbol: 'GC', daysUntil: 14 }]
            },
            dataSource: 'static'
        };
    }
}

module.exports = new ContractDataService();
