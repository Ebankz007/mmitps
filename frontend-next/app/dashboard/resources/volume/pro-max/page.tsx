"use client";

import React, { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    ShieldAlert,
    Layers,
    PieChart,
    Zap,
    Target,
    FileText
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine,
    Cell,
    Pie,
    PieChart as RechartsPieChart
} from "recharts";
import { useVolumeMomentum, useOpenInterest } from "@/hooks/use-volume";
import { useSeasonality } from "@/hooks/use-seasonality";
import { clsx } from "clsx";

// Mock Heatmap Data for the Matrix
const MOCK_CORRELATION = [
    { name: 'EUR/USD', 'EUR/USD': 1.0, 'Gold': -0.23, 'Silver': -0.18, 'S&P500': 0.45, 'BTC': 0.12 },
    { name: 'Gold', 'EUR/USD': -0.23, 'Gold': 1.0, 'Silver': 0.89, 'S&P500': -0.34, 'BTC': 0.56 },
    { name: 'Silver', 'EUR/USD': -0.18, 'Gold': 0.89, 'Silver': 1.0, 'S&P500': -0.28, 'BTC': 0.48 },
    { name: 'S&P500', 'EUR/USD': 0.45, 'Gold': -0.34, 'Silver': -0.28, 'S&P500': 1.0, 'BTC': 0.23 },
    { name: 'BTC', 'EUR/USD': 0.12, 'Gold': 0.56, 'Silver': 0.48, 'S&P500': 0.23, 'BTC': 1.0 },
];

