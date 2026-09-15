import api from "../api";

export interface COTReport {
    _id: string;
    asset: string;
    reportDate: string;
    nonCommercialLong: number;
    nonCommercialShort: number;
    nonCommercialNet: number;
    commercialLong: number;
    commercialShort: number;
    commercialNet: number;
    oi: number;
}

export interface StrengthScore {
    symbol: string;
    score: number;
    sentiment: "bullish" | "bearish" | "neutral";
    lastUpdated: string;
}

export interface MacroData {
    country: string;
    gdp: number;
    inflation: number;
    interestRate: number;
    unemployment: number;
}

export interface StrengthMatrix {
    currencies: string[];
    indicators: { name: string; weight: number }[];
    matrix: {
        indicator: string;
        weight: number;
        values: Record<string, number>;
        rankings: Record<string, number>;
    }[];
    lastUpdated: string;
}

export const resourcesService = {
    // COT Data
    getCotReport: async (asset: string): Promise<COTReport[]> => {
        const res = await api.get(`/api/v1/resource/cot/${asset}`);
        const payload = res.data?.data;
        return Array.isArray(payload) ? payload : [];
    },

    // Currency Strength
    getStrengthScores: async () => {
        const res = await api.get('/api/v1/resource/strength');
        return res.data.data as StrengthScore[];
    },

    // Strength Matrix (Pro Dashboard)
    getStrengthMatrix: async () => {
        const res = await api.get('/api/v1/resource/strength/matrix');
        return res.data.data as StrengthMatrix;
    },

    getSystemConfig: async () => {
        const res = await api.get('/api/v1/admin/api-manager');
        return res.data.data;
    },

    // Macro Data
    getMacroData: async (country: string) => {
        const res = await api.get(`/api/v1/resource/macro/${country}`);
        return res.data.data as MacroData;
    },

    // Seasonality
    getSeasonality: async (symbol: string) => {
        const res = await api.get(`/api/v1/resource/seasonality/${symbol}`);
        return res.data.data;
    },

    // Heatmap
    getHeatmap: async () => {
        const res = await api.get('/api/v1/resource/heatmap');
        return res.data.data;
    },

    // Seasonality Planner
    getSeasonalityPlanner: async (year: number, month: number) => {
        const res = await api.get(`/api/v1/resource/seasonality/planner/${year}/${month}`);
        return res.data?.data;
    },

    // ProView Seasonality
    getProViewSeasonality: async (symbol: string) => {
        const res = await api.get(`/api/v1/resource/seasonality/proview/${symbol}`);
        return res.data?.data;
    },

    // Contract Calendar
    getContractCalendar: async (year: number, month: number) => {
        const res = await api.get(`/api/v1/resource/contracts/calendar/${year}/${month}`);
        return res.data?.data;
    },

    getContractStats: async () => {
        const res = await api.get('/api/v1/resource/contracts/stats');
        return res.data?.data;
    },

    async getHeatMapData(type: string) {
        const res = await api.get(`/api/v1/resource/contracts/heatmap/${type}`);
        return res.data?.data;
    },

    async getPlannerWatchlist() {
        const res = await api.get('/api/v1/resource/contracts/planner/watchlist');
        return res.data?.data;
    },

    async getContractSpecs() {
        const res = await api.get('/api/v1/resource/contracts/planner/specs');
        return res.data?.data;
    }
};
