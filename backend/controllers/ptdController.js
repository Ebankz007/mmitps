const FibonacciTimeService = require('../services/ptd/FibonacciTimeService');
const GannSquareService = require('../services/ptd/GannSquareService');
const AstroCycleService = require('../services/ptd/AstroCycleService');
const FourierCycleService = require('../services/ptd/FourierCycleService');
const PTDBacktestService = require('../services/ptd/PTDBacktestService');

const MODULE_ACCURACIES = {
    fibonacci: { accuracy: 82, last50: 84, last100: 82, allTime: 80 },
    gann: { accuracy: 74, last50: 76, last100: 74, allTime: 72 },
    astro: { accuracy: 71, last50: 69, last100: 71, allTime: 70 },
    cycles: { accuracy: 88, last50: 90, last100: 88, allTime: 86 },
};

/**
 * Helper to generate simulated historical data for the engines if real data isn't fetched yet.
 */
const getSimulatedOHLCV = (count = 500) => {
    const data = [];
    let price = 2650; // Base Gold price
    const now = Date.now();
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 10;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        data.push({
            time: Math.floor((now - (count - i) * 15 * 60 * 1000) / 1000),
            open, high, low, close, volume: Math.random() * 1000
        });
        price = close;
    }
    return data;
};

// POST /api/ptd/scan
exports.scanSignals = async (req, res) => {
    try {
        const { symbol, timeframe, logics = [], rule = "AND", tolerance = 5 } = req.body;
        console.log(`[PTD SCAN] Request logic for ${symbol} @ ${timeframe}: ${JSON.stringify(logics)}`);

        // Generate robust history
        const historicalBars = getSimulatedOHLCV(1000);
        console.log(`[PTD SCAN] Generated ${historicalBars.length} simulated bars`);

        const signals = [];
        if (logics.includes('fibonacci')) signals.push(...FibonacciTimeService.generateProjections(historicalBars));
        if (logics.includes('gann')) signals.push(...GannSquareService.generateProjections(historicalBars));
        if (logics.includes('astro')) signals.push(...AstroCycleService.generateProjections(historicalBars));
        if (logics.includes('cycles')) signals.push(...FourierCycleService.generateProjections(historicalBars));

        console.log(`[PTD SCAN] Generated ${signals.length} raw projections`);

        // Add "Future Space" bars to the chart so signals can be visualized forward in time
        const lastBar = historicalBars[historicalBars.length - 1];
        const lastClose = lastBar.close;
        
        // Precise timeframe mapping
        const timeframeMap = {
            '1m': 1, '5m': 5, '15m': 15, '30m': 30,
            '1h': 60, '4h': 240, '1d': 1440
        };
        const timeframeMinutes = timeframeMap[timeframe] || 60;
        
        const futureBars = [];
        for (let i = 1; i <= 600; i++) { // Increased to 600 for even longer projections
            // Simulate a slight trend/volatility in future space for visual depth
            const trend = (Math.random() - 0.45) * 5; 
            const prevClose = i === 1 ? lastClose : futureBars[i-2].close;
            const open = prevClose;
            const close = prevClose + trend;
            futureBars.push({
                time: lastBar.time + (i * timeframeMinutes * 60),
                open, 
                high: Math.max(open, close) + Math.random() * 2, 
                low: Math.min(open, close) - Math.random() * 2, 
                close, 
                volume: 0, 
                isFuture: true
            });
        }
        const ohlcv = [...historicalBars, ...futureBars];

        // Sort by timestamp and format for UI
        // We add a simulated price level for signals that don't have one
        const sortedSignals = signals
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(s => {
                const signalTime = Math.floor(s.timestamp / 1000);
                // Find matching bar in ohlcv to get a price level
                const matchingBar = ohlcv.find(b => b.time >= signalTime) || lastBar;
                
                return {
                    id: `sig-${Math.random().toString(36).substr(2, 9)}`,
                    ...s,
                    price: matchingBar.close, // Anchor for horizontal projection
                    time: new Date(s.timestamp).toISOString(),
                    status: s.timestamp < Date.now() ? (Math.random() > 0.3 ? 'hit' : 'miss') : 'pending'
                };
            });

        res.json({ success: true, data: sortedSignals, ohlcv });
    } catch (error) {
        console.error(`[PTD SCAN ERROR] ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/ptd/combinations
exports.getCombinations = async (req, res) => {
    res.json({
        success: true, data: [
            { id: "c1", name: "Fib + Cycles AND", modules: ["fibonacci", "cycles"], rule: "AND", tolerance: 5, weights: { fibonacci: 0.5, cycles: 0.5 } },
            { id: "c2", name: "All Modules OR", modules: ["fibonacci", "gann", "astro", "cycles"], rule: "OR", tolerance: 10, weights: {} },
        ]
    });
};

// POST /api/ptd/combinations
exports.saveCombination = async (req, res) => {
    const combo = { id: `c${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
    res.json({ success: true, data: combo });
};

// GET /api/ptd/signals
exports.getSignalHistory = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const now = Date.now();
    const signals = Array.from({ length: 20 }, (_, i) => ({
        id: `sig-${i}`,
        time: new Date(now - i * 3600000).toISOString(),
        type: ["Fibonacci Time", "Gann Square", "Astro Aspect", "Cycle Peak"][i % 4],
        direction: i % 2 === 0 ? "UP" : "DOWN",
        confidence: 60 + Math.round(Math.random() * 35),
        source: ["fibonacci", "gann", "astro", "cycles"][i % 4],
        status: ["hit", "miss", "pending"][i % 3],
        asset: "XAUUSD",
        timeframe: "1h",
    }));
    res.json({ success: true, data: signals, total: 200, page: +page });
};

// GET /api/ptd/accuracy
exports.getAccuracy = async (req, res) => {
    res.json({
        success: true, data: {
            overall: 79.4,
            modules: MODULE_ACCURACIES,
            total_evaluated: 412,
            hit_rate_history: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
                accuracy: 70 + Math.round(Math.random() * 20),
            }))
        }
    });
};

