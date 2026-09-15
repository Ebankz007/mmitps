/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Hammer,
    Pickaxe,
    Sprout,
    Zap,
    Play,
    Info,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    HardHat,
    Flame,
    Droplets,
    Wind
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function CommoditiesPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "$20T+", desc: "Global Market", color: "text-amber-400" },
        { label: "100+", desc: "Active Assets", color: "text-brand-400" },
        { label: "High", desc: "Inflation Hedge", color: "text-emerald-400" },
        { label: "24/5", desc: "Trading Hours", color: "text-brand-400" },
    ];

    const categories = [
        {
            title: "Precious Metals",
            desc: "Gold, Silver, Platinum, Palladium. Primary store of value assets.",
            assets: ["GOLD", "SILVER", "PLATINUM", "PALLADIUM"],
            icon: Pickaxe,
            color: "amber"
        },
        {
            title: "Energy",
            desc: "Crude Oil, Natural Gas, Heating Oil. Global industrial drivers.",
            assets: ["CRUDE OIL", "NATURAL GAS", "HEATING OIL"],
            icon: Flame,
            color: "orange"
        },
        {
            title: "Industrial Metals",
            desc: "Copper, Aluminum, Zinc, Nickel. Essential for global construction.",
            assets: ["COPPER", "ALUMINUM", "ZINC", "NICKEL"],
            icon: HardHat,
            color: "blue"
        },
        {
            title: "Agriculture",
            desc: "Wheat, Corn, Soybeans, Coffee. Global food supply foundations.",
            assets: ["WHEAT", "CORN", "SOYBEANS", "COFFEE"],
            icon: Sprout,
            color: "emerald"
        }
    ];

    const popularCommodities = [
        { name: "GOLD", symbol: "XAU/USD", trend: "up", price: "$2,034.12", change: "+0.45%", icon: Pickaxe, color: "amber" },
        { name: "SILVER", symbol: "XAG/USD", trend: "up", price: "$22.84", change: "+1.12%", icon: Pickaxe, color: "blue" },
        { name: "CRUDE OIL", symbol: "WTI", trend: "down", price: "$78.21", change: "-0.34%", icon: Flame, color: "orange" },
        { name: "NATURAL GAS", symbol: "NATGAS", trend: "up", price: "$1.842", change: "+2.15%", icon: Droplets, color: "blue" },
        { name: "COPPER", symbol: "HG", trend: "up", price: "$3.842", change: "+0.87%", icon: HardHat, color: "gray" },
        { name: "WHEAT", symbol: "WHEAT", trend: "down", price: "$5.742", change: "-1.21%", icon: Sprout, color: "emerald" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                        <Hammer className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Commodities</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Commodity <span className="text-amber-500 italic">Markets</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Trade precious metals, energy, and agricultural products.
                    </p>
                </div>
                <Link
                    href="/dashboard/resources/cot/pro-max"
                    className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-all group"
                >
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Pricing Intelligence</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Commodities Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-amber-500/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Video Overview</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-amber-500">Commodities</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Understand how commodity markets work, what drives prices, and how to trade metals, energy, and agricultural products.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16, 185, 129,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-[var(--color-text-primary)] fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            15:20 Duration
                        </div>
                    </div>
                </div>

                {/* What are Commodities Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-amber-500/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                                    <Hammer className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What are Commodities?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Raw materials and primary goods</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Commodities are basic goods used by consumers that are interchangeable with other goods of the same type. They are divided into hard commodities (natural resources) and soft commodities (agricultural products).
                            </p>

                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Key Insight</span>
                                <p className="text-[11px] text-gray-300 italic">
                                    Commodity prices are driven by supply/demand, geopolitical events, weather patterns, and currency fluctuations. They often move inversely to the US Dollar.
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

            {/* Commodity Categories */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Pickaxe className="h-3 w-3" />
                        Commodity Categories
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-amber-500/10 rounded-lg group hover:border-amber-500/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    cat.color === 'amber' ? "bg-amber-500/20 text-amber-500" :
                                        cat.color === 'orange' ? "bg-brand-500/20 text-brand-500" :
                                            cat.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                                "bg-emerald-500/20 text-emerald-500"
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
                                        cat.color === 'amber' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            cat.color === 'orange' ? "bg-brand-500/10 text-brand-400 border-orange-500/20" :
                                                cat.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    )}>
                                        {asset}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Commodities on MMITPS */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Popular Commodities on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularCommodities.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-amber-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-amber-500 transition-colors">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <item.icon className={cn("h-4 w-4",
                                    item.color === 'amber' ? "text-amber-500" :
                                        item.color === 'orange' ? "text-brand-500" :
                                            item.color === 'blue' ? "text-brand-500" :
                                                item.color === 'emerald' ? "text-emerald-500" : "text-gray-400"
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
                        href="/dashboard/resources/cot/pro-max"
                        className="px-8 py-4 bg-amber-500 rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest shadow-[0_0_30px_rgba(16, 185, 129,0.4)] hover:shadow-[0_0_40px_rgba(16, 185, 129,0.6)] hover:scale-105 transition-all"
                    >
                        Explore Advanced Analytics
                    </Link>
                </div>
            </div>
        </div>
    );
}
