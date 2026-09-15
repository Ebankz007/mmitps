import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://python.mmitps.com/api";

export interface GeometryScanResponse {
    symbol: string;
    timeframe: string;
    patterns: unknown[];
}

export interface ConfluenceFactor {
    name: string;
    contribution: number;
}

export interface ConfluenceResponse {
    symbol: string;
    score: number;
    factors: ConfluenceFactor[];
}

export const geometryApi = {
    scan: async (symbol: string, timeframe: string, patterns: string[]): Promise<GeometryScanResponse> => {
        const response = await axios.post(`${API_BASE_URL}/geometry/scan`, { symbol, timeframe, patterns });
        return response.data;
    },
    getConfluence: async (symbol: string): Promise<ConfluenceResponse> => {
        const response = await axios.get(`${API_BASE_URL}/geometry/confluence/${symbol}`);
        return response.data;
    },
};
