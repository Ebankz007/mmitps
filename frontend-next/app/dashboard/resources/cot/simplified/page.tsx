/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
    Activity, TrendingUp, BarChart3, Download,
    Layers, Globe, RefreshCcw, ChevronDown,
    Shield, Target, BookOpen
} from "lucide-react";
import { useCOTGlobalMatrix } from "@/hooks/use-resources";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
type COTRow = {
    currency: string;
    nonCommLong: number; nonCommShort: number;
    commLong: number; commShort: number;
    nonRepLong: number; nonRepShort: number;
    oi: number; netPosition: number; pctLong: number;
    weeklyChange: number; cotIndex: number; stochastic: number;
    dealersNet: number; sentiment: string;
};

// ─── Horizontal bar (green/red) ──────────────────────────────────────────────
function PositionBar({ long, short }: { long: number; short: number }) {
    const total = long + short;
    const pct = total > 0 ? Math.round((long / total) * 100) : 50;
    return (
        <div className="flex gap-0.5 h-[18px] w-full rounded-[4px] overflow-hidden">
            <div className="bg-emerald-500/50  rounded-l-[4px] transition-all duration-500" style={{ width: `${pct}%` }} />
            <div className="bg-red-500/40 flex-1 rounded-r-[4px]" />
        </div>
    );
}

// ─── Net change badge ────────────────────────────────────────────────────────
function NetBadge({ value }: { value: number }) {
    return (
        <span className={cn(
            "text-[10px] font-black font-mono",
            value > 0 ? "text-emerald-400" : value < 0 ? "text-red-400" : "text-[var(--color-text-muted)]"
        )}>
            {value > 0 ? "+" : ""}{value.toLocaleString()}
        </span>
    );
}

