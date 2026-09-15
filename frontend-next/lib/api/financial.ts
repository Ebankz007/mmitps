import api from "../api";

export interface WalletBalance {
    totalUSD: number;
    availableUSD: number;
    pendingUSD: number;
    lockedUSD?: number;
    lockedWalletBalance?: number;
    cryptoBalances: {
        symbol: string;
        amount: number;
        frozen?: number;
        usdValue?: number;
    }[];
}

export interface Transaction {
    _id: string;
    type: "deposit" | "withdrawal" | "transfer" | "subscription" | "earning";
    category: string;
    amount: number;
    currency: string;
    status: "completed" | "pending" | "failed";
    description: string;
    createdAt: string;
}

export interface PayoutRequest {
    _id: string;
    amount: number;
    method: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    details: Record<string, unknown>;
    createdAt: string;
}

export const financialService = {
    getWalletBalance: async () => {
        const res = await api.get("/api/v1/financial/wallet/balance");
        const rawBalances = res.data?.data;

        if (!Array.isArray(rawBalances)) {
            console.warn("[API] Wallet balance data is not an array:", rawBalances);
            return {
                totalUSD: 0,
                availableUSD: 0,
                pendingUSD: 0,
                cryptoBalances: []
            } as WalletBalance;
        }

        // Transform into WalletBalance structure
        const usdBalance = rawBalances.find((b: any) => b.currency === 'USD') || { amount: 0, frozen: 0 };
        const cryptoBalances = rawBalances
            .filter((b: any) => b.currency !== 'USD')
            .map((b: any) => ({
                symbol: b.currency,
                amount: b.amount,
                frozen: b.frozen,
                // Mock USD value calculation for now (USD/USDT 1:1, others mock)
                usdValue: b.currency === 'USDT' ? b.amount : (b.currency === 'BTC' ? b.amount * 45000 : b.currency === 'ETH' ? b.amount * 2500 : 0)
            }));

        const totalUSD = (usdBalance.amount || 0) + cryptoBalances.reduce((acc, b) => acc + (b.usdValue || 0), 0);

        return {
            totalUSD,
            availableUSD: usdBalance.amount || 0,
            pendingUSD: usdBalance.frozen || 0,
            cryptoBalances
        } as WalletBalance;
    },

    deposit: async (data: { amount: number; method: string; currency: string }) => {
        const res = await api.post("/api/v1/financial/wallet/deposit", data);
        return res.data;
    },

    withdraw: async (data: { amount: number; method: string; details: Record<string, unknown> }) => {
        const res = await api.post("/api/v1/financial/wallet/withdraw", data);
        return res.data;
    },

    transfer: async (data: { amount: number; recipientId?: string; type: "internal" | "user" | "exchange"; targetCurrency?: string }) => {
        const res = await api.post("/api/v1/financial/wallet/transfer", data);
        return res.data;
    },

    // Payouts
    requestPayout: async (data: { amount: number; method: string; details: Record<string, unknown> }) => {
        const res = await api.post("/api/v1/financial/payouts/request", data);
        return res.data.data as PayoutRequest;
    },

    getMyPayouts: async () => {
        const res = await api.get("/api/v1/financial/payouts/my");
        return res.data.data as PayoutRequest[];
    },

    cancelPayout: async (id: string) => {
        const res = await api.post(`/api/v1/financial/payouts/${id}/cancel`);
        return res.data;
    },

    // Transactions
    getTransactions: async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
        const res = await api.get("/api/v1/financial/transactions", { params });
        return res.data; // { data: Transaction[], pagination: Meta }
    },

    getTransaction: async (id: string) => {
        const res = await api.get(`/api/v1/financial/transactions/${id}`);
        return res.data.data as Transaction;
    },

    // Coupons
    getActiveCoupons: async () => {
        const res = await api.get("/api/v1/financial/coupons/active");
        return res.data.data;
    },

    validateCoupon: async (code: string) => {
        const res = await api.post("/api/v1/financial/coupons/validate", { code });
        return res.data;
    },

    redeemCoupon: async (code: string) => {
        const res = await api.post("/api/v1/financial/coupons/redeem", { code });
        return res.data;
    },

    adminGetCoupons: async () => {
        const res = await api.get("/api/v1/admin/financial/coupons");
        return res.data.data;
    },

    adminCreateCoupon: async (data: {
        code: string;
        type: "percentage" | "fixed_amount";
        value: number;
        minPurchase?: number;
        maxDiscount?: number;
        expiresAt: string;
        usageLimit?: number;
    }) => {
        const res = await api.post("/api/v1/admin/financial/coupons", data);
        return res.data.data;
    },

    // Admin Tools
    adminGetSupportedCurrencies: async () => {
        const res = await api.get("/api/v1/admin/financial/currencies");
        return res.data.data;
    },

    adminAddSupportedCurrency: async (data: { symbol: string, name: string, type: 'fiat' | 'crypto' | 'credits', isActive: boolean }) => {
        const res = await api.post("/api/v1/admin/financial/currencies", data);
        return res.data.data;
    },

    adminUpdateUserWallet: async (userId: string, data: { currency: string, amount?: number, frozen?: number }) => {
        const res = await api.put(`/api/v1/admin/financial/users/${userId}/wallet`, data);
        return res.data.data;
    }
};
