import api from '@/lib/api';

export interface OHLCV {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    value: number; // Volume
    color: string;
}

export interface Signal {
    time: number;
    type: "Accumulation" | "Distribution";
    strength: number;
    description: string;
}

export interface MarketDataResponse {
    instrument: string;
    timeframe: string;
    currentPrice: number;
    session: string;
    momentum: {
        volumeROC: number;
        zScore: number;
        obv: number;
        status: string;
    };
    signals?: Signal[];
    ohlcv: OHLCV[];
}

export interface WatchlistItem {
    id: number;
    instrument: string;
    type: string;
    volROC: number;
    atrPercent: number;
    vVolRatio: number;
    alert: boolean;
}

export interface OpenInterestData {
    instrument: string;
    currentOI: number;
    change1h: number;
    change24h: number;
    oiVolumeRatio: number;
    signal: string;
    description: string;
}

export interface COTData {
    instrument: string;
    reportDate: string;
    commercialNet: number;
    managedMoneyNet: number;
    commercialPercentile: number;
    managedMoneyPercentile: number;
    signal: string;
    description: string;
}

export interface CorrelationData {
    matrix: Record<string, number | string>[]; // Array of dynamic objects for heatmap
}

export const vmidAPI = {
    getMarketData: async (instrument: string, timeframe: string): Promise<MarketDataResponse> => {
        const response = await api.get(`/api/v1/vmid/market-data`, { params: { instrument, timeframe } });
        return response.data.data;
    },

    getWatchlist: async (): Promise<{ watchlist: WatchlistItem[] }> => {
        const response = await api.get(`/api/v1/vmid/watchlist`);
        return response.data.data;
    },

    getOpenInterest: async (instrument: string): Promise<OpenInterestData | null> => {
        const response = await api.get(`/api/v1/vmid/open-interest`, { params: { instrument } });
        return response.data.data;
    },

    getCOTData: async (instrument: string): Promise<COTData | null> => {
        const response = await api.get(`/api/v1/vmid/cot`, { params: { instrument } });
        return response.data.data;
    },

    getCorrelationMatrix: async (): Promise<CorrelationData> => {
        const response = await api.get(`/api/v1/vmid/correlation`);
        return response.data.data;
    }
};
