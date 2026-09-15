"use client";

import React, { useState } from "react";
import {
    Zap,
    Link2,
    Clock,
    Activity,
    BarChart3,
    Target,
    ShieldCheck,
    Maximize2,
    TrendingUp,
    Scale,
    Dices,
    Globe,
    Building2,
    Thermometer,
    Flame
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

// Definitions for the 12 tools organized into 2 categories
const TOOL_CATEGORIES = [
    {
        id: "toolkit",
        name: "Trading Toolkit",
        label: "TRADING TOOLKIT",
        tools: [
            { id: "correlation", name: "Currency Correlation", icon: Link2, desc: "Analyze positive and negative correlations between major pairs.", sub: "Corelation Matrix • Heat Map • Pair Relationships" },
            { id: "hours", name: "Forex Market Hours", icon: Clock, desc: "Visualize forex market trading sessions in your local timezone.", sub: "Session Times • Overlap Zones • Live Clock" },
            { id: "risk-meter", name: "Risk-On / Risk-Off Meter", icon: Dices, desc: "Gauge the overall risk sentiment of the market.", sub: "Market Mood • Sentiment Gauge • RORO Analysis" },
            { id: "pivot", name: "Pivot Point Calculator", icon: Target, desc: "Determine significant daily, weekly and monthly support/resistance levels.", sub: "Classic • Fibonacci • Camarilla • Woodie • DeMark" },
            { id: "gain-loss", name: "Gain & Loss Calculator", icon: BarChart3, desc: "Quickly calculate the percentage of your account balance that you have won or lost.", sub: "Gain % • Loss % • Recovery Calculator" },
            { id: "pip-calc", name: "Pip Value Calculator", icon: Scale, desc: "Determine the value per pip in your trading account currency.", sub: "Pair Selection • Account Currency • Lot Sizing" },
            { id: "position-size", name: "Position Size Calculator", icon: Maximize2, desc: "Find the approximate amount of currency units to buy or sell to control your risk.", sub: "Risk % • Stop Loss • Untis / Lots" },
            { id: "regulators", name: "Forex Regulatory Organizations", icon: Building2, desc: "A comprehensive list of governmental and independent regulators.", sub: "Global Regulators • Licensing Bodies • Trading Jurisdictions" },
        ]
    },
    {
        id: "intelligence",
        name: "Market Intelligence",
        label: "MARKET INTELLIGENCE",
        tools: [
            { id: "snapshot", name: "FX Market Snapshot", icon: Globe, desc: "Visual overview of current market activity — strength, volatility, gainers & losers.", sub: "Strength • Movers • Volatility" },
            { id: "strength", name: "Currency Strength Meter", icon: Thermometer, desc: "Monitor the strength of all 8 major currencies with trend matrix and momentum analysis.", sub: "8 Currencies • Trend Matrix • Momentum" },
            { id: "volatility", name: "Currency Volatility Meter", icon: Zap, desc: "Identify which currencies are volatile and which are quiet.", sub: "Volatility Bars • Historical Volatility" },
            { id: "movers", name: "FX Market Movers", icon: Flame, desc: "See which currency pairs have gone up or down significantly.", sub: "28 Pairs • Bullish • Bearish • Pips" },
        ]
    }
];

export default function TradingToolsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpenTool = (tool: any, category: string) => {
        setSelectedTool({ ...tool, categoryId: category });
        setIsModalOpen(true);
        toast.info(`Launching ${tool.name}`, {
            description: "Initializing institutional intelligence engine..."
        });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans selection:bg-brand-500/30 pb-32">
            {/* --- HEADER --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-black tracking-[0.4em] text-brand-500 uppercase mb-4">TRADING TOOLKIT</span>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight mb-4">
                        Trading <span className="text-brand-500">Tools</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-[11px] md:text-xs max-w-2xl font-bold tracking-widest leading-relaxed uppercase italic mb-8">
                        Use our <span className="text-[var(--color-text-primary)]">professional-grade tools</span> by MMITPS INC to make smarter, more informed trading decisions.
                        From market session timing to risk sentiment analysis.
                    </p>

                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[9px] font-black tracking-[0.2em] uppercase hover:bg-brand-500/20 transition-all flex items-center gap-2">
                            Calculators
                        </button>
                        <button className="px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black tracking-[0.2em] uppercase hover:bg-amber-500/20 transition-all flex items-center gap-2">
                            Strategies
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SECTIONS --- */}
            <div className="max-w-[1700px] mx-auto space-y-24">
                {TOOL_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-12">
                        {/* Section Divider / Label */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[9px] font-black tracking-[0.5em] text-brand-500 uppercase mb-4">{cat.label}</span>
                            <div className="w-full max-w-sm h-[1px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {cat.tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleOpenTool(tool, cat.id)}
                                    className="group flex flex-col p-8 bg-[#050505] border border-[var(--color-border)] rounded-lg hover:bg-white/[0.02] hover:border-brand-500/20 transition-all duration-300 relative overflow-hidden text-left"
                                >
                                    <div className="absolute top-4 right-6 text-[8px] font-bold text-white/10 uppercase tracking-widest italic group-hover:text-brand-500/40 transition-colors">MMITPS INC</div>
                                    <div className="w-14 h-14 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
                                        <tool.icon className={`w-7 h-7 text-[var(--color-text-muted)] group-hover:text-brand-500 transition-all`} />
                                    </div>
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase text-brand-500 mb-4">{tool.name}</h3>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-bold leading-relaxed uppercase tracking-wide mb-6">
                                        {tool.desc}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
                                        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{tool.sub}</p>
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-brand-500 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- FOOTER DECORATION --- */}
            <div className="max-w-[1700px] mx-auto text-center mt-32">
                <p className="text-[10px] font-black text-[var(--color-text-muted)] tracking-[0.5em] uppercase italic">MMITPS INC - TRADING TOOLKIT</p>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-2">Professional Grade Tools for 28 Currencies • 12 Models • Algorithmic Precision</p>
            </div>

            {/* --- TOOL MODAL --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl bg-[#090909] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-6 mb-4">
                            {selectedTool && (
                                <div className="w-16 h-16 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
                                    <selectedTool.icon className="w-8 h-8 text-brand-500" />
                                </div>
                            )}
                            <div>
                                <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
                                    {selectedTool?.name} <span className="text-sm font-medium text-[var(--color-text-muted)] italic ml-2">v4.2</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[var(--color-text-secondary)] italic uppercase tracking-widest font-bold">
                                    {selectedTool?.desc}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {selectedTool?.id === "hours" ? (
                            <div className="space-y-10">
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { s: "Sydney", t: "22:00 - 07:00", active: false },
                                        { s: "Tokyo", t: "00:00 - 09:00", active: true },
                                        { s: "London", t: "08:00 - 17:00", active: false },
                                        { s: "New York", t: "13:00 - 22:00", active: false }
                                    ].map((loc) => (
                                        <div key={loc.s} className={`p-6 rounded-lg border ${loc.active ? 'border-brand-500/50 bg-brand-500/5' : 'border-[var(--color-border)] bg-white/[0.02]'}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${loc.active ? 'text-brand-500' : 'text-[var(--color-text-muted)]'}`}>{loc.s}</p>
                                            <p className="text-lg font-black italic text-[var(--color-text-primary)] tracking-tighter">{loc.t}</p>
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className={`w-2 h-2 rounded-full ${loc.active ? 'bg-brand-500 animate-pulse' : 'bg-[var(--color-surface-3)]'}`} />
                                                <span className="text-[9px] font-bold uppercase text-[var(--color-text-secondary)] tracking-widest">{loc.active ? 'Session Open' : 'Closed'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-10 bg-white/[0.02] border border-[var(--color-border)] rounded-lg text-center space-y-4">
                                    <Clock className="w-12 h-12 text-brand-500/20 mx-auto" />
                                    <p className="text-3xl font-black italic tracking-widest text-[var(--color-text-primary)]">03:42:15 <span className="text-sm text-[var(--color-text-muted)]">GMT</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Institutional Time Verification Engine</p>
                                </div>
                            </div>
                        ) : selectedTool?.id === "strength" ? (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    {[
                                        { c: "USD", v: 85, trend: "up" },
                                        { c: "EUR", v: 42, trend: "down" },
                                        { c: "GBP", v: 67, trend: "up" },
                                        { c: "JPY", v: 12, trend: "down" },
                                        { c: "AUD", v: 54, trend: "up" },
                                        { c: "CAD", v: 38, trend: "down" },
                                    ].map((curr) => (
                                        <div key={curr.c} className="flex items-center gap-6 p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                            <div className="w-16 text-xl font-black italic text-brand-500">{curr.c}</div>
                                            <div className="flex-1 h-3 bg-[var(--color-surface-2)] rounded-full overflow-hidden flex items-center">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${curr.v}%` }}
                                                    className="h-full bg-brand-500"
                                                />
                                            </div>
                                            <div className="w-16 text-right font-black italic text-[var(--color-text-primary)]">{curr.v}%</div>
                                            {curr.trend === "up" ? <TrendingUp className="w-4 h-4 text-brand-500" /> : <TrendingUp className="w-4 h-4 text-rose-500 rotate-180" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 py-10">
                                <div className="flex flex-col items-center justify-center text-center gap-6">
                                    <Activity className="w-20 h-20 text-brand-500 opacity-20 animate-pulse" />
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-[var(--color-text-secondary)]">Module Initialization Sequence</h4>
                                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.3em] max-w-sm">
                                            Provisioning institutional intelligence feeds and mathematical blueprints for {selectedTool?.name}
                                        </p>
                                    </div>
                                    <div className="w-full max-w-sm h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="h-full bg-brand-500 shadow-[0_0_15px_rgba(16, 185, 129,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 opacity-30 pointer-events-none">
                                    <div className="p-8 rounded-lg border border-[var(--color-border)] bg-white/[0.01] space-y-4">
                                        <div className="h-4 w-24 bg-[var(--color-surface-3)] rounded-full" />
                                        <div className="h-10 w-full bg-[var(--color-surface-2)] rounded-lg" />
                                    </div>
                                    <div className="p-8 rounded-lg border border-[var(--color-border)] bg-white/[0.01] space-y-4">
                                        <div className="h-4 w-24 bg-[var(--color-surface-3)] rounded-full" />
                                        <div className="h-10 w-full bg-[var(--color-surface-2)] rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white/[0.01] border-t border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-brand-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] italic">Validated Institutional Feed State</span>
                        </div>
                        <button
                            className="px-10 py-4 rounded-lg bg-brand-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-400 transition-all shadow-xl shadow-brand-500/10"
                            onClick={() => toast.success("Module Sync Successful", { description: "Institutional data alignment complete." })}
                        >
                            Sync Module
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
