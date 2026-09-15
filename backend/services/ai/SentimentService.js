const NewsArticle = require('../../models/News/NewsArticle');
const COTReport = require('../../models/Trading/COTReport');
const FundamentalData = require('../../models/Trading/FundamentalData');

/**
 * AI Sentiment Service
 * Analyzes market sentiment based on news and COT data.
 */
class SentimentService {
    /**
     * Map common symbols to their primary currencies/assets
     */
    static symbolMap = {
        'EURUSD': ['EUR', 'USD'],
        'GBPUSD': ['GBP', 'USD'],
        'USDJPY': ['USD', 'JPY'],
        'AUDUSD': ['AUD', 'USD'],
        'USDCAD': ['USD', 'CAD'],
        'GOLD': ['XAU', 'GOLD'],
        'BTCUSD': ['BTC', 'CRYPTO']
    };

    /**
     * Calculate sentiment for a specific symbol
     * @param {string} symbol - e.g., 'EURUSD'
     * @returns {Promise<Object>} Sentiment report
     */
    static async analyzeSymbol(symbol) {
        const assets = this.symbolMap[symbol.toUpperCase()] || [symbol.toUpperCase()];

        // 1. Fetch data in parallel
        const [news, cotData, fundamental] = await Promise.all([
            this.getRecentNews(assets),
            this.getLatestCOT(assets),
            this.getFundamentalSnapshots(assets)
        ]);

        // 2. Calculate scores
        const newsScore = this.calculateNewsScore(news);
        const cotScore = this.calculateCOTScore(cotData);

        // Weighted aggregate (COT 60%, News 40%)
        let totalScore = (cotScore * 0.6) + (newsScore * 0.4);

        // Round to nearest integer
        totalScore = Math.round(totalScore);

        return {
            symbol,
            sentimentScore: totalScore,
            category: this.getSentimentCategory(totalScore),
            breakdown: {
                institutional: cotScore,
                retail_news: newsScore
            },
            summary: this.generateSummary(symbol, totalScore, news),
            timestamp: new Date()
        };
    }

    /**
     * Get recent news mentioning relevant assets
     */
    static async getRecentNews(assets) {
        // Simple regex search in title/content for asset mentions
        const articles = await NewsArticle.find({
            isPublished: true,
            $or: assets.map(asset => ({
                $or: [
                    { title: new RegExp(asset, 'i') },
                    { content: new RegExp(asset, 'i') }
                ]
            }))
        })
            .sort({ publishedAt: -1 })
            .limit(10);

        return articles;
    }

    /**
     * Get latest COT report for assets
     */
    static async getLatestCOT(assets) {
        const reports = await COTReport.find({
            asset: { $in: assets }
        })
            .sort({ reportingDate: -1 })
            .limit(assets.length);

        return reports;
    }

    /**
     * Get fundamental data for assets
     */
    static async getFundamentalSnapshots(assets) {
        return await FundamentalData.find({
            country: { $in: assets }
        })
            .sort({ releaseDate: -1 })
            .limit(5);
    }

    /**
     * Mock NLP sentiment analysis for news
     * In a production environment, this would call an LLM or NLP library
     */
    static calculateNewsScore(articles) {
        if (!articles || articles.length === 0) return 0;

        let score = 0;
        const keywords = {
            positive: ['bullish', 'growth', 'gain', 'strength', 'improve', 'hawkish', 'rise', 'recovery'],
            negative: ['bearish', 'drop', 'fall', 'weak', 'inflation', 'dovish', 'recession', 'uncertainty']
        };

        articles.forEach(article => {
            const text = (article.title + ' ' + (article.summary || '')).toLowerCase();

            keywords.positive.forEach(word => {
                if (text.includes(word)) score += 10;
            });
            keywords.negative.forEach(word => {
                if (text.includes(word)) score -= 10;
            });
        });

        // Normalize to -100 to 100
        return Math.max(-100, Math.min(100, score / Math.max(1, articles.length / 2)));
    }

    /**
     * Calculate score based on COT net positions
     */
    static calculateCOTScore(reports) {
        if (!reports || reports.length === 0) return 0;

        // If it's a pair, compare base vs quote sentiment
        if (reports.length >= 2) {
            const base = reports[0].sentimentScore || 0;
            const quote = reports[1].sentimentScore || 0;
            return base - quote; // Bullish for base if base > quote
        }

        return reports[0].sentimentScore || 0;
    }

    /**
     * Map numeric score to category
     */
    static getSentimentCategory(score) {
        if (score >= 60) return 'Extreme Greed';
        if (score >= 20) return 'Greed';
        if (score > -20) return 'Neutral';
        if (score > -60) return 'Fear';
        return 'Extreme Fear';
    }

    /**
     * Generate a concise summary
     */
    static generateSummary(symbol, score, news) {
        const category = this.getSentimentCategory(score);
        let summary = `Market sentiment for ${symbol} is currently ${category} (${score}). `;

        if (news.length > 0) {
            summary += `Recent headlines focus on ${news[0].title.substring(0, 50)}...`;
        } else {
            summary += `Limited recent news coverage was found for this asset.`;
        }

        return summary;
    }

    /**
     * Get sentiment overview for major assets
     */
    static async getMarketOverview() {
        const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'BTCUSD'];
        const reports = [];

        for (const pair of majorPairs) {
            try {
                const report = await this.analyzeSymbol(pair);
                reports.push(report);
            } catch (err) {
                console.error(`Error analyzing ${pair}:`, err.message);
            }
        }

        return reports;
    }
}

module.exports = SentimentService;
