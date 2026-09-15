const ApiServiceManager = require('../ApiServiceManager');
const COTReportRepository = require('../../repositories/pg/COTReportRepository');

// Full 23-currency set
const ALL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'NOK', 'SEK', 'DKK', 'SGD', 'HKD', 'ZAR', 'MXN', 'PLN', 'TRY', 'CNH', 'INR', 'BRL', 'CZK', 'HUF', 'ILS'];

// Deterministic seed from string
function seed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function prand(s, offset = 0) {
    return ((seed(s) + offset * 7919) % 10000) / 10000;
}

class COTService {
    async getLatestReport(asset) {
        const isMock = await ApiServiceManager.isMockMode();
        if (isMock) return this.generateMockReport(asset);
        return await COTReportRepository.findLatestByAsset(asset);
    }

    generateMockReport(asset) {
        const r0 = prand(asset, 0);
        const r1 = prand(asset, 1);
        return {
            asset,
            reportingDate: new Date(),
            nonCommercialLong: Math.round(40000 + r0 * 120000),
            nonCommercialShort: Math.round(20000 + r1 * 80000),
            commercialLong: Math.round(50000 + prand(asset, 2) * 100000),
            commercialShort: Math.round(60000 + prand(asset, 3) * 120000),
            netPosition: Math.round((r0 - r1) * 60000),
            sentiment: r0 > r1 ? 'Bullish' : 'Bearish',
            oi: Math.round(200000 + prand(asset, 4) * 300000),
            nonCommercialNet: Math.round((r0 - r1) * 60000),
            commercialNet: Math.round((prand(asset, 2) - prand(asset, 3)) * 60000),
        };
    }

    /**
     * Get full global matrix for all 23 currencies — drives the data table
     */
    async getGlobalMatrix() {
        const isMock = await ApiServiceManager.isMockMode();
        if (isMock || true) return this.generateGlobalMatrix();
        // Future: aggregate real COT reports from DB
        return this.generateGlobalMatrix();
    }

    generateGlobalMatrix() {
        return ALL_CURRENCIES.map(ccy => {
            const r0 = prand(ccy, 10);
            const r1 = prand(ccy, 11);
            const r2 = prand(ccy, 12);
            const r3 = prand(ccy, 13);
            const r4 = prand(ccy, 14);
            const r5 = prand(ccy, 15);

            const nonCommLong = Math.round(30000 + r0 * 150000);
            const nonCommShort = Math.round(15000 + r1 * 100000);
            const commLong = Math.round(40000 + r2 * 130000);
            const commShort = Math.round(50000 + r3 * 140000);
            const nonRepLong = Math.round(5000 + r4 * 20000);
            const nonRepShort = Math.round(5000 + r5 * 20000);

            const oi = nonCommLong + nonCommShort + commLong + commShort + nonRepLong + nonRepShort;
            const netPosition = nonCommLong - nonCommShort;
            const pctLong = Math.round((nonCommLong / (nonCommLong + nonCommShort)) * 100);
            const weeklyChange = Math.round((prand(ccy, 20) - 0.5) * 12000);
            const cotIndex = Math.round(prand(ccy, 30) * 100);
            const stochastic = Math.round(prand(ccy, 40) * 100);
            const dealersNet = commLong - commShort;
            const sentiment = netPosition > 0 ? 'Bullish' : netPosition < -5000 ? 'Bearish' : 'Neutral';

            return {
                currency: ccy,
                nonCommLong, nonCommShort,
                commLong, commShort,
                nonRepLong, nonRepShort,
                oi, netPosition, pctLong,
                weeklyChange, cotIndex, stochastic,
                dealersNet, sentiment,
                reportDate: new Date(),
            };
        });
    }

    /**
     * Get 12-week historical COT index values per currency
     */
    async getCOTHistoricalIndex() {
        const isMock = await ApiServiceManager.isMockMode();
        if (isMock || true) return this.generateHistoricalIndex();
        return this.generateHistoricalIndex();
    }

    generateHistoricalIndex() {
        const weeks = 12;
        const result = {};
        for (const ccy of ALL_CURRENCIES) {
            const history = [];
            let val = prand(ccy, 50) * 80 + 10; // start between 10-90
            for (let w = 0; w < weeks; w++) {
                const drift = (prand(ccy, 100 + w) - 0.48) * 12;
                val = Math.max(0, Math.min(100, val + drift));
                const d = new Date();
                d.setDate(d.getDate() - (weeks - w) * 7);
                history.push({
                    week: w + 1,
                    date: d.toISOString().slice(0, 10),
                    cotIndex: Math.round(val * 10) / 10,
                    netPosition: Math.round((val - 50) * 1200),
                });
            }
            result[ccy] = history;
        }
        return result;
    }

    async getHistoricalReports(asset, startDate, endDate) {
        const reports = await COTReportRepository.findByAsset(asset, { sort: 'reportingDate', direction: 'asc' });
        return reports.filter(r => {
            const d = new Date(r.reportingDate);
            if (startDate && d < new Date(startDate)) return false;
            if (endDate && d > new Date(endDate)) return false;
            return true;
        });
    }

    async syncData(dataArray) {
        return COTReportRepository.upsertByAssetDate(dataArray);
    }
}

module.exports = new COTService();
