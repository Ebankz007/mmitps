const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const https = require('https');

// Helper to fetch external data (using native https to avoid dependency issues if axios/fetch not avail)
const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => reject(err));
    });
};

/**
 * @desc    Get market quotes (Forex, Crypto, Indices)
 * @route   GET /api/v1/market-data/quotes?symbols=EURUSD,BTCUSD
 * @access  Public
 */
exports.getQuotes = catchAsync(async (req, res) => {
    const symbols = (req.query.symbols || 'EURUSD,GBPUSD,BTCUSD,ETHUSD,SPX500,NAS100,XAUUSD').split(',');

    // In a real app, we would query Alpha Vantage, Twelve Data, or a paid provider here.
    // For MVP/Demo, we return realistic mock data with slight randomization to simulate live feed.

    const mockData = symbols.map(sym => {
        const basePrice = getBasePrice(sym);
        const randomChange = (Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1); // +/- 0.5%
        const price = basePrice * (1 + randomChange);
        const change = price - basePrice;
        const changePercent = (change / basePrice) * 100;

        return {
            symbol: sym,
            price: parseFloat(price.toFixed(5)),
            change: parseFloat(change.toFixed(5)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            bid: parseFloat((price * 0.9998).toFixed(5)),
            ask: parseFloat((price * 1.0002).toFixed(5)),
            timestamp: new Date().toISOString()
        };
    });

    res.status(200).json(new ApiResponse(true, mockData, 'Market quotes retrieved'));
});

/**
 * @desc    Get historical data (Candles)
 * @route   GET /api/v1/market-data/history?symbol=EURUSD&interval=1h
 * @access  Public
 */
exports.getHistory = catchAsync(async (req, res) => {
    const { symbol, interval } = req.query;

    // Generate mock candlestick data
    const candles = generateMockCandles(symbol || 'EURUSD', 50);

    res.status(200).json(new ApiResponse(true, candles, 'Historical data retrieved'));
});

/**
 * @desc    Get Economic Calendar
 * @route   GET /api/v1/market-data/calendar
 * @access  Public
 */
exports.getCalendar = catchAsync(async (req, res) => {
    // Mock economic events
    const events = [
        {
            id: '1',
            title: 'Non-Farm Payrolls',
            currency: 'USD',
            impact: 'High',
            forecast: '180K',
            previous: '175K',
            actual: null,
            date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        },
        {
            id: '2',
            title: 'FOMC Meeting Minutes',
            currency: 'USD',
            impact: 'High',
            forecast: '',
            previous: '',
            actual: null,
            date: new Date(Date.now() + 172800000).toISOString() // Day after tomorrow
        },
        {
            id: '3',
            title: 'CPI y/y',
            currency: 'GBP',
            impact: 'Medium',
            forecast: '2.1%',
            previous: '2.3%',
            actual: '2.2%',
            date: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }
    ];

    res.status(200).json(new ApiResponse(true, events, 'Economic calendar retrieved'));
});

// --- Helpers ---

function getBasePrice(symbol) {
    const map = {
        'EURUSD': 1.0850,
        'GBPUSD': 1.2750,
        'USDJPY': 150.00,
        'BTCUSD': 65000.00,
        'ETHUSD': 3500.00,
        'XAUUSD': 2030.00, // Gold
        'SPX500': 5100.00,
        'NAS100': 18000.00
    };
    return map[symbol] || 100.00;
}

function generateMockCandles(symbol, count) {
    const candles = [];
    let price = getBasePrice(symbol);
    const now = Date.now();
    const intervalMs = 3600000; // 1 hour

    for (let i = count; i > 0; i--) {
        const open = price;
        const close = price * (1 + (Math.random() * 0.004 - 0.002));
        const high = Math.max(open, close) * (1 + Math.random() * 0.001);
        const low = Math.min(open, close) * (1 - Math.random() * 0.001);

        candles.push({
            time: now - (i * intervalMs),
            open: parseFloat(open.toFixed(5)),
            high: parseFloat(high.toFixed(5)),
            low: parseFloat(low.toFixed(5)),
            close: parseFloat(close.toFixed(5)),
            volume: Math.floor(Math.random() * 1000)
        });

        price = close;
    }
    return candles;
}
