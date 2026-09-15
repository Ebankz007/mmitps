import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seasonalityService } from "@/lib/api/seasonality";

export const useSeasonality = () => {
    const queryClient = useQueryClient();

    const useMarkets = () => {
        return useQuery({
            queryKey: ["seasonality", "markets"],
            queryFn: () => seasonalityService.getMarkets(),
        });
    };

    const useSeasonalData = (params: { market: string; timeframe: string; patterns: string[] }) => {
        return useQuery({
            queryKey: ["seasonality", "data", params],
            queryFn: () => seasonalityService.getSeasonalData(params),
            enabled: !!params.market,
        });
    };

    const useMarketHealth = (market: string) => {
        return useQuery({
            queryKey: ["seasonality", "health", market],
            queryFn: () => seasonalityService.getMarketHealth(market),
            enabled: !!market,
        });
    };

    return {
        useMarkets,
        useSeasonalData,
        useMarketHealth,
    };
};
