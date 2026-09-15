/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Landmark,
    ShieldCheck,
    PieChart,
    TrendingDown,
    TrendingUp,
    Zap,
    Play,
    Info,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Globe,
    Building,
    Map
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function BondsPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "$130T+", desc: "Global Market", color: "text-brand-400" },
        { label: "Lower", desc: "Risk Profile", color: "text-emerald-400" },
        { label: "Fixed", desc: "Income Stream", color: "text-brand-400" },
        { label: "High", desc: "Capital Security", color: "text-cyan-400" },
    ];

    const bondTypes = [
        {
            title: "Government Bonds",
            desc: "Issued by national governments. Considered the safest bonds with lower default risk.",
            assets: ["US Treasuries", "Bunds", "Gilts"],
            icon: Globe,
            color: "indigo"
        },
        {
            title: "Corporate Bonds",
            desc: "Issued by companies to raise capital. Higher yields but increased credit risk.",
            assets: ["Investment Grade", "High Yield"],
            icon: Building,
            color: "purple"
        },
        {
            title: "Municipal Bonds",
            desc: "Issued by states, cities, or counties. Often tax-exempt for residents.",
            assets: ["General Obligation", "Revenue"],
            icon: Map,
            color: "cyan"
        }
    ];

    const popularBonds = [
        { name: "US 10Y Yield", symbol: "US10Y", trend: "up", price: "4.281%", change: "+0.012", color: "indigo" },
        { name: "US 30Y Yield", symbol: "US30Y", trend: "up", price: "4.412%", change: "+0.008", color: "indigo" },
        { name: "German Bund", symbol: "GER10Y", trend: "down", price: "2.352%", change: "-0.015", color: "purple" },
        { name: "UK Gilt", symbol: "UK10Y", trend: "up", price: "4.012%", change: "+0.021", color: "purple" },
        { name: "Japan JGB", symbol: "JPY10Y", trend: "up", price: "0.742%", change: "+0.005", color: "red" },
        { name: "US 2Y Yield", symbol: "US02Y", trend: "down", price: "4.652%", change: "-0.005", color: "indigo" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-500 mb-1">
                        <Landmark className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fixed Income</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Bond <span className="text-brand-500 italic">Markets</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Trade government and corporate bonds for stable returns.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/bonds"
                    className="flex items-center gap-3 px-6 py-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-lg transition-all group"
                >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Yield Analysis</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Bond Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-brand-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Masterclass</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-brand-500">Bond Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Understand how bonds work, the relationship between yields and prices, and how to incorporate fixed income into your portfolio. Master the yield curve.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-[var(--color-text-primary)] fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            15:45 Duration
                        </div>
                    </div>
                </div>

                {/* What are Bonds Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center text-brand-500">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What are Bonds?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Loan instruments explained</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Bonds are fixed-income securities representing a loan made by an investor to a borrower (government or corporate). They pay periodic interest and return the principal at maturity.
                            </p>

                            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-lg">
                                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-1">Key Concept</span>
                                <p className="text-[10px] text-gray-300 italic">
                                    **Yield vs Price:** Bond prices and yields move inversely. When interest rates rise, bond prices fall, and vice versa. This relationship is crucial for trading bonds.
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

            {/* Types of Bonds */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <PieChart className="h-3 w-3" />
                        Types of Bonds
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {bondTypes.map((type, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg group hover:border-brand-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    type.color === 'indigo' ? "bg-brand-500/20 text-brand-500" :
                                        type.color === 'purple' ? "bg-brand-500/20 text-brand-500" :
                                            "bg-cyan-500/20 text-cyan-500"
                                )}>
                                    <type.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-base font-black text-[var(--color-text-primary)]">{type.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 italic">
                                {type.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {type.assets.map((asset, j) => (
                                    <span key={j} className={cn("px-3 py-1 text-[9px] font-black rounded-lg border",
                                        type.color === 'indigo' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                            type.color === 'purple' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                    )}>
                                        {asset}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Bonds on MMITPS */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingDown className="h-3 w-3" />
                        Popular Bonds on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularBonds.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-brand-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors uppercase">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <Landmark className={cn("h-4 w-4",
                                    item.color === 'indigo' ? "text-brand-500" :
                                        item.color === 'purple' ? "text-brand-500" :
                                            item.color === 'red' ? "text-red-500" : "text-cyan-500"
                                )} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-md font-black text-[var(--color-text-primary)] tracking-tight">{item.price}</div>
                                <div className={cn("text-[10px] font-bold", item.trend === 'up' ? "text-emerald-500" : "text-red-500")}>
                                    {item.change} {item.trend === 'up' ? '↑' : '↓'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-4">
                    <Link
                        href="/dashboard/trading"
                        className="px-8 py-4 bg-brand-600 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] hover:scale-105 transition-all"
                    >
                        Access Fixed Income Desk
                    </Link>
                </div>
            </div>
        </div>
    );
}
