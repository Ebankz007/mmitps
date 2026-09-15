"use client";

import { useState } from "react";
import { useProViewSeasonality } from "@/hooks/use-resources";
import ProViewChart from "@/components/charts/ProViewChart";
import {
    LayoutGrid,
    Activity,
    Target,
    Zap,
    Users,
    ArrowUpRight,
    Search,
    PlayCircle,
    TrendingUp,
    Radio,
    ShieldCheck,
    Box
} from "lucide-react";
import { cn } from "@/lib/utils";

const ASSETS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "XAUUSD", "BTCUSD", "US30", "SPX500", "XAGUSD", "XALUSD", "XAUAUD", "XAUEUR", "XCUUSD", "XNIUSD", "XPBUSD", "XPDUSD", "XPTUSD", "XZNUSD", "EURCZK", "EURHUF", "EURPLN", "EURTRY", "EURZAR", "GBPPLN", "GBPZAR", "USDCNH", "USDCZK", "USDHUF", "USDILS", "USDMXN", "USDPLN", "USDTRY", "USDZAR", "AUDCAD", "AUDCHF", "AUDJPY", "AUDNZD", "CADCHF", "CADJPY", "CHFJPY", "EURAUD", "EURCAD", "EURCHF", "EURDKK", "EURGBP", "EURHKD", "EURJPY", "EURMXN", "EURNOK", "EURNZD", "EURSEK", "EURRON", "EURSGD", "GBPAUD", "GBPCAD", "GBPCHF", "GBPDKK", "GBPHKD", "GBPJPY", "GBPNZD", "GBPSEK", "GBPSGD", "NOKSEK", "NZDCAD", "NZDCHF", "NZDJPY", "NZDSGD", "NZDUSD", "USDCAD", "USDCHF", "USDDKK", "USDHKD", "USDNOK", "USDRON", "USDSEK", "USDSGD"];

