import api from "../api";

export interface SentimentData {
    symbol: string;
    score: number; // -1 to 1
    bullish: number; // 0-100%
    bearish: number; // 0-100%
    neutral: number; // 0-100%
    source: string;
    lastUpdated: string;
}

export interface MarketOverview {
    globalScore: number;
    sectors: Record<string, number>;
    topBullish: string[];
    topBearish: string[];
}

export const sentimentService = {
    getSentimentBySymbol: async (symbol: string) => {
        const res = await api.get(`/api/v1/sentiment/${symbol}`);
        return res.data.data as SentimentData;
    },

    getMarketOverview: async (): Promise<MarketOverview> => {
        const res = await api.get('/api/v1/sentiment/overview/market');
        const d = res.data?.data;
        return {
            globalScore: typeof d?.globalScore === 'number' ? d.globalScore : 0,
            sectors: (d?.sectors && typeof d.sectors === 'object') ? d.sectors : {},
            topBullish: Array.isArray(d?.topBullish) ? d.topBullish : [],
            topBearish: Array.isArray(d?.topBearish) ? d.topBearish : [],
        };
    }
};