export default function VolumeProMaxPage() {
    const [selectedMarket, setSelectedMarket] = useState("Gold");
    const [timeframe, setTimeframe] = useState("1h");

    const { useMarkets } = useSeasonality();
    const { data: marketList } = useMarkets();
    const { data: momentum, isLoading: momentumLoading } = useVolumeMomentum(selectedMarket, timeframe);
    const { data: oi } = useOpenInterest(selectedMarket);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border border-[var(--color-border)] rounded-lg p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Institutional Hub</span>
                    </div>
                    <h1 className="text-5xl font-black leading-tight tracking-tight uppercase">
                        Volume <span className="text-amber-500">Intelligence</span> Pro Max
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                        Detect early smart money shifts using institutional tick volume proxies and multi-asset Open Interest analysis.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col gap-4 w-full lg:w-80">
                    <div className="bg-black/40 backdrop-blur-3xl border border-[var(--color-border)] p-6 rounded-lg space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Market Selector</label>
                            <select
                                value={selectedMarket}
                                onChange={(e) => setSelectedMarket(e.target.value)}
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 appearance-none"
                            >
                                {marketList?.markets?.map((m: string) => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Analysis Timeframe</label>
                            <div className="flex bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] p-1">
                                {["15m", "1h", "4h", "D"].map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${timeframe === tf ? "bg-amber-500 text-black shadow-lg shadow-brand-500/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                                            }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Module 1: Volume Momentum */}
                <div className="lg:col-span-2 bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8 relative overflow-hidden group transition-all hover:border-amber-500/20">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <BarChart3 size={200} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <TrendingUp className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Volume Momentum & Z-Score</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detecting Abnormal Accumulation Intensity</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-[var(--color-surface-2)] rounded-lg p-6 border border-[var(--color-border)]">
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Volume ROC</p>
                            <div className={`text-4xl font-black tracking-tighter ${(momentum?.roc ?? 0) > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                                {momentumLoading ? "---" : `${momentum?.roc.toFixed(2)}%`}
                            </div>
                        </div>
                        <div className="bg-[var(--color-surface-2)] rounded-lg p-6 border border-[var(--color-border)]">
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Volume Z-Score</p>
                            <div className="flex items-center gap-3">
                                <div className={`text-4xl font-black tracking-tighter ${(momentum?.z_score ?? 0) > 2 ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {momentumLoading ? "---" : momentum?.z_score.toFixed(2)}
                                </div>
                                {(momentum?.z_score ?? 0) > 2 && (
                                    <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/30">
                                        <ShieldAlert className="text-amber-500 animate-pulse" size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-[var(--color-surface-2)] rounded-lg p-6 border border-[var(--color-border)]">
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Market Absorption</p>
                            <div className="text-3xl font-black text-[var(--color-text-primary)] capitalize tracking-tight">
                                {momentumLoading ? "---" : momentum?.status}
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{ v: 10 }, { v: 25 }, { v: 60 }, { v: 45 }, { v: 80 }, { v: 95 }, { v: 70 }, { v: 65 }, { v: 120 }]}>
                                <defs>
                                    <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis hide />
                                <YAxis hide domain={[0, 150]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#volGradient)" />
                                <ReferenceLine y={90} stroke="#10b981" strokeDasharray="8 8" label={{ value: 'ACCUMULATION THRESHOLD', fill: '#10b981', fontSize: 10, fontWeight: 'bold', position: 'insideTopLeft' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Module 2: Open Interest (Adaptive) */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8 transition-all hover:border-brand-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                                <PieChart className="text-brand-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Open Interest</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Future Participation Flow</p>
                            </div>
                        </div>
                        {oi && <div className="text-[10px] bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full border border-brand-500/30 uppercase font-black tracking-widest">Active</div>}
                    </div>

                    {!oi ? (
                        <div className="flex flex-col items-center justify-center h-[400px] space-y-6 text-center bg-[var(--color-surface-2)] rounded-lg border border-dashed border-[var(--color-border)]">
                            <ShieldAlert className="text-gray-700" size={64} />
                            <div className="space-y-2">
                                <p className="text-gray-400 text-sm font-bold">OI data unavailable for <span className="text-[var(--color-text-primary)]">{selectedMarket} (Spot)</span></p>
                                <p className="text-gray-600 text-[10px] uppercase font-black tracking-wider px-8">Participation metrics are restricted to Futures/Options and Perpetual market types.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Total OI</p>
                                    <div className="text-3xl font-black text-[var(--color-text-primary)] truncatetracking-tighter">{(oi.current_oi / 1000).toFixed(1)}K</div>
                                </div>
                                <div className="p-6 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">24h Shift</p>
                                    <div className={`text-3xl font-black tracking-tighter ${oi.change_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {oi.change_24h > 0 ? '+' : ''}{oi.change_24h}%
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-brand-500/5 border border-brand-500/10 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-brand-400">
                                    <Zap size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Institutional Signal</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight leading-none">{oi.signal.replace('_', ' ')}</div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{oi.description}</p>
                                </div>
                            </div>

                            <div className="h-[200px] flex items-center justify-center relative">
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-black text-[var(--color-text-primary)] leading-none">High</span>
                                    <span className="text-[10px] font-black text-brand-500 uppercase">Intensity</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={[{ name: 'OI', value: 75 }, { name: 'Other', value: 25 }]}
                                            innerRadius={70}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="rgba(255,255,255,0.05)" />
                                        </Pie>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Module 3: Correlation Matrix Heatmap */}
                <div className="lg:col-span-3 bg-surface border border-[var(--color-border)] rounded-lg p-12 space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                            <Layers className="text-brand-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Intermarket Volumetric Matrix</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-Time Volume Correlation & Sector Divergence Map</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-left border-separate border-spacing-2">
                            <thead>
                                <tr>
                                    <th className="p-4 text-gray-600 text-[10px] uppercase font-black tracking-[0.2em]">Asset</th>
                                    {MOCK_CORRELATION[0] && Object.keys(MOCK_CORRELATION[0]).filter(k => k !== 'name').map(k => (
                                        <th key={k} className="p-4 text-gray-600 text-[10px] uppercase font-black tracking-[0.2em] text-center">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_CORRELATION.map((row) => (
                                    <tr key={row.name} className="group">
                                        <td className="p-6 font-black text-[var(--color-text-primary)] uppercase text-xs tracking-tighter bg-[var(--color-surface-2)] rounded-lg group-hover:bg-[var(--color-surface-3)] transition-all">{row.name}</td>
                                        {Object.keys(row).filter(k => k !== 'name').map((k) => {
                                            const val = row[k as keyof typeof row] as number;
                                            const opacity = Math.abs(val);
                                            const isPositive = val > 0;
                                            return (
                                                <td key={k} className="p-1">
                                                    <div
                                                        className={clsx(
                                                            "h-16 w-full flex items-center justify-center rounded-lg text-xs font-black font-mono transition-all",
                                                            val === 1.0 ? "text-gray-700 bg-[var(--color-surface-2)]" : isPositive ? "text-green-500" : "text-red-500"
                                                        )}
                                                        style={{ backgroundColor: val === 1.0 ? 'rgba(255,255,255,0.02)' : `rgba(${isPositive ? '34, 197, 94' : '239, 68, 68'}, ${opacity * 0.2})` }}
                                                    >
                                                        {val.toFixed(2)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Institutional Insights Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
                {[
                    { icon: Target, label: "Volume Order Blocks", value: "3 Active", color: "text-amber-500" },
                    { icon: Zap, label: "TradeSeeker™ Alerts", value: "High Intensity", color: "text-amber-500" },
                    { icon: ShieldAlert, label: "Market Volatility", value: "Elevated (88%)", color: "text-red-500" },
                    { icon: FileText, label: "COT Positioning", value: "Extreme Long", color: "text-brand-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center gap-6 group hover:border-[var(--color-border)] transition-all">
                        <div className={clsx("p-4 bg-[var(--color-surface-2)] rounded-lg transition-transform group-hover:scale-110", stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest leading-none">{stat.label}</p>
                            <p className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
