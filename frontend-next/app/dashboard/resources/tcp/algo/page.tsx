"use client";

import { useTrading } from "@/hooks/use-trading";
import {
    Cpu,
    Play,
    Pause,
    Plus,
    BarChart3,
    Settings2,
    CheckCircle2,
    RefreshCw,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TCPAlgoPage() {
    const { bots, isLoadingBots, updateBotStatus } = useTrading();

    if (isLoadingBots) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-black min-h-screen text-[var(--color-text-primary)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">BOT MANAGEMENT</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm">Orchestration and execution control for MMITPS proprietary algorithmic trading agents.</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-500/20">
                    <Plus className="h-4 w-4" />
                    Deploy New Agent
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bots && bots.map((bot: any) => (
                    <div
                        key={bot.id || bot._id}
                        className="bg-surface border border-[var(--color-border)] rounded-lg p-8 hover:border-brand-500/30 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                                    <Cpu className="h-7 w-7 text-brand-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">{bot.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            bot.status === 'active' ? "bg-green-500 animate-pulse" : "bg-[var(--color-surface-3)]"
                                        )} />
                                        <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">{bot.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateBotStatus.mutate({ id: bot.id || bot._id, status: bot.status === 'active' ? 'paused' : 'active' })}
                                    className={cn(
                                        "p-3 rounded-lg border transition-all",
                                        bot.status === 'active'
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                                            : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20"
                                    )}
                                >
                                    {bot.status === 'active' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                </button>
                                <button className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg transition-all">
                                    <Settings2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                            <div>
                                <h4 className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest mb-1">Win Rate</h4>
                                <p className="text-sm font-black text-green-500">{(bot.profitFactor || 1.45).toFixed(2)}</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest mb-1">Total P&L</h4>
                                <p className={cn(
                                    "text-sm font-black",
                                    (bot.profit || 0) >= 0 ? "text-green-500" : "text-red-500"
                                )}>+${(bot.profit || 1250).toFixed(2)}</p>
                            </div>
                            <div>
                                <h4 className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest mb-1">Trades</h4>
                                <p className="text-sm font-black text-[var(--color-text-secondary)]">{bot.tradesCount || 42}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-[var(--color-text-muted)]" />
                                <span className="text-xs font-bold text-[var(--color-text-secondary)]">{bot.strategy} Strategy</span>
                            </div>
                            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                                Last: {bot.lastActive || "Just now"}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {(!bots || bots.length === 0) && (
                    <div className="lg:col-span-2 flex flex-col items-center justify-center py-24 bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed rounded-lg">
                        <Cpu className="h-12 w-12 text-white/10 mb-4" />
                        <h3 className="text-xl font-black text-[var(--color-text-secondary)] uppercase tracking-tighter">No Active Agents</h3>
                        <p className="text-[var(--color-text-muted)] text-sm mt-1 mb-8">Deploy your first algorithmic strategy to start automated trading.</p>
                        <button className="px-10 py-4 bg-brand-500 hover:bg-brand-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                            Browse Strategy Library
                        </button>
                    </div>
                )}
            </div>

            {/* Global Stats Row */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-[var(--color-text-secondary)]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Bot Profit</span>
                    </div>
                    <p className="text-2xl font-black text-green-500">+$12,450.40</p>
                </div>
                <div className="p-6 bg-surface border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-[var(--color-text-secondary)]">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Avg. Weekly Return</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--color-text-primary)]">4.21%</p>
                </div>
                <div className="p-6 bg-surface border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3 mb-4 text-[var(--color-text-secondary)]">
                        <Settings2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Pair Count</span>
                    </div>
                    <p className="text-2xl font-black text-brand-500">12 Pairs</p>
                </div>
            </div>
        </div>
    );
}
