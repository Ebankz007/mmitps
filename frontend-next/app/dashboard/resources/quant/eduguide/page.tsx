"use client";

import React from "react";
import {
    Activity,
    Target,
    Zap,
    TrendingUp,
    ShieldCheck,
    BarChart3,
    Compass,
    PieChart,
    ChevronRight,
    Play,
    Info,
    Brain,
    Layers,
    Clock,
    Crosshair,
    FileSearch
} from "lucide-react";

import { toast } from "sonner";


export default function QuantEduGuidePage() {
    const handleAction = (label: string) => {
        toast.info(`Quant ${label}`, {
            description: `Navigating to ${label.toLowerCase()} module...`
        });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans selection:bg-brand-500/30">
            {/* --- HEADER --- */}
            <div className="max-w-[1600px] mx-auto mb-16">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.4em] text-[var(--color-text-secondary)] uppercase italic">Financial Analytics // Systems Science</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-tight mb-6">
                        Quantitative <span className="text-brand-500">Methodology</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl font-medium tracking-tight leading-relaxed italic mb-10">
                        Master technical analysis through algorithmic models, statistical tools, and geometric patterns to analyze price action and forecast market movements.
                        While institutional-grade analysis once required supercomputers, MMITPS brings this power to your desktop.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: "Calculators", accent: "bg-brand-500/10 border-brand-500/20 text-brand-400" },
                            { label: "Tools", accent: "bg-brand-500/10 border-brand-500/20 text-brand-400" },
                            { label: "Strategies", accent: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                            { label: "Glossary", accent: "bg-brand-500/10 border-brand-500/20 text-brand-400" },
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => handleAction(btn.label)}
                                className={`px-6 py-2 rounded-full border ${btn.accent} text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-black/40`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- WHAT IS QUANT SECTION --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="p-10 rounded-lg border border-[var(--color-border)] bg-[#050505] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/[0.03] blur-[120px] rounded-full -mr-64 -mt-64 group-hover:bg-brand-500/5 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
                        <div className="w-16 h-16 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                            <Info className="w-8 h-8 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6 leading-none">What is <span className="text-brand-500">Quantitative Methodology?</span></h2>
                            <div className="space-y-4 text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed italic">
                                <p>
                                    <strong className="text-[var(--color-text-primary)]">Quantitative Methodology</strong> is the science of using mathematical models, statistical tools, and geometric patterns to analyze price action and market behavior.
                                    Institutional traders rely on "Quantitative" metrics to identify risk-to-reward ratios and algorithmic execution setups before placing Capital.
                                </p>
                                <p>
                                    At <strong className="text-brand-500">MMITPS</strong>, we synthesize both Quantitative and Quant-Mental data to identify harmonic asymmetries, price inefficiencies, and market cycles.
                                    Quantitative analysis is essentially "Technical Analysis with Number-Crunching" — removing guesswork and replacing it with mathematical probability.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- THE FOUR PILLARS --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="flex items-center gap-3 mb-10">
                    <Layers className="w-5 h-5 text-brand-500" />
                    <h3 className="text-xs font-black italic tracking-[0.3em] uppercase opacity-40">The Four Pillars of Quantitative Analysis at MMITPS</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            title: "Risk Metrics",
                            icon: ShieldCheck,
                            color: "text-brand-500",
                            bg: "bg-brand-500/5",
                            border: "border-brand-500/10",
                            desc: "Calculating standard deviation, volatility (ATR), stop-loss logic, and drawdown parameters to protect institutional capital pools."
                        },
                        {
                            title: "Yields",
                            icon: TrendingUp,
                            color: "text-brand-500",
                            bg: "bg-brand-500/5",
                            border: "border-brand-500/10",
                            desc: "Analyzing cross-market bond yields and currency strength matrix to identify the 'Cost of Money' and directional flow bias."
                        },
                        {
                            title: "Strategies",
                            icon: Zap,
                            color: "text-brand-500",
                            bg: "bg-brand-500/5",
                            border: "border-brand-500/10",
                            desc: "Designing back-tested algorithmic models like 3-Drive, PO3, and mean-reversion protocols for consistent alpha generation."
                        },
                        {
                            title: "Mentality",
                            icon: Brain,
                            color: "text-emerald-500",
                            bg: "bg-emerald-500/5",
                            border: "border-emerald-500/10",
                            desc: "Removing emotional bias by following data-driven execution rules and systematic risk management frameworks."
                        }
                    ].map((pillar, i) => (
                        <div key={i} className={`p-8 rounded-lg border ${pillar.border} bg-[#050505] group hover:bg-white/[0.02] transition-all duration-500`}>
                            <div className={`w-12 h-12 rounded-lg ${pillar.bg} border ${pillar.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                            </div>
                            <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4">{pillar.title}</h4>
                            <p className="text-[var(--color-text-muted)] text-xs font-medium leading-relaxed italic">{pillar.desc}</p>
                            <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-px bg-[var(--color-surface-3)]" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${pillar.color}`}>Explore Methodology</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- COMPARISON MODULE --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="p-10 rounded-lg border border-[var(--color-border)] bg-gradient-to-b from-[#080808] to-[#020202] relative group">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2">
                                <Compass className="w-4 h-4 text-brand-500" />
                                <h3 className="text-xs font-black italic tracking-widest uppercase text-brand-500">Technical vs Fundamental</h3>
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">A Complete <span className="text-brand-500">Trilogy</span></h2>
                            <p className="text-[var(--color-text-secondary)] text-sm italic font-medium leading-relaxed">
                                Most retail traders focus ONLY on Technicals. Professional institutions focus on BOTH Fundamentals and Technicals to find higher-probability trade ideas.
                                MMITPS bridges this gap with Quantitative methodology.
                            </p>
                            <button
                                onClick={() => handleAction("Trilogy Guide")}
                                className="px-8 py-3 rounded-lg bg-violet-600/20 border border-brand-500/30 text-brand-400 text-[10px] font-black tracking-widest uppercase hover:bg-violet-600/30 transition-all"
                            >
                                Read Complete Guide
                            </button>
                        </div>
                        <div className="flex-1 w-full max-w-lg aspect-video rounded-lg border border-[var(--color-border)] bg-black/40 flex items-center justify-center relative overflow-hidden group-hover:border-brand-500/30 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Play className="w-12 h-12 text-brand-500 fill-brand-500/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CORE CONCEPTS --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="flex items-center gap-3 mb-10">
                    <Crosshair className="w-5 h-5 text-brand-500" />
                    <h3 className="text-xs font-black italic tracking-[0.3em] uppercase opacity-40">Core Concepts of Quantitative Analysis</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: "Price Action and Volumes", icon: BarChart3, color: "text-brand-400", desc: "Understanding how buy/sell pressure creates order blocks and institutional imbalances." },
                        { title: "Risk-to-Reward Ratio", icon: ShieldCheck, color: "text-emerald-400", desc: "Mathematical evaluation of potential profit versus risk per entry — 1:3 RR as standard." },
                        { title: "Margin Allocation", icon: Activity, color: "text-brand-500", desc: "Dynamic sizing models based on account equity, leverage ratios, and contract tick values." },
                        { title: "Execution Criteria", icon: Target, color: "text-rose-400", desc: "The checklists of indicators and signal criteria required before a trade is triggered." },
                        { title: "Asset Correlation", icon: PieChart, color: "text-brand-400", desc: "How assets move together (e.g., Gold & USD Inverse) to prevent over-exposure." },
                        { title: "Trade Visualization", icon: FileSearch, color: "text-[var(--color-text-primary)]", desc: "Using advanced mapping like VMID and COT to 'see' where the money flow is shifting." }
                    ].map((concept, i) => (
                        <div key={i} className="p-8 rounded-lg border border-[var(--color-border)] bg-[#050505] hover:border-[var(--color-border)] transition-all flex flex-col items-center text-center group">
                            <div className={`w-10 h-10 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:bg-brand-500/10 transition-colors`}>
                                <concept.icon className={`w-5 h-5 ${concept.color}`} />
                            </div>
                            <h4 className="text-sm font-black italic tracking-widest uppercase mb-4">{concept.title}</h4>
                            <p className="text-[var(--color-text-muted)] text-xs font-medium leading-relaxed italic">{concept.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- THE TRADING WORKFLOW --- */}
            <div className="max-w-[1600px] mx-auto mb-20">
                <div className="p-10 rounded-lg border border-[var(--color-border)] bg-[#050505] relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">The Quantitative Trading Workflow</h2>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1 italic">Protocol Execution Pipeline</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { step: "01", title: "Scan with Geometry", desc: "Use the Formation Scanner to identify price patterns across 28 FX pairs and Commodities." },
                            { step: "02", title: "Assess Technical Edge", desc: "Identify institutional levels, Fibonacci reversals, and supply/demand zones." },
                            { step: "03", title: "Analyze Bias Strategy", desc: "Cross-reference fundamental strength and COT data to confirm high-probability direction." },
                            { step: "04", title: "Calculate Position Size", desc: "Determine appropriate lot sizes and margin based on system-wide risk rules." },
                            { step: "05", title: "Cross-Check with Smart View", desc: "Final verification using Heat Maps and Correlation Matrix to ensure optimal conditions." }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-lg bg-white/[0.02] border border-[var(--color-border)] flex items-center gap-8 group hover:bg-white/[0.04] transition-all"
                            >
                                <span className="text-2xl font-black italic tracking-tighter text-white/10 group-hover:text-brand-500 transition-colors">{item.step}</span>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black italic tracking-widest uppercase mb-1">{item.title}</h4>
                                    <p className="text-[var(--color-text-muted)] text-[11px] font-medium italic">{item.desc}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="w-4 h-4 text-brand-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- FOOTER DECORATION --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Launch Calculator", icon: Target },
                    { label: "Pattern Scanner", icon: Crosshair },
                    { label: "Margin Desk", icon: ShieldCheck },
                    { label: "Strategy Builder", icon: Zap }
                ].map((nav, i) => (
                    <button
                        key={i}
                        onClick={() => handleAction(nav.label)}
                        className="p-6 rounded-lg border border-[var(--color-border)] bg-[#050505] flex flex-col items-center gap-3 group hover:border-brand-500/20 transition-all"
                    >
                        <nav.icon className="w-5 h-5 text-brand-500/40 group-hover:text-brand-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">{nav.label}</span>
                    </button>
                ))}
            </div>

            <div className="max-w-[1600px] mx-auto text-center pt-8 border-t border-[var(--color-border)] opacity-20">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase grayscale">Institutional Intelligence Protocol // Quant Methodology EduGuide</span>
            </div>
        </div>
    );
}

