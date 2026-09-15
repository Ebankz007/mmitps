class StrategyService {
    constructor() {
        this.strategies = [
            // --- Strategy & Analysis ---
            { id: 'trading-strategies', cat: 'toolkit', title: 'Trading Strategies', desc: 'A systematic approach to identifying, entering and exiting trades.', content: 'Comprehensive guide to rule-based execution...' },
            { id: 'technical-analysis', cat: 'toolkit', title: 'Technical Analysis', desc: 'Analyzing price movements using charts and indicators.', content: 'Deep dive into chart patterns, candles...' },
            { id: 'fundamental-analysis', cat: 'toolkit', title: 'Fundamental Analysis', desc: 'Evaluating assets based on economic and financial factors.', content: 'Economic indicators, central banks...' },
            { id: 'trading-indicators', cat: 'toolkit', title: 'Trading Indicators', desc: 'Mathematical calculations based on price and volume.', content: 'RSI, MACD, Moving Averages...' },
            { id: 'macro-strategy', cat: 'toolkit', title: 'Macro Strategy', desc: 'Top-down approach based on global economic trends.', content: 'Global macro cycles, interest rates...' },
            { id: 'arbitrage-basics', cat: 'toolkit', title: 'Arbitrage Basics', desc: 'Profiting from price differences in different markets.', content: 'Introduction to market inefficiencies...' },

            // --- Market Structure ---
            { id: 'smc', cat: 'structure', title: 'Smart Money Concepts', desc: 'Undeerstanding how institutional players move the market.', content: 'BOS, CHoCH, Order Blocks...' },
            { id: 'institutional-trading', cat: 'structure', title: 'Institutional Trading', desc: 'How large financial institutions execute their trades.', content: 'Large-scale execution, dark pools...' },
            { id: 'supply-demand', cat: 'structure', title: 'Supply and Demand', desc: 'Identifying areas where buyers and sellers are most active.', content: 'Zones, imbalances, mitigation...' },
            { id: 'liquidity-man', cat: 'structure', title: 'Liquidity Management', desc: 'Understanding how liquidity flows drive price action.', content: 'Stop hunts, liquidity pools...' },
            { id: 'order-flow', cat: 'structure', title: 'Trading Order flow', desc: 'Analyzing the actual buy and sell orders in the market.', content: 'Footprint charts, level 2 data...' },
            { id: 'mmm', cat: 'structure', title: 'Market Maker Method', desc: 'Trading in alignment with the liquidity provider cycles.', content: 'London session traps, peak formations...' },
            { id: 'market-micro', cat: 'structure', title: 'Market Microstructure', desc: 'The mechanics behind how buy and sell orders meet.', content: 'Spread, slippage, limit orders...' },
            { id: 'hft', cat: 'structure', title: 'High Frequency Trading', desc: 'Algorithmic trading with ultra-fast execution.', content: 'Latency, arb algorithms...' },

            // --- Risk & Theory ---
            { id: 'risk-man', cat: 'risk', title: 'Risk Management', desc: 'The process of identifying and mitigating potential losses.', content: 'Position sizing, risk per trade...' },
            { id: 'risk-metrics', cat: 'risk', title: 'Risk Theory Metrics', desc: 'Advanced mathematical formulas to measure risk exposure.', content: 'Kelly Criterion, Sharpe Ratio...' },
            { id: 'sl-strategy', cat: 'risk', title: 'Stop loss Strategy', desc: 'Placing orders to prevent further losses on a trade.', content: 'Dynamic stops, ATR stops...' },
            { id: 'trading-psych', cat: 'risk', title: 'Trading psychology', desc: 'The mental state during trading operations.', content: 'Fear, greed, and the zone...' },
            { id: 'market-liq', cat: 'risk', title: 'Market Liquidity', desc: 'Ease of buying/selling without affecting price much.', content: 'Volume vs Liquidity...' },
            { id: 'scalping-lev', cat: 'risk', title: 'Scalping with leverage', desc: 'Using increased capital for short-term profits.', content: 'Leverage risks, fast execution...' },
            { id: 'position-sizing-str', cat: 'risk', title: 'Position Sizing Strategy', desc: 'Determining the correct lot size for every trade.', content: 'Fixed risk vs Percentage risk...' },

            // --- Psychology ---
            { id: 'psych-trading', cat: 'psych', title: 'Psychological Trading', desc: 'Focusing on the mental discipline of high-performance traders.', content: 'Emotional intelligence in markets...' },
            { id: 'behavioral-fin', cat: 'psych', title: 'Behavioral Finance', desc: 'How psychological biases affect financial decisions.', content: 'Loss aversion, herd mentality...' },
            { id: 'prob-thinking', cat: 'psych', title: 'Probabilistic thinking', desc: 'Trading as a game of numbers rather than certainty.', content: 'Edge, expectancy, variance...' },
            { id: 'bias-awareness', cat: 'psych', title: 'Bias Awareness', desc: 'Identifying and neutralizing cognitive biases.', content: 'Recency bias, conformation bias...' },
            { id: 'discipline-cons', cat: 'psych', title: 'Discipline & Consistency', desc: 'The core foundations of a professional trader.', content: 'Routine, rules, adherence...' },
            { id: 'trading-journal-psych', cat: 'psych', title: 'Trading Journal Psychology', desc: 'Using records to improve mental performance.', content: 'Review cycles, emotional logging...' },

            // --- Execution ---
            { id: 'forex-trading', cat: 'execution', title: 'Forex Trading', desc: 'Methods for executing trades in the currency markets.', content: 'FX specific execution logic...' },
            { id: 'trend-wave', cat: 'execution', title: 'Trend Wave Analysis', desc: 'Executing based on multi-timeframe wave cycles.', content: 'Elliott waves, swing points...' },
            { id: 'scalping', cat: 'execution', title: 'Scalping', desc: 'Executing many trades for very small price moves.', content: '1m/5m execution tactics...' },
            { id: 'arbitrate-trading', cat: 'execution', title: 'Arbitrate Trading', desc: 'Advanced multi-asset execution frameworks.', content: 'Cross-exchange mechanics...' },
            { id: 'portfolio-opt', cat: 'execution', title: 'Portfolio Optimization', desc: 'Balancing multiple assets for maximum risk-adjusted return.', content: 'Modern Portfolio Theory (MPT)...' }
        ];
    }

    async getCategorizedStrategies() {
        const categories = {
            toolkit: { label: 'Strategy & Analysis', tools: [] },
            structure: { label: 'Market Structure', tools: [] },
            risk: { label: 'Risk & Theory Management', tools: [] },
            psych: { label: 'Psychology & Education', tools: [] },
            execution: { label: 'Execution Methods', tools: [] }
        };

        this.strategies.forEach(s => {
            if (categories[s.cat]) {
                categories[s.cat].tools.push({ id: s.id, title: s.title, desc: s.desc });
            }
        });

        return categories;
    }

    async getStrategyDetails(id) {
        const strategy = this.strategies.find(s => s.id === id);
        if (!strategy) return null;
        return strategy;
    }
}

module.exports = new StrategyService();
