import { useQuery } from '@tanstack/react-query';
import { vmidAPI } from '@/lib/api/vmid';

export const VMID_QUERY_KEYS = {
    marketData: (instrument: string, timeframe: string) => ['vmid', 'marketData', instrument, timeframe],
    watchlist: ['vmid', 'watchlist'],
    openInterest: (instrument: string) => ['vmid', 'oi', instrument],
    cotData: (instrument: string) => ['vmid', 'cot', instrument],
    correlation: ['vmid', 'correlation'],
};

// 1. Fetch Market Data & Main Chart
export const useVMIDMarketData = (instrument: string, timeframe: string) => {
    return useQuery({
        queryKey: VMID_QUERY_KEYS.marketData(instrument, timeframe),
        queryFn: () => vmidAPI.getMarketData(instrument, timeframe),
        refetchInterval: 60000, // Refetch every 1 minute
        staleTime: 30000,
    });
};

// 2. Fetch Watchlist
export const useVMIDWatchlist = () => {
    return useQuery({
        queryKey: VMID_QUERY_KEYS.watchlist,
        queryFn: () => vmidAPI.getWatchlist(),
        refetchInterval: 120000, // Every 2 mins
    });
};

// 3. Fetch Open Interest (Conditional per instrument)
export const useVMIDOpenInterest = (instrument: string) => {
    return useQuery({
        queryKey: VMID_QUERY_KEYS.openInterest(instrument),
        queryFn: () => vmidAPI.getOpenInterest(instrument),
        refetchInterval: 300000, // Every 5 mins
    });
};

// 4. Fetch COT Data (Conditional per instrument)
export const useVMIDCOTData = (instrument: string) => {
    return useQuery({
        queryKey: VMID_QUERY_KEYS.cotData(instrument),
        queryFn: () => vmidAPI.getCOTData(instrument),
        staleTime: Infinity, // COT data updates weekly, doesn't need rapid refetch
    });
};

// 5. Fetch Correlation Matrix
export const useVMIDCorrelation = () => {
    return useQuery({
        queryKey: VMID_QUERY_KEYS.correlation,
        queryFn: () => vmidAPI.getCorrelationMatrix(),
        staleTime: 3600000, // 1 hour
    });
};
