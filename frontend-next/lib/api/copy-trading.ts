import api from '../api';

export const CopyTradingAPI = {
    // Discovery & Leaderboard (Public / Social Routes)
    getLeaderboard: async () => {
        const response = await api.get('/api/v1/social/leaderboard');
        return response.data;
    },

    getTraderProfile: async (traderId: string) => {
        const response = await api.get(`/api/v1/social/traders/${traderId}`);
        return response.data;
    },

    getTraderPerformance: async (traderId: string) => {
        const response = await api.get(`/api/v1/social/traders/${traderId}/performance`);
        return response.data;
    },

    // Subscription Management (Protected / Social Routes)
    copyTrader: async (traderId: string, payload: {
        allocation: number;
        allocationType: "fixed" | "percentage";
        lotSizeStrategy?: 'SIGNAL' | 'FIXED' | 'MULTIPLIER';
        lotSizeValue?: number;
        minLotSize?: number;
        maxDrawdown?: number;
        stopLoss?: number;
        takeProfit?: number;
    }) => {
        const response = await api.post(`/api/v1/social/copy/${traderId}`, payload);
        return response.data;
    },

    stopCopying: async (traderId: string) => {
        const response = await api.delete(`/api/v1/social/copy/${traderId}`);
        return response.data;
    },

    // Follower Management (Protected / Trading Routes)
    getMySubscriptions: async () => {
        const response = await api.get('/api/v1/trading/copy/my-subscriptions');
        return response.data;
    },

    getProviderFollowers: async () => {
        const response = await api.get('/api/v1/trading/copy/my-followers');
        return response.data;
    },

    settleCommission: async (subscriptionId: string) => {
        const response = await api.post(`/trading/copy/settle/${subscriptionId}`);
        return response.data;
    },

    confirmSettlementReceipt: async (subscriptionId: string) => {
        const response = await api.post(`/trading/copy/confirm-receipt/${subscriptionId}`);
        return response.data;
    },

    syncAccountStats: async (accountId: string) => {
        const response = await api.post(`/trading/accounts/${accountId}/sync`);
        return response.data;
    },
};
