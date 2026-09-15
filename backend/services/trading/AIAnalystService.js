const ApiServiceManager = require('../ApiServiceManager');

// Agent definitions matching the AI Analyst hub
const AGENTS = {
    'macro-ai': {
        name: 'MacroMind AI',
        specialty: 'Global Fundamentals',
        focus: 'fundamental',
    },
    'technical-ai': {
        name: 'VectorQuant AI',
        specialty: 'Technical Patterns',
        focus: 'technical',
    },
    'sentiment-ai': {
        name: 'VoxPopuli AI',
        specialty: 'Market Sentiment',
        focus: 'sentiment',
    },
    'multi-agent': {
        name: 'Multi-Agent Consensus',
        specialty: 'Composite Analysis',
        focus: 'composite',
    },
};

// Deterministic but varied mock data seeded from symbol
function seed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function pseudoRand(s, offset = 0) {
    return ((seed(s) + offset) % 100) / 100;
}

class AIAnalystService {
    /**
     * Get market analysis for a specific symbol with optional agent filter
     */
    async getMarketAnalysis(symbol, agentId = 'technical-ai') {
        const isMock = await ApiServiceManager.isMockMode();
        if (isMock || true) {
            return this.generateMockAnalysis(symbol, agentId);
        }
        // Future: route to real OpenAI/Anthropic or internal model
        return this.generateMockAnalysis(symbol, agentId);
    }

    /**
     * Get composite multi-agent consensus
     */
    async getConsensus(symbol) {
        const [macro, tech, sentiment] = await Promise.all([
            this.getMarketAnalysis(symbol, 'macro-ai'),
            this.getMarketAnalysis(symbol, 'technical-ai'),
            this.getMarketAnalysis(symbol, 'sentiment-ai'),
        ]);
        const avgConfidence = Math.round((macro.confidence + tech.confidence + sentiment.confidence) / 3);
        const votes = [macro.bias, tech.bias, sentiment.bias];
        const bias = votes.filter(v => v === 'Bullish').length >= 2 ? 'Bullish' :
            votes.filter(v => v === 'Bearish').length >= 2 ? 'Bearish' : 'Neutral';
        return { symbol, agentId: 'multi-agent', agentName: 'Multi-Agent Consensus', bias, confidence: avgConfidence, agents: { macro, tech, sentiment }, timestamp: new Date() };
    }

