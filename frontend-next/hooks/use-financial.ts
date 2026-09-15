import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialService } from "@/lib/api/financial";

export function useWallet() {
    return useQuery({
        queryKey: ["wallet"],
        queryFn: () => financialService.getWalletBalance(),
    });
}

export function useTransactions() {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: () => financialService.getTransactions(),
    });
}

export function useWithdrawal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { amount: number; method: string; details: any }) =>
            financialService.withdraw(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}

export function useDeposit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { amount: number; method: string; currency: string }) =>
            financialService.deposit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}
