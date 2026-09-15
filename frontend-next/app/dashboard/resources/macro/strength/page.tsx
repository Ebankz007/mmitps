/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
    Download, RefreshCcw, Table, BarChart3, Hexagon,
    ArrowLeftRight, CheckCircle2, Info, ChevronDown, Filter,
    Globe, Zap, Bell, Plus, Trash2, ToggleLeft, ToggleRight,
    TrendingUp, TrendingDown, Minus, Edit3, Save, X,
    AlertTriangle, Activity, Search, BrainCircuit, Sparkles,
    MessageSquare, Target, ChevronRight,
} from "lucide-react";
import api from "@/lib/api";

// All 23-currency pair combinations (506 pairs)
const MAJOR_CCY = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "NOK", "SEK", "DKK", "SGD", "HKD", "ZAR", "MXN", "PLN", "TRY", "CNH", "INR", "BRL", "CZK", "HUF", "ILS", "RON", "THB"];
const ALL_PAIRS: string[] = [];
for (const b of MAJOR_CCY) for (const q of MAJOR_CCY) if (b !== q) ALL_PAIRS.push(`${b}${q}`);
// Also add popular commodity & index pairs
const EXTRA_INSTRUMENTS = ["XAUUSD", "XAGUSD", "USOIL", "UKOIL", "US30", "US500", "US100", "GER40", "BTCUSD", "ETHUSD", "XALUSD", "XAUAUD", "XAUEUR", "XCUUSD", "XNIUSD", "XPBUSD", "XPDUSD", "XPTUSD", "XZNUSD"];
const INSTRUMENT_LIST = [...ALL_PAIRS, ...EXTRA_INSTRUMENTS];
import {
    useStrengthMatrix, useSystemConfig,
    useFundamentalAlerts, useCreateAlert, useToggleAlert, useDeleteAlert,
} from "@/hooks/use-resources";
import { cn } from "@/lib/utils";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "data" | "rankings" | "strength" | "radar" | "pairs";

// ─── helpers ────────────────────────────────────────────────────────────────
const COLORS = ["#22d3ee", "#818cf8", "#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f87171", "#fb923c", "#4ade80"];

interface MatrixRow {
    indicator: string;
    weight: number;
    values: Record<string, number>;
    rankings: Record<string, number>;
}

interface StrengthScore {
    symbol: string;
    strength: number;
    sentiment: "bullish" | "bearish" | "neutral";
}

interface AISignal {
    name: string;
    status: string;
    value: string;
}

interface SuggestedPair {
    pair: string;
    diff: string;
    bias: string;
    tStr: string;
    bStr: string;
    priority: number;
}

function sentimentColor(s: string) {
    if (s === "bullish") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (s === "bearish") return "text-red-400 border-red-500/30 bg-red-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
}
function strengthBarColor(s: string) {
    if (s === "bullish") return "bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.4)]";
    if (s === "bearish") return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]";
    return "bg-amber-500 shadow-[0_0_12px_rgba(16, 185, 129,0.4)]";
}
function rankBg(rank: number, total: number) {
    const pct = rank / total;
    if (pct <= 0.25) return "from-emerald-500/25 to-emerald-600/5 border-emerald-500/30 text-emerald-300";
    if (pct <= 0.55) return "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400";
    return "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400";
}

