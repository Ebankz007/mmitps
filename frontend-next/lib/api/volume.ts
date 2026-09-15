import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://python.mmitps.com/api";

export interface VolumeMomentum {
    roc: number;
    z_score: number;
    obv: number;
    status: 'accumulation' | 'distribution' | 'normal';
}

export interface OpenInterestData {
    symbol: string;
    current_oi: number;
    change_24h: number;
    signal: string;
    description: string;
}

export interface CorrelationMatrix {
    matrix: Record<string, Record<string, number>>;
}

export const volumeApi = {
    getMomentum: async (symbol: string, timeframe: string): Promise<VolumeMomentum> => {
        const response = await axios.post(`${API_BASE_URL}/volume/momentum`, { symbol, timeframe });
        return response.data.momentum;
    },
    getOpenInterest: async (symbol: string): Promise<OpenInterestData> => {
        const response = await axios.get(`${API_BASE_URL}/volume/open-interest/${symbol}`);
        return response.data;
    },
    getCorrelationMatrix: async (): Promise<CorrelationMatrix> => {
        const response = await axios.get(`${API_BASE_URL}/volume/correlation-matrix`);
        return response.data;
    },
};
