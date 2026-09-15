"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    Layers,
    PieChart,
    Zap,
    Target,
    ArrowUpRight,
    Clock,
    Activity,
    ChevronDown,
    Maximize2,
    Radar,
    List,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import VolumeChart from "@/components/vmid/VolumeChart";
import AlertsDialog from "@/components/vmid/AlertsDialog";
import {
    useVMIDMarketData,
    useVMIDWatchlist,
    useVMIDOpenInterest,
    useVMIDCOTData,
    useVMIDCorrelation
} from "@/hooks/use-vmid";
import { WatchlistPanel } from "@/components/shared/WatchlistPanel";
import { ALL_ASSETS } from "@/lib/constants/instruments";

export default function VMIDProPage() {
    const [selectedInstrument, setSelectedInstrument] = useState("Gold");
    const [timeframe, setTimeframe] = useState("15m");
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);

    // Fetch diverse context datasets from custom Hooks
    const { data: marketData, isLoading: marketLoading } = useVMIDMarketData(selectedInstrument, timeframe);
    const { data: watchlistData, isLoading: watchLoading } = useVMIDWatchlist();
    const { data: oiData } = useVMIDOpenInterest(selectedInstrument);
    const { data: cotData } = useVMIDCOTData(selectedInstrument);
    const { data: correlationData } = useVMIDCorrelation();

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)] min-h-screen">
            {/* ── Consolidated Command Header ── */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-[#080E1A] border border-[var(--color-border)] rounded-lg shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg shadow-inner">
                            <Activity className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter leading-none">
                                MMITPS-VMID <span className="text-amber-500">PRO</span>
                            </h1>
                            <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mt-1">Global Intelligence</p>
                        </div>
                    </div>


                    <div className="h-8 w-px bg-[var(--color-surface-2)] hidden md:block" />

                    {/* Session Indicator */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                        <Clock size={12} className="text-brand-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">{marketData?.session || "Global"} Session</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Instrument Selector */}
                    <div className="relative group">
                        <select
                            value={selectedInstrument}
                            onChange={(e) => setSelectedInstrument(e.target.value)}
                            className="pl-4 pr-10 py-3 bg-[#0D1529] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] appearance-none focus:outline-none focus:border-amber-500/50 shadow-inner group-hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
                        >
                            {ALL_ASSETS.map(asset => (
                                <option key={asset} value={asset} className="bg-[#0D1529]">
                                    {asset}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none group-hover:text-amber-500 transition-colors" />
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex bg-[#0D1529] rounded-lg border border-[var(--color-border)] p-1 shadow-inner">
                        {["1m", "5m", "15m", "1h", "4h", "D"].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={clsx(
                                    "px-3 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-tighter",
                                    timeframe === tf
                                        ? "bg-amber-500 text-black shadow-lg shadow-brand-500/20"
                                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                                )}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-[var(--color-surface-2)] hidden xl:block" />

                    {/* Volumetric Alert Setup Button */}
                    <button
                        onClick={() => setIsAlertsOpen(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-lg shadow-brand-500/20 active:scale-95 group"
                    >
                        <Bell size={14} className="group-hover:animate-ring" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Setup Alerts</span>
                    </button>
                </div>
            </div>

            {/* Alerts Dialog */}
            <AlertsDialog isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />

            {/* ── Main Engine Matrix (Full Width Meta-Chart) ── */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 space-y-6 flex flex-col">
                    {/* Primary TradingView Lightweight Chart Area - MAXIMIZED */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-2 flex-1 min-h-[750px] flex flex-col relative overflow-hidden shadow-2xl group/chart">
                        {/* Information Overlay (Legend) */}
                        <div className="absolute top-6 left-8 z-20 pointer-events-none space-y-1 text-[var(--color-text-primary)]">
                            <div className="flex items-center gap-4">
                                <h2 className="text-4xl font-black tracking-[-0.05em] uppercase">{selectedInstrument}</h2>
                                <div className="px-3 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[10px] font-black text-amber-500 tracking-widest">{timeframe}</div>
                            </div>

                            {/* OHLCV Legend Container (Dynamic updates handled in VolumeChart Component) */}
                            <div id="chart-legend" className="flex items-center gap-6 mt-4 bg-black/40 backdrop-blur-md p-3 rounded-lg border border-[var(--color-border)] shadow-2xl">
                                {/* Values will be populated by the VolumeChart crosshair subscriber */}
                                <div className="flex flex-col"><span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Open</span><span id="legend-open" className="text-xs font-mono font-bold">---</span></div>
                                <div className="flex flex-col"><span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">High</span><span id="legend-high" className="text-xs font-mono font-bold text-emerald-400">---</span></div>
                                <div className="flex flex-col"><span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Low</span><span id="legend-low" className="text-xs font-mono font-bold text-rose-400">---</span></div>
                                <div className="flex flex-col"><span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Close</span><span id="legend-close" className="text-sm font-mono font-black">---</span></div>
                                <div className="w-px h-8 bg-[var(--color-surface-3)] mx-2" />
                                <div className="flex flex-col"><span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Volume</span><span id="legend-volume" className="text-sm font-mono font-black text-amber-500">---</span></div>
                            </div>
                        </div>

                        {/* Chart Component */}
                        <div className="flex-1 w-full bg-[#0D1529] rounded-[2.2rem] overflow-hidden relative z-0 mt-2">
                            {marketLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Activity className="w-12 h-12 text-amber-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.5em]">Syncing Liquidity Nodes</p>
                                    </div>
                                </div>
                            ) : (
                                marketData?.ohlcv && (
                                    <VolumeChart
                                        data={marketData.ohlcv}
                                        signals={marketData.signals}
                                        primaryColor="#10b981"
                                    />
                                )
                            )}
                        </div>
                    </div>

                    {/* Volumetric Oscillators - Unified Horizontal Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Vol ROC", val: marketData?.momentum?.volumeROC ? marketData.momentum.volumeROC + "%" : "---", alert: (marketData?.momentum?.volumeROC ?? 0) > 100, color: "text-emerald-400", sub: "Rate of Change" },
                            { label: "Z-Score", val: marketData?.momentum?.zScore ?? "---", alert: (marketData?.momentum?.zScore ?? 0) > 2, color: "text-amber-400", sub: "Statistical Deviation" },
                            { label: "OBV Flow", val: marketData?.momentum?.obv ? (marketData.momentum.obv / 1000).toFixed(1) + "K" : "---", alert: false, color: "text-brand-400", sub: "Accumulated Volume" },
                            { label: "Status", val: marketData?.momentum?.status, alert: false, color: "text-[var(--color-text-primary)]", sub: "Market Phase" },
                        ].map((osc, i) => (
                            <div key={i} className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 flex flex-col justify-between group hover:border-amber-500/20 transition-all duration-500 shadow-xl">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{osc.label}</span>
                                    <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest group-hover:text-[var(--color-text-muted)] transition-colors">{osc.sub}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className={clsx("text-2xl font-black tracking-tighter truncate leading-none", osc.color)}>
                                        {osc.val || "---"}
                                    </span>
                                    {osc.alert && <ShieldAlert size={14} className="text-amber-500 animate-pulse shrink-0" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* ── Context & Intelligence Layer (Relocated Watchlist) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                {/* 1. Watchlist & Market Rankings */}
                <div className="col-span-1 flex flex-col gap-6">
                    <WatchlistPanel moduleName="VMID Pro" />
                    
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col shadow-2xl h-[500px]">
                    <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-br from-amber-500/5 to-transparent">
                        <div>
                            <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em]">Volume Engine</h3>
                            <p className="text-[8px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mt-1">Live Rankings</p>
                        </div>
                        <Zap size={16} className="text-amber-500" />
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {watchLoading ? (
                                    <tr><td className="py-12 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Scanning...</td></tr>
                                ) : (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    watchlistData?.watchlist.map((item: any) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedInstrument(item.instrument)}
                                            className={clsx(
                                                "cursor-pointer group transition-all",
                                                selectedInstrument === item.instrument ? "bg-amber-500/10" : "hover:bg-[var(--color-surface-2)]"
                                            )}
                                        >
                                            <td className="py-4 px-3">
                                                <span className={clsx(
                                                    "text-[10px] font-black uppercase tracking-wider",
                                                    selectedInstrument === item.instrument ? "text-amber-500" : "text-[var(--color-text-primary)]"
                                                )}>
                                                    {item.instrument}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <div className={clsx(
                                                    "text-xs font-black tracking-tighter font-mono",
                                                    item.vVolRatio > 100 ? "text-amber-500" : "text-emerald-400"
                                                )}>
                                                    {item.vVolRatio.toFixed(1)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>


                {/* 1. Recent Predictive Signals */}
                <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Radar className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Predictive Engine</h3>
                                <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Recent Signals</p>
                            </div>
                        </div>
                        <Link href="#" className="p-2 bg-[var(--color-surface-2)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all border border-[var(--color-border)]">
                            <List size={14} className="text-[var(--color-text-secondary)]" />
                        </Link>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {!marketData?.signals || marketData.signals.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-lg">
                                <Activity className="w-8 h-8 text-white/5 mx-auto mb-4" />
                                <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">Monitoring Flow...</p>
                            </div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            marketData.signals.map((sig: any, i: number) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="flex items-center justify-between p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border)] transition-all group/sig cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg",
                                            sig.type === "Accumulation" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                        )}>
                                            {sig.type === "Accumulation" ? "ACC" : "DIST"}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-[var(--color-text-primary)] group-hover/sig:text-amber-500 transition-colors uppercase tracking-tight">{sig.description}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Conf: {sig.strength}%</span>
                                                <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />
                                                <span className={clsx("text-[9px] font-black uppercase tracking-widest", sig.type === "Accumulation" ? "text-emerald-400" : "text-rose-400")}>
                                                    {sig.type === "Accumulation" ? "BUY SIGNAL" : "SELL SIGNAL"}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />
                                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{new Date(sig.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-white/10 group-hover/sig:text-[var(--color-text-primary)] transition-all transform group-hover/sig:translate-x-1 group-hover/sig:-translate-y-1" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Open Interest Intelligence */}
                <div className={clsx("bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl transition-all relative overflow-hidden group", !oiData && "opacity-50 grayscale")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
                                <PieChart size={16} className="text-brand-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Global OI</h3>
                                <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Contextual Depth</p>
                            </div>
                        </div>
                    </div>

                    {!oiData ? (
                        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">N/A for Current Market</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Current Open Interest</span>
                                    <div className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)] font-mono">{(oiData.currentOI / 1000).toFixed(1)}K</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--color-surface-2)] rounded-lg p-4 border border-[var(--color-border)]">
                                    <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2">1H Change</div>
                                    <div className={clsx("font-mono font-black text-lg tracking-tighter", oiData.change1h > 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {oiData.change1h > 0 ? "+" : ""}{oiData.change1h}%
                                    </div>
                                </div>
                                <div className="bg-[var(--color-surface-2)] rounded-lg p-4 border border-[var(--color-border)]">
                                    <div className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2">24H Change</div>
                                    <div className={clsx("font-mono font-black text-lg tracking-tighter", oiData.change24h > 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {oiData.change24h > 0 ? "+" : ""}{oiData.change24h}%
                                    </div>
                                </div>
                            </div>
                            <div className="bg-brand-500/5 border border-brand-500/20 rounded-lg p-5">
                                <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <ShieldAlert size={12} /> OI Narrative
                                </div>
                                <div className="text-xs font-bold text-[var(--color-text-primary)] leading-relaxed">{oiData.signal}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. COT Smart Money Intelligence */}
                <div className={clsx("bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl transition-all relative overflow-hidden group col-span-1", !cotData && "opacity-50 grayscale")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
                                <Target size={16} className="text-brand-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">COT Analytics</h3>
                                <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Institutional Bias</p>
                            </div>
                        </div>
                    </div>

                    {!cotData ? (
                        <div className="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">No CFTC Data Found</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Commercial Net Position</span>
                                    <span className="text-[11px] font-black text-brand-400 uppercase">{cotData.commercialPercentile}th Pct</span>
                                </div>
                                <div className="w-full bg-[var(--color-surface-2)] rounded-full h-2 px-1 flex items-center">
                                    <div className="bg-gradient-to-r from-purple-800 to-brand-400 h-1 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-1000" style={{ width: `${cotData.commercialPercentile}%` }} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Managed Money Bias</span>
                                    <span className="text-[11px] font-black text-emerald-400 uppercase">{cotData.managedMoneyPercentile}th Pct</span>
                                </div>
                                <div className="w-full bg-[var(--color-surface-2)] rounded-full h-2 px-1 flex items-center">
                                    <div className="bg-gradient-to-r from-emerald-800 to-emerald-400 h-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${cotData.managedMoneyPercentile}%` }} />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-[var(--color-border)]">
                                <p className="text-xs font-bold text-[var(--color-text-secondary)] leading-[1.8] italic">
                                    &ldquo;{cotData.description}&rdquo;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Correlation Matrix Row ── */}
            <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl mt-6 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Layers size={18} className="text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest text-emerald-500">Volumetric-Correlation Matrix</h3>
                            <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mt-1">Cross-Asset Flow Coupling</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/resources/vmid/correlation"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] transition-all border border-[var(--color-border)] group-hover:border-emerald-500/20"
                    >
                        Detailed Analysis <Maximize2 size={12} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {correlationData?.matrix?.slice(0, 4).map((row: any, idx: number) => (
                        <div key={idx} className="bg-black/20 border border-[var(--color-border)] rounded-lg p-5 hover:bg-black/40 transition-all group/cell">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{row.name.replace('/USD', '')}</span>
                                <Activity size={12} className="text-[var(--color-text-muted)] group-hover/cell:text-amber-500 transition-colors" />
                            </div>
                            <div className="flex gap-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {Object.entries(row).filter(([k]) => k !== 'name' && k !== row.name).slice(0, 3).map(([k, v]: [string, any]) => (
                                    <div key={k} className="flex-1 rounded-lg p-2 text-center relative overflow-hidden transition-all hover:scale-105" style={{ backgroundColor: v > 0 ? `rgba(16, 185, 129, 0.05)` : `rgba(239, 68, 68, 0.05)` }}>
                                        <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: v > 0 ? `rgba(16, 185, 129, ${Math.abs(v)})` : `rgba(239, 68, 68, ${Math.abs(v)})` }} />
                                        <div className="text-[7px] font-black uppercase text-[var(--color-text-muted)] truncate mb-1">{k.replace('/USD', '')}</div>
                                        <div className={clsx("text-[11px] font-mono font-black tracking-tighter", v > 0 ? "text-emerald-400" : "text-rose-400")}>
                                            {v.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
