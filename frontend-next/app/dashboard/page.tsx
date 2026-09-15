/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useAuth } from "@/lib/auth-context";
import { useWallet } from "@/hooks/use-financial";
import { useMLMStats, useMLMNetworkStats } from "@/hooks/use-mlm";
import {
    LayoutDashboard,
    Wallet,
    Network,
    GraduationCap,
    Users,
    Coins,
    Calendar,
    LineChart,
    Bot,
    BookOpen,
    Tv,
    Zap,
    Activity,
    ArrowRightLeft,
    ArrowRight,
    PieChart,
    ShieldCheck,
    Bell,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LivePriceTicker } from "@/components/market/LivePriceTicker";
import { useLanguage } from "@/lib/language-context";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import React from "react";
import TradingViewWidget from "@/components/charts/TradingViewWidget";

export default function DashboardHome() {
    const { user } = useAuth();
    const { data: wallet, isLoading: walletLoading } = useWallet();
    const { data: mlmStats, isLoading: mlmLoading } = useMLMStats();
    const { data: mlmNetwork, isLoading: networkLoading } = useMLMNetworkStats();
    const { t } = useLanguage();
    const [greeting, setGreeting] = useState("goodmorning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("goodmorning");
        else if (hour < 17) setGreeting("goodafternoon");
        else setGreeting("goodevening");
    }, []);

    const userTier = user?.tier || "PRO";

    return (
        <div className="max-w-[1900px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 text-[var(--color-text-primary)] font-sans font-medium animate-in fade-in duration-700">
            {/* 1. Header & User Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/80 backdrop-blur-xl border border-[var(--color-border)] rounded-lg p-6 shadow-2xl">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-black text-[var(--color-text-primary)] shadow-lg shadow-red-500/20">
                            {user?.email?.substring(0, 2).toUpperCase() || "SA"}
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">
                            {t(greeting)}, <span className="text-brand-400 capitalize">{user?.email?.split('@')[0] || "Super!"}</span>
                            <span className="inline-block ml-2 w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(16, 185, 129,0.8)]"></span>
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] ml-14">Welcome to your complete trading command center</p>

                    <div className="flex gap-4 ml-14 mt-2">
                        <Link href="/dashboard/trade-station" className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-[10px] font-bold text-brand-400 hover:bg-brand-500/20 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Trade Station
                        </Link>
                        <Link href="/dashboard/financial/wallet" className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-orange-500/20 rounded-full text-[10px] font-bold text-brand-400 hover:bg-brand-500/20 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                            Wallet
                        </Link>
                        <Link href="/dashboard/genealogy/binary" className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 hover:bg-green-500/20 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Network
                        </Link>
                        <Link href="/dashboard/education" className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-[10px] font-bold text-brand-400 hover:bg-brand-500/20 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                            Academy
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg flex flex-col items-end">
                        <span className="text-xl font-black text-green-400">
                            ${walletLoading ? "..." : (wallet?.totalUSD?.toLocaleString() ?? "24,567")}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">Total Balance</span>
                    </div>
                    <div className="px-4 py-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#10b981]">Gold</span>
                        <span className="text-[8px] uppercase tracking-widest text-[#10b981]/50">Rank</span>
                    </div>
                    <div className="px-4 py-3 bg-brand-500/10 border border-brand-500/20 rounded-lg flex flex-col items-center justify-center min-w-[60px] shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        <span className="text-[10px] uppercase font-black tracking-wider text-brand-400">Pro</span>
                        <span className="text-[8px] uppercase tracking-widest text-brand-400/50">Plan</span>
                    </div>
                </div>
            </div>

            {/* 3. Live TradingView Chart */}
            <div className="rounded-lg border border-[var(--color-border)] bg-surface p-1 shadow-2xl relative z-10 w-full">
                <TradingViewWidget symbol="FX:EURUSD" interval="D" height={500} />
            </div>

            {/* 4. Wallet & Network Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Wallet Summary */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-brand-400" />
                            <h2 className="text-sm font-bold text-gray-200">Wallet Summary</h2>
                        </div>
                        <Link href="/dashboard/financial/wallet" className="px-3 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors text-[var(--color-text-secondary)]">Manage</Link>
                    </div>

                    {/* Balances Row */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-green-400">
                                ${walletLoading ? "..." : (wallet?.availableUSD?.toLocaleString() ?? "12,450")}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1">USD</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-brand-400">
                                {walletLoading ? "..." : (wallet?.cryptoBalances?.find(b => b.symbol === 'BTC')?.amount ?? "0.45")}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1">BTC</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-brand-400">
                                {walletLoading ? "..." : (wallet?.cryptoBalances?.find(b => b.symbol === 'ETH')?.amount ?? "2.0")}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1">ETH</span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/financial/deposit" className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest text-[11px] rounded-lg transition-all">
                            Deposit
                        </Link>
                        <Link href="/dashboard/financial/payout" className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-[11px] rounded-lg transition-all">
                            Withdraw
                        </Link>
                    </div>
                </div>

                {/* Network Summary */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-green-400" />
                            <h2 className="text-sm font-bold text-gray-200">Network Summary</h2>
                        </div>
                        <Link href="/dashboard/genealogy/binary" className="px-3 py-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors text-[var(--color-text-secondary)]">View All</Link>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Leg Volumes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex flex-col justify-between">
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mb-1">Left Leg</span>
                                <div className="flex items-end justify-between">
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                        {mlmLoading ? "..." : (mlmNetwork?.stats?.leftMembers ?? 42)} Members
                                    </span>
                                    <span className="text-lg font-black text-cyan-400">
                                        ${mlmLoading ? "..." : (mlmNetwork?.stats?.leftLegVolume?.toLocaleString() ?? "42,200")}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex flex-col justify-between">
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mb-1">Right Leg</span>
                                <div className="flex items-end justify-between">
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                        {mlmLoading ? "..." : (mlmNetwork?.stats?.rightMembers ?? 24)} Members
                                    </span>
                                    <span className="text-lg font-black text-pink-400">
                                        ${mlmLoading ? "..." : (mlmNetwork?.stats?.rightLegVolume?.toLocaleString() ?? "18,750")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Volume */}
                        <div className="flex items-center justify-between p-4 bg-[#10b981]/5 border border-[#10b981]/20 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-[#10b981]">
                                    ${mlmLoading ? "..." : (((mlmNetwork?.stats?.leftLegVolume ?? 0) + (mlmNetwork?.stats?.rightLegVolume ?? 0)).toLocaleString())}
                                </span>
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">Total Volume</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-base font-black text-[#10b981]">
                                    {mlmStats?.currentRank || user?.rank || "Bronze"}
                                </span>
                                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">Current Rank</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 6. Platform Ecosystem (Copy Trading, Token Pools, Academy) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Copy Trading */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-400" />
                            <h2 className="text-sm font-bold text-gray-200">Copy Trading</h2>
                        </div>
                        <Link href="/dashboard/resources/copy-trading" className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">Manage</Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-cyan-400">120</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Copied Traders</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-green-400">+32.5%</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Avg Monthly ROI</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">TT</div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">TopTraders_Inc</span>
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest">Master Bot</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-black">FX</div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">FX_Master</span>
                                    <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest">Elite Tier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Token Pools */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl flex flex-col justify-between" >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-pink-400" />
                            <h2 className="text-sm font-bold text-gray-200">Token Pools</h2>
                        </div>
                        <Link href="/dashboard/resources/token-pool/all" className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">Stake Now</Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-pink-400">$3.4M</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Total Value Locked</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-green-400">18.5%</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Average APY</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex flex-col justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-pink-500"></div>
                            <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Base Alpha Pool</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 w-[68%] rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                            <span>$1.2M Staked</span>
                            <span className="text-pink-400">68.0% APR</span>
                        </div>
                    </div>
                </div>

                {/* Academy */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl flex flex-col justify-between" >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-[#10b981]" />
                            <h2 className="text-sm font-bold text-gray-200">Academy</h2>
                        </div>
                        <Link href="/dashboard/education" className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">Continue</Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-[#10b981]">45</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Courses</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-cyan-400">125</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Videos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                            <span className="text-xl font-black text-green-400">30%</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest mt-1 text-center">Progress</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex flex-col justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-[#10b981]"></div>
                            <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Technical Analysis</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                            <div className="h-full bg-[#10b981] w-[45%] rounded-full shadow-[0_0_10px_rgba(16, 185, 129,0.8)]"></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-[var(--color-text-secondary)] uppercase">
                            <span>Module 3 of 10</span>
                            <span className="text-[#10b981]">45%</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 7. Platform Features & Quick Actions */}
            <div className="space-y-4" >
                <div className="flex items-center gap-2 mb-2">
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    <h2 className="text-sm font-bold text-gray-200">Platform Features</h2>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
                    { [
                        { title: 'Trade Station', icon: LayoutDashboard, color: 'text-brand-400', desc: 'Centralized workspace', href: '/dashboard/trade-station' },
                        { title: 'News Calendar', icon: Calendar, color: 'text-red-400', desc: 'Fundamental events', href: '/dashboard/resources/news-calendar' },
                        { title: 'COT Data', icon: LineChart, color: 'text-green-400', desc: 'Institutional flow', href: '/dashboard/resources/cot' },
                        { title: 'AI Agent', icon: Bot, color: 'text-brand-400', desc: 'Smart analysis', href: '/dashboard/resources/ai-agent' },
                        { title: 'Trade Journal', icon: BookOpen, color: 'text-brand-400', desc: 'Track metrics', href: '/dashboard/resources/trade-journal' },
                        { title: 'HFT Botting', icon: Zap, color: 'text-yellow-400', desc: 'Algo Trading', href: '/dashboard/resources/hft-botting' },
                        { title: 'Live Stream', icon: Tv, color: 'text-cyan-400', desc: 'With the makers', href: '/dashboard/resources/live-stream' },
                        { title: 'Community', icon: Users, color: 'text-pink-400', desc: 'Global network', href: '/dashboard/social' },
                    ].map((feature, i) => (
                        <Link href={feature.href} key={i} className="min-w-[140px] bg-surface border border-[var(--color-border)] rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] cursor-pointer transition-colors snap-start shadow-lg">
                            <feature.icon className={`w-6 h-6 ${feature.color} mb-1`} />
                            <span className="text-[11px] font-bold text-gray-200 text-center">{feature.title}</span>
                            <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest text-center">{feature.desc}</span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    <Link href="/dashboard/trade-station" className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-brand-500/20 transition-colors flex items-center gap-2">
                        <ArrowRightLeft className="w-3 h-3" /> Trade Station
                    </Link>
                    <Link href="/dashboard/resources/news-calendar" className="px-4 py-2 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-[#10b981]/20 transition-colors flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> News Calendar
                    </Link>
                    <Link href="/dashboard/resources/cot" className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-green-500/20 transition-colors flex items-center gap-2">
                        <LineChart className="w-3 h-3" /> COT Data
                    </Link>
                    <Link href="/dashboard/resources/ai-agent" className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-brand-500/20 transition-colors flex items-center gap-2">
                        <Bot className="w-3 h-3" /> AI Agent
                    </Link>
                    <Link href="/dashboard/resources/token-pool/all" className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-pink-500/20 transition-colors flex items-center gap-2">
                        <Coins className="w-3 h-3" /> Token Pools
                    </Link>
                    <Link href="/dashboard/resources/copy-trading" className="px-4 py-2 bg-brand-500/10 border border-orange-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-brand-500/20 transition-colors flex items-center gap-2">
                        <Users className="w-3 h-3" /> Copy Trading
                    </Link>
                    <Link href="/dashboard/support/help-center" className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-red-500/20 transition-colors flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Smart Contract
                    </Link>
                    <Link href="/dashboard/financial/wallet" className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-cyan-500/20 transition-colors flex items-center gap-2">
                        <PieChart className="w-3 h-3" /> View Portfolio
                    </Link>
                </div>
                {/* 8. Recent Activity & Announcements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Activity */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <h2 className="text-sm font-bold text-gray-200">Recent Activity</h2>
                            </div>
                            <Link href="/dashboard/financial/history" className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">View History</Link>
                        </div>
                        <div className="space-y-2">
                            {[
                                { title: 'Deposit Confirmed', desc: '+500 USDT via TRC20', time: '2m ago', icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { title: 'New Referral Joined', desc: 'john.doe@example.com', time: '1h ago', icon: Network, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                                { title: 'Course Completed', desc: 'HFT Trading Anatomy', time: '3h ago', icon: GraduationCap, color: 'text-[#10b981]', bg: 'bg-[#10b981]/10' },
                                { title: 'Bot Trade Closed', desc: '+12.50 pips on EUR/USD', time: '5h ago', icon: Bot, color: 'text-brand-400', bg: 'bg-brand-500/10' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg transition-colors hover:bg-white/[0.04]">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-200">{item.title}</span>
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">{item.desc}</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-red-400" />
                                <h2 className="text-sm font-bold text-gray-200">Announcements</h2>
                            </div>
                            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">3 New</span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { tag: 'HOT', tagColor: 'text-red-400 bg-red-500/10 border-red-500/20', title: 'HFT Trading Base Beta Released!', desc: 'Access the new HFT botting dashboard. Exclusive to Pro+ tiers.' },
                                { tag: 'INFO', tagColor: 'text-brand-400 bg-brand-500/10 border-brand-500/20', title: 'Crypto Payments Now Live', desc: 'Deposit and withdraw using BTC, ETH, USDT across multiple chains.' },
                                { tag: 'UPDATE', tagColor: 'text-green-400 bg-green-500/10 border-green-500/20', title: 'Creative Academy Launched', desc: '45 courses, 125 videos, and 3 learning tracks now available.' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg transition-colors hover:bg-white/[0.04] cursor-pointer group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${item.tagColor}`}>{item.tag}</span>
                                        <span className="font-bold text-sm text-gray-200 group-hover:text-[var(--color-text-primary)] transition-colors">{item.title}</span>
                                    </div>
                                    <span className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 9. Full Width Payment Methods (Optimized Visibility) */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-xl space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#10b981]" />
                            <h2 className="text-sm font-bold text-gray-200">Available Payment Methods</h2>
                        </div>
                        <Link href="/dashboard/financial/deposit" className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">Deposit Now</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
                        {PAYMENT_METHODS.map((method) => (
                            <Link 
                                key={method.id}
                                href={`/dashboard/financial/deposit?method=${method.id}`}
                                className="min-w-[240px] flex flex-col p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg hover:bg-white/[0.05] hover:border-[var(--color-border)] transition-all cursor-pointer snap-start group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${method.iconBg} ${method.iconColor}`}>
                                        {React.cloneElement(method.icon as any, { className: "w-5 h-5" })}
                                    </div>
                                    <span className="font-black text-[var(--color-text-primary)] text-xs truncate">{method.name}</span>
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-1 mb-3">{method.desc}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {method.badges.map((b, i) => (
                                            <span key={i} className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${b.color}`}>
                                                {b.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                                    <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold">Details</span>
                                    <ArrowRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 10. Footer Widgets (Status, Progress) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                </div>

            </div>
        </div>
    );
}

const ChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
);

