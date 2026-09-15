const ApiServiceManager = require('../ApiServiceManager');

class ContractHeatMapService {
    /**
     * Get margin requirements for heat map
     */
    async getMarginData(sector = 'All') {
        const marginData = [
            { symbol: 'ES', name: 'E-mini S&P', margin: '$12,650', status: 'high', icon: 'BarChart3' },
            { symbol: 'NQ', name: 'E-mini Nasdaq', margin: '$17,600', status: 'high', icon: 'Activity' },
            { symbol: 'GC', name: 'Gold', margin: '$9,900', status: 'medium', icon: 'Zap' },
            { symbol: 'CL', name: 'Crude Oil', margin: '$7,700', status: 'high', icon: 'Database' },
            { symbol: '6E', name: 'Euro FX', margin: '$2,530', status: 'low', icon: 'Globe' },
            { symbol: 'SI', name: 'Silver', margin: '$14,300', status: 'medium', icon: 'Search' },
            { symbol: 'NG', name: 'Natural Gas', margin: '$5,500', status: 'high', icon: 'Zap' },
            { symbol: '6J', name: 'Japanese Yen', margin: '$3,300', status: 'low', icon: 'LayoutGrid' },
            { symbol: 'YM', name: 'E-mini Dow', margin: '$9,350', status: 'medium', icon: 'BarChart' },
            { symbol: 'HG', name: 'Copper', margin: '$6,050', status: 'medium', icon: 'Filter' }
        ];

        return marginData;
    }

    /**
     * Get liquidity data across sectors
     */
    async getLiquidityData() {
        return [
            { name: "Currencies", liquidity: 85, vol: 12, bias: "Bullish", assets: ["6E", "6B", "6J", "6A", "6C"] },
            { name: "Indices", liquidity: 92, vol: 18, bias: "Neutral", assets: ["ES", "NQ", "YM", "RTY"] },
            { name: "Metals", liquidity: 78, vol: 15, bias: "Bullish", assets: ["GC", "SI", "HG"] },
            { name: "Energies", liquidity: 74, vol: 24, bias: "Bearish", assets: ["CL", "NG", "RB"] },
            { name: "Financials", liquidity: 65, vol: 8, bias: "Neutral", assets: ["ZN", "ZB", "ZF"] },
        ];
    }

    /**
     * Get detailed contract comparison
     */
    async getComparisonData() {
        return [
            { contract: 'ES - E-mini S&P 500', initial: '$12,650', maintenance: '$11,500', tick: '$12.50', value: '~$240,000', leverage: '19:1' },
            { contract: 'NQ - E-mini Nasdaq', initial: '$17,600', maintenance: '$16,000', tick: '$5.00', value: '~$360,000', leverage: '20:1' },
            { contract: 'GC - Gold', initial: '$9,900', maintenance: '$9,000', tick: '$10.00', value: '~$200,000', leverage: '20:1' },
            { contract: 'CL - Crude Oil', initial: '$7,700', maintenance: '$7,000', tick: '$10.00', value: '~$75,000', leverage: '10:1' }
        ];
    }

    /**
     * Get volatility correlation stats
     */
    async getVolatilityCorrelation() {
        return [
            { name: "Risk-Off", val: "High", status: "Active" },
            { name: "VIX Pulse", val: "18.4", status: "Low" },
            { name: "USD Demand", val: "+0.4%", status: "Stable" },
            { name: "Treasury Y.", val: "4.2%", status: "Rising" }
        ];
    }
}

module.exports = new ContractHeatMapService();
