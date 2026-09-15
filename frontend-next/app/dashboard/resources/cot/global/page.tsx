/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from "recharts";
import {
    TrendingUp, TrendingDown, Activity, Download, Eye,
    BarChart3, Table, Zap, Filter, RefreshCcw, Globe,
    ChevronDown, Info,
    Lightbulb, AlertTriangle, ExternalLink, Layers,
    Search, BookOpen, Target, Shield,
} from "lucide-react";
import { useCOTGlobalMatrix, useCOTHistoricalIndex } from "@/hooks/use-resources";
import { cn } from "@/lib/utils";

// ─── Helper ──────────────────────────────────────────────────────────────────
function seed(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
function prand(s: string, off = 0) { return ((seed(s) + off * 7919) % 10000) / 10000; }

const ALL_CCY = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "NOK", "SEK", "DKK", "SGD", "HKD", "ZAR", "MXN", "PLN", "TRY", "CNH", "INR", "BRL", "CZK", "HUF", "ILS"];

const TABS = [
    { id: "summary", label: "Summary", icon: Table },
    { id: "charts", label: "Charts", icon: BarChart3 },
    { id: "analysis", label: "Analysis", icon: Eye },
] as const;

type Tab = typeof TABS[number]["id"];

// ─── CSV Export ──────────────────────────────────────────────────────────────
function exportCSV(rows: any[]) {
    const headers = ["Currency", "NonComm Long", "NonComm Short", "Comm Long", "Comm Short", "Net Position", "OI", "% Long", "Weekly Δ", "COT Index"];
    const csv = [headers.join(","), ...rows.map((r: any) =>
        [r.currency, r.nonCommLong, r.nonCommShort, r.commLong, r.commShort, r.netPosition, r.oi, r.pctLong, r.weeklyChange, r.cotIndex].join(",")
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "COT_Global_Report.csv"; a.click(); URL.revokeObjectURL(url);
}

// ─── Mini Chart Component ────────────────────────────────────────────────────
function MiniChart({ title, color, dataKey, data }: { title: string; color: string; dataKey: string; data: any[] }) {
    return (
        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{title}</span>
            </div>
            <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} />
                        <Tooltip
                            contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function CotGlobalPage() {
    const { data: matrix = [], isLoading: matrixLoading } = useCOTGlobalMatrix();
    const { data: histIndex = {}, isLoading: histLoading } = useCOTHistoricalIndex();

    const [activeTab, setActiveTab] = useState<Tab>("summary");
    const [selectedCcy, setSelectedCcy] = useState("EUR");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter matrix by search
    const filtered = useMemo(() => {
        if (!searchQuery) return matrix;
        const q = searchQuery.toUpperCase();
        return matrix.filter((r: any) => r.currency.includes(q));
    }, [matrix, searchQuery]);

    // Selected currency data for commitments panel
    const selectedData = matrix.find((r: any) => r.currency === selectedCcy) || matrix[0];

    // Historical index chart data for selected currency
    const histChartData = useMemo(() => {
        const h = (histIndex as any)?.[selectedCcy] || [];
        return h.map((p: any) => ({ ...p, name: p.date }));
    }, [histIndex, selectedCcy]);

    // Mini chart data (generate from matrix data for each concept)
    const miniChartData = useMemo(() => {
        return ALL_CCY.slice(0, 12).map(ccy => ({
            name: ccy,
            futures: Math.round(prand(ccy, 60) * 100),
            stochastic: Math.round(prand(ccy, 70) * 100),
            dealers: Math.round((prand(ccy, 80) - 0.5) * 60000),
            nearby: Math.round(prand(ccy, 90) * 80 + 10),
        }));
    }, []);

    // Aggregate stats
    const totalBullish = matrix.filter((r: any) => r.sentiment === "Bullish").length;
    const totalBearish = matrix.filter((r: any) => r.sentiment === "Bearish").length;
    const avgCotIndex = matrix.length ? Math.round(matrix.reduce((s: number, r: any) => s + r.cotIndex, 0) / matrix.length) : 0;

    return (
        <div className="space-y-8">
            {/* ═══ HEADER ═══ */}
            <div className="relative bg-surface border border-[var(--color-border)] p-8 md:p-10 rounded-lg overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-400/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/8 blur-[120px] opacity-30 pointer-events-none" />
                <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                        <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Commitment Of Traders Protocol</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        MMITPS Report{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Data, Charts & Index</span>
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-[0.3em] max-w-xl mx-auto">
                        Institutional-grade COT analytics across {ALL_CCY.length} currencies · Updated weekly
                    </p>

                    {/* Tabs */}
                    <div className="flex items-center justify-center gap-2 pt-3">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                                    activeTab === tab.id
                                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        : "bg-white/[0.02] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ STATS ROW ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Currencies Tracked", value: ALL_CCY.length, icon: Globe, color: "text-cyan-400" },
                    { label: "Bullish Signals", value: totalBullish, icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Bearish Signals", value: totalBearish, icon: TrendingDown, color: "text-red-400" },
                    { label: "Avg COT Index", value: avgCotIndex, icon: Activity, color: "text-amber-400" },
                ].map(s => (
                    <div key={s.label} className="bg-surface border border-[var(--color-border)] p-5 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{s.label}</p>
                            <p className={cn("text-2xl font-black mt-1", s.color)}>{s.value}</p>
                        </div>
                        <s.icon className={cn("w-5 h-5", s.color, "opacity-30")} />
                    </div>
                ))}
            </div>

            {/* ═══ TAB 1: SUMMARY — FULL DATA MATRIX ═══ */}
            {activeTab === "summary" && (
                <div className="space-y-8">
                    <div className="bg-[#111827] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                        {/* Table header bar */}
                        <div className="p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-cyan-500" />
                                    Global COT Positioning Matrix
                                </h2>
                                <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1">
                                    {filtered.length} currencies · Non-Commercial & Commercial breakdown
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="flex items-center bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-2 gap-2">
                                    <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                                        placeholder="Filter..."
                                        className="bg-transparent text-xs font-bold text-[var(--color-text-secondary)] outline-none w-20 placeholder:text-white/15"
                                    />
                                </div>
                                {/* Export */}
                                <button
                                    onClick={() => exportCSV(filtered)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                                >
                                    <Download className="w-3 h-3" /> CSV
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {matrixLoading ? (
                                <div className="py-20 flex justify-center"><RefreshCcw className="w-6 h-6 animate-spin text-white/10" /></div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-[1100px]">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-[var(--color-border)]">
                                            {["Currency", "NC Long", "NC Short", "Comm Long", "Comm Short", "Net Pos", "OI", "% Long", "Weekly Δ", "COT Idx", "Stoch", "Sentiment"].map(h => (
                                                <th key={h} className="p-3 px-4 text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-center first:text-left first:pl-6">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((row: any, idx: number) => (
                                            <tr
                                                key={row.currency}
                                                onClick={() => setSelectedCcy(row.currency)}
                                                className={cn(
                                                    "border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors cursor-pointer",
                                                    selectedCcy === row.currency && "bg-cyan-500/[0.04]"
                                                )}
                                            >
                                                <td className="p-3 pl-6 text-xs font-black text-[var(--color-text-primary)] tracking-widest font-mono">{row.currency}</td>
                                                <td className="p-3 text-center text-xs text-emerald-400/70 font-mono">{row.nonCommLong?.toLocaleString()}</td>
                                                <td className="p-3 text-center text-xs text-red-400/70 font-mono">{row.nonCommShort?.toLocaleString()}</td>
                                                <td className="p-3 text-center text-xs text-cyan-400/50 font-mono">{row.commLong?.toLocaleString()}</td>
                                                <td className="p-3 text-center text-xs text-brand-400/50 font-mono">{row.commShort?.toLocaleString()}</td>
                                                <td className={cn("p-3 text-center text-xs font-black font-mono", row.netPosition >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                    {row.netPosition?.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center text-xs text-[var(--color-text-muted)] font-mono">{row.oi?.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-12 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pctLong}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">{row.pctLong}%</span>
                                                    </div>
                                                </td>
                                                <td className={cn("p-3 text-center text-xs font-black font-mono", row.weeklyChange > 0 ? "text-emerald-400" : row.weeklyChange < 0 ? "text-red-400" : "text-[var(--color-text-muted)]")}>
                                                    {row.weeklyChange > 0 ? "+" : ""}{row.weeklyChange?.toLocaleString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-lg text-[9px] font-black",
                                                        row.cotIndex > 70 ? "bg-emerald-500/10 text-emerald-400" :
                                                            row.cotIndex < 30 ? "bg-red-500/10 text-red-400" :
                                                                "bg-amber-500/10 text-amber-400"
                                                    )}>{row.cotIndex}</span>
                                                </td>
                                                <td className="p-3 text-center text-[10px] font-bold text-[var(--color-text-muted)] font-mono">{row.stochastic}</td>
                                                <td className="p-3 text-center">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                        row.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                            row.sentiment === "Bearish" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    )}>{row.sentiment}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* ═══ GRADIENT CTA BANNER ═══ */}
                    <div className="relative p-8 rounded-lg overflow-hidden text-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/30 via-blue-600/30 to-brand-600/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] to-transparent opacity-50" />
                        <div className="relative z-10 space-y-4">
                            <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.4em]">Start Your Trading Analysis Now</p>
                            <a
                                href="/dashboard/resources/macro/strength"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                            >
                                <Target className="w-3.5 h-3.5" /> Open Strength Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB 2: CHARTS ═══ */}
            {activeTab === "charts" && (
                <div className="space-y-8">
                    {/* COT Commitments Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: COT Breakdown */}
                        <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <Layers className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">COT Commitments of Traders</h3>
                                    <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">
                                        {selectedCcy} · Breakdown by trader category
                                    </p>
                                </div>
                            </div>

                            {/* Currency selector */}
                            <div className="flex flex-wrap gap-1.5">
                                {ALL_CCY.slice(0, 12).map(ccy => (
                                    <button
                                        key={ccy}
                                        onClick={() => setSelectedCcy(ccy)}
                                        className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            selectedCcy === ccy
                                                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                                : "bg-white/[0.03] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
                                        )}
                                    >{ccy}</button>
                                ))}
                                <button
                                    className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/[0.03] text-white/15 border border-[var(--color-border)]"
                                >+{ALL_CCY.length - 12}</button>
                            </div>

                            {selectedData && (
                                <div className="space-y-3">
                                    {[
                                        { label: "Non-Commercial", long: selectedData.nonCommLong, short: selectedData.nonCommShort, color: "emerald" },
                                        { label: "Commercial", long: selectedData.commLong, short: selectedData.commShort, color: "cyan" },
                                        { label: "Non-Reportable", long: selectedData.nonRepLong || 0, short: selectedData.nonRepShort || 0, color: "amber" },
                                    ].map(cat => {
                                        const total = cat.long + cat.short;
                                        const pct = total > 0 ? Math.round((cat.long / total) * 100) : 50;
                                        return (
                                            <div key={cat.label} className="p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{cat.label}</span>
                                                    <span className="text-[9px] font-bold text-white/15">{pct}% long</span>
                                                </div>
                                                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                                                    <div className={`bg-${cat.color}-500/60 rounded-l-full`} style={{ width: `${pct}%` }} />
                                                    <div className="bg-red-500/40 flex-1 rounded-r-full" />
                                                </div>
                                                <div className="flex justify-between text-[9px] font-mono">
                                                    <span className="text-emerald-400/50">L: {cat.long?.toLocaleString()}</span>
                                                    <span className="text-red-400/50">S: {cat.short?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Net COT Directional */}
                        <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <Activity className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Net COT Directional</h3>
                                    <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">
                                        Sentiment overview for {selectedCcy}
                                    </p>
                                </div>
                            </div>

                            {selectedData && (
                                <div className="space-y-4">
                                    <div className="p-6 rounded-lg bg-gradient-to-br from-[#111827] to-[#0D1117] border border-[var(--color-border)] text-center space-y-3">
                                        <p className="text-5xl font-black text-[var(--color-text-primary)] font-mono">{selectedData.netPosition?.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Net Non-Commercial Position</p>
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            selectedData.sentiment === "Bullish" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {selectedData.sentiment === "Bullish" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {selectedData.sentiment} Outlook
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "COT Index", value: selectedData.cotIndex, suffix: "/100" },
                                            { label: "Stochastic", value: selectedData.stochastic, suffix: "%" },
                                            { label: "Weekly Δ", value: (selectedData.weeklyChange > 0 ? "+" : "") + selectedData.weeklyChange?.toLocaleString() },
                                        ].map(s => (
                                            <div key={s.label} className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)] text-center">
                                                <p className="text-[8px] font-black text-white/15 uppercase tracking-widest">{s.label}</p>
                                                <p className="text-sm font-black text-[var(--color-text-secondary)] mt-1 font-mono">{s.value}{s.suffix || ""}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4 Mini Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MiniChart title="Futures" color="#06b6d4" dataKey="futures" data={miniChartData} />
                        <MiniChart title="Stochastic" color="#10b981" dataKey="stochastic" data={miniChartData} />
                        <MiniChart title="Dealers" color="#10b981" dataKey="dealers" data={miniChartData} />
                        <MiniChart title="Nearby" color="#ef4444" dataKey="nearby" data={miniChartData} />
                    </div>

                    {/* COT Historical Index */}
                    <div className="bg-[#111827] border border-[var(--color-border)] rounded-[28px] p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">COT Historical Index</h3>
                                    <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">12-week trend for {selectedCcy}</p>
                                </div>
                            </div>
                            <a href="#" className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                                Update <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Currency chips */}
                        <div className="flex flex-wrap gap-1.5">
                            {ALL_CCY.map(ccy => (
                                <button
                                    key={ccy}
                                    onClick={() => setSelectedCcy(ccy)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        selectedCcy === ccy
                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                            : "bg-white/[0.03] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
                                    )}
                                >{ccy}</button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="h-[280px]">
                            {histLoading ? (
                                <div className="h-full flex items-center justify-center"><RefreshCcw className="w-6 h-6 animate-spin text-white/10" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={histChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        <XAxis dataKey="date" stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 100]} stroke="#4b5563" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }} />
                                        <Line type="monotone" dataKey="cotIndex" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5, fill: "#10b981" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB 3: ANALYSIS ═══ */}
            {activeTab === "analysis" && (
                <div className="space-y-8">
                    {/* Observations & Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Key Observations */}
                        <div className="bg-surface border border-cyan-500/10 rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Key Observations</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: TrendingUp, color: "text-emerald-400", text: `${totalBullish} currencies show bullish non-commercial positioning this week, suggesting broad risk-on sentiment.` },
                                    { icon: AlertTriangle, color: "text-amber-400", text: `Average COT Index at ${avgCotIndex}/100 indicates ${avgCotIndex > 60 ? "extended long positioning" : avgCotIndex < 40 ? "oversold conditions" : "neutral market equilibrium"}.` },
                                    { icon: Shield, color: "text-cyan-400", text: "Commercial hedgers are net short in G10 currencies, consistent with producer hedging at current price levels." },
                                    { icon: Activity, color: "text-brand-400", text: "Open interest has expanded across emerging market currencies, signaling increased speculative activity in PLN, CZK, and HUF." },
                                ].map((obs, i) => (
                                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <obs.icon className={cn("w-4 h-4 shrink-0 mt-0.5", obs.color)} />
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium">{obs.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggested Actions */}
                        <div className="bg-surface border border-amber-500/10 rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <Target className="w-4 h-4 text-amber-400" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Suggested Actions</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { text: "Monitor EUR and GBP for potential reversal — COT index approaching extreme readings. Consider contrarian setups if index exceeds 85.", priority: "High" },
                                    { text: "JPY commercial positioning at multi-week extremes. Watch for BOJ intervention signals alongside COT data for confirmation.", priority: "Medium" },
                                    { text: "AUD and NZD showing divergence in speculative positioning. Look for relative value opportunities in AUDNZD cross.", priority: "Medium" },
                                    { text: "Emerging market currencies (ZAR, MXN, TRY) showing increased volatility in COT flows. Reduce position sizes in exotic pairs.", priority: "Low" },
                                ].map((action, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest",
                                                action.priority === "High" ? "bg-red-500/10 text-red-400" :
                                                    action.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                                        "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                                            )}>{action.priority}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium">{action.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Fundamental Changes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Changes */}
                        <div className="bg-surface border border-teal-500/10 rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                    <BookOpen className="w-4 h-4 text-teal-400" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Fundamental Changes</h3>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { ccy: "USD", event: "FOMC held rates steady at 5.25-5.50%", impact: "Neutral", date: "Mar 01" },
                                    { ccy: "EUR", event: "ECB signals June rate cut, inflation easing", impact: "Bearish", date: "Feb 28" },
                                    { ccy: "JPY", event: "BOJ considering exit from negative rates", impact: "Bullish", date: "Feb 27" },
                                    { ccy: "GBP", event: "UK GDP revised upward to 0.3% Q4", impact: "Bullish", date: "Feb 26" },
                                    { ccy: "AUD", event: "RBA holds, employment data mixed", impact: "Neutral", date: "Feb 25" },
                                ].map((e, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <span className="text-xs font-black text-cyan-400 font-mono w-8">{e.ccy}</span>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold">{e.event}</p>
                                            <p className="text-[8px] text-white/15 uppercase tracking-widest mt-0.5">{e.date}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                            e.impact === "Bullish" ? "text-emerald-400 bg-emerald-500/10" :
                                                e.impact === "Bearish" ? "text-red-400 bg-red-500/10" :
                                                    "text-amber-400 bg-amber-500/10"
                                        )}>{e.impact}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Interpretation */}
                        <div className="bg-surface border border-orange-500/10 rounded-[28px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-brand-500/10 border border-orange-500/20">
                                    <Info className="w-4 h-4 text-brand-400" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Data Interpretation</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                        The Commitment of Traders (COT) report is released weekly by the CFTC and provides a breakdown
                                        of open interest positions held by different categories of traders in futures markets.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { cat: "Non-Commercial", desc: "Large speculators (hedge funds, CTAs). Their positioning often indicates momentum direction.", color: "text-emerald-400" },
                                        { cat: "Commercial", desc: "Hedgers (producers, consumers). Typically contrarian — extreme positions may signal reversals.", color: "text-cyan-400" },
                                        { cat: "Non-Reportable", desc: "Small speculators. Generally considered noise but extremes can signal retail crowding.", color: "text-amber-400" },
                                    ].map(c => (
                                        <div key={c.cat} className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", c.color)}>{c.cat}</p>
                                            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed font-medium">{c.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ FOOTER ═══ */}
            <footer className="pt-8 pb-4 text-center">
                <div className="flex items-center justify-center gap-6">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                        <Layers className="w-5 h-5 text-white/10" />
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                        <Globe className="w-5 h-5 text-cyan-500/20" />
                    </div>
                </div>
                <p className="text-[8px] text-white/10 font-black tracking-[0.5em] uppercase mt-4 flex items-center justify-center gap-4">
                    <span className="h-px w-16 bg-[var(--color-surface-2)]" />
                    MMITPS · COT INTELLIGENCE PROTOCOL v2.0
                    <span className="h-px w-16 bg-[var(--color-surface-2)]" />
                </p>
            </footer>
        </div>
    );
}
