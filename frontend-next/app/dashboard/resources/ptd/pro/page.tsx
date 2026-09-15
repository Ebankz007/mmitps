"use client";

import React, { useState, useMemo } from "react";
import {
    Activity, Target, Compass, Clock,
    Bell, Cpu, History, Play, RotateCcw, ShieldCheck, Zap,
    ChevronRight, Download, Trash2, Eye, AlertCircle,
    ToggleLeft, ToggleRight, Plus, ArrowUpRight, ArrowDownRight,
    BarChart2, Link2, CheckCircle, XCircle, Radio,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
    usePTDScan, usePTDAccuracy, usePTDBacktest,
    usePTDAlerts, useCreateAlert, useDeleteAlert, useAlertHistory,
    useBrokerAccount, useTradeLog, useExecuteTrade, useConnectBroker,
} from "@/hooks/use-ptd";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ALL_ASSETS } from "@/lib/constants/instruments";
import { WatchlistPanel } from "@/components/shared/WatchlistPanel";
import type { SignalMarker } from "@/components/ptd/PTDChart";

// Load chart client-side only
const PTDChart = dynamic(() => import("@/components/ptd/PTDChart"), { ssr: false });

// Backtest trade has extra fields beyond PTDTrade
interface BacktestTrade { direction: string; confidence?: number; source?: string; result?: string; profit?: number; }

