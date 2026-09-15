/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    TrendingUp,
    BarChart3,
    Globe,
    Zap,
    Play,
    Calendar,
    Info,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function ForexPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "$7.5T", desc: "Daily Volume", color: "text-brand-400" },
        { label: "24/5", desc: "Market Hours", color: "text-brand-400" },
        { label: "210", desc: "Currency Pairs", color: "text-emerald-400" },
        { label: "21", desc: "World Regions", color: "text-amber-400" },
    ];

    const pairTypes = [
        {
            title: "Major Pairs",
            desc: "Most traded pairs involving USD. Highest liquidity and tightest spreads.",
            pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"],
            color: "blue"
        },
        {
            title: "Minor Pairs",
            desc: "Crosses between major currencies excluding USD. Good liquidity.",
            pairs: ["EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/NZD"],
            color: "purple"
        },
        {
            title: "Exotic Pairs",
            desc: "Major currency paired with emerging market currency. Higher volatility.",
            pairs: ["USD/ZAR", "USD/MXN", "HKD/JPY", "USD/THB"],
            color: "orange"
        }
    ];

    const sessions = [
        { city: "Sydney", code: "AU", time: "10:00 PM - 7:00 AM GMT" },
        { city: "Tokyo", code: "JP", time: "12:00 AM - 9:00 AM GMT" },
        { city: "London", code: "GB", time: "8:00 AM - 5:00 PM GMT" },
        { city: "New York", code: "US", time: "1:00 PM - 10:00 PM GMT" },
    ];

    const popularPairs = [
        { name: "EUR/USD", trend: "up", price: "1.0854", change: "+0.12%" },
        { name: "GBP/USD", trend: "down", price: "1.2674", change: "-0.05%" },
        { name: "USD/JPY", trend: "up", price: "150.21", change: "+0.34%" },
        { name: "USD/CHF", trend: "down", price: "0.8812", change: "-0.11%" },
        { name: "AUD/USD", trend: "up", price: "0.6542", change: "+0.18%" },
        { name: "USD/CAD", trend: "down", price: "1.3521", change: "-0.08%" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-500 mb-1">
                        <Globe className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Forex Markets</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Foreign <span className="text-brand-500 italic">Exchange</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        The world's largest financial market with $7.5 trillion daily volume.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/forex"
                    className="flex items-center gap-3 px-6 py-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-lg transition-all group"
                >
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Economic Calendar</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Forex Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-brand-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Video Tutorial</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-brand-500">Forex Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Learn the fundamentals of currency trading, how exchanges work, and what drives Forex markets. Learn why it is the most liquid market in the world.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16, 185, 129,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-[var(--color-text-primary)] fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            12:45 Duration
                        </div>
                    </div>
                </div>

                {/* What is Forex Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-500">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What is Forex?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">The basics of currency trading</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Forex (Foreign Exchange) is the global marketplace for trading national currencies. It is the most liquid market in the world, operating 24 hours a day, 5 days a week across major financial centers.
                            </p>

                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Key Concept</span>
                                <p className="text-[11px] text-gray-300 italic">
                                    Currencies are always traded in pairs (e.g., EUR/USD). When you buy EUR/USD, you're buying Euro while selling US Dollars simultaneously.
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

            {/* Types of Currency Pairs */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <BarChart3 className="h-3 w-3" />
                        Types of Currency Pairs
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pairTypes.map((type, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg group hover:border-brand-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    type.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                        type.color === 'purple' ? "bg-brand-500/20 text-brand-500" :
                                            "bg-brand-500/20 text-brand-500"
                                )}>
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <h4 className="text-xl font-black text-[var(--color-text-primary)]">{type.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 italic">
                                {type.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {type.pairs.map((pair, j) => (
                                    <span key={j} className={cn("px-3 py-1 text-[10px] font-black rounded-lg border",
                                        type.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                            type.color === 'purple' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                "bg-brand-500/10 text-brand-400 border-orange-500/20"
                                    )}>
                                        {pair}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trading Sessions */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Forex Trading Sessions
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="bg-[#0B1224] p-8 rounded-lg border border-brand-500/10 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {sessions.map((session, i) => (
                            <div key={i} className="p-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group hover:bg-[var(--color-surface-3)] transition-colors">
                                <div className="text-[40px] font-black text-white/5 group-hover:text-brand-500/10 transition-colors mb-[-20px]">{session.code}</div>
                                <div className="text-xl font-black text-[var(--color-text-primary)] mb-1">{session.city}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{session.time}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <p className="text-[11px] text-gray-400 italic">
                            <span className="text-amber-500 font-bold uppercase mr-1">Pro Tip:</span>
                            The highest volatility occurs during "session overlaps", especially London/New York (1:00 PM - 5:00 PM GMT).
                        </p>
                    </div>
                </div>
            </div>

            {/* Popular Currency Pairs on MMITPS */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Currency Pairs on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {popularPairs.map((pair, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-brand-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-xs font-black text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors">{pair.name}</div>
                                {pair.trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <ArrowUpRight className="h-3 w-3 text-red-500 rotate-90" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">{pair.price}</div>
                                <div className={cn("text-[10px] font-bold", pair.trend === 'up' ? "text-emerald-500" : "text-red-500")}>
                                    {pair.change}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-4">
                    <Link
                        href="/dashboard/resources/cot/pro-max"
                        className="px-8 py-4 bg-brand-500 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(16, 185, 129,0.4)] hover:shadow-[0_0_40px_rgba(16, 185, 129,0.6)] hover:scale-105 transition-all"
                    >
                        Explore Advanced Analytics
                    </Link>
                </div>
            </div>
        </div>
    );
}
