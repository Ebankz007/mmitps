class LiveStreamService {
    async getActiveStreams() {
        return [
            {
                id: 'stream_1',
                title: 'Forex Day Trading Live - EUR/USD & Gold',
                host: 'AlphaTrades',
                status: 'live',
                viewers: 1242,
                desc: 'Live forex trading session focusing on EUR/USD and XAU/USD. Real-time analysis and trade executions with institutional order flow.'
            },
            {
                id: 'stream_2',
                title: 'Crypto Swing Trading - BTC & Altcoins',
                host: 'CryptoOracle',
                status: 'live',
                viewers: 878,
                desc: 'Bitcoin and altcoin analysis with live charting and community discussion. Swing trade setups using multi-timeframe analysis.'
            },
            {
                id: 'stream_3',
                title: 'S&P 500 Futures Live Analysis',
                host: 'MarketStructure',
                status: 'live',
                viewers: 543,
                desc: 'Live analysis of S&P 500 futures with technical breakdowns and key level monitoring. Order flow and market structure focus.'
            },
            {
                id: 'stream_4',
                title: 'Options Trading Live - Earnings Plays',
                host: 'OptionsFlow',
                status: 'offline',
                viewers: 0,
                desc: 'Weekly options strategies with earnings report analysis and trade adjustments. Focus on premium selling strategies.'
            },
            {
                id: 'stream_5',
                title: 'London Session Forex Trading',
                host: 'LondonTrader',
                status: 'live',
                viewers: 321,
                desc: 'Live London open trading session with GBP pairs focus and order flow analysis. COT data-driven setups.'
            },
            {
                id: 'stream_6',
                title: 'Weekly Market Wrap & Planning',
                host: 'MarketMentor',
                status: 'live',
                viewers: 654,
                desc: 'Weekly market review and planning for the upcoming trading week. Fundamental and technical outlook across major pairs.'
            }
        ];
    }
}

module.exports = new LiveStreamService();
