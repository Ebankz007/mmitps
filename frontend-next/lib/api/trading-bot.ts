import api from "../api";

export interface TradingBot {
    id: string;
    name: string;
    strategy: string;
    status: "active" | "paused" | "stopped";
    pairs: string[];
    profit: number;
    tradesCount: number;
    lastActive: string;
}

export const tradingBotService = {
    getMyBots: async () => {
        const res = await api.get('/api/v1/trading/bots');
        return res.data.data as TradingBot[];
    },

    createBot: async (bot: Partial<TradingBot>) => {
        const res = await api.post('/api/v1/trading/bots', bot);
        return res.data;
    },

    updateBotStatus: async (id: string, status: TradingBot["status"]) => {
        const res = await api.patch(`/api/v1/trading/bots/${id}/status`, { status });
        return res.data;
    }
};
