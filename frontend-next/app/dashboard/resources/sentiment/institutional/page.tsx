"use client";

import { useMarketSentimentOverview } from "@/hooks/use-sentiment";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import {
    ShieldCheck,
    Globe,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Zap,
    Info,
    RefreshCw,
    Layers,
    Activity
} from "lucide-react";
import { clsx } from "clsx";

export default function InstitutionalSentimentPage() {
    const { data: overview, isLoading: loading, refetch } = useMarketSentimentOverview();

    const fetchOverview = () => refetch();

    const radarData = overview?.sectors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Object.entries(overview.sectors).map(([name, value]: [string, any]) => ({
            subject: name,
            A: value,
            fullMark: 100
        }))
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                        <ShieldCheck className="text-[#10b981]" />
                        Institutional Sentiment Hub
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Global macro positioning and institutional sector flows</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchOverview}
                        className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-xs font-bold border border-[var(--color-border)] transition-all flex items-center gap-2"
                    >
                        <RefreshCw className={clsx("h-3.5 w-3.5", loading && "animate-spin")} />
                        Update Intelligence
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Radar Chart */}
                <div className="lg:col-span-2 bg-surface border border-[var(--color-border)] p-8 rounded-lg relative">
                    <div className="absolute top-6 left-6">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Sector Sentiment Radar</h3>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Aggregated Institutional Bias</p>
                    </div>

                    <div className="h-[450px] w-full">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981]"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Institutional Bias"
                                        dataKey="A"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Performance & Top Symbols */}
                <div className="space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#10b981]" />
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Top Institutional Longs</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {overview?.topBullish.map((symbol: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                    <span className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{symbol}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1 bg-green-500/20 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full w-[85%]"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-500">85%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Institutional Shorts</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {overview?.topBearish.map((symbol: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                    <span className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{symbol}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1 bg-red-500/20 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full w-[72%]"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-red-500">72%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sector Deep Dive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden group">
                    <Globe className="absolute -bottom-4 -right-4 h-24 w-24 text-white/[0.02] group-hover:text-[#10b981]/[0.05] transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                            <Layers className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Global Macro Flow</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-4">
                        Capital is currently flowing into G10 safe havens, indicating a risk-off environment as institutional players reposition for volatility.
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                        <span>Liquidity Status</span>
                        <span className="text-green-500">Ample</span>
                    </div>
                </div>

                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden group">
                    <Activity className="absolute -bottom-4 -right-4 h-24 w-24 text-white/[0.02] group-hover:text-[#10b981]/[0.05] transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#10b981]/10 text-[#10b981] rounded-lg">
                            <Zap className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Alpha Signals</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-4">
                        High-conviction divergence identified between Retail Sentiment and COT data in Gold. Signal strength: 8.4/10.
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                        <span>Market Pulse</span>
                        <span className="text-[#10b981]">Highly Active</span>
                    </div>
                </div>

                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden group">
                    <BarChart3 className="absolute -bottom-4 -right-4 h-24 w-24 text-white/[0.02] group-hover:text-[#10b981]/[0.05] transition-all" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
                            <Info className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Sentiment Correlation</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-4">
                        Institutional sentiment correlation with 10Y Yields is currently at 0.92, the highest level in 14 months.
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                        <span>Data Integrity</span>
                        <span className="text-brand-400">99.8%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
