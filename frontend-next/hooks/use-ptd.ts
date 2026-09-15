import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ptdApi } from "@/lib/api/ptd";

export function usePTDScan(symbol: string, timeframe: string, logics: string[], rule = "AND", tolerance = 5) {
    return useQuery({
        queryKey: ["ptd-scan", symbol, timeframe, logics, rule, tolerance],
        queryFn: () => ptdApi.scan(symbol, timeframe, logics, rule, tolerance),
        enabled: !!symbol,
        refetchInterval: 60000,
    });
}

export function usePTDSignalHistory(page = 1) {
    return useQuery({
        queryKey: ["ptd-signal-history", page],
        queryFn: () => ptdApi.getSignalHistory(page),
    });
}

export function usePTDAccuracy(combinationId?: string) {
    return useQuery({
        queryKey: ["ptd-accuracy", combinationId],
        queryFn: () => ptdApi.getAccuracy(combinationId),
    });
}

export function usePTDModuleAccuracy(moduleId: string) {
    return useQuery({
        queryKey: ["ptd-module-accuracy", moduleId],
        queryFn: () => ptdApi.getModuleAccuracy(moduleId),
        enabled: !!moduleId,
    });
}

export function usePTDBacktest(symbol: string, startDate: string, endDate: string, logics: string[]) {
    return useQuery({
        queryKey: ["ptd-backtest", symbol, startDate, endDate, logics],
        queryFn: () => ptdApi.runBacktest(symbol, startDate, endDate, logics),
        enabled: false,
    });
}

export function usePTDCombinations() {
    return useQuery({
        queryKey: ["ptd-combinations"],
        queryFn: () => ptdApi.getCombinations(),
    });
}

export function useSaveCombination() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ptdApi.saveCombination,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ptd-combinations"] }),
    });
}

export function usePTDAlerts() {
    return useQuery({
        queryKey: ["ptd-alerts"],
        queryFn: () => ptdApi.getAlerts(),
    });
}

export function useCreateAlert() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ptdApi.createAlert,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ptd-alerts"] }),
    });
}

export function useDeleteAlert() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ptdApi.deleteAlert(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ptd-alerts"] }),
    });
}

export function useAlertHistory() {
    return useQuery({
        queryKey: ["ptd-alert-history"],
        queryFn: () => ptdApi.getAlertHistory(),
    });
}

export function useBrokerAccount() {
    return useQuery({
        queryKey: ["ptd-broker-account"],
        queryFn: () => ptdApi.getBrokerAccount(),
        retry: false,
    });
}

export function useTradeLog() {
    return useQuery({
        queryKey: ["ptd-trade-log"],
        queryFn: () => ptdApi.getTradeLog(),
    });
}

export function useExecuteTrade() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ptdApi.executeTrade,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ptd-trade-log"] }),
    });
}

export function useConnectBroker() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ apiKey, secretKey, type }: { apiKey: string; secretKey: string; type: "paper" | "live" }) =>
            ptdApi.connectBroker(apiKey, secretKey, type),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["ptd-broker-account"] }),
    });
}
