import { useQuery } from "@tanstack/react-query";
import { mlmService } from "@/lib/api/mlm";

export function useMLMStats() {
    return useQuery({
        queryKey: ["mlm-stats"],
        queryFn: () => mlmService.getRankProgress(),
    });
}

export function useBinaryTree() {
    return useQuery({
        queryKey: ["genealogy", "binary"],
        queryFn: () => mlmService.getBinaryTree(),
    });
}

export function useSponsorTree() {
    return useQuery({
        queryKey: ["genealogy", "sponsor"],
        queryFn: () => mlmService.getSponsorTree(),
    });
}

export function useRanks() {
    return useQuery({
        queryKey: ["mlm-ranks"],
        queryFn: () => mlmService.getRanks(),
    });
}
export function useMLMNetworkStats() {
    return useQuery({
        queryKey: ["mlm-network-stats"],
        queryFn: () => mlmService.getLegSettings(),
    });
}
