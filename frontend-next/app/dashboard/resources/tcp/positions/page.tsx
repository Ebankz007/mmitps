"use client";

import { useTrading } from "@/hooks/use-trading";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Clock,
    ArrowUpRight,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TCPPositionsPage() {
    const { positions, isLoadingPositions } = useTrading();

    if (isLoadingPositions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-black min-h-screen text-[var(--color-text-primary)]">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">ACTIVE POSITIONS</h1>
                <p className="text-[var(--color-text-secondary)] text-sm">Real-time monitoring of all live trades currently running on linked accounts.</p>
            </div>

            {positions && positions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-6 px-6 py-4 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-[10px] uppercase font-black tracking-widest text-[var(--color-text-secondary)] mb-2">
                        <span>Symbol / Type</span>
                        <span>Lot Size</span>
                        <span>Entry Price</span>
                        <span>Current Price</span>
                        <span>Time Elapsed</span>
                        <span className="text-right">Profit / Loss</span>
                    </div>

                    {/* Positions List */}
                    {positions.map((pos: any) => (
                        <div
                            key={pos.id || pos._id}
                            className="grid grid-cols-1 md:grid-cols-6 items-center px-6 py-5 bg-surface border border-[var(--color-border)] rounded-lg hover:border-brand-500/30 transition-all group"
                        >
                            {/* Symbol & Direction */}
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    pos.direction?.toLowerCase() === 'buy' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {pos.direction?.toLowerCase() === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm">{pos.symbol}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase",
                                        pos.direction?.toLowerCase() === 'buy' ? "text-green-500" : "text-red-500"
                                    )}>{pos.direction}</span>
                                </div>
                            </div>

                            {/* Lot Size */}
                            <div className="text-sm font-bold text-[var(--color-text-secondary)]">
                                {pos.lotSize?.toFixed(2)} Lot
                            </div>

                            {/* Entry Price */}
                            <div className="text-sm font-mono text-[var(--color-text-secondary)]">
                                {pos.entryPrice?.toFixed(5)}
                            </div>

                            {/* Current Price (Mocked for MVP if not in API) */}
                            <div className="text-sm font-mono text-[var(--color-text-secondary)]">
                                {(pos.entryPrice * (1 + (Math.random() * 0.002 - 0.001)))?.toFixed(5)}
                            </div>

                            {/* Clock */}
                            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                <Clock className="h-3 w-3" />
                                <span className="text-[10px] font-bold">2h 14m</span>
                            </div>

                            {/* PnL */}
                            <div className="text-right flex flex-col items-end">
                                <span className={cn(
                                    "text-lg font-black",
                                    (pos.pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {(pos.pnl || 0) >= 0 ? "+" : ""}{(pos.pnl || 0).toFixed(2)} USD
                                </span>
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Floating</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed rounded-lg">
                    <Activity className="h-12 w-12 text-white/10 mb-4" />
                    <h3 className="text-xl font-black text-[var(--color-text-secondary)] uppercase tracking-tighter">No Active Positions</h3>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Start a bot or enter a trade to see it here.</p>
                </div>
            )}

            {/* Account Summary Floating Bar */}
            <div className="mt-12 p-6 bg-gradient-to-r from-brand-600/20 to-transparent border border-brand-500/20 rounded-lg flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center text-[var(--color-text-primary)] shadow-xl shadow-brand-500/20">
                        <ArrowUpRight className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Aggregate Exposure</h4>
                        <p className="text-xl font-black">$4,250.00 <span className="text-xs text-[var(--color-text-muted)]">USD</span></p>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div>
                        <h4 className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Total Margin Used</h4>
                        <p className="font-black">$1,120.40</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Free Margin</h4>
                        <p className="font-black text-brand-500">$11,329.60</p>
                    </div>
                </div>

                <button className="px-8 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                    Risk Management Settings
                </button>
            </div>
        </div>
    );
}
