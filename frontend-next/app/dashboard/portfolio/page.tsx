/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    TrendingUp,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Globe,
    Shield,
    Layers,
    Activity,
    CreditCard,
    DollarSign,
    Target,
    ArrowRight
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Pie
} from "recharts";
import { clsx } from "clsx";

const MOCK_TOTAL_PERFORMANCE = [
    { name: "Jan", value: 45000 },
    { name: "Feb", value: 52000 },
    { name: "Mar", value: 48000 },
    { name: "Apr", value: 61000 },
    { name: "May", value: 59000 },
    { name: "Jun", value: 75000 },
];

const ASSET_ALLOCATION = [
    { name: "Tokenization Pools", value: 45, color: "#10b981" },
    { name: "MLM Earnings", value: 25, color: "#10B981" },
    { name: "Trading Account", value: 20, color: "#10b981" },
    { name: "Wallet Balance", value: 10, color: "#10b981" },
];

export default function PortfolioPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Executive Summary Header */}
            <div className="bg-surface border border-[var(--color-border)] p-10 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-[#10b981]/5 blur-[100px] rounded-full -mr-40 -mt-20"></div>
                <div className="space-y-4 relative z-10 w-full lg:w-1/2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)]">
                        <TrendingUp className="h-4 w-4 text-[#10b981]" />
                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em]">Asset Consolidation</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight uppercase leading-tight">
                        Total Equity <span className="text-[#10b981]">Intelligence</span>
                    </h1>
                    <div className="flex items-baseline gap-4 mt-8">
                        <span className="text-6xl font-black text-[var(--color-text-primary)] tracking-tighter">$75,420.00</span>
                        <div className="flex items-center gap-2 text-green-500 font-bold text-lg">
                            <ArrowUpRight className="h-6 w-6" />
                            <span>12.4%</span>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium mt-4">Aggregate valuation across all MMITPS ecosystem modules, updated in real-time.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full lg:w-[400px] relative z-10">
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Flux</span>
                        <div className="text-2xl font-black text-[var(--color-text-primary)]">$12,450.00</div>
                    </div>
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Locked Assets</span>
                        <div className="text-2xl font-black text-[var(--color-text-primary)]">$62,970.00</div>
                    </div>
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly ROI</span>
                        <div className="text-2xl font-black text-green-500">+$8,240</div>
                    </div>
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-6 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">MLM Credits</span>
                        <div className="text-2xl font-black text-[#10b981]">2,400 XP</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-8 bg-surface border border-[var(--color-border)] rounded-lg p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-3">
                            <Activity className="h-4 w-4 text-[#10b981]" /> Performance Velocity
                        </h3>
                        <div className="flex items-center gap-2">
                            {["1W", "1M", "3M", "1Y", "ALL"].map((p) => (
                                <button key={p} className={clsx("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", p === "6M" ? "bg-[#10b981] text-black" : "text-gray-600 hover:text-[var(--color-text-primary)]")}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_TOTAL_PERFORMANCE}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", fontSize: "12px" }}
                                    itemStyle={{ color: "#10b981" }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Allocation Pie */}
                <div className="lg:col-span-4 bg-surface border border-[var(--color-border)] rounded-lg p-10 flex flex-col justify-between space-y-8">
                    <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-3">
                        <PieChart className="h-4 w-4 text-[#10b981]" /> Capital Allocation
                    </h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={ASSET_ALLOCATION}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {ASSET_ALLOCATION.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#000", border: "none", borderRadius: "10px", color: "#fff" }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        {ASSET_ALLOCATION.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }}></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{asset.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase">{asset.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Segment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Tokenization Desk", icon: Layers, value: "$33,940", change: "+14.2%", color: "#10b981", sub: "3 Active Pools" },
                    { title: "MLM Commission Hub", icon: Zap, value: "$18,850", change: "+8.9%", color: "#10B981", sub: "Executive Diamond" },
                    { title: "Financial Wallets", icon: Wallet, value: "$22,630", change: "+2.5%", color: "#10b981", sub: "Main + Deposit" },
                ].map((item, idx) => (
                    <div key={idx} className="bg-surface border border-[var(--color-border)] p-8 rounded-lg group hover:border-[var(--color-border)] transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                                <item.icon className="h-6 w-6" style={{ color: item.color }} />
                            </div>
                            <span className="text-green-500 text-[10px] font-black uppercase">{item.change}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.title}</h4>
                        <div className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight leading-tight">{item.value}</div>
                        <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4 border-t border-[var(--color-border)]">
                            <span className="text-gray-700">{item.sub}</span>
                            <button className="text-[#10b981] flex items-center gap-1 hover:translate-x-1 transition-transform">Details <ArrowRight className="h-3 w-3" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategic Actions */}
            <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[#10b981]/10 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 space-y-4 max-w-xl">
                    <div className="w-16 h-16 rounded-lg bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20 mx-auto">
                        <Target className="h-8 w-8 text-[#10b981]" />
                    </div>
                    <h3 className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tight leading-tight">Institutional <span className="text-[#10b981]">Capital</span> Optimization</h3>
                    <p className="text-gray-500 text-sm font-medium">Rebalance your institutional portfolio or Relocate assets within the MMITPS ecosystem for maximum efficiency.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 relative z-10 w-full">
                    <button className="px-12 py-5 bg-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#10b981]/20">
                        Institutional Rebalance
                    </button>
                    <button className="px-12 py-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] transition-all">
                        Asset Relocation
                    </button>
                </div>
                <div className="mt-8 flex items-center justify-center gap-8 relative z-10">
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        <Shield className="h-3 w-3" /> Encrypted Vault
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        <Globe className="h-3 w-3" /> Global Settlement
                    </div>
                </div>
            </div>
        </div>
    );
}
