"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Filter,
    Activity,
    Brain,
    Target,
    Download,
    Zap,
    Info,
    ChevronDown
} from "lucide-react";
import {
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    ReferenceArea
} from "recharts";
import { clsx } from "clsx";
import { useSeasonality } from "@/hooks/use-seasonality";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SeasonalityProMaxPage() {
    const { useMarkets, useSeasonalData, useMarketHealth } = useSeasonality();
    const { data: marketList } = useMarkets();

    const [selectedMarket, setSelectedMarket] = useState("AstraZeneca");
    const [timeframe, setTimeframe] = useState("20 Years");
    const [selectedPatterns, setSelectedPatterns] = useState(["20 Years"]);

    const { data: seasonalData, isLoading } = useSeasonalData({
        market: selectedMarket,
        timeframe: timeframe,
        patterns: selectedPatterns
    });

    const { data: healthData } = useMarketHealth(selectedMarket);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#000] border border-[var(--color-border)] p-4 rounded-lg shadow-2xl">
                    <h4 className="text-[var(--color-text-primary)] font-black text-xs mb-2 uppercase tracking-tight">{label}</h4>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] flex justify-between gap-8">
                            Average Return: <span className="text-[var(--color-text-primary)] font-bold">{payload[0].value.toFixed(2)}%</span>
                        </p>
                        {payload[1] && (
                            <p className="text-gray-400 text-[10px] flex justify-between gap-8">
                                Yearly Path: <span className="text-[#10b981] font-bold">{payload[1].value.toFixed(2)}%</span>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border border-[var(--color-border)] rounded-lg p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 space-y-6 max-w-2xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full">
                        <Brain className="h-4 w-4 text-[#10b981]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                            AI-Powered Seasonal Engine
                        </span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-[var(--color-text-primary)] leading-tight tracking-[calc(-0.04em)]">
                        Seasonal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#D97706]">Intelligence</span> Pro Max
                    </h1>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                        Identify high-probability institutional price cycles using machine learning pattern detection and dual-axis historical overlays.
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                        <button className="px-10 py-5 bg-[#10b981] text-black rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(16, 185, 129,0.2)] flex items-center gap-3">
                            <Zap className="h-5 w-5" />
                            Analyze Markets
                        </button>
                        <button className="px-10 py-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full text-xs font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] transition-all flex items-center gap-3">
                            <Info className="h-5 w-5" />
                            How it works
                        </button>
                    </div>
                </div>

                {/* Market Quick Select */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-black/40 backdrop-blur-3xl border border-[var(--color-border)] p-6 rounded-lg space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Market Selector</label>
                            <div className="grid grid-cols-1 gap-2">
                                {marketList?.markets?.slice(0, 4).map((m: string) => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMarket(m)}
                                        className={clsx(
                                            "flex items-center justify-between px-4 py-3 rounded-lg transition-all border",
                                            selectedMarket === m
                                                ? "bg-[#10b981]/10 border-[#10b981]/20 text-[var(--color-text-primary)]"
                                                : "bg-[var(--color-surface-2)] border-transparent text-gray-500 hover:text-[var(--color-text-primary)]"
                                        )}
                                    >
                                        <span className="text-xs font-bold uppercase">{m}</span>
                                        {selectedMarket === m && <Target className="h-4 w-4 text-[#10b981]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-[var(--color-surface-2)]" />

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Time Horizon</label>
                            <div className="flex flex-wrap gap-2">
                                {marketList?.timeframes?.slice(0, 3).map((tf: string) => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-widest",
                                            timeframe === tf ? "bg-[#10b981] text-black" : "bg-[var(--color-surface-2)] text-gray-500"
                                        )}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "AI Health Score", value: `${healthData?.health_score || 0}%`, sub: healthData?.rating || "Analysing", icon: Brain, color: "text-[#10b981]" },
                    { label: "Pattern Consistency", value: `${healthData?.metrics?.avg_consistency || 0}%`, sub: "Historical Accuracy", icon: Target, color: "text-green-500" },
                    { label: "Market Momentum", value: `${healthData?.metrics?.recent_trend || 0}%`, sub: "Last 30 Days", icon: TrendingUp, color: "text-brand-500" },
                    { label: "Active Cycles", value: healthData?.metrics?.total_patterns || 0, sub: "Seasonal Opportunities", icon: Zap, color: "text-amber-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-4 hover:border-[var(--color-border)] transition-all group">
                        <div className="flex items-center justify-between">
                            <div className={clsx("p-3 rounded-lg bg-[var(--color-surface-2)]", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-black text-[var(--color-text-primary)]">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Institutional Seasonal Path</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Averaged Multi-Year Projection Overlaid with Current Trend</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] hover:text-[#10b981] transition-all">
                                    <Download className="h-4 w-4" />
                                </button>
                                <button className="p-2 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] hover:text-[#10b981] transition-all">
                                    <Maximized className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="h-[400px] w-full relative">
                            {isLoading && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
                                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Initialising AI Neural Engine...</span>
                                    </div>
                                </div>
                            )}

                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={seasonalData?.monthly_data}>
                                    <XAxis dataKey="month" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />

                                    {/* Seasonal Zones */}
                                    {seasonalData?.patterns?.filter(p => !p.ai_predicted).map((pattern, idx) => (
                                        <ReferenceArea
                                            key={idx}
                                            x1={pattern.start_month}
                                            x2={pattern.end_month}
                                            fill={pattern.type === "buy" ? "rgba(34, 197, 94, 0.05)" : "rgba(239, 68, 68, 0.05)"}
                                            strokeOpacity={0.1}
                                        />
                                    ))}

                                    <Area
                                        type="monotone"
                                        dataKey="average"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={0.1}
                                        fill="#10b981"
                                    />

                                    {/* Last Year Path Comparison */}
                                    {seasonalData?.yearly_data?.slice(-1).map((year) => (
                                        <Line
                                            key={year.key}
                                            type="monotone"
                                            data={year.values.map((v, idx) => ({ month: MONTHS[idx], val: v }))}
                                            dataKey="val"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeDasharray="4 4"
                                            strokeWidth={1}
                                            dot={false}
                                        />
                                    ))}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-1 bg-[#10b981] rounded-full" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Institutional Path</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-1 bg-[var(--color-surface-3)] rounded-full border border-dashed border-white/40" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Trend Deviation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-green-500/10 border border-green-500/20 rounded-sm" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optimum Accumulation Zone</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Opportunities Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-4 w-4 text-[#10b981]" />
                                AI Neural Cycle Opportunities
                            </h3>
                            <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline">View All Alerts</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {seasonalData?.optimum_patterns?.slice(0, 4).map((p: any, i: number) => (
                                <div key={i} className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center justify-between group hover:border-[#10b981]/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-lg flex items-center justify-center border",
                                            p.type === "buy" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                        )}>
                                            {p.type === "buy" ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">
                                                {p.start_month} - {p.end_month || "Phase Start"}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                                {p.ai_predicted ? "AI Neural Prediction" : `Institutional ${p.type === "buy" ? "Accumulation" : "Distribution"}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-[#10b981]">{p.consistency}%</div>
                                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Consistency</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Matrix/Patterns */}
                <div className="space-y-8">
                    {/* Pattern Selection Card */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6 shadow-2xl">
                        <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight flex items-center gap-3">
                            <Filter className="h-5 w-5 text-[#10b981]" />
                            Neural Parameters
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Preset Algorithms</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {marketList?.patterns?.map((p: string) => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                if (selectedPatterns.includes(p)) setSelectedPatterns(prev => prev.filter(x => x !== p));
                                                else setSelectedPatterns(prev => [...prev, p]);
                                            }}
                                            className={clsx(
                                                "px-3 py-2 rounded-lg text-[10px] font-bold transition-all border",
                                                selectedPatterns.includes(p)
                                                    ? "bg-[#10b981] text-black border-[#10b981]"
                                                    : "bg-[var(--color-surface-2)] border-transparent text-gray-400 hover:text-[var(--color-text-primary)]"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-[var(--color-surface-2)]" />

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Cycle Overlays</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {["Election Cycle Phase", "Midterm Impact", "FOMC Liquidity Phase"].map(cycle => (
                                        <button
                                            key={cycle}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-2)] border border-transparent rounded-lg text-[10px] font-bold text-gray-400 hover:text-[var(--color-text-primary)] transition-all uppercase"
                                        >
                                            {cycle}
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-[#10b981] to-[#D97706] text-black rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/10 hover:scale-105 transition-all">
                                Execute Analysis
                            </button>
                        </div>
                    </div>

                    {/* Highest Consistency Matrix */}
                    <div className="bg-black border border-[#10b981]/10 rounded-lg p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Neural Correlations</h3>
                            <Activity className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="space-y-6">
                            {[
                                { market: "FTSE 100", corr: 94, trend: "up" },
                                { market: "S&P 500", corr: 89, trend: "up" },
                                { market: "Gold Spot", corr: 72, trend: "down" },
                                { market: "Nasdaq", corr: 86, trend: "up" }
                            ].map((corr, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-black uppercase">
                                        <span className="text-gray-200">{corr.market}</span>
                                        <span className="text-[#10b981]">{corr.corr}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#10b981] to-[#D97706] rounded-full"
                                            style={{ width: `${corr.corr}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Maximized(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
    )
}