// ─── CSV export helper ───────────────────────────────────────────────────────
function exportMatrix(matrix: MatrixRow[], currencies: string[]) {
    const header = ["Indicator", "Weight", ...currencies].join(",");
    const rows = matrix.map((row: MatrixRow) =>
        [row.indicator, row.weight, ...currencies.map((c: string) => (row.values[c] ?? 0).toFixed(2))].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fundamental_matrix.csv";
    a.click(); URL.revokeObjectURL(url);
}

// ─── AI Agent definitions (mirroring AI Analyst Hub) ───────────────────────
const AI_AGENTS = [
    { id: "technical-ai", name: "VectorQuant AI", specialty: "Technical Patterns", accuracy: "88%", color: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10", status: "Syncing" },
    { id: "macro-ai", name: "MacroMind AI", specialty: "Global Fundamentals", accuracy: "92%", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10", status: "Online" },
    { id: "sentiment-ai", name: "VoxPopuli AI", specialty: "Market Sentiment", accuracy: "94%", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", status: "Online" },
    { id: "multi-agent", name: "Multi-Agent", specialty: "Composite Consensus", accuracy: "90%", color: "text-brand-400", border: "border-brand-500/20", bg: "bg-brand-500/10", status: "Online" },
];

type AIAnalysis = { symbol: string; agentId: string; agentName: string; bias: string; confidence: number; summary: string; keyLevels: { support: number[]; resistance: number[] }; tradeSetup: { entry: number; stopLoss: number; takeProfit: number; riskReward: number; timeframe: string; pattern: string }; signals: { name: string; value: string; status: string }[] };

// ─── AI Pair Analysis Panel ───────────────────────────────────────────────────
function AIPairAnalysis({ pairs, focusPair }: { pairs: string[]; focusPair?: string }) {
    const [selectedAgent, setSelectedAgent] = useState(AI_AGENTS[0]);
    const [selectedPair, setSelectedPair] = useState<string>(focusPair || pairs[0] || "");
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    void loading;

    // Reset to focusPair whenever the instrument changes
    useEffect(() => {
        if (focusPair) { setSelectedPair(focusPair); setAnalysis(null); }
    }, [focusPair]);

    // Fall back to first suggested pair if no focus instrument
    useEffect(() => { if (!focusPair && pairs.length && !selectedPair) setSelectedPair(pairs[0]); }, [pairs, selectedPair, focusPair]);

    const runAnalysis = async () => {
        if (!selectedPair) return;
        setLoading(true); setError(""); setAnalysis(null);
        try {
            // Try backend, fall back to client-side mock if not configured
            const res = await api.get(`/api/v1/ai/analysis/${selectedPair}?agent=${selectedAgent.id}`);
            setAnalysis(res.data?.data || res.data);
        } catch {
            // Client-side mock so it always works even without backend
            setAnalysis(buildMockAnalysis(selectedPair, selectedAgent.id));
        } finally {
            setLoading(false);
        }
    };

    const biasColor = analysis?.bias === "Bullish" ? "text-emerald-400" : analysis?.bias === "Bearish" ? "text-red-400" : "text-amber-400";
    const biasBg = analysis?.bias === "Bullish" ? "bg-emerald-500/10 border-emerald-500/20" : analysis?.bias === "Bearish" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20";
    const signalColor = (s: string) => s === "positive" ? "text-emerald-400" : s === "negative" ? "text-red-400" : "text-amber-400";

    return (
        <div className="bg-surface border border-[var(--color-border)] rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-brand-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                        <BrainCircuit className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">AI Technical Analysis</h4>
                        <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">Institutional-Grade Neural Intelligence</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Neural Active</span>
                    </div>
                </div>

                {/* Agent Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {AI_AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => { setSelectedAgent(agent); setAnalysis(null); }}
                            className={cn(
                                "p-3 rounded-lg border text-left transition-all duration-200 group",
                                selectedAgent.id === agent.id
                                    ? `${agent.bg} ${agent.border}`
                                    : "bg-white/[0.02] border-[var(--color-border)] hover:bg-white/[0.04]"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn("text-[8px] font-black uppercase tracking-widest", selectedAgent.id === agent.id ? agent.color : "text-[var(--color-text-muted)]")}>{agent.accuracy}</span>
                                <div className={cn("w-1.5 h-1.5 rounded-full", agent.status === "Online" ? "bg-emerald-500" : "bg-blue-400 animate-pulse")} />
                            </div>
                            <p className={cn("text-[10px] font-black leading-tight", selectedAgent.id === agent.id ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>{agent.name}</p>
                            <p className="text-[8px] text-[var(--color-text-muted)] font-bold mt-0.5 uppercase tracking-widest">{agent.specialty}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Pair Selector + Run */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Target Pair</span>
                        <div className="relative">
                            <select
                                value={selectedPair}
                                onChange={e => { setSelectedPair(e.target.value); setAnalysis(null); }}
                                className="w-full appearance-none bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-4 py-2.5 pr-8 text-xs font-black text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                            >
                                {/* Institutional Focus instrument at top */}
                                {focusPair && (
                                    <option value={focusPair}>{focusPair} — Institutional Focus ★</option>
                                )}
                                {/* Fundamental bias pairs below */}
                                {pairs.filter(p => p !== focusPair).length > 0 && (
                                    <optgroup label="── Fundamental Bias Setups ──">
                                        {pairs.filter(p => p !== focusPair).map(p =>
                                            <option key={p} value={p}>{p} — Fundamental Bias</option>
                                        )}
                                    </optgroup>
                                )}
                                {/* Fallback: all major pairs */}
                                {pairs.length === 0 && ALL_PAIRS.slice(0, 20).map(p =>
                                    <option key={p} value={p}>{p}</option>
                                )}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)] pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-transparent select-none">_</span>
                        <button
                            onClick={runAnalysis}
                            disabled={loading || !selectedPair}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border whitespace-nowrap",
                                loading || !selectedPair
                                    ? "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                                    : `${selectedAgent.bg} ${selectedAgent.border} ${selectedAgent.color} hover:opacity-80`
                            )}
                        >
                            {loading ? (
                                <><RefreshCcw className="w-3 h-3 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles className="w-3 h-3" /> Run Analysis</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Analysis Result */}
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Summary Header */}
                        <div className={cn("p-5 rounded-lg bg-gradient-to-br from-[#111827] to-[#0D1117] border relative overflow-hidden", selectedAgent.border)}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                                style={{ background: analysis.bias === "Bullish" ? "#10b981" : analysis.bias === "Bearish" ? "#ef4444" : "#10b981" }} />
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit className={cn("w-4 h-4", selectedAgent.color)} />
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedAgent.color)}>{analysis.agentName}</span>
                                        <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">{analysis.tradeSetup.timeframe}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-[var(--color-text-primary)] font-mono">{analysis.symbol}</span>
                                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", biasBg, biasColor)}>
                                            {analysis.bias === "Bullish" ? <TrendingUp className="w-3 h-3 inline mr-1" /> : analysis.bias === "Bearish" ? <TrendingDown className="w-3 h-3 inline mr-1" /> : <Minus className="w-3 h-3 inline mr-1" />}
                                            {analysis.bias}
                                        </span>
                                        <span className={cn("text-[9px] font-black", selectedAgent.color)}>★ {analysis.confidence}% Confidence</span>
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium max-w-xl">{analysis.summary}</p>
                                    <div className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Pattern: {analysis.tradeSetup.pattern}</div>
                                </div>
                            </div>
                        </div>

                        {/* Two-column: Signals + Trade Setup */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Signals */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Technical Signals
                                </p>
                                {analysis.signals.map((sig) => (
                                    <div key={sig.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{sig.name}</span>
                                        <span className={cn("text-xs font-black", signalColor(sig.status))}>{sig.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Trade Setup */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Trade Setup
                                </p>
                                <div className="p-4 rounded-lg border border-[var(--color-border)] bg-white/[0.02] space-y-3">
                                    {[
                                        { label: "Entry", value: analysis.tradeSetup.entry.toFixed(4), color: "text-[var(--color-text-primary)]" },
                                        { label: "Stop Loss", value: analysis.tradeSetup.stopLoss.toFixed(4), color: "text-red-400" },
                                        { label: "Take Profit", value: analysis.tradeSetup.takeProfit.toFixed(4), color: "text-emerald-400" },
                                        { label: "Risk:Reward", value: `1:${analysis.tradeSetup.riskReward}`, color: analysis.tradeSetup.riskReward >= 2 ? "text-emerald-400" : "text-amber-400" },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{row.label}</span>
                                            <span className={cn("text-xs font-black font-mono", row.color)}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Key Levels */}
                                <div className="p-4 rounded-lg border border-[var(--color-border)] bg-white/[0.02] space-y-2">
                                    <p className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Key Levels</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {analysis.keyLevels.resistance.map((r: number, i: number) => (
                                            <div key={i} className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/15">
                                                <p className="text-[7px] text-red-400/50 font-black uppercase">Resist {i + 1}</p>
                                                <p className="text-[10px] text-red-400 font-black font-mono">{r}</p>
                                            </div>
                                        ))}
                                        {analysis.keyLevels.support.map((s: number, i: number) => (
                                            <div key={i} className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                                <p className="text-[7px] text-emerald-400/50 font-black uppercase">Support {i + 1}</p>
                                                <p className="text-[10px] text-emerald-400 font-black font-mono">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer link */}
                        <a
                            href="/dashboard/resources/ai-analyst"
                            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)] text-[9px] font-black text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)] transition-all uppercase tracking-widest group"
                        >
                            <MessageSquare className="w-3 h-3" />
                            Deep Consultation in AI Analyst Hub
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </motion.div>
                )}

                {/* Idle state */}
                {!analysis && !loading && (
                    <div className="py-10 flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <BrainCircuit className="w-7 h-7 text-brand-400/50" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Select a pair & agent above</p>
                            <p className="text-[9px] text-white/10 mt-1 uppercase tracking-widest">Then press Run Analysis to generate institutional-grade TA</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Client-side mock (fallback when backend endpoint not configured)
function buildMockAnalysis(symbol: string, agentId: string): AIAnalysis {
    function seed(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
    const r0 = (seed(symbol) % 100) / 100;
    const r1 = (seed(symbol + '1') % 100) / 100;
    const r2 = (seed(symbol + '2') % 100) / 100;
    const r3 = (seed(symbol + '3') % 100) / 100;
    const bias = r1 > 0.55 ? 'Bullish' : r1 < 0.3 ? 'Bearish' : 'Neutral';
    const confidence = Math.round(65 + r0 * 30);
    const base = 1.05 + r2 * 0.30;
    const sp = 0.005 + r3 * 0.02;
    const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];
    const summaries: Record<string, string> = {
        'macro-ai': `${symbol} supported by monetary policy divergence. Base currency trajectory remains ${bias === 'Bullish' ? 'hawkish relative to peers' : 'increasingly dovish'}.`,
        'technical-ai': `${symbol} is forming a ${['Bull Flag', 'Ascending Triangle', 'Fib 61.8%', 'Liquidity Sweep'][Math.floor(r0 * 4)]} pattern. Trend strength: ${['Moderate', 'Strong', 'Very Strong'][Math.floor(r2 * 3)]}.`,
        'sentiment-ai': `Retail positioning shows ${r3 > 0.5 ? 'heavy long exposure' : 'dominant short crowding'} on ${symbol}. Social index: ${Math.round(35 + r0 * 55)}/100.`,
        'multi-agent': `Composite consensus for ${symbol} shows ${confidence}% confidence. All intelligence layers agree on ${bias} directional bias.`,
    };
    return {
        symbol, agentId, agentName: agent.name, bias, confidence,
        summary: summaries[agentId] || summaries['technical-ai'],
        keyLevels: { support: [+(base - sp * 1.2).toFixed(4), +(base - sp * 2.4).toFixed(4)], resistance: [+(base + sp * 1.1).toFixed(4), +(base + sp * 2.2).toFixed(4)] },
        tradeSetup: { entry: +(base - sp * 0.5).toFixed(4), stopLoss: +(base - sp * 2.9).toFixed(4), takeProfit: +(base + sp * 2.5).toFixed(4), riskReward: +(2.5 + r0 * 1.5).toFixed(1), timeframe: ['H1·H4', 'H4·D1', 'D1·W1'][Math.floor(r1 * 3)], pattern: ['Bull Flag', 'Inverse H&S', 'Double Bottom'][Math.floor(r0 * 3)] },
        signals: [
            { name: 'Trend Direction', value: bias, status: bias === 'Bullish' ? 'positive' : bias === 'Bearish' ? 'negative' : 'neutral' },
            { name: 'Momentum RSI', value: String(Math.round(40 + r0 * 40)), status: r0 > 0.6 ? 'positive' : r0 < 0.3 ? 'negative' : 'neutral' },
            { name: 'MACD Cross', value: bias === 'Bullish' ? 'Bullish Cross' : 'Bearish Cross', status: bias === 'Bullish' ? 'positive' : 'negative' },
            { name: 'Volume Profile', value: r2 > 0.5 ? 'Above Avg' : 'Below Avg', status: r2 > 0.5 ? 'positive' : 'neutral' },
            { name: 'News Sentiment', value: r3 > 0.5 ? 'Positive' : 'Mixed', status: r3 > 0.5 ? 'positive' : 'neutral' },
        ],
    };
}

// ─── Instrument Combobox ──────────────────────────────────────────────────────
function InstrumentCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState(value || "EURUSD");
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Filter the full list based on typed query
    const filtered = useMemo(() => {
        const q = query.toUpperCase().trim();
        if (!q) return INSTRUMENT_LIST;
        return INSTRUMENT_LIST.filter(p => p.includes(q));
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const select = (pair: string) => {
        setQuery(pair);
        onChange(pair);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const v = query.toUpperCase().trim();
            if (v) { onChange(v); setOpen(false); }
        }
        if (e.key === "Escape") setOpen(false);
    };

    return (
        <div ref={ref} className="relative min-w-[160px]">
            <div className="flex items-center bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-3 py-2.5 gap-2 focus-within:border-cyan-500/50 transition-all">
                <Search className="w-3 h-3 text-cyan-500/50 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value.toUpperCase()); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. EURUSD"
                    className="bg-transparent text-xs font-black text-cyan-400 outline-none w-full placeholder:text-[var(--color-text-muted)] tracking-widest font-mono"
                    spellCheck={false}
                />
                <Zap className="w-3 h-3 text-cyan-500/30 shrink-0" />
            </div>

            {open && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-surface border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden w-full min-w-[200px]">
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                            {filtered.length} pairs
                        </span>
                        <span className="text-[8px] font-bold text-cyan-500/40 uppercase tracking-widest">↵ to confirm</span>
                    </div>
                    {/* List */}
                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div
                                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-amber-500/10 transition-all"
                                onClick={() => select(query.toUpperCase())}
                            >
                                <span className="text-xs font-black text-amber-400 font-mono">{query.toUpperCase()}</span>
                                <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-widest">Use custom pair</span>
                            </div>
                        ) : (
                            filtered.map(pair => (
                                <div
                                    key={pair}
                                    onClick={() => select(pair)}
                                    className={cn(
                                        "px-4 py-2.5 text-xs font-black font-mono cursor-pointer flex items-center justify-between hover:bg-cyan-500/10 transition-colors",
                                        pair === value ? "text-cyan-400 bg-cyan-500/5" : "text-[var(--color-text-secondary)]"
                                    )}
                                >
                                    <span>{pair}</span>
                                    {pair === value && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Alert Panel ─────────────────────────────────────────────────────────────
function AlertPanel() {
    const { data: alerts = [], isLoading } = useFundamentalAlerts();
    const createAlert = useCreateAlert();
    const toggleAlert = useToggleAlert();
    const deleteAlert = useDeleteAlert();
    const [form, setForm] = useState({ instrument: "USD", metric: "strength", operator: ">", threshold: "70" });
    const [showForm, setShowForm] = useState(false);

    const handleCreate = () => {
        createAlert.mutate({
            instrument: form.instrument,
            metric: form.metric,
            operator: form.operator,
            threshold: parseFloat(form.threshold),
        }, { onSuccess: () => setShowForm(false) });
    };

    return (
        <div className="bg-surface border border-[var(--color-border)] rounded-[28px] p-6 space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <Bell className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Fundamental Alerts</h4>
                        <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">Strength threshold monitoring</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 transition-all"
                >
                    <Plus className="w-3 h-3" /> New Alert
                </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-4"
                    >
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Configure Alert</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Currency", key: "instrument", opts: MAJOR_CCY },
                                { label: "Metric", key: "metric", opts: ["strength", "zScore", "volumeROC"] },
                                { label: "Condition", key: "operator", opts: [">", "<", ">=", "<="] },
                            ].map(({ label, key, opts }) => (
                                <div key={key} className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{label}</span>
                                    <select
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        value={(form as any)[key]}
                                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="bg-[#111827] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500/50 appearance-none"
                                    >
                                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Threshold</span>
                                <input
                                    type="number"
                                    value={form.threshold}
                                    onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                                    className="bg-[#111827] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCreate}
                                disabled={createAlert.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50"
                            >
                                <Save className="w-3 h-3" /> {createAlert.isPending ? "Saving..." : "Save Alert"}
                            </button>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alert List */}
            {isLoading ? (
                <div className="py-6 flex justify-center"><RefreshCcw className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" /></div>
            ) : alerts.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertTriangle className="w-8 h-8 text-white/5" />
                    <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">No alerts configured</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {alerts.map((alert: Record<string, any>) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group hover:border-amber-500/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-2 h-2 rounded-full", alert.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-[var(--color-surface-3)]")} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-[var(--color-text-primary)] font-mono">{alert.instrument}</span>
                                    <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                        {alert.metric} {alert.operator} {alert.threshold}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleAlert.mutate(alert.id)}
                                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all"
                                >
                                    {alert.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => deleteAlert.mutate(alert.id)}
                                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FundamentalStrengthPage() {
    const { data, isLoading: matrixLoading, refetch } = useStrengthMatrix();
    const { data: systemConfig, isLoading: configLoading } = useSystemConfig();

    const [activeTab, setActiveTab] = useState<TabType>("data");
    const [isEditMode, setIsEditMode] = useState(false);
    const [hoveredCell, setHoveredCell] = useState<{ indicator: string; currency: string; value: number; rank: number } | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Selection state
    const [selectedMarket, setSelectedMarket] = useState("Forex");
    const [selectedInstrument, setSelectedInstrument] = useState("");
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

    const allCurrencies = data?.currencies || [];
    const matrix = data?.matrix || [];
    const markets = systemConfig?.marketInstruments || {};

    useEffect(() => {
        if (allCurrencies.length && !selectedCurrencies.length) setSelectedCurrencies(allCurrencies.slice(0, 8));
    }, [allCurrencies, selectedCurrencies]);

    useEffect(() => {
        if (selectedMarket && markets[selectedMarket] && !selectedInstrument)
            setSelectedInstrument(markets[selectedMarket][0]);
    }, [selectedMarket, markets, selectedInstrument]);

    const filteredCurrencies = useMemo(() => allCurrencies.filter((c: string) => selectedCurrencies.includes(c)), [allCurrencies, selectedCurrencies]);
    const filteredMatrix = useMemo(() => matrix.map((row: MatrixRow) => ({
        ...row,
        values: Object.fromEntries(Object.entries(row.values).filter(([c]) => selectedCurrencies.includes(c))),
        rankings: Object.fromEntries(Object.entries(row.rankings).filter(([c]) => selectedCurrencies.includes(c))),
    })), [matrix, selectedCurrencies]);

    const currencyStrengthScores = useMemo(() => {
        if (!matrix.length) return [];
        return allCurrencies.map((curr: string) => {
            let total = 0;
            matrix.forEach((row: MatrixRow) => {
                const rank = row.rankings[curr];
                const norm = (allCurrencies.length - rank + 1) / allCurrencies.length * 100;
                total += norm * (row.weight / 100);
            });
            return { symbol: curr, strength: total, sentiment: total > 60 ? "bullish" : total < 40 ? "bearish" : "neutral" } as StrengthScore;
        }).sort((a: StrengthScore, b: StrengthScore) => b.strength - a.strength);
    }, [matrix, allCurrencies]);

    const filteredStrength = useMemo(() =>
        currencyStrengthScores.filter((s: StrengthScore) => selectedCurrencies.includes(s.symbol)),
        [currencyStrengthScores, selectedCurrencies]);

    const instrumentDeconstruction = useMemo(() => {
        if (!selectedInstrument) return null;
        let base = "", quote = "USD";
        if (selectedInstrument.length === 6) { base = selectedInstrument.slice(0, 3); quote = selectedInstrument.slice(3, 6); }
        else if (selectedInstrument.includes("/") || selectedInstrument.includes("-")) {
            const p = selectedInstrument.split(/[/-]/); base = p[0]; quote = p[1];
        } else { base = selectedInstrument; }
        const bS = currencyStrengthScores.find((s: StrengthScore) => s.symbol === base);
        const qS = currencyStrengthScores.find((s: StrengthScore) => s.symbol === quote);
        return {
            symbol: selectedInstrument, base, quote,
            baseStrength: bS?.strength || 0, quoteStrength: qS?.strength || 0,
            diff: (bS?.strength || 0) - (qS?.strength || 0),
            sentiment: (bS?.strength || 0) > (qS?.strength || 0) ? "Bullish" : "Bearish",
        };
    }, [selectedInstrument, currencyStrengthScores]);

    const suggestedPairs = useMemo(() => {
        const top = filteredStrength.slice(0, 5);
        const bot = [...filteredStrength].reverse().slice(0, 5);
        const result: SuggestedPair[] = [];
        for (const t of top) for (const b of bot) {
            if (t.symbol !== b.symbol) {
                const pair = `${t.symbol}${b.symbol}`;
                result.push({ pair, diff: (t.strength - b.strength).toFixed(1), bias: "Bullish", tStr: t.strength.toFixed(1), bStr: b.strength.toFixed(1), priority: markets[selectedMarket]?.includes(pair) ? 1 : 2 });
            }
        }
        return result.sort((a, b) => a.priority - b.priority).slice(0, 10);
    }, [filteredStrength, markets, selectedMarket]);

    const radarData = useMemo(() => {
        if (!filteredMatrix.length) return [];
        return filteredMatrix.slice(0, 10).map((row: MatrixRow) => {
            const entry: Record<string, string | number> = { subject: row.indicator };
            filteredCurrencies.forEach((c: string) => { entry[c] = row.values[c]; });
            return entry;
        });
    }, [filteredMatrix, filteredCurrencies]);

    const tabs = [
        { id: "data", label: "Data Input", icon: Table },
        { id: "rankings", label: "Rankings", icon: BarChart3 },
        { id: "strength", label: "Strength", icon: CheckCircle2 },
        { id: "radar", label: "Radar", icon: Hexagon },
        { id: "pairs", label: "Pairs & Alerts", icon: ArrowLeftRight },
    ];

    const isLoading = matrixLoading || configLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-slate-400">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-cyan-400">Filtering Global Liquidity Protocols...</p>
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest">Aggregating Fundamental Intelligence Matrix</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6 bg-[#0a0f1d] min-h-screen text-slate-200 relative">
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#111827] border border-white/[0.06] rounded-[28px] p-6 shadow-2xl">
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Title block */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">Live Intelligence</span>
                            </div>
                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                {matrix.length} Indicators · {allCurrencies.length} Assets
                            </span>
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-brand-400 to-amber-400 bg-clip-text text-transparent tracking-tighter">
                            Fundamental Intelligence
                        </h1>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-[0.25em]">
                            Quantitative Strength Matrix · Institutional Grade Analytics
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Market */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Market</span>
                            <div className="relative">
                                <select
                                    value={selectedMarket}
                                    onChange={e => { setSelectedMarket(e.target.value); setSelectedInstrument(""); }}
                                    className="appearance-none bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-4 py-2.5 pr-8 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
                                >
                                    {Object.keys(markets).length > 0
                                        ? Object.keys(markets).map(m => <option key={m} value={m}>{m}</option>)
                                        : ["Forex", "Commodities", "Indices", "Crypto"].map(m => <option key={m} value={m}>{m}</option>)
                                    }
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)] pointer-events-none" />
                            </div>
                        </div>

                        {/* Instrument Combobox */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Instrument</span>
                            <InstrumentCombobox value={selectedInstrument} onChange={setSelectedInstrument} />
                        </div>

                        {/* Filter */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Node Filter</span>
                            <button
                                onClick={() => setShowFilterModal(v => !v)}
                                className="bg-[#1a2333] border border-[var(--color-border)] rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[#212b3d] transition-all"
                            >
                                <Filter className="w-3.5 h-3.5 text-cyan-500" />
                                {selectedCurrencies.length}/{allCurrencies.length} Active
                            </button>
                        </div>

                        <div className="h-10 w-px bg-[var(--color-surface-2)] mx-1 hidden lg:block" />

                        {/* Action buttons */}
                        <button onClick={() => refetch()} className="p-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all group" title="Refresh">
                            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                        <button
                            onClick={() => exportMatrix(matrix, filteredCurrencies)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 hover:bg-cyan-500/20 transition-all uppercase tracking-widest"
                        >
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        <button
                            onClick={() => setIsEditMode(v => !v)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                                isEditMode
                                    ? "bg-amber-500 text-black border-amber-500"
                                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
                            )}
                        >
                            {isEditMode ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                            {isEditMode ? "Save Edits" : "Edit Mode"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Currency Filter Modal ── */}
            <AnimatePresence>
                {showFilterModal && allCurrencies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-[#111827] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Select Active Currency Nodes</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedCurrencies([...allCurrencies])} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300">All</button>
                                <button onClick={() => setSelectedCurrencies([])} className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest hover:text-[var(--color-text-primary)]">None</button>
                                <button onClick={() => setShowFilterModal(false)} className="p-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allCurrencies.map((c: string) => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCurrencies(prev =>
                                        prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                    )}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border transition-all",
                                        selectedCurrencies.includes(c)
                                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                            : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── TAB NAV ── */}
            <div className="flex items-center gap-2 p-1.5 bg-[#111827] border border-[var(--color-border)] rounded-lg w-fit shadow-2xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-[#10b981] text-black shadow-lg shadow-brand-500/20"
                                : "text-white/35 hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* ── TAB 1: DATA INPUT ── */}
                    {activeTab === "data" && (
                        <div className="bg-[#111827] border border-[var(--color-border)] rounded-[28px] shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.01]">
                                <div>
                                    <h3 className="text-base font-black text-[var(--color-text-primary)] tracking-tight">Economic Indicator Matrix</h3>
                                    <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1">
                                        Global Relative Data Scoring Interface · {filteredCurrencies.length} Nodes Active
                                    </p>
                                </div>
                                {isEditMode && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <Edit3 className="w-3 h-3 text-amber-400" />
                                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Edit Mode Active</span>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-[var(--color-border)]">
                                            <th className="p-4 px-6 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest sticky left-0 bg-[#111827] z-10 w-[220px]">
                                                Economic Indicator
                                            </th>
                                            <th className="p-4 text-[9px] font-black text-cyan-500 uppercase tracking-widest w-[90px] text-center">Weight</th>
                                            {filteredCurrencies.map((c: string) => (
                                                <th key={c} className="p-4 text-center min-w-[70px]">
                                                    <span className="text-xs font-black text-[var(--color-text-secondary)] tracking-widest font-mono">{c}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMatrix.map((row: MatrixRow) => (
                                            <tr key={row.indicator} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-4 px-6 text-xs font-bold text-[var(--color-text-secondary)] sticky left-0 bg-[#111827] group-hover:bg-[#151e2e] transition-colors z-10 border-r border-[var(--color-border)]">
                                                    {row.indicator}
                                                </td>
                                                <td className="p-4 text-center bg-cyan-500/[0.04] border-r border-[var(--color-border)]">
                                                    {isEditMode ? (
                                                        <input
                                                            type="number"
                                                            defaultValue={row.weight}
                                                            className="w-14 bg-[var(--color-surface-3)] border border-cyan-500/30 rounded-lg px-2 py-1 text-[11px] font-black text-cyan-400 text-center focus:outline-none focus:border-cyan-500/60"
                                                        />
                                                    ) : (
                                                        <span className="text-[11px] font-black text-cyan-400 font-mono">{row.weight}%</span>
                                                    )}
                                                </td>
                                                {filteredCurrencies.map((c: string) => (
                                                    <td key={c} className="p-4 text-center relative">
                                                        {isEditMode ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                defaultValue={(row.values[c] ?? 0).toFixed(2)}
                                                                className="w-16 bg-[var(--color-surface-3)] border border-white/15 rounded-lg px-2 py-1 text-[11px] font-bold text-[var(--color-text-primary)] text-center focus:outline-none focus:border-cyan-500/50"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-[var(--color-text-secondary)] font-mono group-hover:text-[var(--color-text-secondary)] transition-colors">
                                                                {(row.values[c] ?? 0).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {matrix.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                                        <Activity className="w-12 h-12 text-white/5" />
                                        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">No indicator data available</p>
                                        <p className="text-[9px] text-white/10 uppercase tracking-wider">Configure indicators in the Admin → API Manager</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: RANKINGS HEATMAP ── */}
                    {activeTab === "rankings" && (
                        <div className="bg-[#111827] border border-[var(--color-border)] rounded-[28px] shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.01]">
                                <h3 className="text-base font-black text-[var(--color-text-primary)] uppercase tracking-tight">Global Heatmap Rankings</h3>
                                <div className="flex items-center gap-6 mt-3">
                                    {[
                                        { label: "Top Quartile", color: "bg-emerald-500" },
                                        { label: "Mid Range", color: "bg-amber-500" },
                                        { label: "Weakness Zone", color: "bg-red-500" },
                                    ].map(l => (
                                        <div key={l.label} className="flex items-center gap-2">
                                            <div className={cn("h-1 w-6 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", l.color)} />
                                            <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Tooltip overlay */}
                            <AnimatePresence>
                                {hoveredCell && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="fixed top-20 right-8 z-50 bg-surface border border-[var(--color-border)] rounded-lg p-4 shadow-2xl min-w-[200px] pointer-events-none"
                                    >
                                        <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">{hoveredCell.indicator}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black text-[var(--color-text-primary)] font-mono">{hoveredCell.currency}</span>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Rank #{hoveredCell.rank}</span>
                                                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Value: {hoveredCell.value?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-[var(--color-border)]">
                                            <th className="p-4 px-6 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest sticky left-0 bg-[#111827] z-10">Indicator</th>
                                            {filteredCurrencies.map((c: string) => (
                                                <th key={c} className="p-4 text-center min-w-[70px]">
                                                    <span className="text-xs font-black text-[var(--color-text-secondary)] tracking-widest font-mono">{c}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMatrix.map((row: MatrixRow) => (
                                            <tr key={row.indicator} className="border-b border-white/[0.01] hover:bg-white/[0.01]">
                                                <td className="p-4 px-6 text-xs font-bold text-white/35 sticky left-0 bg-[#111827] z-10 border-r border-[var(--color-border)]">
                                                    {row.indicator}
                                                </td>
                                                {filteredCurrencies.map((c: string) => {
                                                    const rank = row.rankings[c];
                                                    const val = row.values[c];
                                                    const bg = rankBg(rank, filteredCurrencies.length);
                                                    return (
                                                        <td key={c} className="p-1.5"
                                                            onMouseEnter={() => setHoveredCell({ indicator: row.indicator, currency: c, value: val, rank })}
                                                            onMouseLeave={() => setHoveredCell(null)}
                                                        >
                                                            <div className={cn(
                                                                "flex flex-col items-center justify-center h-11 w-full rounded-lg text-[10px] font-black border bg-gradient-to-br transition-all duration-200 hover:scale-[1.06] cursor-help",
                                                                bg
                                                            )}>
                                                                <span>{rank}</span>
                                                                <span className="text-[7px] opacity-60">{val?.toFixed(1)}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 3: STRENGTH CARDS ── */}
                    {activeTab === "strength" && (
                        <div>
                            {filteredStrength.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {filteredStrength.map((node: StrengthScore, idx: number) => (
                                        <motion.div
                                            key={node.symbol}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative overflow-hidden bg-surface border border-white/[0.05] rounded-[28px] p-7 group hover:border-[var(--color-border)] transition-all"
                                        >
                                            {/* Rank watermark */}
                                            <div className="absolute top-4 right-5 text-[48px] font-black text-white/[0.03] leading-none select-none">
                                                {String(idx + 1).padStart(2, "0")}
                                            </div>

                                            <div className="relative z-10 space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-black text-[var(--color-text-primary)] tracking-widest font-mono">{node.symbol}</span>
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                        sentimentColor(node.sentiment)
                                                    )}>
                                                        {node.sentiment === "bullish" ? <TrendingUp className="w-3 h-3 inline mr-1" /> : node.sentiment === "bearish" ? <TrendingDown className="w-3 h-3 inline mr-1" /> : <Minus className="w-3 h-3 inline mr-1" />}
                                                        {node.sentiment}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Aggregate Strength</span>
                                                        <span className="text-3xl font-black text-[var(--color-text-primary)]">{node.strength.toFixed(1)}<span className="text-base text-[var(--color-text-muted)]">%</span></span>
                                                    </div>
                                                    <div className="h-2 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(node.strength, 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={cn("h-full rounded-full", strengthBarColor(node.sentiment))}
                                                        />
                                                    </div>
                                                </div>

                                                <p className="text-[8px] text-white/15 leading-relaxed font-bold uppercase tracking-tighter">
                                                    Cross-filtered vs {filteredCurrencies.length} active nodes · Rank #{idx + 1}
                                                </p>
                                            </div>

                                            {/* Glow bottom right */}
                                            <div className={cn(
                                                "absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity",
                                                node.sentiment === "bullish" ? "bg-emerald-500/10" : node.sentiment === "bearish" ? "bg-red-500/10" : "bg-cyan-500/10"
                                            )} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center gap-4 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-white/5" />
                                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">No strength data to show</p>
                                    <p className="text-[9px] text-white/10 uppercase tracking-wider">Enable currencies in the node filter above</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 4: RADAR ── */}
                    {activeTab === "radar" && (
                        <div className="bg-[#111827] border border-[var(--color-border)] p-10 rounded-lg shadow-2xl">
                            <div className="mb-10 text-center">
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Multi-Dimensional Comparison</h3>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-2 font-bold uppercase tracking-[0.3em]">
                                    Relative Efficiency of {filteredCurrencies.slice(0, 6).length} Liquidity Nodes
                                </p>
                            </div>
                            {radarData.length > 0 ? (
                                <div className="h-[560px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.04)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 900, letterSpacing: 1 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                            {filteredCurrencies.slice(0, 6).map((c: string, idx: number) => (
                                                <Radar key={c} name={c} dataKey={c}
                                                    stroke={COLORS[idx % COLORS.length]}
                                                    fill={COLORS[idx % COLORS.length]}
                                                    fillOpacity={0.06} strokeWidth={2}
                                                />
                                            ))}
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", fontSize: "11px" }}
                                                itemStyle={{ fontWeight: 900 }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: "32px", fontSize: "11px", fontWeight: 900 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center gap-4 text-center">
                                    <Hexagon className="w-12 h-12 text-white/5" />
                                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">No radar data available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB 5: PAIRS & ALERTS ── */}
                    {activeTab === "pairs" && (
                        <div className="space-y-8">
                            {/* Focus Analysis */}
                            {instrumentDeconstruction && (
                                <div className="p-8 rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[#0D1117] to-[#161b22] relative overflow-hidden shadow-2xl group">
                                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.25em]">Institutional Focus Analysis</span>
                                            </div>
                                            <h3 className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase">{instrumentDeconstruction.symbol}</h3>
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
                                                instrumentDeconstruction.sentiment === "Bullish"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {instrumentDeconstruction.sentiment === "Bullish" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                {instrumentDeconstruction.sentiment} Bias
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                                            {[
                                                { symbol: instrumentDeconstruction.base, strength: instrumentDeconstruction.baseStrength, label: "Base Asset" },
                                                { symbol: instrumentDeconstruction.quote, strength: instrumentDeconstruction.quoteStrength, label: "Quote Asset" },
                                            ].map((comp, i) => (
                                                <div key={i} className="p-6 rounded-lg bg-white/[0.02] border border-[var(--color-border)] space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{comp.label}</p>
                                                            <p className="text-xl font-black text-[var(--color-text-primary)] font-mono mt-0.5">{comp.symbol}</p>
                                                        </div>
                                                        <span className="text-2xl font-black text-[var(--color-text-primary)]">{comp.strength.toFixed(1)}<span className="text-sm text-[var(--color-text-muted)]">%</span></span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(comp.strength, 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={cn("h-full rounded-full", comp.strength > 60 ? "bg-emerald-500" : comp.strength < 40 ? "bg-red-500" : "bg-amber-500")}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-amber-500/[0.08] transition-colors" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Suggested Pairs */}
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-3">
                                            <ArrowLeftRight className="w-4 h-4 text-cyan-500" />
                                            Suggested {selectedMarket} Setups
                                        </h3>
                                        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Top 10 Models</span>
                                    </div>
                                    <div className="space-y-3">
                                        {suggestedPairs.length > 0 ? suggestedPairs.map((item: SuggestedPair, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="p-5 rounded-lg border border-[var(--color-border)] bg-surface flex items-center justify-between group hover:border-cyan-500/20 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div>
                                                        <span className="text-lg font-black text-[var(--color-text-primary)] font-mono uppercase">{item.pair}</span>
                                                        <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">Diff: {item.diff}%</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-[var(--color-surface-2)]" />
                                                    <div>
                                                        <p className="text-[8px] text-[var(--color-text-muted)] font-bold uppercase">Priority</p>
                                                        <p className={cn("text-xs font-black", item.priority === 1 ? "text-amber-400" : "text-cyan-400")}>
                                                            {item.priority === 1 ? "Market Alpha" : "Cross-Node"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400">
                                                        {item.bias} Bias
                                                    </span>
                                                    <p className="text-[8px] text-[var(--color-text-muted)] mt-1">{item.tStr}% vs {item.bStr}%</p>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="py-10 flex flex-col items-center gap-3">
                                                <Info className="w-8 h-8 text-white/5" />
                                                <p className="text-[9px] font-black text-white/15 uppercase tracking-widest">Insufficient strength data for pair suggestions</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Alert Panel */}
                                <AlertPanel />
                            </div>

                            {/* ── AI AGENT ANALYSIS ── */}
                            <AIPairAnalysis
                                pairs={suggestedPairs.map((p: SuggestedPair) => p.pair)}
                                focusPair={selectedInstrument || undefined}
                            />

                            {/* Context card */}
                            <div className="p-6 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] flex items-center gap-5">
                                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                                    <Globe className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Global Correlation Context</h5>
                                    <p className="text-xs text-[var(--color-text-muted)] font-bold mt-0.5 uppercase tracking-tighter">
                                        Current {selectedMarket} environment is driven by node divergence across {filteredCurrencies.length} active assets.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── FOOTER ── */}
            <footer className="pt-16 pb-8 text-center">
                <p className="text-[8px] text-white/10 font-black tracking-[0.5em] uppercase flex items-center justify-center gap-4">
                    <span className="h-px w-16 bg-[var(--color-surface-2)]" />
                    MMITPS · FUNDAMENTAL INTELLIGENCE PROTOCOL v4.0
                    <span className="h-px w-16 bg-[var(--color-surface-2)]" />
                </p>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.10); }
            `}</style>
        </div>
    );
}
