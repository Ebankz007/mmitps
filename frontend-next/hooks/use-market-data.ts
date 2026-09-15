import { useQuery } from "@tanstack/react-query";
// This would typically come from a market data provider or custom API
import axios from "axios";

export function useMarketPrices(symbols: string[]) {
    return useQuery({
        queryKey: ["market-prices", symbols],
        queryFn: async () => {
            // Placeholder for actual market data API call
            // In a real app, this might fetch from /api/prices or an external provider
            const response = await axios.get(`/api/prices?symbols=${symbols.join(",")}`);
            return response.data;
        },
        enabled: symbols.length > 0,
        refetchInterval: 10000, // Update every 10 seconds
    });
}

export function useMarketStatus() {
    return useQuery({
        queryKey: ["market-status"],
        queryFn: async () => {
            const response = await axios.get("/api/market-status");
            return response.data;
        },
        refetchInterval: 60000,
    });
}