// ─── COT Index pill ──────────────────────────────────────────────────────────
function IndexPill({ value }: { value: number }) {
    return (
        <span className={cn(
            "px-2 py-0.5 rounded-md text-[9px] font-black",
            value > 70 ? "bg-emerald-500/15 text-emerald-400" :
                value < 30 ? "bg-red-500/15 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
        )}>{value}</span>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function COTSimplifiedPage() {
    const { data: matrix = [], isLoading } = useCOTGlobalMatrix();
    const [sortKey, setSortKey] = useState<string>("currency");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    // Sort
    const sorted: COTRow[] = useMemo(() => {
        const rows = [...matrix] as COTRow[];
        rows.sort((a: COTRow, b: COTRow) => {
            const va = a[sortKey as keyof COTRow];
            const vb = b[sortKey as keyof COTRow];
            if (typeof va === "number") return sortDir === "asc" ? va - (vb as number) : (vb as number) - va;
            return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
        });
        return rows;
    }, [matrix, sortKey, sortDir]);

    const toggleSort = (key: string) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    // Aggregate
    const totalBullish = matrix.filter((r: { sentiment?: string }) => r.sentiment === "Bullish").length;
    const totalBearish = matrix.filter((r: { sentiment?: string }) => r.sentiment === "Bearish").length;
    const overallBias = totalBullish > totalBearish ? "LONG" : totalBullish < totalBearish ? "SHORT" : "NEUTRAL";
    const biasColor = overallBias === "LONG" ? "text-emerald-400" : overallBias === "SHORT" ? "text-red-400" : "text-amber-400";

    // CSV export
    function exportCSV() {
        const h = ["Currency", "NC Long", "NC Short", "Comm Long", "Comm Short", "NR Long", "NR Short", "Net", "OI", "%Long", "Δ Week", "COT Idx", "Stoch", "Sentiment"];
        const csv = [h.join(","), ...sorted.map(r =>
            [r.currency, r.nonCommLong, r.nonCommShort, r.commLong, r.commShort, r.nonRepLong, r.nonRepShort, r.netPosition, r.oi, r.pctLong, r.weeklyChange, r.cotIndex, r.stochastic, r.sentiment].join(",")
        )].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "COT_Simplified.csv"; a.click();
    }

    // ─── Column group definitions matching mockup ──────────────────────────
    const COL_GROUPS = [
        {
            label: "Non-Commercial", cols: [
                { key: "nonCommLong", label: "Long", type: "num", color: "text-emerald-400/70" },
                { key: "nonCommShort", label: "Short", type: "num", color: "text-red-400/70" },
                { key: "_ncBar", label: "Position", type: "bar" },
            ]
        },
        {
            label: "Commercial (Hedgers)", cols: [
                { key: "commLong", label: "Long", type: "num", color: "text-cyan-400/60" },
                { key: "commShort", label: "Short", type: "num", color: "text-brand-400/60" },
                { key: "_cBar", label: "Position", type: "bar" },
            ]
        },
        {
            label: "Non-Reportable", cols: [
                { key: "nonRepLong", label: "Long", type: "num", color: "text-emerald-400/40" },
                { key: "nonRepShort", label: "Short", type: "num", color: "text-red-400/40" },
                { key: "_nrBar", label: "Position", type: "bar" },
            ]
        },
        {
            label: "Positioning", cols: [
                { key: "netPosition", label: "Net", type: "net" },
                { key: "weeklyChange", label: "Δ Week", type: "net" },
                { key: "pctLong", label: "% Long", type: "pct" },
            ]
        },
        {
            label: "Index & Signals", cols: [
                { key: "cotIndex", label: "COT Idx", type: "idx" },
                { key: "stochastic", label: "Stoch", type: "idx" },
                { key: "sentiment", label: "Signal", type: "signal" },
            ]
        },
    ];

    return (
        <div className="space-y-8">
            {/* ═══ HEADER ═══ */}
            <div className="relative bg-surface border border-[var(--color-border)] p-8 md:p-10 rounded-lg overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-emerald-500/8 blur-[100px] opacity-25 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <Activity className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Simplified Sentiment Protocol</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        COT{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Simplified</span>
                    </h1>
                    <p className="text-white/15 text-xs font-bold uppercase tracking-[0.3em] max-w-xl mx-auto">
                        Where the "Big Money" is moving — directional bars for {matrix.length || 23} currencies
                    </p>

                    {/* Navigation pills */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {[
                            { label: "Summary", icon: BarChart3, href: "/dashboard/resources/cot/simplified" },
                            { label: "Global", icon: Globe, href: "/dashboard/resources/cot/global" },
                            { label: "Pro Max", icon: Layers, href: "/dashboard/resources/cot/pro-max" },
                        ].map(tab => (
                            <a
                                key={tab.label}
                                href={tab.href}
                                className={cn(
                                    "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                                    tab.label === "Summary"
                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                                        : "bg-white/[0.02] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </a>
                        ))}
                    </div>

                    {/* Overall bias */}
                    <div className="flex items-center justify-center gap-6 pt-3">
                        <div className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/[0.03] border border-[var(--color-border)]">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Overall Bias</span>
                            <span className={cn("text-sm font-black uppercase tracking-widest", biasColor)}>{overallBias}</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/[0.03] border border-[var(--color-border)]">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Bullish</span>
                            <span className="text-sm font-black text-emerald-400">{totalBullish}</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/[0.03] border border-[var(--color-border)]">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Bearish</span>
                            <span className="text-sm font-black text-red-400">{totalBearish}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MAIN DATA MATRIX ═══ */}
            <div className="bg-[#111827] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-5 px-6 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">COT Positioning Matrix</h2>
                            <p className="text-[9px] text-white/15 font-bold uppercase tracking-widest mt-0.5">{sorted.length} currencies · Click column headers to sort</p>
                        </div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                    >
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex justify-center"><RefreshCcw className="w-6 h-6 animate-spin text-white/10" /></div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[1400px]">
                            {/* Column group headers */}
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="p-2 pl-6 text-[7px] font-black text-white/10 uppercase tracking-widest" rowSpan={2}>CCY</th>
                                    {COL_GROUPS.map(g => (
                                        <th
                                            key={g.label}
                                            colSpan={g.cols.length}
                                            className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest border-l border-white/[0.03]"
                                        >{g.label}</th>
                                    ))}
                                </tr>
                                <tr className="bg-white/[0.01] border-b border-[var(--color-border)]">
                                    {COL_GROUPS.flatMap(g => g.cols.map(c => (
                                        <th
                                            key={c.key}
                                            onClick={() => c.type !== "bar" && toggleSort(c.key)}
                                            className={cn(
                                                "p-2 text-center text-[7px] font-black text-[var(--color-text-muted)] uppercase tracking-widest border-l border-white/[0.02]",
                                                c.type !== "bar" && "cursor-pointer hover:text-[var(--color-text-secondary)]"
                                            )}
                                        >
                                            <span className="flex items-center justify-center gap-1">
                                                {c.label}
                                                {sortKey === c.key && <ChevronDown className={cn("w-2.5 h-2.5 transition-transform", sortDir === "desc" && "rotate-180")} />}
                                            </span>
                                        </th>
                                    )))}
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((row) => (
                                    <tr key={row.currency} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                                        {/* Currency */}
                                        <td className="p-2.5 pl-6 text-xs font-black text-[var(--color-text-primary)] tracking-widest font-mono">{row.currency}</td>

                                        {/* Non-Commercial */}
                                        <td className="p-2 text-center text-[10px] text-emerald-400/70 font-mono border-l border-white/[0.02]">{row.nonCommLong?.toLocaleString()}</td>
                                        <td className="p-2 text-center text-[10px] text-red-400/70 font-mono">{row.nonCommShort?.toLocaleString()}</td>
                                        <td className="p-2 px-3 w-28"><PositionBar long={row.nonCommLong} short={row.nonCommShort} /></td>

                                        {/* Commercial */}
                                        <td className="p-2 text-center text-[10px] text-cyan-400/60 font-mono border-l border-white/[0.02]">{row.commLong?.toLocaleString()}</td>
                                        <td className="p-2 text-center text-[10px] text-brand-400/60 font-mono">{row.commShort?.toLocaleString()}</td>
                                        <td className="p-2 px-3 w-28"><PositionBar long={row.commLong} short={row.commShort} /></td>

                                        {/* Non-Reportable */}
                                        <td className="p-2 text-center text-[10px] text-emerald-400/40 font-mono border-l border-white/[0.02]">{(row.nonRepLong || 0).toLocaleString()}</td>
                                        <td className="p-2 text-center text-[10px] text-red-400/40 font-mono">{(row.nonRepShort || 0).toLocaleString()}</td>
                                        <td className="p-2 px-3 w-28"><PositionBar long={row.nonRepLong || 0} short={row.nonRepShort || 0} /></td>

                                        {/* Positioning */}
                                        <td className="p-2 text-center border-l border-white/[0.02]"><NetBadge value={row.netPosition} /></td>
                                        <td className="p-2 text-center"><NetBadge value={row.weeklyChange} /></td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className="w-10 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${row.pctLong}%` }} />
                                                </div>
                                                <span className="text-[9px] font-bold text-[var(--color-text-muted)]">{row.pctLong}%</span>
                                            </div>
                                        </td>

                                        {/* Index & Signals */}
                                        <td className="p-2 text-center border-l border-white/[0.02]"><IndexPill value={row.cotIndex} /></td>
                                        <td className="p-2 text-center text-[10px] font-bold text-[var(--color-text-muted)] font-mono">{row.stochastic}</td>
                                        <td className="p-2 text-center">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border",
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

            {/* ═══ FOOTER PANELS ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reading Guide */}
                <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">How to Read</h3>
                    </div>
                    <div className="space-y-2 text-[10px] text-[var(--color-text-muted)] leading-relaxed font-medium">
                        <p>• <span className="text-emerald-400">Green bars</span> = long contracts (buyers)</p>
                        <p>• <span className="text-red-400">Red bars</span> = short contracts (sellers)</p>
                        <p>• Wider green = more bullish positioning</p>
                        <p>• <span className="text-[var(--color-text-secondary)]">COT Index</span> &gt;70 = extreme bullish, &lt;30 = extreme bearish</p>
                        <p>• Commercial hedgers often signal contrarian reversals at extremes</p>
                    </div>
                </div>

                {/* Data Source */}
                <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <h3 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Data Source</h3>
                    </div>
                    <div className="space-y-2 text-[10px] text-[var(--color-text-muted)] leading-relaxed font-medium">
                        <p>• CFTC Commitment of Traders Report</p>
                        <p>• Released every Friday (as of Tuesday close)</p>
                        <p>• Covers futures and options on major currency contracts</p>
                        <p>• Non-Commercial = hedge funds & CTAs</p>
                        <p>• Commercial = banks & producers hedging exposure</p>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Trading Tips</h3>
                    </div>
                    <div className="space-y-2 text-[10px] text-[var(--color-text-muted)] leading-relaxed font-medium">
                        <p>• Follow non-commercial direction for trend confirmation</p>
                        <p>• Watch for extremes — commercial positioning often leads reversals</p>
                        <p>• Weekly changes matter more than absolute levels</p>
                        <p>• Combine with price action and fundamental analysis</p>
                        <p>• Use the COT Index as a relative positioning gauge</p>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 pb-4">
                <a
                    href="/dashboard/resources/cot/global"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                >
                    <Globe className="w-3.5 h-3.5" /> Full Global Report
                </a>
                <a
                    href="/dashboard/resources/macro/strength"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                >
                    <TrendingUp className="w-3.5 h-3.5" /> Fundamental Strength
                </a>
            </div>

            {/* Protocol footer */}
            <footer className="text-center pb-4">
                <p className="text-[7px] text-white/8 font-black tracking-[0.5em] uppercase flex items-center justify-center gap-4">
                    <span className="h-px w-12 bg-[var(--color-surface-2)]" />
                    MMITPS · COT SIMPLIFIED PROTOCOL v2.0
                    <span className="h-px w-12 bg-[var(--color-surface-2)]" />
                </p>
            </footer>
        </div>
    );
}
