/**
 * SentimentService — PostgreSQL edition.
 * Analyzes market sentiment based on news, COT reports, and fundamental data.
 */
const NewsRepository = require('../../repositories/pg/NewsRepository');
const COTReportRepository = require('../../repositories/pg/COTReportRepository');
const FundamentalDataRepository = require('../../repositories/pg/FundamentalDataRepository');

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
   * Get recent news mentioning relevant assets (client-side match on title/summary)
   */
  static async getRecentNews(assets) {
    const published = await NewsRepository.findPublished({}, {
      sort: 'publishedAt',
      direction: 'desc',
      limit: 50,
    });

    const q = assets.map(a => a.toLowerCase());
    const matched = published.filter(a => {
      const haystack = `${a.title || ''} ${a.summary || ''}`.toLowerCase();
      return q.some(asset => haystack.includes(asset));
    });

    return matched.slice(0, 10);
  }

  /**
   * Get latest COT report for assets
   */
  static async getLatestCOT(assets) {
    const reports = [];
    for (const asset of assets) {
      const latest = await COTReportRepository.findLatestByAsset(asset);
      if (latest) reports.push(latest);
    }
    return reports;
  }

  /**
   * Get fundamental data for assets
   */
  static async getFundamentalSnapshots(assets) {
    const all = await FundamentalDataRepository.findAll({}, {
      sort: 'releaseDate',
      direction: 'desc',
      limit: 100,
    });
    return all.filter(f => assets.includes(f.country)).slice(0, 5);
  }

  /**
   * Mock NLP sentiment analysis for news
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