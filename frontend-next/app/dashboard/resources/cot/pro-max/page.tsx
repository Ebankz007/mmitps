"use client";

import { useState, useMemo } from "react";
import {
    TrendingUp, Activity,
    Search, Coins, Droplets, Landmark,
    MousePointer, ShieldCheck, Waves, RotateCcw, Clock,
    Zap, Rocket, Plus, RotateCw,
    LineChart as ChartIcon,
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { useCOTGlobalMatrix } from "@/hooks/use-resources";
import { cn } from "@/lib/utils";
import TradingViewChart from "@/components/charts/TradingViewChart";

// ─── Deterministic seed ──────────────────────────────────────────────────────
function seed(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
function prand(s: string, off = 0) { return ((seed(s) + off * 7919) % 10000) / 10000; }

// ─── Markets data ────────────────────────────────────────────────────────────
const MARKETS = [
    { id: "AUD", name: "AUSTRALIAN DOLLAR", class: "FX" },
    { id: "EUR", name: "EURO", class: "FX" },
    { id: "GBP", name: "BRITISH POUND", class: "FX" },
    { id: "JPY", name: "JAPANESE YEN", class: "FX" },
    { id: "CAD", name: "CANADIAN DOLLAR", class: "FX" },
    { id: "CHF", name: "SWISS FRANC", class: "FX" },
    { id: "NZD", name: "NEW ZEALAND DOLLAR", class: "FX" },
    { id: "MXN", name: "MEXICAN PESO", class: "FX" },
    { id: "SP500", name: "S&P 500", class: "Index" },
    { id: "NQ100", name: "NASDAQ 100", class: "Index" },
    { id: "GOLD", name: "GOLD", class: "Metals" },
    { id: "SILVER", name: "SILVER", class: "Metals" },
    { id: "CL", name: "CRUDE OIL", class: "Energy" },
    { id: "NG", name: "NATURAL GAS", class: "Energy" },
    { id: "ZN", name: "10-YEAR T-NOTE", class: "Bonds" },
    { id: "WHEAT", name: "WHEAT", class: "Agri" },
    { id: "CORN", name: "CORN", class: "Agri" },
    { id: "BTC", name: "BITCOIN", class: "Crypto" },
];

const MONTHS_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CHART_TYPES = ["COT Positions", "COT Index", "Net Position", "% Change"];
const AGENT_TYPES = ["Comm positions", "Non-Comm positions", "All Traders", "Managed Money", "Leveraged Funds"];
const ZOOM_OPTIONS = ["3m", "6m", "1y", "3y", "All"];
const INDEX_TABS = [
    { id: "grid", label: "COT Index Grid" },
    { id: "36m", label: "COT 36 Month" },
    { id: "18m", label: "COT 18 Months" },
    { id: "6m", label: "COT 6 Months" },
];

function generateChartData(marketId: string, months: number) {
    const data = [];
    const basePrice = 50 + prand(marketId, 0) * 200;
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = "01";
        const timeStr = `${yyyy}-${mm}-${dd}`;

        const m = d.getMonth();
        const price = +(basePrice + (prand(marketId, i + 100) - 0.45) * 40 * (i / months + 0.5)).toFixed(2);
        const open = +(price + (prand(marketId, i + 101) - 0.5) * 5).toFixed(2);
        const high = +(Math.max(open, price) + prand(marketId, i + 102) * 5).toFixed(2);
        const low = +(Math.min(open, price) - prand(marketId, i + 103) * 5).toFixed(2);

        data.push({
            name: MONTHS_LABEL[m] + (months > 12 ? ` &apos;${String(yyyy).slice(-2)}` : ""),
            time: timeStr,
            open, high, low, close: price, price,
            cotIndex: Math.round(prand(marketId, i + 200) * 100),
            commLong: Math.round(50000 + prand(marketId, i + 300) * 120000),
            commShort: Math.round(40000 + prand(marketId, i + 400) * 100000),
            nonCommLong: Math.round(30000 + prand(marketId, i + 500) * 80000),
            nonCommShort: Math.round(20000 + prand(marketId, i + 600) * 60000),
            netPosition: Math.round((prand(marketId, i + 700) - 0.5) * 80000),
        });
    }
    return data;
}

// ─── Index grid cell color ───────────────────────────────────────────────────
function idxColor(val: number) {
    if (val >= 90) return "bg-emerald-500/20 text-emerald-400 font-black";
    if (val >= 70) return "bg-emerald-500/10 text-emerald-400/70";
    if (val <= 10) return "bg-red-500/20 text-red-400 font-black";
    if (val <= 30) return "bg-red-500/10 text-red-400/70";
    return "bg-amber-500/5 text-amber-400/50";
}

// ═════════════════════════════════════════════════════════════════════════════
export default function CotProMaxPage() {
    const { data: matrix = [] } = useCOTGlobalMatrix();
    void matrix;
    const [selectedMarket, setSelectedMarket] = useState("AUD");
    const [chartType, setChartType] = useState("COT Positions");
    const [agentType, setAgentType] = useState("Comm positions");
    const [activeIndexTab, setActiveIndexTab] = useState("grid");
    const [activePeriod, setActivePeriod] = useState("week");
    const [zoom, setZoom] = useState("1y");
    const [searchQuery, setSearchQuery] = useState("");

    const months = zoom === "3m" ? 3 : zoom === "6m" ? 6 : zoom === "1y" ? 12 : zoom === "3y" ? 36 : 60;
    const chartData = useMemo(() => generateChartData(selectedMarket, months), [selectedMarket, months]);
    const marketInfo = MARKETS.find(m => m.id === selectedMarket) || MARKETS[0];

    // Index grid data per market
    const indexGridData = useMemo(() => {
        return MARKETS.filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase())).map(m => ({
            ...m,
            idx36: Math.round(prand(m.id, 36) * 100),
            idx18: Math.round(prand(m.id, 18) * 100),
            idx6: Math.round(prand(m.id, 6) * 100),
            commPctChgLong: +((prand(m.id, 50) - 0.5) * 10).toFixed(1),
            commPctChgShort: +((prand(m.id, 51) - 0.5) * 10).toFixed(1),
            nonCommPctChgLong: +((prand(m.id, 60) - 0.5) * 10).toFixed(1),
            nonCommPctChgShort: +((prand(m.id, 61) - 0.5) * 10).toFixed(1),
            seasonality: Math.round((prand(m.id, 70) - 0.5) * 6),
        }));
    }, [searchQuery]);

    // 4 static chart datasets for the "Key Markets" section
    const SP500 = useMemo(() => generateChartData("SP500", 12), []);
    const GOLD = useMemo(() => generateChartData("GOLD", 12), []);
    const OIL = useMemo(() => generateChartData("CL", 12), []);
    const TREASURY = useMemo(() => generateChartData("ZN", 12), []);

    return (
        <div className="space-y-8">
            {/* ═══ HERO HEADER ═══ */}
            <div className="relative bg-surface border border-[var(--color-border)] p-8 md:p-12 rounded-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Institutional-Grade COT Analysis</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase">
                            Trade with the <span className="text-amber-400">Giants</span> of Today&apos;s Markets
                        </h1>
                        <p className="text-[var(--color-text-muted)] text-sm font-medium leading-relaxed">
                            Our unrivalled analysis of the Commitments of Traders report allows you to see every active institutional position.
                            The only true record of what is happening right now in the markets.
                        </p>
                    </div>
                    <a
                        href="#charts-workspace"
                        className="shrink-0 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_15px_40px_rgba(16, 185, 129,0.25)] flex items-center gap-3"
                    >
                        <ChartIcon className="h-4 w-4" /> View Latest Positions
                    </a>
                </div>
            </div>

            {/* ═══ MARKET DIRECTION ═══ */}
            <div className="bg-surface border-l-[6px] border-amber-500 border-y border-r border-[var(--color-border)] p-8 rounded-lg space-y-3">
                <h2 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">
                    MARKET DIRECTION <span className="text-amber-400 italic">• Trade with the market. Not against it.</span>
                </h2>
                <p className="text-[var(--color-text-muted)] text-sm font-medium leading-relaxed max-w-4xl">
                    Never again will you enter a trend just as it ends or believe a trend is ending only for it to roar on for weeks.
                    The Commitments of Traders is the only true record of what is happening right now in the markets, accessible by private/retail traders.
                </p>
            </div>

            {/* ═══ COT INDEX GRID (from mockup image) ═══ */}
            <div className="bg-[#111827] border border-[var(--color-border)] rounded-[28px] overflow-hidden shadow-2xl">
                {/* Index tab bar */}
                <div className="p-4 px-6 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        {INDEX_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveIndexTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                                    activeIndexTab === tab.id
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                        : "bg-white/[0.02] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
                                )}
                            >{tab.label}</button>
                        ))}
                    </div>
                    <div className="flex items-center bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-2 gap-2">
                        <Search className="w-3.5 h-3.5 text-white/15" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search market..."
                            className="bg-transparent text-xs font-bold text-[var(--color-text-secondary)] outline-none w-32 placeholder:text-white/15"
                        />
                    </div>
                </div>

                {/* Grid table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="p-2.5 pl-6 text-[7px] font-black text-white/15 uppercase tracking-widest" rowSpan={2}>Commodity Name</th>
                                <th className="p-2.5 text-center text-[7px] font-black text-white/15 uppercase tracking-widest" rowSpan={2}>Class</th>
                                <th colSpan={3} className="p-2 text-center text-[7px] font-black text-amber-400/50 uppercase tracking-widest border-l border-white/[0.03]">Commercials</th>
                                <th colSpan={2} className="p-2 text-center text-[7px] font-black text-cyan-400/40 uppercase tracking-widest border-l border-white/[0.03]">Commercials % Change</th>
                                <th colSpan={2} className="p-2 text-center text-[7px] font-black text-emerald-400/40 uppercase tracking-widest border-l border-white/[0.03]">Non Commercials % Change</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest border-l border-white/[0.03]" rowSpan={2}>Seasonality</th>
                            </tr>
                            <tr className="bg-white/[0.01] border-b border-[var(--color-border)]">
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest border-l border-white/[0.02]">Index 36</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest">Index 18</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest">Index 6</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest border-l border-white/[0.02]">Long</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest">Short</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest border-l border-white/[0.02]">Long</th>
                                <th className="p-2 text-center text-[7px] font-black text-white/15 uppercase tracking-widest">Short</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indexGridData.map(m => (
                                <tr
                                    key={m.id}
                                    onClick={() => setSelectedMarket(m.id)}
                                    className={cn(
                                        "border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer",
                                        selectedMarket === m.id && "bg-amber-500/[0.04]"
                                    )}
                                >
                                    <td className="p-2.5 pl-6">
                                        <div className="flex items-center gap-2">
                                            {selectedMarket === m.id && <span className="text-amber-400 text-[8px]">★</span>}
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] tracking-widest">{m.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-center text-[9px] font-bold text-[var(--color-text-muted)] font-mono">{m.class}</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono rounded-sm border-l border-white/[0.02]", idxColor(m.idx36))}>{m.idx36}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono rounded-sm", idxColor(m.idx18))}>{m.idx18}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono rounded-sm", idxColor(m.idx6))}>{m.idx6}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono border-l border-white/[0.02]", m.commPctChgLong > 0 ? "text-emerald-400/60" : "text-red-400/60")}>{m.commPctChgLong > 0 ? "+" : ""}{m.commPctChgLong}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono", m.commPctChgShort > 0 ? "text-emerald-400/60" : "text-red-400/60")}>{m.commPctChgShort > 0 ? "+" : ""}{m.commPctChgShort}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono border-l border-white/[0.02]", m.nonCommPctChgLong > 0 ? "text-emerald-400/60" : "text-red-400/60")}>{m.nonCommPctChgLong > 0 ? "+" : ""}{m.nonCommPctChgLong}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-mono", m.nonCommPctChgShort > 0 ? "text-emerald-400/60" : "text-red-400/60")}>{m.nonCommPctChgShort > 0 ? "+" : ""}{m.nonCommPctChgShort}%</td>
                                    <td className={cn("p-2 text-center text-[10px] font-black font-mono border-l border-white/[0.02]", m.seasonality > 0 ? "text-emerald-400" : m.seasonality < 0 ? "text-red-400" : "text-[var(--color-text-muted)]")}>
                                        {m.seasonality > 0 ? "+" : ""}{m.seasonality}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══ INTERACTIVE CHART WORKSPACE (from mockup image) ═══ */}
            <div id="charts-workspace" className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-6">
                {/* OHLC info bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-red-400 text-xs font-black tracking-widest">★</span>
                        <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{marketInfo.name}</span>
                        <span className="text-[9px] text-white/15">—</span>
                        <span className="text-[9px] text-emerald-400/60 font-mono">Open: {chartData[chartData.length - 1]?.price}</span>
                        <span className="text-[9px] text-white/15">|</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">High: {(chartData[chartData.length - 1]?.price * 1.02).toFixed(2)}</span>
                        <span className="text-[9px] text-white/15">|</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">Low: {(chartData[chartData.length - 1]?.price * 0.98).toFixed(2)}</span>
                        <span className="text-[9px] text-white/15">|</span>
                        <span className="text-[9px] text-cyan-400/60 font-mono">Close: {chartData[chartData.length - 1]?.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[7px] text-white/15 font-black uppercase tracking-widest mr-2">Zoom</span>
                        {ZOOM_OPTIONS.map(z => (
                            <button
                                key={z}
                                onClick={() => setZoom(z)}
                                className={cn(
                                    "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                                    zoom === z ? "bg-amber-500/15 text-amber-400" : "text-white/15 hover:text-[var(--color-text-muted)]"
                                )}
                            >{z}</button>
                        ))}
                    </div>
                </div>

                {/* Chart 1: Main Price + COT Overlay */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/15 uppercase tracking-widest">Market</label>
                            <select
                                value={selectedMarket}
                                onChange={e => setSelectedMarket(e.target.value)}
                                className="block bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none"
                            >
                                {MARKETS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/15 uppercase tracking-widest">Index</label>
                            <select className="block bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none">
                                <option>18m Comm OI Index</option>
                                <option>36m Comm OI Index</option>
                                <option>6m Comm OI Index</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <TradingViewChart
                            candles={chartData}
                            overlayData={chartData.map(d => ({ time: d.time, value: d.cotIndex }))}
                            overlayLabel="18m Comm OI Index"
                            height={280}
                        />
                    </div>
                </div>

                {/* Chart 2: COT Index (oscillator) */}
                <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Chart 2 — {marketInfo.name} — 18m Comm OI Index</span>
                    </div>
                    <div className="h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="cotIdxGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <YAxis domain={[0, 100]} stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                                <Area type="monotone" dataKey="cotIndex" stroke="#10b981" strokeWidth={1.5} fill="url(#cotIdxGrad)" />
                                <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: COT Positions with market/type/agent selectors */}
                <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/15 uppercase tracking-widest">Market</label>
                            <select className="block bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none">
                                {MARKETS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/15 uppercase tracking-widest">Type</label>
                            <select
                                value={chartType}
                                onChange={e => setChartType(e.target.value)}
                                className="block bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none"
                            >
                                {CHART_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[7px] font-black text-white/15 uppercase tracking-widest">Agent</label>
                            <select
                                value={agentType}
                                onChange={e => setAgentType(e.target.value)}
                                className="block bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none"
                            >
                                {AGENT_TYPES.map(a => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                        <button className="mt-4 px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest hover:border-amber-500/30 hover:text-amber-400 transition-all flex items-center gap-1.5">
                            <Plus className="w-3 h-3" /> Add Chart
                        </button>
                    </div>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                <YAxis stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }} />
                                <Line type="monotone" dataKey="netPosition" stroke="#d946ef" strokeWidth={2} dot={false} name="Net Position" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 4: Comparison — multi-line (Long/Short/Net) */}
                <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-1.5 rounded-lg bg-white/[0.03] border border-[var(--color-border)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest hover:border-amber-500/30 hover:text-amber-400 transition-all">Compare</button>
                            <button className="flex items-center gap-1.5 text-[9px] font-black text-white/15 uppercase tracking-widest hover:text-[var(--color-text-muted)] transition-all">
                                <RotateCw className="w-3 h-3" /> Reset chart
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-[8px] font-bold">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded" /> Long: {chartData[chartData.length - 1]?.commLong?.toLocaleString()}</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 rounded" /> Short: {chartData[chartData.length - 1]?.commShort?.toLocaleString()}</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 rounded" /> Net: {chartData[chartData.length - 1]?.netPosition?.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                <XAxis dataKey="name" stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }} />
                                <Line type="monotone" dataKey="commLong" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Comm Long" />
                                <Line type="monotone" dataKey="commShort" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Comm Short" />
                                <Line type="monotone" dataKey="netPosition" stroke="#06b6d4" strokeWidth={2} dot={false} name="Net" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[7px] text-white/8 font-bold uppercase tracking-widest text-right">MMITPS.com</p>
                </div>
            </div>

            {/* ═══ KEY MARKET CHARTS (4-Grid) ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { title: "S&P 500 - Commercial", data: SP500, color: "#10b981", cotColor: "#22c55e", badge: "COT Index: 92%", icon: Activity, stats: ["+125K", "-89K"] },
                    { title: "Gold - Managed Money", data: GOLD, color: "#10b981", cotColor: "#10b981", badge: "ATL Alert", icon: Coins, stats: ["+45K", "+15%"], badgeColor: "bg-red-500/10 text-red-400 border-red-500/20" },
                    { title: "Crude Oil - Producer", data: OIL, color: "#10b981", cotColor: "#ef4444", badge: "COT Index: 8%", icon: Droplets, stats: ["-234K", "Extreme Bear"] },
                    { title: "10-Yr T-Note - Leveraged", data: TREASURY, color: "#10b981", cotColor: "#a855f7", badge: "ATH Alert", icon: Landmark, stats: ["-67K", "ATH Shorts"], badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" },
                ].map((chart, idx) => (
                    <div key={idx} className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-4 hover:border-amber-500/15 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: `${chart.color}10`, borderColor: `${chart.color}30` }}>
                                    <chart.icon className="h-4 w-4" style={{ color: chart.color }} />
                                </div>
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">{chart.title}</h3>
                            </div>
                            <span className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border", chart.badgeColor || "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]")}>{chart.badge}</span>
                        </div>
                        <div className="h-[180px]">
                            <TradingViewChart
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                candles={chart.data as any}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                overlayData={chart.data.map((d: any) => ({ time: d.time, value: d.cotIndex }))}
                                overlayColor={chart.cotColor}
                                overlayLabel="COT Index"
                                height={180}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-[9px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-emerald-400/60"><TrendingUp className="h-3 w-3" /> {chart.stats[0]}</span>
                            <span className="text-[var(--color-text-muted)]">{chart.stats[1]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ SUPPLY & DEMAND ═══ */}
            <div className="bg-[#111827] border border-[var(--color-border)] p-10 rounded-[28px] space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">SUPPLY &amp; DEMAND</h2>
                    <p className="text-[var(--color-text-muted)] text-sm font-medium">Trade with the facts. Markets aren&apos;t moved by indicators — they are moved by buyers and sellers.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { title: "Simple to use", desc: "Analyse the markets you want to trade with just a few simple clicks.", icon: MousePointer },
                        { title: "Stay protected", desc: "Know what markets to avoid so you can preserve your capital.", icon: ShieldCheck },
                        { title: "Trend trending", desc: "Track the money flow into markets that will drive trend momentum.", icon: Waves },
                        { title: "Trend reversal", desc: "See the tell tail signs a trend is over, as traders leave that market.", icon: RotateCcw },
                    ].map((f, i) => (
                        <div key={i} className="bg-white/[0.02] border border-[var(--color-border)] p-6 rounded-lg text-center space-y-3 hover:border-amber-500/20 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                <f.icon className="h-5 w-5 text-amber-400" />
                            </div>
                            <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{f.title}</h4>
                            <p className="text-[var(--color-text-muted)] text-[10px] font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ TRADESEEKER™ ALERTS ═══ */}
            <div className="bg-surface border border-[var(--color-border)] p-8 rounded-[28px] space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">TradeSeeker™ <span className="text-amber-400">Optimum Markets</span></h2>
                        <p className="text-white/15 text-xs font-medium mt-1">Real-time alerts for the most extreme COT positioning.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-[var(--color-border)]">
                        {["week", "month", "quarter"].map(p => (
                            <button
                                key={p}
                                onClick={() => setActivePeriod(p)}
                                className={cn(
                                    "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                    activePeriod === p ? "bg-amber-500 text-black" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                                )}
                            >This {p}</button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { market: "NASDAQ 100", value: "94%", type: "BULLISH", desc: "COT Index above 90% - Strong institutional buying.", color: "emerald", time: "3 days ago", momentum: "+12.5%" },
                        { market: "Wheat Futures", value: "7%", type: "BEARISH", desc: "COT Index below 10% - Extreme selling pressure.", color: "red", time: "1 day ago", momentum: "-8.3%" },
                        { market: "Bitcoin Futures", value: "ATH", type: "EXTREME", desc: "All-Time High in commercial long positions.", color: "amber", time: "Just now", momentum: "Historic" },
                    ].map((a, i) => (
                        <div key={i} className={cn("bg-white/[0.02] border-l-4 border-y border-r border-[var(--color-border)] p-6 rounded-lg space-y-3 hover:bg-white/[0.03] transition-all", `border-l-${a.color}-500`)}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{a.market}</span>
                                <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest", `bg-${a.color}-500/10 text-${a.color}-400`)}>{a.type}</span>
                            </div>
                            <div className={cn("text-4xl font-black tracking-tighter", `text-${a.color}-400`)}>{a.value}</div>
                            <p className="text-[var(--color-text-muted)] text-[10px] font-medium italic">{a.desc}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-[8px] font-black text-white/10 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {a.time}</span>
                                <span className={cn(`text-${a.color}-400/50`)}>{a.momentum} momentum</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ TESTIMONIAL ═══ */}
            <div className="bg-[#000] border border-[var(--color-border)] rounded-[28px] p-12 md:p-16 relative overflow-hidden text-center">
                <div className="absolute top-0 left-8 text-amber-500/5 font-serif text-[16rem] leading-none select-none">"</div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <p className="text-lg md:text-xl font-medium text-[var(--color-text-muted)] italic leading-relaxed">
                        "To trade financial markets you must understand who is moving them. This was the lightbulb moment I had 12 years ago,
                        and why I began using the Commitments of Traders. The clarity and transparency it has brought to the financial markets
                        has been fundamental to my trading success."
                    </p>
                    <div>
                        <h4 className="text-lg font-black text-amber-400 uppercase tracking-widest">Ray Gilmour</h4>
                        <p className="text-white/15 font-bold uppercase tracking-widest text-[10px] mt-1">Founder, Markets Made Clear & Chief Analyst, MMITPS</p>
                    </div>
                </div>
            </div>

            {/* ═══ FOOTER CTA ═══ */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0D1117] border border-amber-500/15 rounded-[28px] p-12 md:p-16 text-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]"><Rocket className="w-full h-full text-[var(--color-text-primary)]" /></div>
                <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Leave Trading Mistakes Behind</h2>
                    <p className="text-[var(--color-text-muted)] text-sm font-medium leading-relaxed">
                        Join the growing number of institutional traders around the world using the Commitments of Traders to take control of their market edge.
                    </p>
                </div>
                <a
                    href="/dashboard/resources/macro/strength"
                    className="relative z-10 inline-flex items-center gap-3 px-12 py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_20px_50px_rgba(16, 185, 129,0.25)]"
                >
                    <Rocket className="h-4 w-4" /> Get Started Today
                </a>
            </div>

            {/* Protocol footer */}
            <footer className="text-center pb-4">
                <p className="text-[7px] text-white/8 font-black tracking-[0.5em] uppercase flex items-center justify-center gap-4">
                    <span className="h-px w-12 bg-[var(--color-surface-2)]" />
                    MMITPS · COT PRO MAX PROTOCOL v2.0
                    <span className="h-px w-12 bg-[var(--color-surface-2)]" />
                </p>
            </footer>
        </div>
    );
}
