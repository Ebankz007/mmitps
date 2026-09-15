"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TradingAccountAPI } from "../lib/api/trading-accounts";
import { tradingBotService, TradingBot } from "../lib/api/trading-bot";
import { journalService, TradeEntry } from "../lib/api/journal";
import { toast } from "sonner";

export function useTrading() {
    const queryClient = useQueryClient();

    // --- Trading Accounts ---
    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ["trading-accounts"],
        queryFn: TradingAccountAPI.getMyAccounts,
    });

    const connectAccount = useMutation({
        mutationFn: TradingAccountAPI.connectAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trading-accounts"] });
            toast.success("Trading account connected successfully");
        },
        onError: () => toast.error("Failed to connect trading account"),
    });

    const disconnectAccount = useMutation({
        mutationFn: TradingAccountAPI.disconnectAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trading-accounts"] });
            toast.success("Account disconnected");
        },
    });

    // --- Trading Bots ---
    const { data: bots, isLoading: isLoadingBots } = useQuery({
        queryKey: ["trading-bots"],
        queryFn: tradingBotService.getMyBots,
    });

    const updateBotStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: TradingBot["status"] }) =>
            tradingBotService.updateBotStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trading-bots"] });
            toast.success("Bot status updated");
        },
    });

    // --- Active Positions (from Journal) ---
    const { data: positions, isLoading: isLoadingPositions } = useQuery({
        queryKey: ["active-positions"],
        queryFn: async () => {
            const entries = await journalService.getMyJournal();
            // Filter only 'open' positions
            // In a real system, there might be a dedicated positions endpoint.
            // For this integrated platform, we use the journal with status 'open'.
            return entries.filter((e: any) => e.status === "open");
        },
    });

    // --- Emergency Controls ---
    const emergencyCloseAll = useMutation({
        mutationFn: async () => {
            const openPositions = await queryClient.ensureQueryData({
                queryKey: ["active-positions"],
                queryFn: async () => {
                    const entries = await journalService.getMyJournal();
                    return entries.filter((e: any) => e.status === "open");
                },
            });

            // Sequential close for MVP
            const closed = await Promise.all(
                openPositions.map((pos: any) =>
                    journalService.updateTrade(pos.id || pos._id, { status: "closed" } as any)
                )
            );
            return closed;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["active-positions"] });
            toast.warning("EMERGENCY: All positions closed successfully");
        },
        onError: () => toast.error("Failed to close all positions"),
    });

    return {
        accounts,
        isLoadingAccounts,
        connectAccount,
        disconnectAccount,
        bots,
        isLoadingBots,
        updateBotStatus,
        positions,
        isLoadingPositions,
        emergencyCloseAll,
    };
}
