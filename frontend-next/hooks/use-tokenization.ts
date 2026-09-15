import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenizationService } from "@/lib/api/tokenization";

export function useTokenPools() {
    return useQuery({
        queryKey: ["token-pools"],
        queryFn: () => tokenizationService.getActivePools(),
    });
}

export function useUserPoolTokens() {
    return useQuery({
        queryKey: ["user-tokens"],
        queryFn: () => tokenizationService.getMyInvestments(),
    });
}

export function useTokenPool(id: string) {
    return useQuery({
        queryKey: ["token-pool", id],
        queryFn: () => tokenizationService.getPoolById(id),
        enabled: !!id,
    });
}

export function useInvestInPool() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { poolId: string; amount: number }) =>
            tokenizationService.invest(data.poolId, data.amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-tokens"] });
            queryClient.invalidateQueries({ queryKey: ["token-pools"] });
        },
    });
}
