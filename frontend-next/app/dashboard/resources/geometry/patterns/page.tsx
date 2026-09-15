"use client";

import React, { useState } from "react";
import {
    Activity,
    ShieldCheck,
    Maximize2,
    MousePointer2,
    Compass,
    ShieldAlert,
    BarChart3
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
import { ALL_ASSETS } from "@/lib/constants/instruments";
import { WatchlistPanel } from "@/components/shared/WatchlistPanel";
import { useNotifications } from "@/hooks/use-notifications";
import MarketScannerChart from "@/components/charts/MarketScannerChart";

// Comprehensive lists of requested patterns
const CHART_PATTERNS = [
    "Rising Wedge", "Falling Wedge", "Inverted Flag", "Symmetrical Triangle", 
    "Head & Shoulder", "Inverted Head & Shoulder", "Cup & Handle", 
    "Descending Triangle", "Ascending Triangle", "Bullish Rectangle", "Bearish Rectangle"
];

const BULLISH_CANDLES = [
    "Hammer", "Inverted Hammer", "Bullish Engulfing", "Piercing Line", 
    "Morning Star", "Three White Soldiers", "Bullish Harami", "Bullish Marubozu", 
    "Dragonfly Doji", "Bullish Kicker", "Bullish Abandoned Baby", "Spinning Top White"
];

const BEARISH_CANDLES = [
    "Hanging Man", "Shooting Star", "Bearish Engulfing", "Dark Cloud Cover", 
    "Evening Star", "Three Black Crows", "Bearish Harami", "Bearish Marubozu", 
    "Gravestone Doji", "Bearish Kicker", "Bearish Abandoned Baby", "Spinning Top Black"
];

// Detailed pattern information for the library
const PATTERN_DETAILS: Record<string, { type: string; psychology: string; accuracy: number; context: string }> = {
    "Bullish Engulfing": {
        type: "Candlestick",
        psychology: "Complete shift in sentiment. Buyers overwhelmed sellers in a single period, engulfing the prior range.",
        accuracy: 92,
        context: "Most powerful when occurring at structural support after a sustained downtrend."
    },
    "Head & Shoulder": {
        type: "Reversal",
        psychology: "Failure to make a new high followed by a break of the 'neckline' support, indicating exhaustion of the trend.",
        accuracy: 88,
        context: "Look for high volume on the left shoulder and decreasing volume on the head and right shoulder."
    },
    "Falling Wedge": {
        type: "Wedge",
        psychology: "Slowing downward momentum with narrowing price action. Indicates sellers are losing control.",
        accuracy: 82,
        context: "Focus on the breakout of the upper resistance line for a high-probability long entry."
    },
    "Rising Wedge": {
        type: "Wedge",
        psychology: "Slowing upward momentum within narrowing boundaries. Usually leads to a sharp breakdown.",
        accuracy: 78,
        context: "A classic bearish reversal pattern often found in overextended rallies."
    },
    "Cup & Handle": {
        type: "Continuation",
        psychology: "A period of consolidation following a strong rally. The 'handle' is the final shakeout before the next leg up.",
        accuracy: 94,
        context: "Institutional accumulation pattern. Handle should not retrace more than 50% of the cup depth."
    }
};

// Temporary Mock Hook for Pattern Feed
function usePatternScan(market: string, timeframe: string) {
    const mockPatterns = [
        { name: "Bullish Engulfing", type: "Candlestick", bias: "Bullish", conf: 92, status: "Active" },
        { name: "Falling Wedge", type: "Wedge", bias: "Bullish", conf: 82, status: "Active" },
        { name: "Head & Shoulders", type: "Reversal", bias: "Bearish", conf: 88, status: "Pending" },
        { name: "Inverted Flag", type: "Continuation", bias: "Bearish", conf: 76, status: "Active" },
        { name: "Morning Star", type: "Candlestick", bias: "Bullish", conf: 81, status: "Pending" },
        { name: "Ascending Triangle", type: "Triangle", bias: "Bullish", conf: 84, status: "Active" },
        { name: "Shooting Star", type: "Candlestick", bias: "Bearish", conf: 89, status: "Active" },
    ];
    return { data: mockPatterns, isLoading: false };
}

export default function ChartPatternsPage() {
    const [selectedMarket, setSelectedMarket] = useState("Gold");
    const [timeframe, setTimeframe] = useState("1h");
    const [activePattern, setActivePattern] = useState<string>("Bullish Engulfing");

    const { data: patterns } = usePatternScan(selectedMarket, timeframe);
    const { addNotification } = useNotifications();

    const detail = PATTERN_DETAILS[activePattern] || PATTERN_DETAILS["Bullish Engulfing"];

    const handlePatternClick = (p: any) => {
        setActivePattern(p.name);
        addNotification({
            title: `${p.name} Detected`,
            message: `${p.bias} formation found on ${selectedMarket} (${timeframe})`,
            type: 'geometry',
            bias: p.bias
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border border-[var(--color-border)] rounded-lg p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 rounded-full border border-brand-500/20">
                        <BarChart3 className="h-4 w-4 text-brand-500" />
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Pattern Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-black leading-tight tracking-tight uppercase">
                        Chart &amp; Candle <span className="text-brand-500">Scanner</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                        Dedicated engine for identifying classic chart formations and candlestick reversals with institutional-grade accuracy.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col gap-4 w-full lg:w-80">
                    <div className="bg-black/40 backdrop-blur-3xl border border-[var(--color-border)] p-6 rounded-lg space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Market Selector</label>
                            <select
                                value={selectedMarket}
                                onChange={(e) => setSelectedMarket(e.target.value)}
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-brand-500/50 appearance-none"
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
                                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${timeframe === tf ? "bg-brand-500 text-black shadow-lg shadow-brand-500/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
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
                {/* Left Col: Detected Patterns */}
                <div className="space-y-8 xl:col-span-1">
                    <WatchlistPanel moduleName="Chart Scanner" />
                    
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-gray-500">Live Detection Feed</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {patterns?.map((pattern, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handlePatternClick(pattern)}
                                    className={`group p-5 border rounded-lg transition-all cursor-pointer ${activePattern === pattern.name ? 'bg-brand-500/10 border-brand-500/40' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-brand-500/40'}`}
                                >
                                    <div className="flex justify-between items-start mb-2 text-[10px] font-black uppercase">
                                        <span className={`${pattern.bias === 'Bullish' ? 'text-green-500/70' : 'text-red-500/70'} tracking-widest`}>{pattern.type} • {pattern.bias}</span>
                                        <span className="text-brand-400 px-2 py-0.5 bg-brand-500/10 rounded-full border border-brand-500/20">{pattern.conf}% CONF</span>
                                    </div>
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-brand-400 transition-colors uppercase tracking-tight">{pattern.name}</h4>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className={`w-2 h-2 rounded-full ${pattern.status === 'Active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(16, 185, 129,0.4)]'}`} />
                                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{pattern.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-gray-500">Pattern Focus</h3>
                        <div className="space-y-6">
                            <div className="text-center p-8 bg-black/40 rounded-lg border border-[var(--color-border)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-500/5 blur-3xl group-hover:bg-brand-500/10 transition-all" />
                                <BarChart3 className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                                <p className="text-2xl font-black text-[var(--color-text-primary)] relative z-10 tracking-tight">{activePattern}</p>
                                <p className="text-[10px] font-black text-green-500 relative z-10 mt-2 uppercase tracking-widest px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 inline-block">{detail.type}</p>
                            </div>
                            <div className="space-y-4 px-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Psychology</p>
                                    <p className="text-xs text-gray-300 font-medium leading-relaxed italic border-l-2 border-brand-500/30 pl-3">
                                        "{detail.psychology}"
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Institutional Context</p>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        {detail.context}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Historical Accuracy</div>
                                    <div className="text-lg font-black text-brand-400">{detail.accuracy}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Interactive Charting */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 h-[650px] flex flex-col relative overflow-hidden transition-all hover:border-brand-500/20">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(16, 185, 129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Chart Pattern Detection</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Candlestick Highlights</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all"><Maximize2 size={18} /></button>
                                <button className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all"><MousePointer2 size={18} /></button>
                            </div>
                        </div>

                        {/* Optimized Candlestick Chart Area */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/[0.02] to-transparent pointer-events-none" />

                            <MarketScannerChart 
                                data={Array.from({ length: 120 }).map((_, i) => {
                                    const base = 2860 + Math.sin(i / 8) * 40 + (i > 80 ? (i - 80) * 2 : 0);
                                    // Use unix timestamps in seconds, unique for each index
                                    const time = Math.floor(Date.now() / 1000) - (120 - i) * 3600;
                                    return {
                                        time,
                                        open: base,
                                        high: base + 8 + Math.random() * 4,
                                        low: base - 4 - Math.random() * 4,
                                        close: base + 2 + Math.random() * 4,
                                    };
                                })}
                                height={500}
                                className="z-10"
                            />

                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-80">
                                <defs>
                                    <filter id="glowChart">
                                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Bull Flag Highlight Box (Dynamic Mock) */}
                                {activePattern === "Bullishly Engulfed" || activePattern === "Bullish Engulfing" ? (
                                    <>
                                        <circle cx="200" cy="450" r="40" fill="rgba(34, 197, 94, 0.05)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" filter="url(#glowChart)" />
                                        <text x="250" y="450" fill="#22c55e" fontSize="10" fontWeight="900" className="uppercase tracking-widest underline decoration-green-500/30 underline-offset-4">Engulfing Signal Zone</text>
                                    </>
                                ) : (
                                    <>
                                        <rect x="300" y="100" width="150" height="200" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" filter="url(#glowChart)" rx="8" />
                                        <text x="310" y="120" fill="#10b981" fontSize="10" fontWeight="900" className="uppercase tracking-widest">Setup Confirmation (Pending)</text>
                                        <line x1="300" y1="140" x2="450" y2="280" stroke="#10b981" strokeWidth="2" filter="url(#glowChart)" />
                                        <line x1="300" y1="200" x2="450" y2="340" stroke="#10b981" strokeWidth="2" filter="url(#glowChart)" />
                                        <path d="M430,240 L450,200 L470,240" fill="none" stroke="#22c55e" strokeWidth="3" filter="url(#glowChart)" />
                                        <line x1="450" y1="200" x2="450" y2="280" stroke="#22c55e" strokeWidth="3" filter="url(#glowChart)" />
                                    </>
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* Operational Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-brand-500" size={24} />
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text-primary)]">Execution Parameters</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Entry Price</p>
                                    <p className="text-2xl font-black text-[var(--color-text-primary)]">$2,860.50</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Invalidation (SL)</p>
                                    <p className="text-2xl font-black text-red-500">$2,842.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Measured Move Target</p>
                                    <p className="text-2xl font-black text-green-500">$2,920.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Secondary Target</p>
                                    <p className="text-2xl font-black text-green-400">$2,965.00</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <Compass className="text-brand-500" size={24} />
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text-primary)]">Setup Context</h3>
                            </div>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                The detected {activePattern} occurred exactly at structural support concurrently with a valid breakout attempt. This powerful confluence suggests immediate upside pricing potential in line with institutional order flow.
                            </p>
                            <div className="flex items-center justify-between p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group hover:border-brand-500/30 transition-all">
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                    <ShieldAlert size={18} className="text-brand-500" />
                                    RR Ratio: 1:{activePattern.includes("Wedge") ? "4.5" : "3.2"}
                                </div>
                                <button className="px-6 py-3 bg-brand-500 text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/10">
                                    Apply to Terminal
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pattern Encyclopedia (requested lists) */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-12 space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">Pattern Encyclopedia</h2>
                            <p className="text-gray-500 text-sm font-medium">Scanning engine identifies and tracks the following formations across all timeframes.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-500 border-b border-brand-500/20 pb-4">Chart Formations</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {CHART_PATTERNS.map(p => (
                                        <div key={p} className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors group cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500/40 group-hover:bg-brand-500" />
                                            <span className="text-[11px] font-bold text-gray-400 group-hover:text-[var(--color-text-primary)] uppercase tracking-wider">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-green-500 border-b border-green-500/20 pb-4">Bullish Candlesticks</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {BULLISH_CANDLES.map(p => (
                                        <div key={p} className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors group cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 group-hover:bg-green-500" />
                                            <span className="text-[11px] font-bold text-gray-400 group-hover:text-[var(--color-text-primary)] uppercase tracking-wider">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-500 border-b border-red-500/20 pb-4">Bearish Candlesticks</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {BEARISH_CANDLES.map(p => (
                                        <div key={p} className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors group cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 group-hover:bg-red-50" />
                                            <span className="text-[11px] font-bold text-gray-400 group-hover:text-[var(--color-text-primary)] uppercase tracking-wider">{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