export default function SeasonalityProView() {
    const [selectedAsset, setSelectedAsset] = useState("EURUSD");
    const { data: proviewData, isLoading } = useProViewSeasonality(selectedAsset);

    const stats = proviewData?.stats || { correlation: 0, winRate: 0, avgMove: 0 };

    if (isLoading || !proviewData) {
        return (
            <div className="h-[600px] flex items-center justify-center border border-[var(--color-border)] bg-[#050505] rounded-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-t-[#10b981] border-[var(--color-border)] animate-spin" />
                    <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-black">Decrypting Temporal Patterns...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto pb-20 font-sans">

            {/* ═══ 1. Hero Reveal Section ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#050505] border border-[var(--color-border)] rounded-lg overflow-hidden p-8">
                <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full w-fit">
                        <Radio className="w-3 h-3 text-[#10b981] animate-pulse" />
                        <span className="text-[9px] font-black text-[#10b981] uppercase tracking-widest leading-none">ProView Seasonality Matrix</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter leading-tight">
                            Reveals <span className="text-[#10b981]">Hidden Recurring</span><br />
                            Price Action Patterns
                        </h1>
                        <p className="mt-4 text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed max-w-md">
                            Typical seasonality don&apos;t follow statistical outliers, instead, ProView simply relays your market in <span className="text-emerald-400">Relationship weight logic</span>. Instant real-time pattern capture, zero lagging indicators, or seasonal imbalances.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-5 space-y-2">
                            <div className="text-3xl font-black text-[#10b981]">+{stats.correlation}%</div>
                            <div className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Better Correlation</div>
                        </div>
                        <div className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-5 space-y-2">
                            <div className="text-3xl font-black text-emerald-400">Real-Time</div>
                            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Pattern Matching</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/10">
                            Start Your Start Now
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest transition-all">
                            <PlayCircle className="w-4 h-4" /> Watch Demo
                        </button>
                    </div>
                </div>

                {/* Main Hero Chart */}
                <div className="lg:col-span-7 bg-white/[0.01] border border-[var(--color-border)] rounded-lg p-4 overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] border border-emerald-500/20 font-bold uppercase tracking-widest">Live</div>
                    </div>
                    <ProViewChart
                        candles={proviewData.candles}
                        proviewPattern={proviewData.proviewPattern}
                        height={400}
                    />
                </div>
            </div>

            {/* ═══ 2. Stats Bar Section ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Asset Selector Hub */}
                <div className="md:col-span-2 bg-[#050505] border border-[var(--color-border)] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center font-black text-[#10b981] text-lg border border-[#10b981]/20">
                            {selectedAsset.substring(0, 3)}
                        </div>
                        <div>
                            <div className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">{selectedAsset} <span className="text-[var(--color-text-muted)] font-medium">/ Institutional Projection</span></div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-black text-[#10b981] uppercase tracking-widest">PROVIEW PRO</span>
                                <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />
                                <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">15yr Pattern Hist.</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedAsset}
                            onChange={(e) => setSelectedAsset(e.target.value)}
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[11px] font-black text-[var(--color-text-primary)] outline-none appearance-none min-w-[160px] cursor-pointer hover:bg-[var(--color-surface-3)] transition-colors"
                        >
                            {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Active Connectivity</span>
                        </div>
                    </div>
                </div>

                {/* Bias Indicator */}
                <div className="bg-[#05181E] border border-emerald-500/20 rounded-lg p-6 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Market Connectivity</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-emerald-400 tracking-tighter uppercase flex items-center gap-2">
                                <ArrowUpRight className="w-6 h-6" /> BULLISH
                            </div>
                            <div className="text-[9px] font-medium text-emerald-500/60 uppercase tracking-widest">Seasonal Bias</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-[var(--color-text-primary)]">High</div>
                            <div className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-widest">Confidence {stats.winRate}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ 3. Comparison Logic Section ═══ */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                <div className="flex items-center gap-3">
                    <Box className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-widest">What Makes <span className="text-amber-500">ProView</span> Different?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left: Traditional */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-1">Traditional Seasonal Charts</h3>
                                <p className="text-[10px] font-medium text-[var(--color-text-muted)] leading-relaxed">
                                    Traditional seasonal charts show the <span className="text-rose-400 font-bold">average movement</span> of a market over a fixed period (i.e. 20 years). This can offer insights into a market behavior, but if the market isn&apos;t following its average, <span className="text-rose-400 font-black italic">it can be misleading.</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/[0.01] border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden h-[300px]">
                            {/* Visual Placeholder for Traditional Chart - Squiggly messy lines */}
                            <div className="absolute inset-x-8 inset-y-12 flex items-center justify-center opacity-40">
                                <svg viewBox="0 0 400 200" className="w-full h-full stroke-white/20 fill-none stroke-2">
                                    <path d="M0,150 Q50,50 100,150 T200,100 T300,160 T400,50" />
                                    <path d="M0,130 C50,180 150,20 200,130 S350,80 400,150" className="stroke-amber-500/40" />
                                </svg>
                            </div>
                            <div className="absolute top-6 left-6 flex items-center gap-6 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-[var(--color-surface-3)] rounded-full" />
                                    <span className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">20yr Pattern</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-amber-500/20 rounded-full" />
                                    <span className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Actual Price</span>
                                </div>
                            </div>
                            <div className="absolute bottom-6 w-full text-center text-[7px] font-black text-white/10 uppercase tracking-[0.5em]">Time Period</div>
                        </div>
                    </div>

                    {/* Right: ProView */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-1">ProView: Advanced Pattern Matching</h3>
                                <p className="text-[10px] font-medium text-emerald-100/40 leading-relaxed">
                                    ProView looks at <span className="text-amber-500 font-bold">similar seasons</span> to find a near-identical pattern that any current price charts is currently follow. This <span className="text-emerald-400 font-black">reduces the noise</span> and a clearly predict on how the market as performed under those circumstances.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#05181E]/30 border border-emerald-500/10 rounded-lg p-6 relative overflow-hidden h-[300px]">
                            {/* Visual Placeholder for ProView Chart - Clean dashed line matching price */}
                            <div className="absolute inset-x-8 inset-y-12 flex items-center justify-center">
                                <svg viewBox="0 0 400 200" className="w-full h-full fill-none stroke-[3]">
                                    <path d="M0,150 L50,130 L100,100 L150,80 L200,60 L250,55 L300,50" className="stroke-[#0ea5e9]" />
                                    <path d="M0,155 L50,135 L100,105 L150,85 L200,65 L250,60 L300,55" className="stroke-amber-500 stroke-dasharray-[6,6]" />
                                </svg>
                            </div>
                            {/* Projection Box */}
                            <div className="absolute right-0 top-0 h-full w-[25%] bg-amber-500/[0.05] border-l border-[var(--color-border)] flex items-center justify-center">
                                <span className="text-[12px] font-black text-amber-500/20 uppercase tracking-[0.2em] rotate-90">Projection</span>
                            </div>
                            <div className="absolute top-6 left-6 flex items-center gap-6 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-amber-500 rounded-full" />
                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">ProView</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-[#0ea5e9] rounded-full" />
                                    <span className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Actual Price</span>
                                </div>
                            </div>
                            <div className="absolute bottom-6 w-full text-center text-[7px] font-black text-white/10 uppercase tracking-[0.5em]">Time Period</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ 4. Why It Matters & Case Study Section ═══ */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit">
                    <Zap className="w-3 h-3 text-rose-500" />
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Why It Matters</span>
                </div>
                <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-8">
                    <p className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed mb-8 max-w-4xl">
                        Markets move in cycles, but not always as you might think. With <span className="text-[var(--color-text-primary)] font-bold italic underline decoration-amber-500">price action often repeating under similar conditions.</span> With the right tools, you can unlock these hidden seasonal patterns, previously only available on professional trading platforms.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Discovery", desc: "Find any market that behaves in a similar pattern.", icon: <Search className="w-4 h-4" />, color: "border-brand-500/20" },
                            { title: "Focus", desc: "Don't mismatch market noise.", icon: <Target className="w-4 h-4" />, color: "border-emerald-500/20" },
                            { title: "Zero Lag", desc: "Instantly find previous year/market behavior in real-time.", icon: <Activity className="w-4 h-4" />, color: "border-amber-500/20" }
                        ].map((item, idx) => (
                            <div key={idx} className={cn("p-6 bg-white/[0.02] border rounded-lg space-y-3 hover:bg-white/[0.04] transition-all", item.color)}>
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)]">
                                    {item.icon}
                                </div>
                                <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">{item.title}</h4>
                                <p className="text-[10px] font-medium text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ 5. Who It's For ═══ */}
            <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full w-fit mx-auto">
                    <Users className="w-3 h-3 text-brand-500" />
                    <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest leading-none">Who It&apos;s For</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Intra-day Traders", icon: <Zap className="w-5 h-5" />, color: "bg-brand-500/10 text-brand-400", desc: "Reading optimum conditions on repetitive returns." },
                        { title: "Swing Traders", icon: <LayoutGrid className="w-5 h-5" />, color: "bg-brand-500/10 text-brand-400", desc: "Looking at the wide time series cycle." },
                        { title: "Investors", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-400", desc: "Portfolio plan for market adaptive allocations." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-8 flex flex-col items-center text-center space-y-4 hover:border-[var(--color-border)] transition-all group">
                            <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform", item.color)}>
                                {item.icon}
                            </div>
                            <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{item.title}</h4>
                            <p className="text-[10px] font-medium text-[var(--color-text-muted)] leading-relaxed px-4">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center pt-8">
                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em]">A tool for every trader • Forex traders, community traders, stock traders.</p>
                </div>
            </div>

            {/* ═══ 6. CTA Footer ═══ */}
            <div className="pt-20 pb-10 text-center space-y-6">
                <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase">Start Using <span className="text-[#10b981]">ProView</span> Today</h2>
                <p className="text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase">Trade with thought, not thoughtless. Unravel what your market is doing, right now.</p>
                <div className="flex items-center justify-center gap-4">
                    <button className="px-8 py-3 bg-[#10b981] hover:bg-[#10b981]/90 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                        Get Your First Buy
                    </button>
                    <button className="px-8 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest transition-all">
                        View Next Alg
                    </button>
                </div>
            </div>

        </div>
    );
}