// GET /api/ptd/accuracy/module/:id
exports.getModuleAccuracy = async (req, res) => {
    const mod = MODULE_ACCURACIES[req.params.id];
    if (!mod) return res.status(404).json({ success: false, message: "Module not found" });
    res.json({ success: true, data: mod });
};

// POST /api/ptd/backtest
exports.runBacktest = async (req, res) => {
    try {
        const { symbol, start_date, end_date, logics, initialBalance = 10000 } = req.body;

        // Generate simulated history for backtest window
        const ohlcv = getSimulatedOHLCV(1000); // 1000 bars for deep simulation

        // Run real backtest through the engine
        const result = PTDBacktestService.run(ohlcv, logics, initialBalance);

        res.json({ success: true, data: result, ohlcv });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/ptd/alerts
exports.getAlerts = async (req, res) => {
    res.json({
        success: true, data: [
            { id: "a1", module: "cycles", minConfidence: 80, channels: ["in-app", "email"], active: true, created: new Date().toISOString() },
        ]
    });
};

// POST /api/ptd/alerts
exports.createAlert = async (req, res) => {
    const alert = { id: `a${Date.now()}`, ...req.body, active: true, created: new Date().toISOString() };
    res.json({ success: true, data: alert });
};

// GET /api/ptd/alerts/history
exports.getAlertHistory = async (req, res) => {
    const now = Date.now();
    const items = Array.from({ length: 10 }, (_, i) => ({
        id: `ah-${i}`, time: new Date(now - i * 3600000).toISOString(),
        instrument: "XAUUSD", direction: i % 2 === 0 ? "UP" : "DOWN",
        confidence: 65 + i * 3, source: ["cycles", "fibonacci"][i % 2],
        channel: "in-app",
    }));
    res.json({ success: true, data: items });
};

// DELETE /api/ptd/alerts/:id
exports.deleteAlert = async (req, res) => {
    res.json({ success: true, message: "Alert deleted" });
};

// POST /api/ptd/broker/connect
exports.connectBroker = async (req, res) => {
    // In production: encrypt keys with AES-256 before storing
    const { apiKey, secretKey, type = "paper" } = req.body;
    if (!apiKey || !secretKey) return res.status(400).json({ success: false, message: "API key and secret required" });
    res.json({ success: true, data: { connected: true, type, accountId: "PA-XXXX-XXXX" } });
};

// GET /api/ptd/broker/account
exports.getBrokerAccount = async (req, res) => {
    res.json({
        success: true, data: {
            id: "PA-XXXX-XXXX", type: "paper",
            equity: 10000, buyingPower: 20000, cash: 10000,
            positions: [], orders: [],
        }
    });
};

// POST /api/ptd/broker/trade
exports.executeTrade = async (req, res) => {
    const { symbol, direction, orderType, qty, stopLoss, takeProfit, signalId } = req.body;
    res.json({
        success: true, data: {
            orderId: `ORD-${Date.now()}`, symbol, direction, qty, orderType,
            status: "filled", filledAt: new Date().toISOString(), filledPrice: 2980.50,
        }
    });
};

// GET /api/ptd/broker/trades
exports.getTradeLog = async (req, res) => {
    const now = Date.now();
    const trades = Array.from({ length: 8 }, (_, i) => ({
        id: `trd-${i}`, symbol: "XAUUSD",
        direction: i % 2 === 0 ? "BUY" : "SELL", qty: 1, orderType: "market",
        status: "filled", filledPrice: 2970 + i * 2,
        pnl: Math.round((Math.random() - 0.4) * 200),
        filledAt: new Date(now - i * 3600000).toISOString(),
        confidence: 70 + i * 3, source: ["cycles", "fibonacci"][i % 2],
        auto: i < 4,
    }));
    res.json({ success: true, data: trades });
};
