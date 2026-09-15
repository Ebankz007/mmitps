"use client";

import { useState, useEffect } from "react";
import { journalService, TradeEntry } from "@/lib/api/journal";
import {
    Book,
    Plus,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Activity,
    MoreVertical,
    CloudIcon,
    CheckCircle2,
    Target,
    ShieldCheck
} from "lucide-react";
import { clsx } from "clsx";

import BrokerAccountModal from "@/components/modals/BrokerAccountModal";
import { Link2, Share2 } from "lucide-react";
import SharePerformanceModal from "@/components/modals/SharePerformanceModal";

export default function TradeJournalPage() {
    const [entries, setEntries] = useState<TradeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    void loading;

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const data = await journalService.getMyJournal();
            setEntries(data);
        } catch (err) {
            console.error("Failed to fetch journal entries:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const totalPnL = entries.reduce((acc, curr) => acc + curr.pnl, 0);
    const winRate = (entries.filter(e => e.pnl > 0).length / entries.length) * 100 || 0;

    return (
        <div className="space-y-6">
            <BrokerAccountModal 
                isOpen={isBrokerModalOpen} 
                onClose={() => setIsBrokerModalOpen(false)} 
            />

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#10b981]/10 rounded-lg">
                        <Book className="h-6 w-6 text-[#10b981]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Trade Journal</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Psychological & Performance Logging</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-6 mr-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Total PnL</div>
                            <div className={clsx("text-lg font-black", totalPnL >= 0 ? "text-green-500" : "text-red-500")}>
                                {totalPnL >= 0 ? `+$${totalPnL.toLocaleString()}` : `-$${Math.abs(totalPnL).toLocaleString()}`}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Win Rate</div>
                            <div className="text-lg font-black text-[var(--color-text-primary)]">{winRate.toFixed(1)}%</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsBrokerModalOpen(true)}
                        className="px-5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Link2 className="h-4 w-4" />
                        Link Account
                    </button>
                    <button 
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                    <button className="px-5 py-2.5 bg-[#10b981] hover:bg-[#10b981]/80 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16, 185, 129,0.2)]">
                        <Plus className="h-4 w-4" />
                        Log Trade
                    </button>
                </div>
            </div>

            <SharePerformanceModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                stats={{
                    totalPnL,
                    winRate,
                    profitFactor: "2.42",
                    avgReturn: "+1.8R"
                }}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Profit Factor", val: "2.42", icon: Target, color: "text-[#10b981]" },
                    { label: "Avg R-Multiple", val: "+1.8R", icon: TrendingUp, color: "text-green-500" },
                    { label: "Max Drawdown", val: "4.2%", icon: TrendingDown, color: "text-red-500" },
                    { label: "Trade Streak", val: "W4", icon: Activity, color: "text-brand-400" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-surface border border-[var(--color-border)] p-5 rounded-lg flex items-center gap-4">
                        <div className={clsx("p-3 rounded-lg bg-[var(--color-surface-2)]", stat.color)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">{stat.label}</div>
                            <div className="text-xl font-black text-[var(--color-text-primary)]">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Area */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="h-3.5 w-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Filter journals..."
                                className="bg-black/40 border border-[var(--color-border)] rounded-lg py-1.5 pl-9 pr-4 text-xs text-[var(--color-text-primary)] placeholder:text-gray-600 focus:outline-none focus:border-[#10b981]/50 transition-all w-48"
                            />
                        </div>
                        <Filter className="h-4 w-4 text-gray-500 hover:text-[var(--color-text-primary)] cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                        <CloudIcon className="h-3.5 w-3.5 text-brand-500" />
                        Auto-Sync Enabled
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-card border-b border-[var(--color-border)] text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Symbol / Type</th>
                                <th className="px-6 py-4">Execution Date</th>
                                <th className="px-6 py-4">Setup / Logic</th>
                                <th className="px-6 py-4">Result (PnL)</th>
                                <th className="px-6 py-4">Psychology</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600 font-bold uppercase text-xs tracking-widest">
                                        No entries found. Start logging to see performance analytics.
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs",
                                                    entry.type === "Buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {entry.symbol.substring(0, 3)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-[var(--color-text-primary)] uppercase">{entry.symbol}</div>
                                                    <div className="text-[9px] text-gray-500 font-bold uppercase">{entry.type} · {entry.lotSize} Lots</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-400">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="px-3 py-1 bg-[var(--color-surface-2)] rounded-full text-[9px] font-black text-gray-300 uppercase tracking-widest inline-block border border-[var(--color-border)]">
                                                {entry.notes || "Technical Setup"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={clsx("text-sm font-black", entry.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                                                {entry.pnl >= 0 ? `+$${entry.pnl.toLocaleString()}` : `-$${Math.abs(entry.pnl).toLocaleString()}`}
                                            </div>
                                            <div className="text-[9px] text-gray-600 font-bold uppercase">Target Hit</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Focus: High</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-gray-600 hover:text-[var(--color-text-primary)] transition-all">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Alert / Feedback */}
            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-lg flex items-center gap-4">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <p className="text-[11px] text-green-300 font-medium leading-normal">
                    <span className="font-black uppercase">Edge Identified:</span> You are currently seeing 82% win rate on "Liquidity Sweep" setups during the London Open. Consider increasing risk on this specific setup.
                </p>
            </div>
        </div>
    );
}