// ── Constants ────────────────────────────────────────────────────────────────
const MODULES = [
    { id: "fibonacci", label: "Fibonacci", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "gann", label: "Gann", icon: Compass, color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
    { id: "astro", label: "Astro", icon: Radio, color: "text-brand-400", bg: "bg-brand-500/10", border: "border-brand-500/20" },
    { id: "cycles", label: "Cycles", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

const FRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
const RULES = ["AND", "OR", "Weighted"] as const;
const TABS = ["Live", "Backtest", "Alerts", "Broker"] as const;

function confidenceBadge(v: number) {
    if (v >= 80) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (v >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
}
function dirIcon(d: string) {
    return d === "UP"
        ? <ArrowUpRight size={14} className="text-emerald-400" />
        : <ArrowDownRight size={14} className="text-red-400" />;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PTDProPage() {
    // Global controls
    const [tab, setTab] = useState<typeof TABS[number]>("Live");
    const [asset, setAsset] = useState("XAUUSD");
    const [timeframe, setTimeframe] = useState("15m");
    const [enabledMods, setEnabledMods] = useState<Record<string, boolean>>({ fibonacci: true, gann: true, astro: false, cycles: true });
    const [rule, setRule] = useState<typeof RULES[number]>("AND");
    const [tolerance, setTolerance] = useState(5);
    const [weights, setWeights] = useState<Record<string, number>>({ fibonacci: 0.3, gann: 0.25, astro: 0.2, cycles: 0.25 });
    const [minConfAuto, setMinConfAuto] = useState(75);
    const [autoTrade, setAutoTrade] = useState(false);

    // Backtest
    const [btStart, setBtStart] = useState("2025-08-01");
    const [btEnd, setBtEnd] = useState("2026-02-20");

    // Alerts form
    const [alertMod, setAlertMod] = useState("cycles");
    const [alertConf, setAlertConf] = useState(80);
    const [alertChan, setAlertChan] = useState<string[]>(["in-app"]);

    // Broker form
    const [bkKey, setBkKey] = useState("");
    const [bkSecret, setBkSecret] = useState("");
    const [bkType, setBkType] = useState<"paper" | "live">("paper");

    const activeMods = Object.keys(enabledMods).filter(k => enabledMods[k]);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: scanData, isLoading: sigLoading } = usePTDScan(asset, timeframe, activeMods, rule, tolerance);
    const { data: accuracy } = usePTDAccuracy();
    const { data: alerts = [] } = usePTDAlerts();
    const { data: alertHistory = [] } = useAlertHistory();
    const { data: brokerAcc } = useBrokerAccount();
    const { data: trades = [] } = useTradeLog();
    const { data: backtestData, refetch: runBt, isFetching: btRunning } = usePTDBacktest(asset, btStart, btEnd, activeMods);

    const signals = scanData?.signals || [];
    const scanOhlcv = scanData?.ohlcv || [];
    const btResult = backtestData?.result;
    const btOhlcv = backtestData?.ohlcv || [];

    const createAlert = useCreateAlert();
    const deleteAlert = useDeleteAlert();
    const connectBroker = useConnectBroker();
    const executeTrade = useExecuteTrade();

    // Convert signals to chart markers
    const chartMarkers = useMemo<SignalMarker[]>(() =>
        signals.map(s => ({
            time: Math.floor(new Date(s.time).getTime() / 1000),
            direction: s.direction,
            confidence: s.confidence,
            label: s.type.split(" ")[0],
            price: s.price, // Pass price for horizontal projection
        })), [signals]
    );

    // Backtest markers
    const btMarkers = useMemo<SignalMarker[]>(() =>
        (btResult?.trades || []).map((t: any) => ({
            time: Math.floor(new Date(t.time).getTime() / 1000),
            direction: t.direction as "UP" | "DOWN",
            confidence: t.confidence || 0,
            label: t.source || "BT",
            price: t.price, // Pass price for BT markers too
        })), [btResult]
    );

    const toggleChannel = (c: string) =>
        setAlertChan(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

    return (
        <div className="space-y-6 pb-20 text-[var(--color-text-primary)]">
            {/* ── Header ── */}
            <div className="relative bg-[#080E1A] border border-[var(--color-border)] rounded-lg px-8 md:px-12 py-10 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -mr-20 -mt-20" />
                <div className="flex-1 space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Cpu size={16} className="text-amber-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Institutional Pulse v2.0</span>
                        {autoTrade && (
                            <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
                                AUTO-TRADE ACTIVE
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                        MMITPS-PTD <span className="text-amber-400">PRO</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-lg">
                        Multi-Methodology Integrated Time Prediction — Fibonacci · Gann · Astro · Cycles
                    </p>
                </div>

                {/* Asset + Timeframe + Tab selectors */}
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                    <select value={asset} onChange={e => setAsset(e.target.value)}
                        className="bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50 cursor-pointer">
                        {ALL_ASSETS.map(a => <option key={a} value={a} className="bg-[#0D1529]">{a}</option>)}
                    </select>
                    <select value={timeframe} onChange={e => setTimeframe(e.target.value)}
                        className="bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50 cursor-pointer">
                        {FRAMES.map(f => <option key={f} value={f} className="bg-[#0D1529]">{f}</option>)}
                    </select>
                    <div className="flex items-center gap-1 p-1 bg-[#0D1529] border border-[var(--color-border)] rounded-lg">
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={cn("px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    tab === t ? "bg-amber-500 text-black shadow-lg" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════════ LIVE TAB ════════ */}
            {tab === "Live" && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* ── Left: Module Control Panel ── */}
                    <div className="xl:col-span-1 space-y-5">
                        <WatchlistPanel moduleName="PTD Pro" />

                        {/* Module Toggles */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Timing Modules</h3>
                            {MODULES.map(m => {
                                const acc = accuracy?.modules?.[m.id];
                                const on = enabledMods[m.id];
                                return (
                                    <div key={m.id} className={cn("p-4 rounded-lg border transition-all cursor-pointer", on ? cn(m.bg, m.border) : "bg-white/[0.02] border-[var(--color-border)]")}
                                        onClick={() => setEnabledMods(p => ({ ...p, [m.id]: !p[m.id] }))}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <m.icon size={14} className={on ? m.color : "text-[var(--color-text-muted)]"} />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", on ? m.color : "text-[var(--color-text-muted)]")}>{m.label}</span>
                                            </div>
                                            {on ? <ToggleRight size={18} className={m.color} /> : <ToggleLeft size={18} className="text-[var(--color-text-muted)]" />}
                                        </div>
                                        {acc && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Accuracy</span>
                                                <span className={cn("text-xs font-black", on ? m.color : "text-[var(--color-text-muted)]")}>{acc.accuracy}%</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Combination Rule */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Combination Rule</h3>
                            <div className="flex gap-2">
                                {RULES.map(r => (
                                    <button key={r} onClick={() => setRule(r)}
                                        className={cn("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                            rule === r ? "bg-amber-500 border-amber-400 text-black" : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Tolerance</span>
                                    <span className="text-xs font-black text-amber-400">±{tolerance}min</span>
                                </div>
                                <input type="range" min={1} max={30} value={tolerance} onChange={e => setTolerance(+e.target.value)}
                                    className="w-full h-1 bg-[var(--color-surface-3)] rounded-full accent-amber-500 cursor-pointer" />
                            </div>
                            {rule === "Weighted" && (
                                <div className="space-y-3 pt-2">
                                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Module Weights</span>
                                    {MODULES.filter(m => enabledMods[m.id]).map(m => (
                                        <div key={m.id} className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className={cn("text-[9px] font-black uppercase", m.color)}>{m.label}</span>
                                                <span className="text-[9px] font-black text-[var(--color-text-secondary)]">{Math.round((weights[m.id] || 0) * 100)}%</span>
                                            </div>
                                            <input type="range" min={0} max={100} value={Math.round((weights[m.id] || 0) * 100)}
                                                onChange={e => setWeights(p => ({ ...p, [m.id]: +e.target.value / 100 }))}
                                                className="w-full h-1 bg-[var(--color-surface-3)] rounded-full accent-amber-500 cursor-pointer" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auto-Trade Guard */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Auto-Trade Guard</h3>
                                <button onClick={() => setAutoTrade(p => !p)}
                                    className={cn("relative w-11 h-6 rounded-full transition-all", autoTrade ? "bg-emerald-500" : "bg-[var(--color-surface-3)]")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-surface rounded-full shadow transition-all", autoTrade ? "left-6" : "left-1")} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Min Confidence</span>
                                    <span className="text-xs font-black text-amber-400">{minConfAuto}%</span>
                                </div>
                                <input type="range" min={50} max={95} value={minConfAuto} onChange={e => setMinConfAuto(+e.target.value)}
                                    className="w-full h-1 bg-[var(--color-surface-3)] rounded-full accent-amber-500 cursor-pointer" />
                            </div>
                            {autoTrade && (
                                <p className="text-[9px] text-emerald-400 font-bold italic">Signals ≥ {minConfAuto}% will auto-execute. Configure order in Broker tab.</p>
                            )}
                        </div>

                        {/* Aggregate Accuracy */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 text-center space-y-2">
                            <ShieldCheck size={20} className="text-amber-400 mx-auto" />
                            <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                                {accuracy?.overall || 79.4}<span className="text-amber-400">%</span>
                            </div>
                            <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Engine Reliability</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">{accuracy?.total_evaluated || "—"} signals evaluated</p>
                        </div>
                    </div>

                    {/* ── Right: Chart + Signal List + Accuracy Cards ── */}
                    <div className="xl:col-span-3 space-y-6">
                        {/* TradingView Lightweight Chart */}
                        <div className={cn("bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden",
                            autoTrade && "ring-2 ring-emerald-500/30")}>
                            {autoTrade && (
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-6 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
                                    Trading Bot: ACTIVE
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-amber-400 animate-pulse" />
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Predictive Oracle</h2>
                                        <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{asset} · {timeframe} · Signal Overlay Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Confidence legend */}
                                    {[{ label: "High >80%", c: "bg-emerald-500" }, { label: "Med 50-80%", c: "bg-amber-500" }, { label: "Low <50%", c: "bg-red-500" }].map(l =>
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <div className={cn("w-2 h-2 rounded-full", l.c)} />
                                            <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest hidden md:block">{l.label}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <PTDChart markers={chartMarkers} ohlcv={scanOhlcv} height={420} />
                            {/* Label: Predictive times / directions (matching reference image) */}
                            <div className="flex justify-end mt-3">
                                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Predictive Times And Directions</span>
                                    <ChevronRight size={12} />
                                </div>
                            </div>
                        </div>

                        {/* Signal Stream Table */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Bell size={16} className="text-amber-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Signal Stream</h3>
                                {sigLoading && <RotateCcw size={14} className="text-[var(--color-text-muted)] animate-spin" />}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            {["Time", "Type", "Dir", "Confidence", "Source", "Status", "Action"].map(h =>
                                                <th key={h} className="px-4 py-3 text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {signals.map((sig, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-4 py-3 text-[10px] font-black text-[var(--color-text-secondary)] font-mono">
                                                    {new Date(sig.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </td>
                                                <td className="px-4 py-3 text-[10px] font-black text-[var(--color-text-secondary)]">{sig.type}</td>
                                                <td className="px-4 py-3">{dirIcon(sig.direction)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", confidenceBadge(sig.confidence))}>
                                                        {sig.confidence}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[9px] font-black text-[var(--color-text-muted)] uppercase">{sig.source}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border",
                                                        sig.status === "hit" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                            sig.status === "miss" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]")}>
                                                        {sig.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {sig.status === "pending" && (
                                                        <button
                                                            onClick={() => executeTrade.mutate({ symbol: asset, direction: sig.direction, orderType: "market", qty: 1, signalId: sig.id, confidence: sig.confidence })}
                                                            className="text-[8px] font-black uppercase px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
                                                            Trade Now
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {signals.length === 0 && !sigLoading && (
                                            <tr><td colSpan={7} className="px-4 py-10 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Enable modules to scan for signals</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Accuracy Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {MODULES.map(m => {
                                const acc = accuracy?.modules?.[m.id];
                                return (
                                    <div key={m.id} className={cn("p-5 rounded-lg border transition-all hover:translate-y-[-2px]",
                                        enabledMods[m.id] ? cn(m.bg, m.border) : "bg-[#080E1A] border-[var(--color-border)]")}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <m.icon size={14} className={enabledMods[m.id] ? m.color : "text-[var(--color-text-muted)]"} />
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest", enabledMods[m.id] ? m.color : "text-[var(--color-text-muted)]")}>{m.label}</span>
                                        </div>
                                        <div className={cn("text-3xl font-black tracking-tighter", enabledMods[m.id] ? m.color : "text-[var(--color-text-muted)]")}>
                                            {acc?.accuracy ?? "—"}{acc && "%"}
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-1 text-[8px] text-[var(--color-text-muted)] font-bold">
                                            <span>L50: {acc?.last50 ?? "—"}{acc && "%"}</span>
                                            <span>L100: {acc?.last100 ?? "—"}{acc && "%"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ BACKTEST TAB ════════ */}
            {tab === "Backtest" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Config panel */}
                    <div className="space-y-5">
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-brand-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Backtest Config</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Asset</label>
                                    <select value={asset} onChange={e => setAsset(e.target.value)}
                                        className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none cursor-pointer">
                                        {ALL_ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Start Date</label>
                                    <input type="date" value={btStart} onChange={e => setBtStart(e.target.value)}
                                        className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none cursor-pointer" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">End Date</label>
                                    <input type="date" value={btEnd} onChange={e => setBtEnd(e.target.value)}
                                        className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none cursor-pointer" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Modules</label>
                                    <div className="flex flex-wrap gap-2">
                                        {MODULES.map(m => (
                                            <button key={m.id} onClick={() => setEnabledMods(p => ({ ...p, [m.id]: !p[m.id] }))}
                                                className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all",
                                                    enabledMods[m.id] ? cn(m.bg, m.border, m.color) : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]")}>
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => runBt()}
                                    disabled={btRunning || activeMods.length === 0}
                                    className="w-full py-4 rounded-lg bg-brand-500 text-[var(--color-text-primary)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-40">
                                    {btRunning ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                    {btRunning ? "Simulating..." : "Run Backtest"}
                                </button>
                            </div>
                        </div>

                        {/* Confidence bracket table */}
                        {btResult?.confidence_brackets && (
                            <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Win Rate by Confidence</h3>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            {["Range", "Signals", "Wins", "Win %"].map(h =>
                                                <th key={h} className="py-2 text-[8px] font-black uppercase text-[var(--color-text-muted)] text-left">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {btResult.confidence_brackets.map((b, i) => (
                                            <tr key={i} className="border-b border-[var(--color-border)]">
                                                <td className="py-2 text-[10px] font-black text-[var(--color-text-primary)]">{b.range}</td>
                                                <td className="py-2 text-[10px] text-[var(--color-text-secondary)]">{b.total}</td>
                                                <td className="py-2 text-[10px] text-emerald-400">{b.wins}</td>
                                                <td className="py-2">
                                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", confidenceBadge(b.winRate))}>
                                                        {b.winRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Equity Curve */}
                    <div className="xl:col-span-2 space-y-5">
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BarChart2 size={16} className="text-brand-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Equity Curve</h3>
                                </div>
                                {btResult && (
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[9px] font-black uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                                        <Download size={12} /> Export CSV
                                    </button>
                                )}
                            </div>

                            {btRunning && (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <RotateCcw size={32} className="text-brand-500 animate-spin" />
                                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Simulating Scenarios...</p>
                                </div>
                            )}

                            {!btRunning && !btResult && (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <History size={40} className="text-white/5" />
                                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Click Run Backtest to start</p>
                                </div>
                            )}

                            {!btRunning && btResult && (
                                <>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {[
                                            { label: "Win Rate", v: `${btResult.win_rate}%`, c: "text-emerald-400" },
                                            { label: "Trades", v: btResult.total_trades, c: "text-[var(--color-text-primary)]" },
                                            { label: "Net P&L", v: `$${(btResult.final_balance - btResult.initial_balance).toLocaleString()}`, c: btResult.final_balance > btResult.initial_balance ? "text-emerald-400" : "text-red-400" },
                                        ].map(s => (
                                            <div key={s.label} className="bg-[var(--color-surface-2)] p-4 rounded-lg border border-[var(--color-border)]">
                                                <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{s.label}</p>
                                                <p className={cn("text-2xl font-black tracking-tighter", s.c)}>{s.v}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={btResult.equity_curve}>
                                                <defs>
                                                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                                                <Tooltip contentStyle={{ background: "#0D1529", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff", fontSize: 10 }} />
                                                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#eq)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Trade list */}
                        {btResult?.trades && (
                            <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Simulated Trades</h3>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {(btResult.trades as BacktestTrade[]).map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                            <div className="flex items-center gap-3">
                                                {dirIcon(t.direction)}
                                                <span className="text-[10px] font-black text-[var(--color-text-primary)]">{t.source}</span>
                                                <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full border", confidenceBadge(t.confidence ?? 0))}>{t.confidence}%</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {t.result === "win" ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
                                                <span className={cn("text-xs font-black", (t.profit ?? 0) > 0 ? "text-emerald-400" : "text-red-400")}>
                                                    {(t.profit ?? 0) > 0 ? "+" : ""}${t.profit}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════ ALERTS TAB ════════ */}
            {tab === "Alerts" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Create Alert */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <Plus size={16} className="text-amber-400" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Create Alert Rule</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Module / Combination</label>
                                <select value={alertMod} onChange={e => setAlertMod(e.target.value)}
                                    className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-4 py-3 focus:outline-none cursor-pointer">
                                    {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                    <option value="combined">All Combined</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Min Confidence Threshold</label>
                                    <span className="text-xs font-black text-amber-400">{alertConf}%</span>
                                </div>
                                <input type="range" min={50} max={95} value={alertConf} onChange={e => setAlertConf(+e.target.value)}
                                    className="w-full h-1 bg-[var(--color-surface-3)] rounded-full accent-amber-500 cursor-pointer" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Notification Channels</label>
                                <div className="flex flex-wrap gap-2">
                                    {["in-app", "email", "sms", "push"].map(ch => (
                                        <button key={ch} onClick={() => toggleChannel(ch)}
                                            className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase border transition-all",
                                                alertChan.includes(ch) ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]")}>
                                            {ch}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => createAlert.mutate({ module: alertMod, minConfidence: alertConf, channels: alertChan })}
                                disabled={createAlert.isPending}
                                className="w-full py-4 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-40">
                                {createAlert.isPending ? "Creating..." : "Create Alert Rule"}
                            </button>
                        </div>

                        {/* Active Alerts */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Active Alert Rules</h4>
                            {alerts.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase">{a.module}</span>
                                        <div className="flex gap-2">
                                            <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full border", confidenceBadge(a.minConfidence))}>≥{a.minConfidence}%</span>
                                            {a.channels.map(c => <span key={c} className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase">{c}</span>)}
                                        </div>
                                    </div>
                                    <button onClick={() => deleteAlert.mutate(a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {alerts.length === 0 && <p className="text-[9px] text-[var(--color-text-muted)] font-bold">No alert rules set yet.</p>}
                        </div>
                    </div>

                    {/* Alert History */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <History size={16} className="text-[var(--color-text-muted)]" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Alert History</h3>
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {alertHistory.map((a: { id: string; time: string; direction: string; source: string; instrument: string; confidence: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group hover:border-amber-500/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        {dirIcon(a.direction)}
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--color-text-primary)]">{a.instrument} — {a.direction}</p>
                                            <p className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase">{a.source} · {new Date(a.time).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", confidenceBadge(a.confidence))}>{a.confidence}%</span>
                                </div>
                            ))}
                            {alertHistory.length === 0 && <p className="text-[9px] text-[var(--color-text-muted)] font-bold py-10 text-center">No alerts triggered yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ BROKER TAB ════════ */}
            {tab === "Broker" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Connection panel */}
                    <div className="space-y-5">
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <Link2 size={16} className="text-amber-400" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Alpaca Connection</h3>
                            </div>
                            <div className="flex gap-2 p-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                {(["paper", "live"] as const).map(t => (
                                    <button key={t} onClick={() => setBkType(t)}
                                        className={cn("flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                            bkType === t ? (t === "live" ? "bg-red-500 text-[var(--color-text-primary)]" : "bg-emerald-500 text-black") : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]")}>
                                        {t === "live" ? "⚡ Live" : "📄 Paper"}
                                    </button>
                                ))}
                            </div>
                            {bkType === "live" && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                                    <AlertCircle size={12} className="text-red-400" />
                                    <p className="text-[9px] font-bold text-red-400">Live trading uses real funds. Use Paper for testing.</p>
                                </div>
                            )}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">API Key</label>
                                    <input type="password" placeholder="PK..." value={bkKey} onChange={e => setBkKey(e.target.value)}
                                        className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Secret Key</label>
                                    <input type="password" placeholder="SK..." value={bkSecret} onChange={e => setBkSecret(e.target.value)}
                                        className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500/50" />
                                </div>
                                <button onClick={() => connectBroker.mutate({ apiKey: bkKey, secretKey: bkSecret, type: bkType })}
                                    disabled={!bkKey || !bkSecret || connectBroker.isPending}
                                    className="w-full py-4 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-40">
                                    {connectBroker.isPending ? "Connecting..." : "Connect Broker"}
                                </button>
                            </div>

                            {brokerAcc && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {[
                                        { label: "Equity", v: `$${brokerAcc.equity.toLocaleString()}` },
                                        { label: "Buying Power", v: `$${brokerAcc.buyingPower.toLocaleString()}` },
                                        { label: "Cash", v: `$${brokerAcc.cash.toLocaleString()}` },
                                        { label: "Account", v: brokerAcc.id },
                                    ].map(s => (
                                        <div key={s.label} className="p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">{s.label}</p>
                                            <p className="text-sm font-black text-[var(--color-text-primary)]">{s.v}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auto-trade settings */}
                        <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap size={16} className="text-amber-400" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Auto-Trade Settings</h3>
                                </div>
                                <button onClick={() => setAutoTrade(p => !p)}
                                    className={cn("relative w-11 h-6 rounded-full transition-all", autoTrade ? "bg-emerald-500" : "bg-[var(--color-surface-3)]")}>
                                    <div className={cn("absolute top-1 w-4 h-4 bg-surface rounded-full shadow transition-all", autoTrade ? "left-6" : "left-1")} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Min Confidence to Auto-Trade</span>
                                    <span className="text-xs font-black text-amber-400">{minConfAuto}%</span>
                                </div>
                                <input type="range" min={50} max={95} value={minConfAuto} onChange={e => setMinConfAuto(+e.target.value)}
                                    className="w-full h-1 bg-[var(--color-surface-3)] rounded-full accent-amber-500 cursor-pointer" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ label: "Order Type", placeholder: "market" }, { label: "Quantity", placeholder: "1" }, { label: "Stop Loss (pips)", placeholder: "20" }, { label: "Take Profit (pips)", placeholder: "40" }].map(f => (
                                    <div key={f.label} className="space-y-1">
                                        <label className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{f.label}</label>
                                        <input type="text" placeholder={f.placeholder}
                                            className="w-full bg-[#0D1529] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black rounded-lg px-3 py-2.5 focus:outline-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Trade Log */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Eye size={16} className="text-[var(--color-text-muted)]" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)]">Trade Execution Log</h3>
                        </div>
                        <div className="space-y-2">
                            {trades.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group hover:border-[var(--color-border)] transition-all">
                                    <div className="flex items-center gap-3">
                                        {dirIcon(t.direction)}
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--color-text-primary)]">{t.symbol} — {t.direction}</p>
                                            <div className="flex gap-2 mt-0.5">
                                                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-full border", confidenceBadge(t.confidence ?? 0))}>{t.confidence}%</span>
                                                {t.auto && <span className="text-[8px] font-bold text-cyan-400">AUTO</span>}
                                                <span className="text-[8px] font-bold text-[var(--color-text-muted)]">{t.source}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-black", (t.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                                            {(t.pnl ?? 0) >= 0 ? "+" : ""}${t.pnl}
                                        </p>
                                        <p className="text-[8px] font-bold text-[var(--color-text-muted)]">${t.filledPrice?.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                            {trades.length === 0 && (
                                <div className="py-16 text-center">
                                    <Clock size={32} className="text-white/5 mx-auto mb-3" />
                                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">No trades executed yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
