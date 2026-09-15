import { useQuery } from "@tanstack/react-query";
import { volumeApi } from "@/lib/api/volume";

export function useVolumeMomentum(symbol: string, timeframe: string) {
    return useQuery({
        queryKey: ["volumeMomentum", symbol, timeframe],
        queryFn: () => volumeApi.getMomentum(symbol, timeframe),
        enabled: !!symbol && !!timeframe,
    });
}

export function useOpenInterest(symbol: string) {
    return useQuery({
        queryKey: ["openInterest", symbol],
        queryFn: () => volumeApi.getOpenInterest(symbol),
        enabled: !!symbol,
    });
}

export function useVolumeCorrelation() {
    return useQuery({
        queryKey: ["volumeCorrelation"],
        queryFn: () => volumeApi.getCorrelationMatrix(),
    });
}
