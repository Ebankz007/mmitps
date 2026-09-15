/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Coins,
    TrendingUp,
    Zap,
    Play,
    Info,
    Clock,
    AlertTriangle,
    ChevronRight,
    ArrowUpRight,
    Gamepad2,
    Database,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export default function CryptoPage() {
    const { t } = useLanguage();

    const stats = [
        { label: "$2.5T+", desc: "Global Market Cap", color: "text-[#10b981]" },
        { label: "24/7", desc: "Trading Hours", color: "text-brand-400" },
        { label: "High", desc: "Market Volatility", color: "text-red-400" },
        { label: "10k+", desc: "Digital Assets", color: "text-brand-400" },
    ];

    const categories = [
        {
            title: "Store of Value",
            desc: "Primary digital gold assets and inflation hedges.",
            assets: ["BTC", "LTC", "BCH"],
            icon: Coins,
            color: "amber"
        },
        {
            title: "Smart Contracts",
            desc: "Programmable blockchains for DeFi and dApps.",
            assets: ["ETH", "SOL", "ADA", "DOT"],
            icon: Database,
            color: "blue"
        },
        {
            title: "Stablecoins",
            desc: "Fiat-pegged assets for liquidity and hedging.",
            assets: ["USDT", "USDC", "DAI"],
            icon: ShieldCheck,
            color: "emerald"
        },
        {
            title: "Meme & Gaming",
            desc: "Community-driven tokens and GameFi assets.",
            assets: ["DOGE", "SHIB", "GALA", "SAND"],
            icon: Gamepad2,
            color: "purple"
        }
    ];

    const popularCryptos = [
        { name: "BITCOIN", symbol: "BTC/USD", trend: "up", price: "$52,241.50", change: "+2.45%", icon: Coins, color: "amber" },
        { name: "ETHEREUM", symbol: "ETH/USD", trend: "up", price: "$2,942.30", change: "+1.12%", icon: Database, color: "blue" },
        { name: "SOLANA", symbol: "SOL/USD", trend: "up", price: "$108.45", change: "+5.12%", icon: Zap, color: "cyan" },
        { name: "RIPPLE", symbol: "XRP/USD", trend: "down", price: "$0.542", change: "-0.85%", icon: ShieldCheck, color: "blue" },
        { name: "CARDANO", symbol: "ADA/USD", trend: "up", price: "$0.612", change: "+0.45%", icon: Database, color: "blue" },
        { name: "DOGECOIN", symbol: "DOGE/USD", trend: "up", price: "$0.084", change: "+1.24%", icon: Gamepad2, color: "amber" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[#10b981] mb-1">
                        <Coins className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cryptocurrency</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Crypto <span className="text-[#10b981] italic">Markets</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Trade Bitcoin, Ethereum, and 100+ digital assets 24/7.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/crypto"
                    className="flex items-center gap-3 px-6 py-3 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/20 rounded-lg transition-all group"
                >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Crypto Trends</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Intro Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Introduction to Crypto Trading Card */}
                <div className="xl:col-span-8 p-8 bg-[#0B1224] border border-[#10b981]/10 rounded-lg relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10b981]/5 blur-[100px] rounded-full group-hover:bg-[#10b981]/10 transition-colors duration-700" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 text-[#10b981] mb-2">
                            <Play className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Video Overview</span>
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)]">Introduction to <span className="text-[#10b981]">Crypto Trading</span></h2>
                        <p className="text-xs text-gray-400 mt-2 max-w-xl italic">
                            Understand blockchain technology, cryptocurrency fundamentals, and how to trade digital assets safely. Learn about DeFi, NFTs, and Web3 ecosystems.
                        </p>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 border border-[var(--color-border)] flex items-center justify-center group/player shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/10 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-700" />

                        <button className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16, 185, 129,0.5)] group-hover/player:scale-110 transition-transform duration-500 z-10">
                            <Play className="h-8 w-8 text-black fill-current ml-1" />
                        </button>

                        <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            14:15 Duration
                        </div>
                    </div>
                </div>

                {/* What is Cryptocurrency Card */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 p-8 bg-[#0B1224] border border-[#10b981]/10 rounded-lg relative overflow-hidden group">
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full group-hover:bg-brand-500/10 transition-colors duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center text-[#10b981]">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)]">What is Crypto?</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Digital asset ecosystems</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                Cryptocurrencies are decentralized digital currencies secured by cryptography. They operate on blockchain technology, offering transparent, borderless, and censorship-resistant transactions.
                            </p>

                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Risk Warning</span>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">
                                    Crypto markets are highly volatile. Prices can swing +/- 10% in minutes. Never invest more than you can afford to lose.
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

            {/* Cryptocurrency Categories */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Coins className="h-3 w-3" />
                        Cryptocurrency Categories
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 bg-[#0B1224] border border-brand-500/10 rounded-lg group hover:border-[#10b981]/30 transition-all duration-500 shadow-xl shadow-black/40">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                    cat.color === 'amber' ? "bg-amber-500/20 text-amber-500" :
                                        cat.color === 'blue' ? "bg-brand-500/20 text-brand-500" :
                                            cat.color === 'emerald' ? "bg-emerald-500/20 text-emerald-500" :
                                                "bg-brand-500/20 text-brand-500"
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
                                            cat.color === 'blue' ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                cat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    "bg-brand-500/10 text-brand-400 border-brand-500/20"
                                    )}>
                                        {asset}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Cryptocurrencies on MMITPS */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Popular Cryptocurrencies on MMITPS
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {popularCryptos.map((item, i) => (
                        <div key={i} className="p-5 bg-[#0B1224] border border-brand-500/10 rounded-lg hover:border-[#10b981]/40 transition-all group cursor-pointer shadow-lg shadow-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="text-[10px] font-black text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors">{item.name}</div>
                                    <div className="text-[11px] font-bold text-gray-500 italic mt-0.5">{item.symbol}</div>
                                </div>
                                <item.icon className={cn("h-4 w-4",
                                    item.color === 'amber' ? "text-amber-500" :
                                        item.color === 'blue' ? "text-brand-500" :
                                            item.color === 'cyan' ? "text-cyan-500" : "text-gray-400"
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
                        className="px-8 py-4 bg-[#10b981] rounded-lg text-xs font-black text-black uppercase tracking-widest shadow-[0_0_30px_rgba(16, 185, 129,0.4)] hover:shadow-[0_0_40px_rgba(16, 185, 129,0.6)] hover:scale-105 transition-all"
                    >
                        Start Trading Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
