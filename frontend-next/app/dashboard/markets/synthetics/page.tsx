/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Zap,
    Activity,
    Cpu,
    Binary,
    TrendingUp,
    TrendingDown,
    Play,
    Info,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Terminal,
    Network,
    Shapes,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function SyntheticsPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "24/7/365", desc: "Non-stop Trading", color: "text-brand-400" },
        { label: "0%", desc: "News Impact", color: "text-emerald-400" },
        { label: "Tick", desc: "Based Pricing", color: "text-fuchsia-400" },
        { label: "100%", desc: "Algorithmic", color: "text-cyan-400" },
    ];

    const categories = [
        {
            title: "Volatility Indices",
            desc: "Indices that correspond to simulated markets with constant volatilities of 10%, 25%, 50%, 75%, and 100%.",
            indices: ["V10", "V75", "V100", "V10(1s)"],
            icon: Activity,
            color: "purple"
        },
        {
            title: "Crash/Boom Indices",
            desc: "Simulate real-world market spikes and drops with average frequencies of 300, 500, or 1000 ticks.",
            indices: ["C300", "B300", "C500", "B500"],
            icon: TrendingDown,
            color: "magenta"
        },
        {
            title: "Step Indices",
            desc: "Market moves up or down with a fixed step size of 0.1 and has an equal probability for each direction.",
            indices: ["Step Index"],
            icon: Shapes,
            color: "blue"
        },
        {
            title: "Range Break Indices",
            desc: "Simulate a market that breaks out of a price range after an average of 100 or 200 breakouts.",
            indices: ["Range 100", "Range 200"],
            icon: Network,
            color: "cyan"
        }
    ];

    const popularSynthetics = [
        { name: "Volatility 75 Index", symbol: "V75", trend: "up", price: "284,512.42", change: "+1.45%", icon: Activity, color: "purple" },
        { name: "Crash 1000 Index", symbol: "C1000", trend: "down", price: "4,212.30", change: "-5.12%", icon: TrendingDown, color: "magenta" },
        { name: "Boom 1000 Index", symbol: "B1000", trend: "up", price: "8,942.12", change: "+2.34%", icon: TrendingUp, color: "fuchsia" },
        { name: "Volatility 10 (1s)", symbol: "V10(1s)", trend: "up", price: "1,245.12", change: "+0.12%", icon: Activity, color: "purple" },
        { name: "Step Index", symbol: "Step", trend: "up", price: "408.45", change: "+0.32%", icon: Shapes, color: "blue" },
        { name: "Jump 10 Index", symbol: "Jump 10", trend: "down", price: "12,452.12", change: "-1.15%", icon: Zap, color: "purple" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-500 mb-1">
                        <Terminal className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Algorithmic Markets</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Synthetic <span className="text-brand-500 italic">Indices</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Proven 24/7 markets unaffected by global news.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/synthetics"
                    className="flex items-center gap-3 px-6 py-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-lg transition-all group"
                >
                    <Binary className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Index Specs</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Synthetic Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-brand-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Masterclass</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-brand-500">Synthetic Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Learn the fundamentals of algorithmic trading, how synthetic indices differ from traditional markets, and strategies to trade Volatility, Crash, and Boom markets.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-black fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            10:15 Duration
                        </div>
                    </div>
                </div>

                {/* What are Synthetics Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-500">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What are Synthetics?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Algorithmic Market Basis</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Synthetic indices mimic real-world market movements but are generated by secure, audited algorithms. They are unaffected by global fundamentals or political news.
                            </p>

                            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-lg">
                                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Key Advantage</span>
                                <p className="text-[10px] text-gray-300 italic">
                                    **Non-Stop Action:** Unlike traditional markets that close over weekends/holidays, synthetic indices are available 24/7, providing consistent opportunity.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {stats.map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className={cn("text-xl font-black", stat.color)}>{stat.label}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Algorithmic Categories */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <BarChart3 className="h-3 w-3" />
                        Algorithmic Categories
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg group hover:border-brand-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    cat.color === 'purple' ? "bg-brand-500/20 text-brand-500" :
                                        cat.color === 'magenta' ? "bg-pink-500/20 text-pink-500" :
                                            cat.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                                "bg-cyan-500/20 text-cyan-500"
                                )}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-base font-black text-[var(--color-text-primary)]">{cat.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 italic">
                                {cat.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cat.indices.map((idx, j) => (
                                    <span key={j} className={cn("px-3 py-1 text-[9px] font-black rounded-lg border",
                                        cat.color === 'purple' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                            cat.color === 'magenta' ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                                                cat.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                    )}>
                                        {idx}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Synthetic Indices Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Binary className="h-3 w-3" />
                        Popular Indices on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularSynthetics.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-brand-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors uppercase">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <item.icon className={cn("h-4 w-4",
                                    item.color === 'purple' ? "text-brand-500" :
                                        item.color === 'magenta' ? "text-pink-500" :
                                            item.color === 'fuchsia' ? "text-fuchsia-500" :
                                                item.color === 'blue' ? "text-brand-500" : "text-cyan-500"
                                )} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-md font-black text-[var(--color-text-primary)] tracking-tight">{item.price}</div>
                                <div className={cn("text-[10px] font-bold", item.trend === 'up' ? "text-emerald-500" : "text-red-500")}>
                                    {item.change}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-4">
                    <Link
                        href="/dashboard/trading?market=synthetics"
                        className="px-8 py-4 bg-brand-600 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 transition-all"
                    >
                        Access Synthetic Desk
                    </Link>
                </div>
            </div>
        </div>
    );
}
