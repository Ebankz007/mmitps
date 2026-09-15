import { useQuery, useMutation } from "@tanstack/react-query";
import { geometryApi } from "@/lib/api/geometry";

export function useGeometryScan(symbol: string, timeframe: string, patterns: string[]) {
    return useQuery({
        queryKey: ["geometryScan", symbol, timeframe, patterns],
        queryFn: () => geometryApi.scan(symbol, timeframe, patterns),
        enabled: !!symbol && !!timeframe,
    });
}

export function useConfluenceScore(symbol: string) {
    return useQuery({
        queryKey: ["confluenceScore", symbol],
        queryFn: () => geometryApi.getConfluence(symbol),
        enabled: !!symbol,
    });
}