    /**
     * Generate high-quality, agent-specific mock technical analysis
     */
    generateMockAnalysis(symbol, agentId = 'technical-ai') {
        const agent = AGENTS[agentId] || AGENTS['technical-ai'];
        const r0 = pseudoRand(symbol);
        const r1 = pseudoRand(symbol, 1);
        const r2 = pseudoRand(symbol, 2);
        const r3 = pseudoRand(symbol, 3);

        const confidence = Math.round(65 + r0 * 30);  // 65–95
        const bias = r1 > 0.55 ? 'Bullish' : r1 < 0.3 ? 'Bearish' : 'Neutral';

        // Fake price levels seeded from symbol
        const base = 1.05 + r2 * 0.30;
        const spread = 0.005 + r3 * 0.02;
        const s1 = +(base - spread * 1.2).toFixed(4);
        const s2 = +(base - spread * 2.4).toFixed(4);
        const r_1 = +(base + spread * 1.1).toFixed(4);
        const r_2 = +(base + spread * 2.2).toFixed(4);
        const entry = +(base - spread * 0.5).toFixed(4);
        const sl = +(s2 - spread * 0.5).toFixed(4);
        const tp = +(r_2 + spread * 0.3).toFixed(4);
        const rr = +((Math.abs(tp - entry)) / (Math.abs(entry - sl))).toFixed(1);

        const patterns = ['Bull Flag', 'Ascending Triangle', 'Inverse H&S', 'Fib Retracement 61.8%', 'Descending Wedge', 'Double Bottom', 'Liquidity Sweep'];
        const trendStr = ['Weak', 'Moderate', 'Strong', 'Very Strong'];
        const timeframes = ['H1 · H4', 'H4 · D1', 'D1 · W1', 'H1 · D1'];

        // Agent-specific summaries
        const SUMMARIES = {
            'macro-ai': `${symbol} is supported by diverging monetary policy and improving economic fundamentals. Central bank trajectory for the base currency remains ${bias === 'Bullish' ? 'hawkish relative to peers' : 'increasingly dovish'}. Expect range continuation if data surprises are contained.`,
            'technical-ai': `${symbol} is forming a ${patterns[Math.floor(r0 * patterns.length)]} on the ${timeframes[Math.floor(r1 * timeframes.length)]} timeframe. Price action approaching ${bias === 'Bullish' ? 'resistance confluence at ' + r_1 : 'support confluence at ' + s1}. Trend strength: ${trendStr[Math.floor(r2 * trendStr.length)]}.`,
            'sentiment-ai': `Retail positioning data shows ${r3 > 0.5 ? 'heavy long exposure' : 'dominant short crowding'} on ${symbol}. Contrarian model signals ${bias === 'Bullish' ? 'institutional accumulation underway' : 'distribution phase near highs'}. Social sentiment index: ${Math.round(35 + r0 * 55)}/100.`,
            'multi-agent': `Composite consensus for ${symbol} shows ${confidence}% overall confidence. All three intelligence layers (Fundamental, Technical, Sentiment) agree on a ${bias} directional bias for the near-term.`,
        };

        return {
            symbol,
            agentId,
            agentName: agent.name,
            agentSpecialty: agent.specialty,
            bias,
            confidence,
            summary: SUMMARIES[agentId] || SUMMARIES['technical-ai'],
            keyLevels: { support: [s1, s2], resistance: [r_1, r_2] },
            tradeSetup: {
                entry,
                stopLoss: sl,
                takeProfit: tp,
                riskReward: rr,
                timeframe: timeframes[Math.floor(r1 * timeframes.length)],
                pattern: patterns[Math.floor(r0 * patterns.length)],
            },
            signals: [
                { name: 'Trend Direction', value: bias, status: bias === 'Bullish' ? 'positive' : bias === 'Bearish' ? 'negative' : 'neutral' },
                { name: 'Momentum RSI', value: Math.round(40 + r0 * 40) + '', status: r0 > 0.6 ? 'positive' : r0 < 0.3 ? 'negative' : 'neutral' },
                { name: 'MACD Cross', value: bias === 'Bullish' ? 'Bullish Cross' : 'Bearish Cross', status: bias === 'Bullish' ? 'positive' : 'negative' },
                { name: 'Volume Profile', value: r2 > 0.5 ? 'Above Average' : 'Below Average', status: r2 > 0.5 ? 'positive' : 'neutral' },
                { name: 'News Sentiment', value: r3 > 0.5 ? 'Positive' : 'Mixed', status: r3 > 0.5 ? 'positive' : 'neutral' },
            ],
            timestamp: new Date(),
        };
    }

    /**
     * Get all available agents
     */
    getAvailableAgents() {
        return Object.entries(AGENTS).map(([id, info]) => ({ id, ...info, status: id === 'technical-ai' ? 'Syncing' : 'Online', accuracy: id === 'sentiment-ai' ? '94%' : id === 'macro-ai' ? '92%' : id === 'technical-ai' ? '88%' : '90%' }));
    }

    /**
     * Get trade control recommendations
     */
    async getTradeControl(traderId) {
        return {
            accountStatus: 'Healthy',
            maxRiskPerTrade: '1.5%',
            currentExposure: '4.2%',
            recommendation: 'Exposure is within safe limits. Consider diversifying with non-correlated assets.',
            riskScore: 32
        };
    }
}

module.exports = new AIAnalystService();
