/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Home,
    Building2,
    Key,
    Wallet,
    Building,
    Warehouse,
    Hotel,
    TreePalm,
    TrendingUp,
    Zap,
    Play,
    Info,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Search,
    Coins,
    Gem
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function RealEstatePage() {
    const { t } = useLanguage();

    const stats = [
        { label: "Fractional", desc: "Share Ownership", color: "text-slate-400" },
        { label: "$200", desc: "Minimum Entry", color: "text-emerald-400" },
        { label: "Liquid", desc: "Digital Assets", color: "text-brand-400" },
        { label: "7.2%", desc: "Avg. Yield Index", color: "text-amber-400" },
    ];

    const categories = [
        {
            title: "Residential",
            desc: "Tokenized luxury apartments and multi-family residential complexes.",
            assets: ["Luxury Lofts", "City Central"],
            icon: Home,
            color: "slate"
        },
        {
            title: "Commercial",
            desc: "Invest in high-traffic office spaces and premium retail centers.",
            assets: ["Plaza Tower", "Retail Hub"],
            icon: Building2,
            color: "blue"
        },
        {
            title: "Industrial",
            desc: "Widespread logistics centers, warehouses, and data infrastructure.",
            assets: ["Logi-Hub", "Data Core"],
            icon: Warehouse,
            color: "emerald"
        },
        {
            title: "REITs",
            desc: "Publicly traded real estate investment trusts for diversified exposure.",
            assets: ["O", "AMT", "PLD", "EQIX"],
            icon: Building,
            color: "amber"
        }
    ];

    const popularAssets = [
        { name: "REALTY INCOME", symbol: "O", trend: "up", price: "$52.12", change: "+0.45%", icon: Building, color: "slate" },
        { name: "AMERICAN TOWER", symbol: "AMT", trend: "down", price: "$182.30", change: "-1.12%", icon: Building2, color: "blue" },
        { name: "PROLOGIS INC.", symbol: "PLD", trend: "up", price: "$124.12", change: "+0.85%", icon: Warehouse, color: "emerald" },
        { name: "EQUINIX INC.", symbol: "EQIX", trend: "up", price: "$842.12", change: "+1.24%", icon: Building, color: "amber" },
        { name: "WEYERHAEUSER", symbol: "WY", trend: "up", price: "$34.45", change: "+0.32%", icon: TreePalm, color: "emerald" },
        { name: "PUBLIC STORAGE", symbol: "PSA", trend: "up", price: "$285.12", change: "+0.55%", icon: Warehouse, color: "blue" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Property Markets</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Real <span className="text-slate-500 italic">Estate</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Digital ownership in global property assets.
                    </p>
                </div>
                <Link
                    href="/dashboard/invest/properties"
                    className="flex items-center gap-3 px-6 py-3 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border border-slate-500/20 rounded-lg transition-all group"
                >
                    <Search className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Explore Properties</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Real Estate Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-slate-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-500/5 blur-[100px] rounded-full group-hover:bg-slate-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Future Tech</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">The Future of <span className="text-slate-500">Real Estate</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Discover how blockchain is transforming property ownership through fractional tokenization. Learn how to earn passive rental income without the hassle of property management.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-slate-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(100,116,139,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-[var(--color-text-primary)] fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            14:20 Duration
                        </div>
                    </div>
                </div>

                {/* What is Tokenization Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-slate-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-slate-500/5 blur-[100px] rounded-full group-hover:bg-slate-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-500/20 rounded-lg flex items-center justify-center text-slate-500">
                                    <Coins className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What is Tokenization?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Fractional Property Ownership</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Tokenization breaks down a physical property into digital shares. This allows investors to buy small percentages of high-value assets that were previously inaccessible.
                            </p>

                            <div className="p-4 bg-slate-500/5 border border-slate-500/10 rounded-lg">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Key Advantage</span>
                                <p className="text-[10px] text-gray-300 italic">
                                    **Instant Liquidity:** Unlike traditional real estate which can take months to sell, tokenized assets can be traded instantly on the MMITPS secondary market.
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

            {/* Property Categories */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Gem className="h-3 w-3" />
                        Asset Classifications
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-slate-500/10 rounded-lg group hover:border-slate-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    cat.color === 'slate' ? "bg-slate-500/20 text-slate-500" :
                                        cat.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                            cat.color === 'emerald' ? "bg-emerald-500/20 text-emerald-500" :
                                                "bg-amber-500/20 text-amber-500"
                                )}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <h4 className="text-base font-black text-[var(--color-text-primary)]">{cat.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-6 italic">
                                {cat.desc}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {cat.assets.map((asset, j) => (
                                    <span key={j} className={cn("px-3 py-1 text-[9px] font-black rounded-lg border",
                                        cat.color === 'slate' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                                            cat.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                cat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
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

            {/* Popular RE Assets Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Assets on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularAssets.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-slate-500/10 rounded-lg hover:border-slate-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-slate-500 transition-colors uppercase">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <item.icon className={cn("h-4 w-4",
                                    item.color === 'slate' ? "text-slate-500" :
                                        item.color === 'blue' ? "text-brand-500" :
                                            item.color === 'emerald' ? "text-emerald-500" : "text-amber-500"
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
                        href="/dashboard/invest/portal"
                        className="px-8 py-4 bg-slate-700 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(71,85,105,0.4)] hover:shadow-[0_0_40px_rgba(71,85,105,0.6)] hover:scale-105 transition-all"
                    >
                        Enter Investment Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}
