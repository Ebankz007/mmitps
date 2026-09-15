const axios = require('axios');
const logger = require('../../utils/logger');
const COTReportRepository = require('../../repositories/pg/COTReportRepository');

/**
 * COTDataMinerService — PostgreSQL edition.
 * 
 * Interacts with the CFTC Socrata Open Data API to fetch the weekly 
 * Commitments of Traders (COT) Legacy report. Parses Commercial and 
 * Non-Commercial (Managed Money) net positioning for global assets.
 */
class COTDataMinerService {
    constructor() {
        this.API_URL = 'https://publicreporting.cftc.gov/resource/g6x5-rxcv.json';

        this.MARKET_CODES = {
            'EUR/USD': '099741', // EURO FX - CHICAGO MERCANTILE EXCHANGE
            'Gold': '088691',    // GOLD - COMMODITY EXCHANGE INC.
            'GBP/USD': '096742', // BRITISH POUND STERLING - CME
            'Oil (WTI)': '067651', // CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE
            'BTC/USD': '133741'  // BITCOIN - CHICAGO MERCANTILE EXCHANGE
        };
    }

    /**
     * Fetches the latest week's COT data from the US Gov API
     */
    async fetchLatestCOTReport() {
        try {
            logger.info('📊 COT Data Miner: Fetching latest CFTC Report...');

            const response = await axios.get(this.API_URL, {
                params: {
                    '$limit': 500,
                    '$order': 'report_date_as_yyyy_mm_dd DESC'
                }
            });

            if (response.data && response.data.length > 0) {
                const latestDate = response.data[0].report_date_as_yyyy_mm_dd;
                const latestWeekData = response.data.filter(row => row.report_date_as_yyyy_mm_dd === latestDate);

                logger.info(`✅ COT Data Miner: Successfully fetched report for week of ${latestDate.substring(0, 10)}`);
                return latestWeekData;
            }

            throw new Error("Empty response from CFTC API");
        } catch (error) {
            logger.error(`❌ COT Data Miner Error: Failed to fetch CFTC API. ${error.message}`);
            return null;
        }
    }

    /**
     * Parses the raw CFTC JSON into our platform's normalized format
     */
    parseInstrumentPositioning(instrument, rawReport) {
        const cftcCode = this.MARKET_CODES[instrument];
        if (!cftcCode) return null;

        const contractData = rawReport.find(row => row.cftc_contract_market_code === cftcCode);
        if (!contractData) {
            logger.warn(`⚠️ COT Data Miner: Contract code ${cftcCode} (${instrument}) not found in this week's report.`);
            return null;
        }

        const commercialLong = parseInt(contractData.comm_positions_long_all) || 0;
        const commercialShort = parseInt(contractData.comm_positions_short_all) || 0;
        const nonCommercialLong = parseInt(contractData.noncomm_positions_long_all) || 0;
        const nonCommercialShort = parseInt(contractData.noncomm_positions_short_all) || 0;
        const managedMoneyNet = nonCommercialLong - nonCommercialShort;

        return {
            asset: instrument,
            reportingDate: new Date(contractData.report_date_as_yyyy_mm_dd.substring(0, 10)),
            commercialLong,
            commercialShort,
            nonCommercialLong,
            nonCommercialShort,
            netPosition: managedMoneyNet,
            metadata: {
                description: `Commercial Net: ${commercialLong - commercialShort} | Speculator Net: ${managedMoneyNet}`
            }
        };
    }

    /**
     * High-level orchestrator — fetch, parse, and save to PostgreSQL.
     */
    async updateAllCOTData() {
        const rawReport = await this.fetchLatestCOTReport();
        if (!rawReport) return;

        const results = [];

        for (const instrument of Object.keys(this.MARKET_CODES)) {
            const parsedData = this.parseInstrumentPositioning(instrument, rawReport);
            if (parsedData) {
                results.push(parsedData);
            }
        }

        if (results.length > 0) {
            try {
                for (const doc of results) {
                    await COTReportRepository.upsertByAssetDate(doc);
                }
                logger.info(`✅ COT Data Miner: Successfully saved ${results.length} instrument reports to PostgreSQL.`);
            } catch (err) {
                logger.error(`❌ COT Data Miner: Failed to save to DB - ${err.message}`);
            }
        }
        
        return results;
    }
}

module.exports = new COTDataMinerService();
