/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Building2,
    Share2,
    TrendingUp,
    Landmark,
    Zap,
    Play,
    Info,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Laptop,
    Briefcase,
    Pill,
    Car,
    Activity
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function StocksPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "500+", desc: "Stock Selections", color: "text-emerald-400" },
        { label: "10+", desc: "Global Markets", color: "text-brand-400" },
        { label: "T+2", desc: "Settlement Cycle", color: "text-brand-400" },
        { label: "High", desc: "Market Liquidity", color: "text-cyan-400" },
    ];

    const sectors = [
        {
            title: "Technology",
            desc: "Software, hardware, and AI innovations.",
            assets: ["AAPL", "MSFT", "NVDA", "GOOGL"],
            icon: Laptop,
            color: "blue"
        },
        {
            title: "Financial",
            desc: "Banking, insurance, and asset management.",
            assets: ["JPM", "GS", "V", "MA"],
            icon: Briefcase,
            color: "emerald"
        },
        {
            title: "Healthcare",
            desc: "Biotech, pharma, and medical devices.",
            assets: ["JNJ", "PFE", "UNH", "ABBV"],
            icon: Pill,
            color: "red"
        },
        {
            title: "Consumer",
            desc: "Retail, automotive, and discretionary goods.",
            assets: ["AMZN", "TSLA", "WMT", "HD"],
            icon: Car,
            color: "amber"
        }
    ];

    const popularStocks = [
        { name: "APPLE INC.", symbol: "AAPL", trend: "up", price: "$182.52", change: "+0.45%", icon: Laptop, color: "blue" },
        { name: "MICROSOFT", symbol: "MSFT", trend: "up", price: "$408.45", change: "+0.12%", icon: Laptop, color: "blue" },
        { name: "ALPHABET", symbol: "GOOGL", trend: "up", price: "$142.12", change: "+1.24%", icon: Laptop, color: "blue" },
        { name: "AMAZON", symbol: "AMZN", trend: "up", price: "$174.45", change: "+0.85%", icon: Car, color: "amber" },
        { name: "TESLA", symbol: "TSLA", trend: "down", price: "$192.30", change: "-1.34%", icon: Car, color: "amber" },
        { name: "NETFLIX", symbol: "NFLX", trend: "up", price: "$585.12", change: "+2.15%", icon: Laptop, color: "blue" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Stock Market</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Stock <span className="text-emerald-500 italic">Trading</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Invest in shares of the world's leading companies.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/stocks"
                    className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all group"
                >
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Market News</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Stock Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-emerald-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Masterclass</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-emerald-500">Stock Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Learn how stock markets work, what drives share prices, and strategies for building wealth through equities. Understand bull and bear market cycles.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-black fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            12:30 Duration
                        </div>
                    </div>
                </div>

                {/* What are Stocks Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-emerald-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What are Stocks?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Ownership in companies</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Stocks (or shares) represent ownership in a company. When you buy a stock, you become a partial owner entitled to a stake of the company's profits and assets.
                            </p>

                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Two Ways to Profit</span>
                                <p className="text-[10px] text-gray-300 italic">
                                    **Capital gains:** Selling a stock for more than you paid. **Dividends:** Regular payouts from company profits to shareholders.
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

            {/* Stock Sectors */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Share2 className="h-3 w-3" />
                        Stock Sectors
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sectors.map((sector, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg group hover:border-emerald-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    sector.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                        sector.color === 'emerald' ? "bg-emerald-500/20 text-emerald-500" :
                                            sector.color === 'red' ? "bg-red-500/20 text-red-500" :
                                                "bg-amber-500/20 text-amber-500"
                                )}>
                                    <sector.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-base font-black text-[var(--color-text-primary)]">{sector.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 italic">
                                {sector.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sector.assets.map((asset, j) => (
                                    <span key={j} className={cn("px-3 py-1 text-[9px] font-black rounded-lg border",
                                        sector.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                            sector.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                sector.color === 'red' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    )}>
                                        {asset}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Stocks on MMITPS */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Stocks on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularStocks.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-emerald-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-emerald-500 transition-colors uppercase">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <item.icon className={cn("h-4 w-4",
                                    item.color === 'blue' ? "text-brand-500" :
                                        item.color === 'emerald' ? "text-emerald-500" :
                                            item.color === 'red' ? "text-red-500" : "text-amber-500"
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
                        href="/dashboard/trading"
                        className="px-8 py-4 bg-emerald-600 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:scale-105 transition-all"
                    >
                        Start Trading Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
