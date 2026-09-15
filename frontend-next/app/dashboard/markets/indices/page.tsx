/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    BarChart3,
    TrendingUp,
    Landmark,
    Globe,
    Zap,
    Play,
    Info,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function IndicesPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "20+", desc: "Global Indices", color: "text-brand-400" },
        { label: "23/5", desc: "Trading Hours", color: "text-brand-400" },
        { label: "High", desc: "Market Breadth", color: "text-emerald-400" },
        { label: "Low", desc: "Average Spread", color: "text-amber-400" },
    ];

    const regions = [
        {
            title: "US Americas",
            code: "US",
            indices: [
                { name: "US30", symbol: "Dow Jones Industrial Average", price: "38,942.21", change: "+0.42%", trend: "up" },
                { name: "US500", symbol: "S&P 500 Index", price: "5,082.12", change: "+0.85%", trend: "up" },
                { name: "US100", symbol: "NASDAQ 100 Index", price: "17,942.30", change: "+1.34%", trend: "up" },
            ]
        },
        {
            title: "EU Europe",
            code: "EU",
            indices: [
                { name: "GER40", symbol: "DAX 40 Index", price: "17,452.12", change: "-0.12%", trend: "down" },
                { name: "UK100", symbol: "FTSE 100 Index", price: "7,624.30", change: "+0.25%", trend: "up" },
                { name: "FRA40", symbol: "CAC 40 Index", price: "7,921.40", change: "+0.18%", trend: "up" },
            ]
        },
        {
            title: "Asia Pacific",
            code: "AP",
            indices: [
                { name: "JPN225", symbol: "Nikkei 225", price: "39,165.20", change: "+1.92%", trend: "up" },
                { name: "HK50", symbol: "Hang Seng Index", price: "16,511.40", change: "-0.84%", trend: "down" },
                { name: "AUS200", symbol: "ASX 200 Index", price: "7,688.70", change: "+0.15%", trend: "up" },
            ]
        }
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-cyan-500 mb-1">
                        <Landmark className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Stock Indices</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Global <span className="text-cyan-500 italic">Indices</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Trade baskets of stocks representing entire market sectors.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg transition-all">
                        <Search className="h-4 w-4 text-gray-400" />
                    </button>
                    <Link
                        href="/dashboard/resources/cot/pro-max"
                        className="flex items-center gap-3 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg transition-all group"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Market Breadth</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Index Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-cyan-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-cyan-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Video Tutorial</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-cyan-500">Index Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Learn how stock indices work, what they represent, and strategies for trading Index CFDs. Understand why these benchmarks are critical for understanding global sentiment.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-400/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-[var(--color-text-primary)] fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            11:45 Duration
                        </div>
                    </div>
                </div>

                {/* What are Indices Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-cyan-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full group-hover:bg-cyan-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-500">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What are Indices?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Market performance benchmarks</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Stock indices are measurement of a group of stocks representing a specific market or sector. They serve as benchmarks for the overall health of an economy or industry.
                            </p>

                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">Key Benefit</span>
                                <p className="text-[11px] text-gray-300 italic">
                                    Trading indices allows you to speculate on the overall direction of a market without having to pick individual stocks. It's instant diversification.
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

            {/* Indices by Region */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        Indices by Region
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {regions.map((region, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                    <span className="text-gray-500 mr-2">{region.code}</span>
                                    {region.title.split(' ')[1]}
                                </h4>
                            </div>
                            <div className="space-y-3">
                                {region.indices.map((index, j) => (
                                    <div key={j} className="p-6 bg-[#0B1224] border border-brand-500/10 rounded-[28px] hover:border-cyan-500/30 transition-all group shadow-lg shadow-black/20">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-cyan-500 transition-colors uppercase">{index.name}</div>
                                                <div className="text-[10px] font-bold text-gray-500 italic uppercase tracking-tighter">{index.symbol}</div>
                                            </div>
                                            {index.trend === 'up' ? (
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                                    <ArrowUpRight className="h-4 w-4 rotate-90" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter">{index.price}</div>
                                            <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg border",
                                                index.trend === 'up' ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-red-500 bg-red-500/5 border-red-500/10"
                                            )}>
                                                {index.change}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Action */}
            <div className="bg-[#0B1224] p-10 rounded-lg border border-cyan-500/10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                    <TrendingUp className="h-8 w-8" />
                </div>
                <div className="max-w-xl space-y-2">
                    <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Ready to trade the world's <span className="text-cyan-500">biggest indices?</span></h3>
                    <p className="text-sm text-gray-400 italic">
                        Access leverage up to 1:200 and tight spreads on over 20 global equity benchmarks with institutional-grade execution speed.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                        href="/dashboard/trading"
                        className="px-10 py-4 bg-cyan-500 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 transition-all text-center"
                    >
                        Start Trading Now
                    </Link>
                    <Link
                        href="/dashboard/education"
                        className="px-10 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-black text-gray-300 uppercase tracking-widest transition-all text-center"
                    >
                        Learn Strategies
                    </Link>
                </div>
            </div>
        </div>
    );
}
