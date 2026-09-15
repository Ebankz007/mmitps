import api from "../api";

export interface TradeEntry {
    id: string;
    symbol: string;
    type: "Buy" | "Sell";
    entryPrice: number;
    exitPrice: number;
    lotSize: number;
    pnl: number;
    notes: string;
    date: string;
    tags: string[];
}

export interface JournalStats {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    netProfit: number;
    averageWinner: number;
    averageLoser: number;
}

export const journalService = {
    getMyJournal: async () => {
        const res = await api.get('/api/v1/journal/my');
        return res.data.data as TradeEntry[];
    },

    getJournalStats: async () => {
        const res = await api.get('/api/v1/journal/stats');
        return res.data.data as JournalStats;
    },

    addTrade: async (trade: Omit<TradeEntry, "id" | "date">) => {
        const res = await api.post('/api/v1/journal/add', trade);
        return res.data;
    },

    updateTrade: async (id: string, trade: Partial<TradeEntry>) => {
        const res = await api.put(`/api/v1/journal/${id}`, trade);
        return res.data;
    }
};
