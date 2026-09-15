"use client";

import React, { useState } from "react";
import {
    Zap,
    Target,
    Activity,
    ShieldCheck,
    LineChart,
    BarChart3,
    TrendingUp,
    Clock,
    Crosshair,
    Scale,
    Layers,
    Compass,
    Info,
    AlertTriangle,
    RefreshCw,
    Percent,
    Maximize2,
    CandlestickChart,
    Gamepad2,
    BookOpen,
    Skull
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// Definitions for the 4 categories and 30 calculators
const CATEGORIES = [
    {
        id: "risk",
        name: "Risk & Trade Planning",
        count: 7,
        icon: ShieldCheck,
        color: "text-rose-500",
        bg: "from-rose-500/10 to-transparent",
        accent: "bg-rose-500",
        border: "group-hover:border-rose-500/30",
        desc: "Essential tools for managing financial exposure and optimizing trading strategies.",
        tools: [
            { id: "pos-size", name: "Position Size", icon: Target, desc: "Calculate precise entry sizing." },
            { id: "lot-size", name: "Lot Size", icon: Layers, desc: "Volume based on account equity." },
            { id: "sl-tp", name: "Stop Loss & Take Profit", icon: ShieldCheck, desc: "Optimal exit parameters." },
            { id: "rr-ratio", name: "Risk Reward Ratio", icon: Scale, desc: "Analyze profitability edge." },
            { id: "breakeven", name: "Breakeven Win Rate", icon: Percent, desc: "Required efficiency for profit." },
            { id: "risk-of-ruin", name: "Risk of Ruin", icon: Skull, desc: "Statistical probability of failure." },
            { id: "margin-call", name: "Margin Call Level", icon: AlertTriangle, desc: "Safety threshold monitor." },
        ]
    },
    {
        id: "forex",
        name: "Forex Calculators",
        count: 8,
        icon: RefreshCw,
        color: "text-brand-500",
        bg: "from-brand-500/10 to-transparent",
        accent: "bg-brand-500",
        border: "group-hover:border-brand-500/30",
        desc: "Vital tools for quick, accurate conversions and daily trading calculations.",
        tools: [
            { id: "pip-value", name: "Pip Value", icon: Target, desc: "Monetary value per tick." },
            { id: "margin-calc", name: "Margin Calculator", icon: ShieldCheck, desc: "Required collateral for entry." },
            { id: "forward-rate", name: "Forward Rate", icon: Clock, desc: "Future price projections." },
            { id: "carry-trade", name: "Carry Trade", icon: RefreshCw, desc: "Swap & interest differentials." },
            { id: "leverage", name: "Leverage Calculator", icon: Maximize2, desc: "Maximum buying power assessment." },
            { id: "volatility", name: "Volatility Calculator", icon: Activity, desc: "ATR & price range analysis." },
            { id: "spread", name: "Spread Calculator", icon: Scale, desc: "Broker cost & slippage impact." },
            { id: "rebate", name: "Forex Rebate", icon: RefreshCw, desc: "Volume-based cashbacks." },
        ]
    },
    {
        id: "technical",
        name: "Technical Calculators",
        count: 8,
        icon: LineChart,
        color: "text-amber-500",
        bg: "from-amber-500/10 to-transparent",
        accent: "bg-amber-500",
        border: "group-hover:border-amber-500/30",
        desc: "Tools for technical analysis — fibonacci, pivot points, waves, and key levels.",
        tools: [
            { id: "pivot-point", name: "Pivot Point", icon: BarChart3, desc: "Standard, Woodie & Camarilla." },
            { id: "elliott-wave", name: "Elliott Wave", icon: Activity, desc: "Impulsive & corrective cycles." },
            { id: "camarilla", name: "Camarilla Pivot", icon: Target, desc: "Short-term institutional levels." },
            { id: "fibonacci", name: "Fibonacci Calculator", icon: Compass, desc: "Retracement & extensions." },
            { id: "gann-square", name: "Gann Square of 9", icon: Layers, desc: "Mathematical price geometry." },
            { id: "gann-angle", name: "Gann Angle", icon: Compass, desc: "Time & price geometric scaling." },
            { id: "vwap", name: "VWAP Calculator", icon: TrendingUp, desc: "Volume weighted average price." },
            { id: "candle-wick", name: "Candle Body Wick Ratio", icon: CandlestickChart, desc: "Momentum & rejection analysis." },
        ]
    },
    {
        id: "profit",
        name: "Profit & Performance",
        count: 7,
        icon: TrendingUp,
        color: "text-cyan-500",
        bg: "from-brand-400/10 to-transparent",
        accent: "bg-cyan-500",
        border: "group-hover:border-cyan-500/30",
        desc: "Evaluate the effectiveness of your trading strategies and stress-test performance.",
        tools: [
            { id: "multi-target", name: "Multitarget Calculator", icon: Crosshair, desc: "Optimizing scale-out exits." },
            { id: "profit-loss", name: "Profit & Loss", icon: Layers, desc: "Direct gain/loss evaluation." },
            { id: "equity-sim", name: "Equity Curve Simulation", icon: LineChart, desc: "Projected growth modeling." },
            { id: "trade-return", name: "Trade Return", icon: BarChart3, desc: "ROI per trade analysis." },
            { id: "monte-carlo", name: "Monte Carlo Simulation", icon: Gamepad2, desc: "Risk stress-test modeling." },
            { id: "drawdown", name: "Drawdown Calculator", icon: TrendingUp, desc: "Maximum loss depth tracker." },
            { id: "compound", name: "Compound Calculator", icon: Zap, desc: "Geometric account growth." },
        ]
    }
];

export default function TradingCalculatorsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpenTool = (tool: any, category: any) => {
        setSelectedTool({ ...tool, category });
        setIsModalOpen(true);
        toast.info(`Opening ${tool.name}`, {
            description: `Loading statistical mathematical model v2.0...`
        });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans selection:bg-brand-500/30">
            {/* --- HEADER --- */}
            <div className="max-w-[1600px] mx-auto mb-16">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[10px] font-black tracking-[0.4em] text-[var(--color-text-secondary)] uppercase italic">QUANTITATIVE METHODOLOGY</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight mb-4">
                        Trading <span className="text-brand-500">Calculators</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-[11px] md:text-xs max-w-2xl font-bold tracking-widest leading-relaxed uppercase italic mb-8">
                        30 professional-grade calculators by MMITPS INC — from position sizing and risk management to
                        Fibonacci, Gann, Elliott Wave, and Monte Carlo simulations.
                    </p>

                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black tracking-[0.2em] uppercase hover:bg-amber-500/20 transition-all flex items-center gap-2">
                            Strategy
                        </button>
                        <button className="px-6 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[9px] font-black tracking-[0.2em] uppercase hover:bg-brand-500/20 transition-all flex items-center gap-2">
                            Geometry
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CATEGORIES & TOOLS --- */}
            <div className="max-w-[1700px] mx-auto space-y-20">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-8">
                        {/* Category Header */}
                        <div className="flex flex-col gap-2 relative">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg ${cat.accent}/10 border border-${cat.accent}/20 flex items-center justify-center`}>
                                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                                </div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase">{cat.name} <span className="text-[10px] ml-2 text-[var(--color-text-muted)] tracking-widest">{cat.count} Calculators</span></h2>
                            </div>
                            <p className="text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-widest leading-relaxed italic max-w-2xl">{cat.desc}</p>
                            <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r ${cat.bg}`} />
                        </div>

                        {/* Grid of Tools */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                            {cat.tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleOpenTool(tool, cat)}
                                    className={`group flex flex-col items-center justify-center p-6 rounded-lg border border-[var(--color-border)] bg-[#050505] transition-all duration-300 ${cat.border} hover:bg-white/[0.02]`}
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-${cat.id}-500/10 transition-all`}>
                                        <tool.icon className={`w-6 h-6 ${cat.color} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-tighter uppercase text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors text-center leading-tight mb-2 h-8 flex items-center">{tool.name}</span>
                                    <span className={`text-[8px] font-bold uppercase tracking-widest italic text-center text-white/10 group-hover:opacity-100 opacity-0 transition-opacity`}>{tool.id.replace('-', ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- FOOTER NAV --- */}
            <div className="max-w-[1600px] mx-auto flex justify-center gap-4 mt-20 mb-12">
                {[
                    { label: "Methodology Guide", icon: BookOpen, color: "text-amber-500" },
                    { label: "Tools", icon: Gamepad2, color: "text-brand-500" },
                    { label: "Strategies", icon: Zap, color: "text-brand-500" }
                ].map((item, i) => (
                    <button key={i} className="px-8 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all flex items-center gap-3 group">
                        <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-black tracking-widest uppercase italic">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* --- CALCULATOR MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl bg-[#090909] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4 mb-4">
                            {selectedTool && (
                                <div className={`w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center`}>
                                    <selectedTool.icon className={`w-6 h-6 ${selectedTool.category.color}`} />
                                </div>
                            )}
                            <div>
                                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                                    {selectedTool?.name} <span className="text-sm font-medium text-[var(--color-text-muted)] italic">v2.0</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[var(--color-text-secondary)] italic uppercase tracking-widest font-bold">
                                    {selectedTool?.desc}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Dynamic Calculator Logic */}
                        <div className="space-y-6">
                            {selectedTool?.id === "pos-size" ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Account Balance ($)</label>
                                            <input type="number" id="calc-balance" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="10000" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Risk %</label>
                                            <input type="number" id="calc-risk" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="1" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Stop Loss (Pips)</label>
                                        <input type="number" id="calc-sl" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="20" />
                                    </div>
                                    <button
                                        className="w-full py-4 rounded-lg bg-brand-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/10"
                                        onClick={() => {
                                            const balance = parseFloat((document.getElementById('calc-balance') as HTMLInputElement).value || "10000");
                                            const risk = parseFloat((document.getElementById('calc-risk') as HTMLInputElement).value || "1");
                                            const sl = parseFloat((document.getElementById('calc-sl') as HTMLInputElement).value || "20");
                                            const riskAmount = balance * (risk / 100);
                                            const lotSize = riskAmount / (sl * 10);
                                            toast.success("Position Size Calculated", { description: `Optimal Lot Size: ${lotSize.toFixed(2)} based on $${riskAmount.toFixed(2)} risk.` });
                                        }}
                                    >
                                        Execute Computation
                                    </button>
                                </div>
                            ) : selectedTool?.id === "pip-value" ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Lot Size</label>
                                            <input type="number" id="calc-lots" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="1.0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Asset Class</label>
                                            <select className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)] appearance-none">
                                                <option className="bg-[#090909]">Major FX Pairs</option>
                                                <option className="bg-[#090909]">Indices / Metals</option>
                                                <option className="bg-[#090909]">Crypto Assets</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        className={`w-full py-4 rounded-lg ${selectedTool.category.accent} text-[var(--color-text-primary)] text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-xl`}
                                        onClick={() => {
                                            const lots = parseFloat((document.getElementById('calc-lots') as HTMLInputElement).value || "1");
                                            const result = lots * 10;
                                            toast.success("Pip Value Computed", { description: `Value per Tick: $${result.toFixed(2)} USD (Standard Lot).` });
                                        }}
                                    >
                                        Calculate Pip Value
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-10 py-6">
                                    <div className="flex flex-col items-center justify-center text-center gap-6">
                                        <Activity className={`w-16 h-16 ${selectedTool?.category.color} opacity-20 animate-pulse`} />
                                        <div className="space-y-2">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                                                Mathematical Blueprint Initializing...
                                            </p>
                                            <p className="text-[10px] text-white/10 font-bold tracking-widest uppercase">
                                                Provisioning institutional mathematical model for {selectedTool?.name}
                                            </p>
                                        </div>
                                        <div className="w-full max-w-xs h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className={`h-full ${selectedTool?.category.accent}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Parameter Alpha</label>
                                            <input type="number" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="0.00" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] italic">Parameter Beta</label>
                                            <input type="number" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all text-[var(--color-text-primary)]" placeholder="0.00" disabled />
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed"
                                        disabled
                                    >
                                        Under Construction
                                    </button>

                                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                                        <Info className="w-4 h-4 text-amber-500 shrink-0" />
                                        <p className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest italic leading-relaxed">
                                            NOTICE: The quantitative logic for this specific model is currently being provisioned with real-time liquidity feeds.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border-t border-[var(--color-border)] flex items-center justify-between text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em]">
                        <span>Institutional Grade Engine</span>
                        <span>MMITPS Statistical Unit</span>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- BOTTOM DECORATION --- */}
            <div className="max-w-[1600px] mx-auto text-center pt-8 border-t border-[var(--color-border)] opacity-20 mt-12">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase grayscale">Institutional Intelligence Protocol // MMITPS Calculators Matrix</span>
            </div>
        </div>
    );
}
