import api from '../api';

export const AdminTradingAPI = {
    // Providers Management
    getAllProviders: async () => {
        const response = await api.get('/api/v1/admin/trading/providers');
        return response.data;
    },

    toggleVerification: async (providerId: string, verified?: boolean) => {
        const response = await api.patch(`/api/v1/admin/trading/provider/${providerId}/verify`, { verified });
        return response.data;
    },

    updateProviderStatus: async (providerId: string, status: 'active' | 'inactive' | 'suspended') => {
        const response = await api.patch(`/api/v1/admin/trading/provider/${providerId}/status`, { status });
        return response.data;
    },

    // Subscriptions Management
    getAllSubscriptions: async () => {
        const response = await api.get('/api/v1/admin/trading/subscriptions');
        return response.data;
    },

    // User-specific Trading Management
    getProviderByUserId: async (userId: string) => {
        const response = await api.get(`/api/v1/admin/trading/provider/user/${userId}`);
        return response.data;
    },

    toggleProviderStatus: async (userId: string, isProvider: boolean) => {
        const response = await api.patch(`/api/v1/admin/trading/user/${userId}/provider-toggle`, { isProvider });
        return response.data;
    },

    getAccountsByUserId: async (userId: string) => {
        const response = await api.get(`/api/v1/admin/trading/user/${userId}/accounts`);
        return response.data;
    },

    // C-Book Management
    createCBookSubscription: async (providerId: string, accountId: string, settings: any = {}) => {
        const response = await api.post('/api/v1/admin/trading/c-book/follow', { providerId, accountId, ...settings });
        return response.data;
    },

    addTradingAccount: async (accountData: any) => {
        const response = await api.post('/api/v1/admin/trading/accounts', accountData);
        return response.data;
    },

    getAdminAccounts: async () => {
        const response = await api.get('/api/v1/admin/trading/accounts');
        return response.data;
    }
};
