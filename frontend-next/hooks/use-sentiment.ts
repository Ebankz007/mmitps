import { useQuery } from "@tanstack/react-query";
import { sentimentService } from "@/lib/api/sentiment";

export function useSentimentBySymbol(symbol: string) {
    return useQuery({
        queryKey: ["sentiment", symbol],
        queryFn: () => sentimentService.getSentimentBySymbol(symbol),
        enabled: !!symbol,
    });
}

export function useMarketSentimentOverview() {
    return useQuery({
        queryKey: ["sentiment-overview"],
        queryFn: () => sentimentService.getMarketOverview(),
    });
}
