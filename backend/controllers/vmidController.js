const catchAsync = require("../utils/catchAsync");
const CorrelationAnalyticsService = require("../services/trading/CorrelationAnalyticsService");
const LiveStreamService = require("../services/LiveStreamService");
const ApiError = require("../utils/ApiError");

// Helper to generate some mock OHLCV candlestick data (kept for chart dependencies)
const generateMockOHLCV = (count, startPrice) => {
    let currentPrice = startPrice;
    let time = Math.floor(Date.now() / 1000) - count * 60; // 1M bars
    const data = [];

    for (let i = 0; i < count; i++) {
        const volatility = currentPrice * 0.002;
        const open = currentPrice;
        const close = open + (Math.random() - 0.45) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        // Spike volume randomly for demonstration
        const isSpike = Math.random() > 0.9;
        const baseVolume = 100 + Math.random() * 500;
        const volume = isSpike ? baseVolume * (3 + Math.random() * 5) : baseVolume;

        data.push({
            time: time,
            open: parseFloat(open.toFixed(5)),
            high: parseFloat(high.toFixed(5)),
            low: parseFloat(low.toFixed(5)),
            close: parseFloat(close.toFixed(5)),
            value: Math.floor(volume), // Recharts / Lightweight Charts standard for histogram
            color: close >= open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)"
        });

        currentPrice = close;
        time += 60 * 15; // 15 minute candles
    }

    return data;
};

// ==========================================
// LIVESTREAM INTEGRATION (External Video API)
// ==========================================

/**
 * Initiates a new Live Stream (Educator / Admin only)
 * This connects to the external Mux API.
 */
exports.createLiveStream = catchAsync(async (req, res) => {
    // Only admins or certified educators should create streams
    if (req.user.role === 'user') {
        throw new ApiError(403, 'You do not have permission to broadcast.');
    }

    const { title, description } = req.body;
    
    // Create the stream on Mux (or AWS IVS depending on config)
    const streamData = await LiveStreamService.createStream(req.user.id || req.user._id, { title, description });

    res.status(201).json({
        status: "success",
        data: {
            title,
            description,
            ...streamData
        }
    });
});

/**
 * Retrieves active streams for students to watch
 */
exports.getActiveStreams = catchAsync(async (req, res) => {
    // In a full production system you would track Active Stream DB records
    // here we return the mock fallback or specific pinned streams
    
    // For demonstration, we'll return a playback URL from our Mock settings
    // so the frontend can immediately play video
    const mockData = LiveStreamService.getMockStreamData();
    const playbackUrl = LiveStreamService.getPlaybackUrl(mockData.playbackId);

    const streams = [
        {
            id: '1',
            title: 'Advanced Market Geometry Structure',
            educator: 'Alex Mercer',
            status: 'live',
            viewers: 1420,
            playbackUrl: playbackUrl,
            thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80'
        },
        {
            id: '2',
            title: 'Precision Timing Delivery (PTD) Review',
            educator: 'Sarah Chen',
            status: 'starting_soon',
            viewers: 0,
            playbackUrl: '',
            thumbnailUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80'
        }
    ];

    res.status(200).json({
        status: "success",
        data: {
            streams
        }
    });
});


// ==========================================
// DATA ANALYTICS & MARKET LOGIC (Geo/VMID)
// ==========================================

exports.getMarketData = catchAsync(async (req, res) => {
    const { instrument = "EUR/USD", timeframe = "15m" } = req.query;

    const basePrices = {
        "EUR/USD": 1.0850,
        "Gold": 2045.50,
        "BTC/USD": 64500.00,
        "S&P 500": 5100.25,
        "Oil (WTI)": 78.40
    };

    const startPrice = basePrices[instrument] || 100;
    const ohlcv = generateMockOHLCV(100, startPrice);

    const signals = ohlcv
        .filter(bar => bar.value > 1500)
        .map(bar => ({
            time: bar.time,
            type: bar.close > bar.open ? "Accumulation" : "Distribution",
            strength: Math.min(Math.floor((bar.value / 1000) * 10), 100),
            description: `Abnormal ${bar.close > bar.open ? "buy" : "sell"} volume detected.`
        }))
        .slice(-5);

    res.status(200).json({
        status: "success",
        data: {
            instrument,
            timeframe,
            currentPrice: ohlcv[ohlcv.length - 1].close,
            session: "New York", 
            momentum: {
                volumeROC: 124.5,
                zScore: 2.4, 
                obv: 125400,
                status: "Strong Accumulation"
            },
            signals,
            ohlcv
        }
    });
});

exports.getWatchlist = catchAsync(async (req, res) => {
    const mockWatchlist = [
        { id: 1, instrument: "Gold", type: "Commodity", volROC: 145.2, atrPercent: 0.8, vVolRatio: 181.5, alert: true },
        { id: 2, instrument: "EUR/USD", type: "Forex", volROC: 45.1, atrPercent: 0.2, vVolRatio: 45.1, alert: false },
        { id: 3, instrument: "BTC/USD", type: "Crypto", volROC: 88.4, atrPercent: 2.1, vVolRatio: 42.0, alert: false },
        { id: 4, instrument: "S&P 500", type: "Index", volROC: 112.5, atrPercent: 0.5, vVolRatio: 225.0, alert: true },
        { id: 5, instrument: "Oil (WTI)", type: "Commodity", volROC: -25.4, atrPercent: 1.2, vVolRatio: -25.4, alert: false },
    ];

    res.status(200).json({
        status: "success",
        data: {
            watchlist: mockWatchlist.sort((a, b) => b.vVolRatio - a.vVolRatio)
        }
    });
});

exports.getOpenInterest = catchAsync(async (req, res) => {
    const { instrument } = req.query;

    if (instrument === "EUR/USD") {
        return res.status(200).json({ status: "success", data: null });
    }

    res.status(200).json({
        status: "success",
        data: {
            instrument,
            currentOI: 452100,
            change1h: 1.2,
            change24h: -4.5,
            oiVolumeRatio: 1.8,
            signal: "Short Covering",
            description: "Price is rising while Open Interest is declining, indicative of short positions being covered rather than new buyers entering."
        }
    });
});

exports.getCOTData = catchAsync(async (req, res) => {
    const { instrument } = req.query;

    if (instrument === "Bitcoin" || instrument === "EUR/USD") {
        return res.status(200).json({ status: "success", data: null });
    }

    res.status(200).json({
        status: "success",
        data: {
            instrument,
            reportDate: "2026-03-01",
            commercialNet: -125000,
            managedMoneyNet: 85000,
            commercialPercentile: 92, 
            managedMoneyPercentile: 88,
            signal: "Bearish Divergence",
            description: "Commercial hedgers are heavily net short at the 92nd percentile, anticipating a price ceiling."
        }
    });
});

exports.getCorrelationMatrix = catchAsync(async (req, res) => {
    const basePrices = {
        "EUR/USD": 1.0850,
        "Gold": 2045.50,
        "BTC/USD": 64500.00,
        "S&P 500": 5100.25,
        "Oil (WTI)": 78.40
    };

    const historicalDataMap = {};
    for (const [asset, startPrice] of Object.entries(basePrices)) {
        const ohlcvData = generateMockOHLCV(50, startPrice);
        historicalDataMap[asset] = ohlcvData.map(bar => bar.close);
    }

    const matrix = CorrelationAnalyticsService.generateMatrix(historicalDataMap);

    res.status(200).json({
        status: "success",
        data: {
            matrix
        }
    });
});
