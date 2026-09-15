import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesService } from "@/lib/api/resources";
import api from "@/lib/api";

export function useCotReport(asset: string) {
    return useQuery({
        queryKey: ["cot-report", asset],
        queryFn: () => resourcesService.getCotReport(asset),
        enabled: !!asset,
    });
}

export function useStrengthScores() {
    return useQuery({
        queryKey: ["strength-scores"],
        queryFn: () => resourcesService.getStrengthScores(),
    });
}

export function useStrengthMatrix() {
    return useQuery({
        queryKey: ["strength-matrix"],
        queryFn: () => resourcesService.getStrengthMatrix(),
    });
}

export function useSystemConfig() {
    return useQuery({
        queryKey: ["system-config"],
        queryFn: () => resourcesService.getSystemConfig(),
    });
}

export function useMacroData(country: string) {
    return useQuery({
        queryKey: ["macro-data", country],
        queryFn: () => resourcesService.getMacroData(country),
        enabled: !!country,
    });
}

export function useSeasonality(symbol: string) {
    return useQuery({
        queryKey: ["seasonality", symbol],
        queryFn: () => resourcesService.getSeasonality(symbol),
        enabled: !!symbol,
    });
}

export function useHeatmap() {
    return useQuery({
        queryKey: ["heatmap"],
        queryFn: () => resourcesService.getHeatmap(),
    });
}

// Fundamental Alerts CRUD
export function useFundamentalAlerts() {
    return useQuery({
        queryKey: ["fundamental-alerts"],
        queryFn: async () => {
            const res = await api.get('/api/v1/alerts');
            return res.data?.data?.alerts || [];
        },
    });
}

export function useCreateAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { instrument: string; metric: string; operator: string; threshold: number }) => {
            const res = await api.post('/api/v1/alerts', payload);
            return res.data?.data?.alert;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fundamental-alerts"] }),
    });
}

export function useToggleAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const res = await api.patch(`/api/v1/alerts/${id}/toggle`);
            return res.data?.data?.alert;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fundamental-alerts"] }),
    });
}

export function useDeleteAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/alerts/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fundamental-alerts"] }),
    });
}

// ─── COT Global Data ─────────────────────────────────────────────────────────
export function useCOTGlobalMatrix() {
    return useQuery({
        queryKey: ["cot-global-matrix"],
        queryFn: async () => {
            const res = await api.get("/api/v1/macro/cot/global-matrix");
            return res.data?.data || res.data;
        },
    });
}

export function useCOTHistoricalIndex() {
    return useQuery({
        queryKey: ["cot-historical-index"],
        queryFn: async () => {
            const res = await api.get("/api/v1/macro/cot/historical-index");
            return res.data?.data || res.data;
        },
    });
}

// ─── Seasonality Planner ───────────────────────────────────────────────────
export function useSeasonalityPlanner(year: number, month: number) {
    return useQuery({
        queryKey: ["seasonality-planner", year, month],
        queryFn: () => resourcesService.getSeasonalityPlanner(year, month),
        enabled: !!year && !!month,
    });
}

// ─── ProView Seasonality ─────────────────────────────────────────────────────
export function useProViewSeasonality(symbol: string) {
    return useQuery({
        queryKey: ["proview-seasonality", symbol],
        queryFn: () => resourcesService.getProViewSeasonality(symbol),
        enabled: !!symbol,
    });
}

// ─── Contract Calendar ───────────────────────────────────────────────────────
export function useContractCalendar(year: number, month: number) {
    return useQuery({
        queryKey: ["contract-calendar", year, month],
        queryFn: () => resourcesService.getContractCalendar(year, month),
        enabled: !!year && !!month,
    });
}

export const useContractStats = () => {
    return useQuery({
        queryKey: ["contract-stats"],
        queryFn: () => resourcesService.getContractStats(),
    });
};

export const useContractHeatMap = (type: string) => {
    return useQuery({
        queryKey: ['contract-heatmap', type],
        queryFn: () => resourcesService.getHeatMapData(type),
    });
};

export const usePlannerWatchlist = () => {
    return useQuery({
        queryKey: ['planner-watchlist'],
        queryFn: () => resourcesService.getPlannerWatchlist(),
    });
};

export const useContractSpecs = () => {
    return useQuery({
        queryKey: ['contract-specs'],
        queryFn: () => resourcesService.getContractSpecs(),
    });
};
