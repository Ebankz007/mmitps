"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Layers,
    ShieldAlert,
    ChevronRight,
    Zap,
    Target,
    BarChart3,
    ArrowUpRight,
    LineChart,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function VMIDEducationPage() {
    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)] min-h-screen pt-4">
            {/* ── Hero Section: The Science of Volume ── */}
            <section className="relative group overflow-hidden bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-12 lg:p-16 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none group-hover:from-amber-500/20 transition-all duration-1000" />

                <div className="relative z-10 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg shadow-xl">
                            <Activity className="h-6 w-6 text-amber-500 shadow-[0_0_15px_rgba(16, 185, 129,0.5)]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-secondary)]">Volumetric Academy</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-black uppercase tracking-[-0.05em] mb-8 leading-[0.95]"
                    >
                        Mastering <br />
                        <span className="text-amber-500">Market Flow</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-10 max-w-2xl font-bold uppercase italic tracking-tight"
                    >
                        Price is a reflection. Volume is the engine. MMITPS-VMID PRO decodes the institutional flow, revealing where mass participation meets algorithmic exhaustion.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            href="/dashboard/resources/vmid/pro"
                            className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            Launch VMID PRO <ArrowUpRight size={16} />
                        </Link>
                        <Link
                            href="/dashboard/resources/vmid/correlation"
                            className="px-10 py-5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                        >
                            Open Correlation Matrix
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── The Four Pillars of Volumetric Intelligence ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    {
                        title: "Volumetric Analysis",
                        icon: BarChart3,
                        color: "text-brand-400",
                        bg: "bg-brand-400/10",
                        border: "border-blue-400/20",
                        desc: "Traditional charts hide the volume nodes where institutions accumulate or distribute. We reveal the 'V/Vol' ratio—the intensity of current flow against historical averages.",
                        points: ["Relative Volume Overlays", "High-Intensity Node Detection", "Algorithm Flow Tracking"]
                    },
                    {
                        title: "Predictive Modeling",
                        icon: Zap,
                        color: "text-amber-400",
                        bg: "bg-amber-400/10",
                        border: "border-amber-400/20",
                        desc: "Our Z-Score engine measures statistical deviation from the mean, identifying 'Exhaustion' and 'Impulse' points before the breakout occurs.",
                        points: ["Z-Score Anomaly Detection", "ROC Impulse Tracking", "Volumetric Divergence"]
                    },
                    {
                        title: "Cross-Asset Coupling",
                        icon: Layers,
                        color: "text-emerald-400",
                        bg: "bg-emerald-400/10",
                        border: "border-emerald-400/20",
                        desc: "Assets don't move in isolation. The Correlation Matrix identifies flow coupling, helping you confirm high-probability rotations and hedge systemic risk.",
                        points: ["Real-time Matrix Spectraling", "Rotation Confirmation", "Systemic Risk Mapping"]
                    },
                    {
                        title: "Institutional Context",
                        icon: Target,
                        color: "text-brand-400",
                        bg: "bg-brand-400/10",
                        border: "border-brand-400/20",
                        desc: "Integrate COT (Commitment of Traders) and Open Interest data to see exactly how Commercials and Managed Money are positioning their capital.",
                        points: ["COT Percentile Mapping", "OI Narrative Analysis", "Positional Bias Detection"]
                    }
                ].map((pillar, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-10 hover:border-[var(--color-border)] transition-all group overflow-hidden relative shadow-xl"
                    >
                        <div className={clsx("absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-all duration-700", pillar.color.replace('text', 'bg'))} />

                        <div className="relative z-10">
                            <div className={clsx("w-14 h-14 rounded-lg flex items-center justify-center mb-8 border", pillar.bg, pillar.border)}>
                                <pillar.icon className={clsx("w-6 h-6", pillar.color)} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[var(--color-text-primary)] group-hover:text-amber-500 transition-colors italic">{pillar.title}</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm font-bold leading-relaxed mb-8 uppercase tracking-tight">
                                {pillar.desc}
                            </p>
                            <ul className="space-y-3">
                                {pillar.points.map((pt, j) => (
                                    <li key={j} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                                        <ChevronRight size={12} className="text-amber-500" />
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Interactive Command Guide ── */}
            <section className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-12 lg:px-16 lg:py-20 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000" />

                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-8 relative z-10">
                        <div>
                            <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Operation Interface</span>
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.05em] mt-6 leading-none">
                                The <span className="text-amber-500 font-black italic">Command Bar</span>
                            </h2>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-lg font-bold uppercase italic tracking-tight leading-relaxed">
                            Elite trading requires zero latency in decision making. Our unified header allows for instantaneous cross-asset and multi-timeframe navigation without losing focus on the chart.
                        </p>
                        <div className="space-y-6">
                            {[
                                { label: "Unified Selector", desc: "Surgically switch between Forex, Commodities, Indices, and Crypto in under 50ms." },
                                { label: "Timeframe Matrix", desc: "Toggle between scalping (1m/5m) and institutional positioning (D/W) instantly." },
                                { label: "Volumetric Alerts", desc: "Set persistent monitoring for ROC breaches and Z-Score spikes directly from the hub." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/10 mt-1">
                                        <span className="text-[10px] font-black text-amber-500">{i + 1}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-1">{item.label}</h4>
                                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tight">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-2xl relative">
                        <div className="bg-[#0D1529] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl relative overflow-hidden group/bar">
                            <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg blur-[1px] group-hover/bar:blur-0 transition-all duration-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30" />
                                    <div className="space-y-1">
                                        <div className="w-16 h-2 bg-[var(--color-surface-3)] rounded-full" />
                                        <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-10 h-6 bg-[var(--color-surface-2)] rounded-md border border-[var(--color-border)]" />)}
                                </div>
                                <div className="w-24 h-8 bg-amber-500/20 rounded-lg border border-amber-500/30" />
                            </div>
                            <div className="mt-8 text-center">
                                <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.5em]">Interactive Simulation Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Correlation Intelligence ── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[120px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-none">
                            Cross-Asset <br />
                            <span className="text-emerald-500">Correlation Spectraling</span>
                        </h2>
                        <p className="text-[var(--color-text-secondary)] font-bold uppercase italic tracking-tight leading-relaxed max-w-xl mb-12">
                            Correlation isn&apos;t just a number; it&apos;s a map of capital flow. Identifying when assets decouple provides elite opportunities to front-run the smart money rotation.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldAlert size={12} /> Positive Coupling
                                    </h4>
                                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase leading-relaxed">Assets moving in sync. Confirm strength by ensuring majors are coupled during impulses.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ShieldAlert size={12} /> Negative Coupling
                                    </h4>
                                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase leading-relaxed">Inverse relationships. Essential for hedging and validating USD-based impulses.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/resources/vmid/correlation"
                        className="mt-12 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-all group"
                    >
                        Explore Matrix <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-10 shadow-2xl flex flex-col justify-between group">
                    <div className="space-y-8">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg inline-flex items-center justify-center">
                            <LineChart className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Precision Analysis</h3>
                        <p className="text-[var(--color-text-secondary)] text-[11px] font-bold uppercase leading-relaxed tracking-tight">
                            Every signal in VMID PRO is processed through a multi-pass validator including Z-Score anomalies, ROC spikes, and OI divergence. We don&apos;t just show data; we show institutional conviction.
                        </p>
                    </div>
                    <div className="pt-10 space-y-4 border-t border-[var(--color-border)] mt-10">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Signal Confidence</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">92% Average</span>
                        </div>
                        <div className="w-full bg-[var(--color-surface-2)] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA: Step Into the Engine ── */}
            <section className="text-center py-20">
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-[-0.05em] mb-12">
                    Ready to <span className="text-amber-500">Decode</span>?
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/dashboard/resources/vmid/pro"
                        className="w-full sm:w-auto px-16 py-6 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-black uppercase tracking-[.25em] text-sm transition-all shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95"
                    >
                        Launch VMID PRO
                    </Link>
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-16 py-6 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg font-black uppercase tracking-[.25em] text-sm transition-all hover:scale-105"
                    >
                        Back to Core
                    </Link>
                </div>
                <p className="mt-12 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.6em]">Proprietary Algorithmic Intelligence Engine</p>
            </section>
        </div>
    );
}
