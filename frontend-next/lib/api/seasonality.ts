import axios from "axios";

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://python.mmitps.com/api/seasonality";

export interface MonthlyDataPoint {
    month: string;
    average: number;
    min: number;
    max: number;
    consistency: number;
}

export interface SeasonalPattern {
    start_month: string;
    end_month: string;
    type: string;
    consistency: number;
    avg_return: number;
    years_positive: number;
    total_years: number;
    ai_predicted?: boolean;
}

export interface SeasonalResponse {
    market: string;
    timeframe: string;
    monthly_data: MonthlyDataPoint[];
    yearly_data: { key: string; values: number[] }[];
    patterns: SeasonalPattern[];
    optimum_patterns: unknown[];
}

export interface MarketHealth {
    market: string;
    health_score: number;
    metrics: {
        total_patterns: number;
        strong_patterns: number;
        avg_consistency: number;
        recent_trend: number;
    };
    rating: string;
}

export const seasonalityService = {
    getSeasonalData: async (params: { market: string; timeframe: string; patterns: string[] }) => {
        const response = await axios.post<SeasonalResponse>(`${PYTHON_API_URL}/seasonal-data`, params);
        return response.data;
    },
    getMarkets: async () => {
        const response = await axios.get(`${PYTHON_API_URL}/markets`);
        return response.data;
    },
    getMarketHealth: async (market: string) => {
        const response = await axios.get<MarketHealth>(`${PYTHON_API_URL}/market-health/${market}`);
        return response.data;
    }
};
