import api from '../api';

export const TradingAccountAPI = {
    connectAccount: async (data: unknown) => {
        const response = await api.post('/api/v1/trading/accounts', data);
        return response.data;
    },

    getMyAccounts: async () => {
        const response = await api.get('/api/v1/trading/accounts');
        return response.data;
    },

    disconnectAccount: async (accountId: string) => {
        const response = await api.delete(`/api/v1/trading/accounts/${accountId}`);
        return response.data;
    }
};
