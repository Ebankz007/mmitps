"use client";

import React, { useState } from "react";
import {
    Activity,
    ShieldCheck,
    Maximize2,
    MousePointer2,
    Compass,
    ShieldAlert
} from "lucide-react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line
} from "recharts";
import { useGeometryScan, useConfluenceScore } from "@/hooks/use-geometry";
import { ALL_ASSETS } from "@/lib/constants/instruments";
import { WatchlistPanel } from "@/components/shared/WatchlistPanel";
import MarketScannerChart from "@/components/charts/MarketScannerChart";
export default function GeometryProMaxPage() {
    const [selectedMarket, setSelectedMarket] = useState("Gold");
    const [timeframe, setTimeframe] = useState("1h");
    const { data: scanResult, isLoading: scanLoading } = useGeometryScan(selectedMarket, timeframe, ["harmonic", "structure"]);
    void scanResult; void scanLoading;
    const { data: confluence } = useConfluenceScore(selectedMarket);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border border-[var(--color-border)] rounded-lg p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <Activity className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Formation Engine</span>
                    </div>
                    <h1 className="text-5xl font-black leading-tight tracking-tight uppercase">
                        Geometry <span className="text-amber-500">Intelligence</span> Pro Max
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                        Institutional formation scanner identifying high-probability Harmonic patterns and dynamic structural shifts.
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
                                {ALL_ASSETS.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Scanning Period</label>
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

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Col: Patterns & Scan Results */}
                <div className="space-y-8 xl:col-span-1">
                    <WatchlistPanel moduleName="Geometry Pro Max" />
                    
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-gray-500">Detected Formations</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Bullish Bat", type: "Harmonic", conf: 92, status: "Active" },
                                { name: "BOS (CHoCH)", type: "Structural", conf: 88, status: "Pending" },
                                { name: "Descending Wedge", type: "Classic", conf: 75, status: "Active" }
                            ].map((pattern, i) => (
                                <div key={i} className="group p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:border-amber-500/40 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2 text-[10px] font-black uppercase">
                                        <span className="text-amber-500/70 tracking-widest">{pattern.type}</span>
                                        <span className="text-green-500 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">{pattern.conf}% CONF</span>
                                    </div>
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-amber-400 transition-colors uppercase tracking-tight">{pattern.name}</h4>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{pattern.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-gray-500">Confluence Profile</h3>
                        {confluence && (
                            <div className="space-y-6">
                                <div className="text-center p-10 bg-black/40 rounded-lg border border-[var(--color-border)] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-all" />
                                    <p className="text-gray-500 text-[10px] font-black uppercase mb-2 relative z-10 tracking-[0.2rem]">TradeSeeker™ Score</p>
                                    <p className="text-6xl font-black text-[var(--color-text-primary)] relative z-10 tracking-tighter">{confluence.score}</p>
                                    <p className="text-[10px] font-black text-amber-500 relative z-10 mt-2 uppercase tracking-widest px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 inline-block">High Probability</p>
                                </div>
                                <div className="space-y-3 px-2">
                                    {confluence.factors.map((f: { name: string, contribution: number }, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-gray-500">{f.name}</span>
                                            <span className="text-[var(--color-text-primary)] font-mono">+{f.contribution}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Interactive Charting */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 h-[650px] flex flex-col relative overflow-hidden transition-all hover:border-amber-500/20">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(16, 185, 129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">XABCD Overlay</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(16, 185, 129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Pitchfork Analysis</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all"><Maximize2 size={18} /></button>
                                <button className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all"><MousePointer2 size={18} /></button>
                            </div>
                        </div>

                        {/* Optimized Market Geometry Chart */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent pointer-events-none" />

                            <MarketScannerChart 
                                data={Array.from({ length: 100 }).map((_, i) => {
                                    const base = 2800 + Math.sin(i / 10) * 50;
                                    // Use unix timestamps in seconds, unique for each index
                                    const time = Math.floor(Date.now() / 1000) - (100 - i) * 3600;
                                    return {
                                        time,
                                        open: base + Math.random() * 5,
                                        high: base + 10 + Math.random() * 5,
                                        low: base - 5 - Math.random() * 5,
                                        close: base + 2 + Math.random() * 5,
                                    };
                                })}
                                height={500}
                                className="z-10"
                            />

                            {/* SVG Geometric Overlays maintained for advanced pattern visualization */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-60">
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Harmonic Pattern Example (Bullish Bat) */}
                                <polygon points="100,400 200,200 300,320 400,100 500,400"
                                    fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8,4" filter="url(#glow)" />

                                {['X', 'A', 'B', 'C', 'D'].map((p, i) => (
                                    <g key={p}>
                                        <circle cx={100 + i * 100} cy={[400, 200, 320, 100, 400][i]} r="4" fill="#10b981" filter="url(#glow)" />
                                        <text x={110 + i * 100} y={[420, 190, 310, 90, 420][i]} fill="#10b981" fontSize="14" fontWeight="900" style={{ fontFamily: 'sans-serif' }}>{p}</text>
                                    </g>
                                ))}

                                <text x="510" y="420" fill="#10b981" fontSize="10" fontWeight="900" className="uppercase tracking-widest">Potential Reversal Zone (PRZ)</text>

                                {/* Median Line Pitchfork */}
                                <g opacity="0.4">
                                    <line x1="50" y1="500" x2="600" y2="100" stroke="#10b981" strokeWidth="2.5" filter="url(#glow)" />
                                    <line x1="50" y1="500" x2="600" y2="20" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" />
                                    <line x1="50" y1="500" x2="600" y2="180" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" />
                                </g>
                            </svg>

                            {/* PRZ Highlighting */}
                            <div className="absolute top-[360px] left-[480px] w-32 h-32 bg-amber-500/5 border border-amber-500/20 rounded-full blur-[40px] animate-pulse" />
                        </div>
                    </div>

                    {/* Institutional Setup Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-green-500" size={24} />
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text-primary)]">Execution Parameters</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">PRZ Level (D)</p>
                                    <p className="text-2xl font-black text-[var(--color-text-primary)]">$2,842.50</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Stop Loss (X)</p>
                                    <p className="text-2xl font-black text-red-500">$2,810.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Target 1 (0.382)</p>
                                    <p className="text-2xl font-black text-green-500">$2,895.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Target 2 (0.618)</p>
                                    <p className="text-2xl font-black text-green-400">$2,945.00</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <Compass className="text-amber-500" size={24} />
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text-primary)]">Strategic Bias</h3>
                            </div>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                The Bullish Bat pattern aligns with the recent <span className="text-[var(--color-text-primary)] font-black text-xs uppercase tracking-tight px-2 py-0.5 bg-[var(--color-surface-2)] rounded-md border border-[var(--color-border)] mx-1">CHoCH</span> structural shift on the 4H timeframe. Price is testing the 0.886 retracement level within a long-term median line support zone.
                            </p>
                            <div className="flex items-center justify-between p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group hover:border-amber-500/30 transition-all">
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                    <ShieldAlert size={18} className="text-amber-500" />
                                    RR Ratio: 1:3.4
                                </div>
                                <button className="px-6 py-3 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/10">
                                    Apply to Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
