import api from "../api";

export interface TokenPool {
    id: string;
    name: string;
    description: string;
    category: string;
    targetAmount: number;
    raisedAmount: number;
    minInvestment: number;
    roi: number;
    riskLevel: "Low" | "Moderate" | "High";
    status: "Active" | "Closed" | "Upcoming";
}

export interface Investment {
    poolId: string;
    poolName: string;
    amount: number;
    tokens: number;
    date: string;
    status: string;
}

export const tokenizationService = {
    getActivePools: async () => {
        const res = await api.get('/api/v1/tokenization/pools');
        return res.data.data as TokenPool[];
    },

    getPoolsByCategory: async (category: string) => {
        const res = await api.get(`/api/v1/tokenization/pools/category/${category}`);
        return res.data.data as TokenPool[];
    },

    getPoolById: async (id: string) => {
        const res = await api.get(`/api/v1/tokenization/pools/${id}`);
        return res.data.data as TokenPool;
    },

    getMyInvestments: async () => {
        const res = await api.get('/api/v1/tokenization/my-investments');
        return res.data.data as Investment[];
    },

    invest: async (poolId: string, amount: number) => {
        const res = await api.post('/api/v1/tokenization/invest', { poolId, amount });
        return res.data;
    }
};
