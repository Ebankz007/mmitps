/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { mlmService, RankProgress, Rank } from "@/lib/api/mlm";
import {
    Trophy,
    Star,
    Target,
    History,
    ChevronRight,
    Award,
    CheckCircle2,
    Circle,
    Info,
    TrendingUp,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function RankDashboardPage() {
    const [progress, setProgress] = useState<RankProgress | null>(null);
    const [allRanks, setAllRanks] = useState<Rank[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [p, r] = await Promise.all([
                    mlmService.getRankProgress(),
                    mlmService.getRanks()
                ]);
                setProgress(p);
                setAllRanks(r);
            } catch (error) {
                console.error("Failed to load rank data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-[600px] gap-4 min-h-[600px]">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Calculating Leadership Metrics...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#020617] min-h-screen p-8 text-[var(--color-text-primary)] font-sans max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header / Breadcrumbs */}
            <div className="mb-10">
                <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#38BDF8] cursor-pointer hover:underline">Dashboard</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Rank Dashboard</span>
                </nav>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] uppercase italic">
                    Leadership <span className="text-[#10b981]">Rank</span>
                </h1>
            </div>

            {/* Rank Hero Card */}
            <div className="relative overflow-hidden bg-[#0B1224] border border-[var(--color-border)] rounded-lg mb-12 shadow-2xl group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-brand-600/10 blur-[130px] rounded-full group-hover:bg-brand-600/15 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-brand-600/5 blur-[100px] rounded-full"></div>

                <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-center gap-14 text-center md:text-left z-10">
                    <div className="relative">
                        <div className="w-56 h-56 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center bg-black/40 backdrop-blur-xl relative z-10 shadow-inner">
                            {/* Inner Ring */}
                            <div className="absolute inset-2 rounded-full border border-dashed border-brand-500/20 animate-spin-slow"></div>

                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#10b981] to-[#10b981] flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.3)]">
                                <Trophy size={80} strokeWidth={1.2} className="text-[var(--color-text-primary)] drop-shadow-lg" />
                            </div>
                        </div>
                        {/* Rank Badge Floating */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface px-8 py-2.5 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 transition-transform group-hover:scale-105">
                            <span className="text-black text-[11px] font-black uppercase tracking-[0.2em] italic">{progress?.currentRank || 'Starter'}</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 w-full">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
                                <ShieldCheck className="h-3 w-3 text-brand-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">Verified Leadership Status</span>
                            </div>
                            <h2 className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase italic leading-none mb-4">
                                {progress?.currentRank || 'Starter'} <span className="text-gray-700 font-medium">Rank</span>
                            </h2>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
                                Next Milestone: <span className="text-[#38BDF8]">{progress?.nextRank || 'Supreme Legend'}</span>
                            </p>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end mb-1">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Qualification Progress</span>
                                    <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase italic">Path to {progress?.nextRank}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter leading-none">{progress?.percentage || 0}<span className="text-[#10b981]">%</span></span>
                                </div>
                            </div>
                            <div className="h-7 bg-[#020617] rounded-lg overflow-hidden border border-[var(--color-border)] p-1.5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-[#10b981] via-[#10b981] to-[#06B6D4] rounded-lg transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.4)] relative"
                                    style={{ width: `${progress?.percentage || 0}%` }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-16 bg-[var(--color-surface-3)] blur-xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Requirements Column */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Target className="h-5 w-5 text-brand-400" />
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">Upgrade Requirements</h3>
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            {progress?.requirements.filter(r => r.status === 'completed').length || 0} / {progress?.requirements.length || 0} Completed
                        </div>
                    </div>

                    <div className="space-y-4">
                        {progress?.requirements.map((req, idx) => (
                            <div key={idx} className="group p-6 bg-[#0B1224] border border-[var(--color-border)] rounded-lg flex flex-col md:flex-row md:items-center justify-between hover:border-brand-500/20 transition-all relative overflow-hidden">
                                {req.status === 'completed' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
                                )}

                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={cn(
                                        "w-14 h-14 rounded-lg flex items-center justify-center transition-all border shadow-sm",
                                        req.status === 'completed'
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : "bg-[#020617] text-gray-700 border-[var(--color-border)] group-hover:border-gray-600"
                                    )}>
                                        {req.status === 'completed' ? <CheckCircle2 size={28} /> : <Circle size={28} strokeWidth={1.5} />}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-0.5 transition-colors group-hover:text-brand-400">
                                            {req.label}
                                        </div>
                                        <div className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className={cn(req.status === 'completed' ? "text-emerald-400" : "text-gray-400")}>
                                                {req.current.toLocaleString()}
                                            </span>
                                            <span className="text-gray-700">/</span>
                                            <span className="text-gray-500">{req.required.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 md:mt-0 flex flex-col items-end gap-2 relative z-10">
                                    <div className="h-2 w-full md:w-48 bg-[#020617] rounded-full overflow-hidden border border-[var(--color-border)]">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                req.status === 'completed' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-brand-500/40"
                                            )}
                                            style={{ width: `${Math.min(100, (req.current / req.required) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-gray-600 italic">
                                        {Math.round(Math.min(100, (req.current / req.required) * 100))}% Fulfilled
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trajectory Column */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                            <Award className="h-5 w-5 text-brand-400" />
                        </div>
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">Rank Trajectory</h3>
                    </div>

                    <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-10 bottom-0 w-0.5 bg-[var(--color-surface-2)] pointer-events-none"></div>

                        <div className="divide-y divide-white/5 relative z-10">
                            {allRanks.map((rank, idx) => {
                                const isCurrent = rank.name === progress?.currentRank;
                                const currentRankIdx = allRanks.findIndex(r => r.name === progress?.currentRank);
                                const isPast = idx < currentRankIdx;
                                const isNext = idx === currentRankIdx + 1;

                                return (
                                    <div key={idx} className={cn(
                                        "p-6 flex items-center justify-between transition-all group/item",
                                        isCurrent ? "bg-brand-600/[0.03] border-l-4 border-l-brand-500" : "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                                    )}>
                                        <div className="flex items-center gap-5 relative">
                                            {/* Connector point */}
                                            <div className={cn(
                                                "absolute -left-[27px] w-2.5 h-2.5 rounded-full z-10",
                                                isPast ? "bg-emerald-500" : isCurrent ? "bg-brand-500 shadow-[0_0_10px_rgba(16, 185, 129,0.8)]" : "bg-gray-800"
                                            )}></div>

                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center font-black italic text-sm transition-all shadow-sm",
                                                isCurrent
                                                    ? "bg-brand-600 text-[var(--color-text-primary)]"
                                                    : "bg-[#020617] border border-[var(--color-border)] text-gray-500 group-hover/item:border-gray-500"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className={cn(
                                                    "text-[13px] font-black uppercase tracking-widest",
                                                    isCurrent ? "text-[var(--color-text-primary)]" : "text-gray-400"
                                                )}>
                                                    {rank.displayName}
                                                </div>
                                                <div className="text-[10px] text-brand-400/80 font-bold uppercase tracking-tight flex items-center gap-2">
                                                    <Info className="h-3 w-3" />
                                                    {rank.benefits.commissionPercentage}% Commission Boost
                                                </div>
                                            </div>
                                        </div>
                                        {isCurrent ? (
                                            <div className="px-4 py-1 bg-brand-500/10 rounded-full text-[8px] font-black text-brand-400 uppercase tracking-widest border border-brand-500/20 shadow-sm animate-pulse">
                                                Active Status
                                            </div>
                                        ) : isPast ? (
                                            <div className="text-emerald-500/40">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        ) : isNext && (
                                            <div className="text-gray-700 animate-bounce">
                                                <Target size={16} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Impact Widget */}
                    <div className="p-8 bg-gradient-to-br from-[#0B1224] to-[#1E1B4B] border border-[var(--color-border)] rounded-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[50px] pointer-events-none group-hover:bg-brand-500/20 transition-all"></div>
                        <div className="flex gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-7 w-7 text-brand-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Impact Bonus Matrix</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed italic tracking-tight">
                                    Advancing to the <span className="text-brand-400">{progress?.nextRank}</span> rank unlocks the <span className="text-brand-400">Global Revenue Pool</span> and increases your daily withdrawal limits by <span className="text-emerald-400">25%</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank History Section */}
            <div className="mt-16 space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-500/5 flex items-center justify-center border border-[var(--color-border)]">
                        <History className="h-5 w-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">Achievement History</h3>
                </div>

                <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-16 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-600/[0.01] pointer-events-none"></div>
                    <div className="relative z-10 max-w-sm mx-auto">
                        <div className="inline-flex p-6 bg-[#020617] rounded-lg border border-[var(--color-border)] mb-6 shadow-xl">
                            <Star size={48} className="text-gray-800" />
                        </div>
                        <p className="text-[11px] text-gray-600 font-black uppercase tracking-[0.2em] italic leading-loose">
                            No rank history records found <br /> for current leadership cycle
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
