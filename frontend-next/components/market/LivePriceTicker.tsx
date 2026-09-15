"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { clsx } from "clsx";

interface PriceData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

const DEFAULT_ASSETS = [
    { symbol: "EURUSD", price: 1.0845, change: 0.0012, changePercent: 0.11 },
    { symbol: "XAUUSD", price: 2024.50, change: -12.40, changePercent: -0.61 },
    { symbol: "BTCUSD", price: 51240.00, change: 450.00, changePercent: 0.88 },
    { symbol: "GBPUSD", price: 1.2630, change: -0.0005, changePercent: -0.04 },
    { symbol: "NDX100", price: 17850.25, change: 125.50, changePercent: 0.71 },
];

export function LivePriceTicker() {
    const { socket, isConnected } = useSocket();
    const [prices, setPrices] = useState<Record<string, PriceData>>({});

    useEffect(() => {
        // Initialize with defaults
        const initialPrices: Record<string, PriceData> = {};
        DEFAULT_ASSETS.forEach(asset => {
            initialPrices[asset.symbol] = asset;
        });
        setPrices(initialPrices);

        if (!socket) return;

        socket.on("price_update", (data: PriceData) => {
            setPrices(prev => ({
                ...prev,
                [data.symbol]: data
            }));
        });

        // Request specific asset updates
        socket.emit("subscribe_prices", DEFAULT_ASSETS.map(a => a.symbol));

        return () => {
            socket.off("price_update");
        };
    }, [socket]);

    return (
        <div className="w-full bg-surface border-y border-[var(--color-border)] py-3 overflow-hidden">
            <div className="flex items-center gap-6 px-6 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex items-center gap-2 whitespace-nowrap border-r border-[var(--color-border)] pr-6 mr-6">
                    <div className={clsx(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    )}></div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        {isConnected ? "Live Feed" : "Reconnecting"}
                        <Activity className="h-3 w-3" />
                    </span>
                </div>

                <div className="flex items-center gap-10">
                    {Object.values(prices).map((asset) => (
                        <div key={asset.symbol} className="flex items-center gap-3 group cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-[var(--color-text-primary)] transition-colors">{asset.symbol}</span>
                                <span className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
                                    {asset.price.toLocaleString(undefined, {
                                        minimumFractionDigits: asset.price < 10 ? 4 : 2,
                                        maximumFractionDigits: asset.price < 10 ? 4 : 2
                                    })}
                                </span>
                            </div>
                            <div className={clsx(
                                "flex flex-col items-end px-2 py-1 rounded-lg transition-all",
                                asset.change >= 0 ? "bg-green-500/10 text-green-500 group-hover:bg-green-500/20" : "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
                            )}>
                                <div className="flex items-center gap-1 text-[10px] font-black">
                                    {asset.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(asset.changePercent).toFixed(2)}%
                                </div>
                                <span className="text-[9px] font-bold opacity-80 tabular-nums">
                                    {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(asset.price < 10 ? 4 : 2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
