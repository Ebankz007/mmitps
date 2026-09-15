/**
 * SentimentController — PostgreSQL edition.
 */
const SentimentService = require('../../services/pg/SentimentService');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * Sentiment Controller
 * Handles API requests for AI Market Sentiment
 */
exports.getSentiment = async (req, res, next) => {
    try {
        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json(new ApiResponse(false, null, 'Symbol is required'));
        }

        const report = await SentimentService.analyzeSymbol(symbol);

        res.status(200).json(new ApiResponse(true, report, 'Sentiment analysis completed'));
    } catch (error) {
        next(error);
    }
};

/**
 * Get Broad Market Sentiment (Overview)
 */
exports.getMarketOverview = async (req, res, next) => {
    try {
        const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'GOLD', 'BTCUSD'];
        const reports = await Promise.all(
            symbols.map(s => SentimentService.analyzeSymbol(s))
        );

        // Build the shape the frontend MarketOverview interface expects
        const scores = reports.map(r => (typeof r?.score === 'number' ? r.score : 0));
        const globalScore = scores.length
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        // sectors: Record<string, number> — keyed by symbol, value 0-100
        const sectors = {};
        reports.forEach((r, i) => {
            sectors[symbols[i]] = typeof r?.score === 'number'
                ? Math.round(((r.score + 1) / 2) * 100) // normalise -1..1 → 0..100
                : 50;
        });

        const topBullish = reports
            .filter(r => r?.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(r => r.symbol || symbols[reports.indexOf(r)])
            .slice(0, 3);

        const topBearish = reports
            .filter(r => r?.score < 0)
            .sort((a, b) => a.score - b.score)
            .map(r => r.symbol || symbols[reports.indexOf(r)])
            .slice(0, 3);

        const overview = { globalScore, sectors, topBullish, topBearish };

        res.status(200).json(new ApiResponse(true, overview, 'Market overview retrieved'));
    } catch (error) {
        next(error);
    }
};