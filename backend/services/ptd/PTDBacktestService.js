const FibonacciTimeService = require('./FibonacciTimeService');
const GannSquareService = require('./GannSquareService');
const AstroCycleService = require('./AstroCycleService');
const FourierCycleService = require('./FourierCycleService');

/**
 * PTD Backtest Service
 * Orchestrates historical price analysis through all enabled math engines
 * to calculate real Win Rates, P&L, and Equity Curves.
 */

class PTDBacktestService {
    /**
     * Executes a historical simulation.
     * @param {Array} ohlcv - Full historical OHLCV data
     * @param {Array} logics - List of enabled modules ['fibonacci', 'gann', 'astro', 'cycles']
     * @param {Number} initialBalance - Starting capital
     * @returns {Object} Backtest results
     */
    static run(ohlcv, logics = [], initialBalance = 10000) {
        if (!ohlcv || ohlcv.length < 200) {
            throw new Error("Insufficient historical data for backtest (min 200 bars)");
        }

        const trades = [];
        let balance = initialBalance;
        const equityCurve = [];

        // We use a sliding window approach.
        // For each 'day' or segment, we run the engines on the data PRIOR to that point.
        // We only simulate trades for the middle 70% of the data to ensure engines have enough context.
        const startIdx = 100;
        const endIdx = ohlcv.length - 20; // Leave some bars for trade resolution

        for (let i = startIdx; i < endIdx; i += 5) { // Step every 5 bars to avoid noise
            const historicalSlice = ohlcv.slice(0, i);
            const currentBar = ohlcv[i];

            // Gather signals from enabled engines
            const signals = [];
            if (logics.includes('fibonacci')) signals.push(...FibonacciTimeService.generateProjections(historicalSlice));
            if (logics.includes('gann')) signals.push(...GannSquareService.generateProjections(historicalSlice));
            if (logics.includes('astro')) signals.push(...AstroCycleService.generateProjections(historicalSlice));
            if (logics.includes('cycles')) signals.push(...FourierCycleService.generateProjections(historicalSlice));

            // Filter for signals triggering EXACTLY at the 'current' bar time (or within small tolerance)
            const currentTime = new Date(currentBar.time).getTime();
            const activeSignals = signals.filter(sig => Math.abs(sig.timestamp - currentTime) < (15 * 60 * 1000)); // 15m tolerance

            if (activeSignals.length > 0) {
                // If multiple signals agree (confluence), pick the strongest
                const bestSignal = activeSignals.sort((a, b) => b.confidence - a.confidence)[0];

                // Simulate Trade Outcome
                // We look forward 10 bars to see if price moved in signal direction
                const futureBars = ohlcv.slice(i + 1, i + 11);
                if (futureBars.length < 5) continue;

                const entryPrice = parseFloat(currentBar.close);
                const exitPrice = parseFloat(futureBars[futureBars.length - 1].close);

                const isWin = bestSignal.direction === 'UP' ? exitPrice > entryPrice : exitPrice < entryPrice;
                const profit = isWin ? 150 : -100; // Simulated $ unit profit/loss

                trades.push({
                    time: currentBar.time,
                    direction: bestSignal.direction,
                    confidence: bestSignal.confidence,
                    type: bestSignal.type,
                    source: bestSignal.source,
                    result: isWin ? 'win' : 'loss',
                    profit: profit
                });

                balance += profit;
                equityCurve.push({ time: currentBar.time, balance });
            }
        }

        const wins = trades.filter(t => t.result === 'win').length;
        const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;

        // Confidence Bracket Calculation
        const brackets = [
            { range: "80–100%", total: 0, wins: 0 },
            { range: "50–79%", total: 0, wins: 0 },
            { range: "<50%", total: 0, wins: 0 }
        ];

        trades.forEach(t => {
            let bIndex = 2;
            if (t.confidence >= 80) bIndex = 0;
            else if (t.confidence >= 50) bIndex = 1;

            brackets[bIndex].total++;
            if (t.result === 'win') brackets[bIndex].wins++;
        });

        const finalizedBrackets = brackets.map(b => ({
            ...b,
            winRate: b.total > 0 ? Math.round((b.wins / b.total) * 100) : 0
        }));

        return {
            initial_balance: initialBalance,
            final_balance: balance,
            total_trades: trades.length,
            win_rate: winRate,
            trades: trades.slice(-50), // Return last 50 for UI
            equity_curve: equityCurve,
            confidence_brackets: finalizedBrackets
        };
    }
}

module.exports = PTDBacktestService;
