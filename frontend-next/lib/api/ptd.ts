import api from "../api";

const BASE = "/api/v1/ptd";

// ── Types ────────────────────────────────────────────────────────────────────
export interface PTDProjection {
    id: string;
    time: string;
    type: string;
    confidence: number;
    direction: "UP" | "DOWN" | "TRANSITION";
    source: string;
    status: "pending" | "hit" | "miss";
    asset?: string;
    timeframe?: string;
}

export interface PTDAccuracy {
    overall: number;
    modules: Record<string, { accuracy: number; last50: number; last100: number; allTime: number }>;
    total_evaluated: number;
    hit_rate_history: { date: string; accuracy: number }[];
}

export interface PTDBacktestResult {
    initial_balance: number;
    final_balance: number;
    total_trades: number;
    win_rate: number;
    trades: PTDTrade[];
    equity_curve: { time: string; balance: number }[];
    confidence_brackets: { range: string; label: string; total: number; wins: number; winRate: number }[];
}

export interface PTDCombination {
    id: string;
    name: string;
    modules: string[];
    rule: "AND" | "OR" | "Weighted";
    tolerance: number;
    weights: Record<string, number>;
}

export interface PTDAlert {
    id: string;
    module: string;
    minConfidence: number;
    channels: string[];
    active: boolean;
    created: string;
}

export interface PTDTrade {
    id: string;
    symbol: string;
    direction: string;
    qty: number;
    orderType: string;
    status: string;
    filledPrice?: number;
    pnl?: number;
    filledAt: string;
    confidence?: number;
    source?: string;
    auto?: boolean;
}

export interface BrokerAccount {
    id: string;
    type: "paper" | "live";
    equity: number;
    buyingPower: number;
    cash: number;
}

export interface OHLCV {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// ── API ───────────────────────────────────────────────────────────────────────
export const ptdApi = {
    // Signals
    scan: async (symbol: string, timeframe: string, logics: string[], rule = "AND", tolerance = 5): Promise<{ signals: PTDProjection[]; ohlcv: OHLCV[] }> => {
        const res = await api.post(`${BASE}/scan`, { symbol, timeframe, logics, rule, tolerance });
        return {
            signals: res.data.data ?? [],
            ohlcv: res.data.ohlcv ?? []
        };
    },

    getSignalHistory: async (page = 1, limit = 20): Promise<{ data: PTDProjection[]; total: number }> => {
        const res = await api.get(`${BASE}/signals`, { params: { page, limit } });
        return res.data;
    },

    // Combinations
    getCombinations: async (): Promise<PTDCombination[]> => {
        const res = await api.get(`${BASE}/combinations`);
        return res.data.data ?? [];
    },

    saveCombination: async (combination: Partial<PTDCombination>): Promise<PTDCombination> => {
        const res = await api.post(`${BASE}/combinations`, combination);
        return res.data.data;
    },

    // Accuracy
    getAccuracy: async (combinationId?: string): Promise<PTDAccuracy> => {
        const res = await api.get(`${BASE}/accuracy`, { params: { combination_id: combinationId } });
        return res.data.data;
    },

    getModuleAccuracy: async (moduleId: string) => {
        const res = await api.get(`${BASE}/accuracy/module/${moduleId}`);
        return res.data.data;
    },

    // Backtest
    runBacktest: async (symbol: string, startDate: string, endDate: string, logics: string[]): Promise<{ result: PTDBacktestResult; ohlcv: OHLCV[] }> => {
        const res = await api.post(`${BASE}/backtest`, { symbol, start_date: startDate, end_date: endDate, logics });
        return {
            result: res.data.data,
            ohlcv: res.data.ohlcv ?? []
        };
    },

    // Alerts
    getAlerts: async (): Promise<PTDAlert[]> => {
        const res = await api.get(`${BASE}/alerts`);
        return res.data.data ?? [];
    },
    createAlert: async (alert: Partial<PTDAlert>): Promise<PTDAlert> => {
        const res = await api.post(`${BASE}/alerts`, alert);
        return res.data.data;
    },
    deleteAlert: async (id: string) => api.delete(`${BASE}/alerts/${id}`),
    getAlertHistory: async () => {
        const res = await api.get(`${BASE}/alerts/history`);
        return res.data.data ?? [];
    },

    // Broker
    connectBroker: async (apiKey: string, secretKey: string, type: "paper" | "live") => {
        const res = await api.post(`${BASE}/broker/connect`, { apiKey, secretKey, type });
        return res.data.data;
    },
    getBrokerAccount: async (): Promise<BrokerAccount> => {
        const res = await api.get(`${BASE}/broker/account`);
        return res.data.data;
    },
    executeTrade: async (params: Record<string, unknown>) => {
        const res = await api.post(`${BASE}/broker/trade`, params);
        return res.data.data;
    },
    getTradeLog: async (): Promise<PTDTrade[]> => {
        const res = await api.get(`${BASE}/broker/trades`);
        return res.data.data ?? [];
    },
};
