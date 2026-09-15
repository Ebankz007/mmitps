"use client";

import React from "react";
import Link from "next/link";
import {
    Activity, Target, Compass, Clock, Zap, Target as TargetIcon,
    ArrowRight, Database,
    Calculator, Radio, Triangle, Layers, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Components ───────────────────────────────────────────────────────────────

function FeatureCard({ title, desc, icon: Icon, color, bg }: {
    title: string; desc: string; icon: React.ElementType; color: string; bg: string;
}) {
    return (
        <div className="relative overflow-hidden group p-6 rounded-lg bg-[#080E1A] border border-[var(--color-border)] transition-all hover:border-[var(--color-border)] mt-2">
            <div className={cn("absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700", bg)} />
            <div className="relative z-10">
                <div className={cn("w-12 h-12 rounded-lg flex flex-col items-center justify-center mb-5 border", bg, color, `border-${color.split("-")[1]}-500/20`)}>
                    <Icon size={24} />
                </div>
                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-2">{title}</h3>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-bold">{desc}</p>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function PTDMenuPage() {
    return (
        <div className="space-y-8 pb-20 text-[var(--color-text-primary)] max-w-7xl mx-auto">

            {/* ── Hero Educational Section ── */}
            <div className="relative bg-[#080E1A] border border-[var(--color-border)] rounded-lg px-8 md:px-12 py-16 overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />

                <div className="flex-1 space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Clock size={16} className="text-amber-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Institutional Intelligence</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        MMITPS-PTD <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">PRO</span>
                    </h1>

                    <p className="text-[var(--color-text-secondary)] text-sm font-bold uppercase tracking-widest max-w-xl leading-relaxed">
                        Predictive Time Dashboard. A paradigm shift from <span className="text-[var(--color-text-primary)]">price-based</span> to <span className="text-[var(--color-text-primary)]">time-based</span> execution. Stop guessing where the market will go, and start knowing exactly <u>when</u> it will turn.
                    </p>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                        <Link href="/dashboard/resources/ptd/pro"
                            className="px-8 py-4 rounded-lg bg-amber-500 text-black text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-amber-400 transition-all shadow-xl shadow-brand-500/20">
                            Launch PRO Oracle <ArrowRight size={16} />
                        </Link>
                        <a href="#how-it-works"
                            className="px-8 py-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] transition-all">
                            How It Works
                        </a>
                    </div>
                </div>

                {/* Hero Graphic (Abstract representation of time/price) */}
                <div className="flex-1 relative z-10 w-full max-w-md hidden lg:block">
                    <div className="relative aspect-square">
                        <div className="absolute inset-0 border border-[var(--color-border)] rounded-full animate-[spin_60s_linear_infinite]" />
                        <div className="absolute inset-4 border border-dashed border-amber-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                        <div className="absolute inset-12 border border-brand-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-[#0D1529] rounded-lg border border-[var(--color-border)] flex flex-col items-center justify-center shadow-2xl rotate-12 transition-transform hover:rotate-0 duration-500">
                                <Target size={40} className="text-amber-400 mb-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Time Delta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Paradigm Shift Overview ── */}
            <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="col-span-1 md:col-span-3 pb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">The Predictive Edge</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Why Timing Displaces Price Analysis</p>
                </div>

                {[
                    { title: "Standard Retail", desc: "95% of traders look left: Support, Resistance, Trendlines. They wait for price to react, missing the origin of the move and enduring severe drawdown.", icon: Triangle, c: "text-red-400" },
                    { title: "Institutional Quant", desc: "Algorithms don't look at chart patterns. They look at volumetric exhaustion mapped over fixed temporal spans. They buy the exact minute the cycle rests.", icon: Database, c: "text-brand-400" },
                    { title: "MMITPS-PTD PRO", desc: "We overlay 4 distinct mathematical temporal engines to predict the precise 15-minute window a reversal will initiate. You trade the future, not the past.", icon: Brain, c: "text-emerald-400" }
                ].map((item, i) => (
                    <div key={i} className="bg-[#080E1A] p-8 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border)] transition-colors">
                        <item.icon size={24} className={item.c} />
                        <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)] mt-6 mb-3">{item.title}</h3>
                        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-bold">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── The 4 Timing Engines ── */}
            <div className="pt-12">
                <div className="pb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">The 4 Timing Engines</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Multi-Modal Temporal Convergence</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <FeatureCard
                        title="Fibonacci Time"
                        desc="Transposes the golden ratio (1.618) from the Y-axis (price) onto the X-axis (time). Anticipating exact bars where trend exhaustion aligns with mathematical growth sequences."
                        icon={TargetIcon}
                        color="text-amber-400"
                        bg="bg-amber-500/10"
                    />
                    <FeatureCard
                        title="W.D. Gann Angles"
                        desc="Geometric mapping of time and price squaring. Uses the legendary 'Square of 9' and planetary angles to identify points where time turns into price resistance."
                        icon={Compass}
                        color="text-brand-400"
                        bg="bg-brand-500/10"
                    />
                    <FeatureCard
                        title="Financial Astrology"
                        desc="Identifies deep macro reversals by charting planetary ingress and lunar phases which statistically correlate heavily with extreme institutional capital flow shifts."
                        icon={Radio}
                        color="text-brand-400"
                        bg="bg-brand-500/10"
                    />
                    <FeatureCard
                        title="Cyclic Oscillation"
                        desc="Applies Fast Fourier Transforms (FFT) to strip away noise, isolating the dominant repeating wave cycles of an asset to predict the precise peak and trough."
                        icon={Activity}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                    />
                </div>
            </div>

            {/* ── Advanced Oracle Features ── */}
            <div className="bg-[#0D1529] rounded-lg border border-[var(--color-border)] p-8 md:p-12 mt-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[var(--color-text-primary)] mb-2">Automated Ecosystem</h2>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">From Scanning to Execution</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "Combination Logic", desc: "Don't trust one engine? Set AND/OR combinations. Require Fibonacci + Cycles to trigger simultaneously for extreme high-probability setups.", icon: Layers },
                                { title: "Backtesting Simulator", desc: "Run historical scenarios across any asset. Instantly see your Win Rate broken down by 80%+, 50-79%, and Low confidence brackets.", icon: Calculator },
                                { title: "Alpaca Broker Integration", desc: "Remove human hesitation. Connect your API keys, set a Minimum Confidence Threshold (e.g., 85%), and let the Oracle auto-execute limits on your behalf.", icon: Zap },
                            ].map((ft, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 shrink-0 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
                                        <ft.icon size={14} className="text-[var(--color-text-secondary)]" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-1">{ft.title}</h4>
                                        <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] leading-relaxed">{ft.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        {/* Mockup Dashboard Preview Graphic */}
                        <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full" />
                        <div className="relative bg-[#080E1A] border border-[var(--color-border)] rounded-lg shadow-2xl p-4 rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 mb-3">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">PTD_ORACLE_OS</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { t: "14:15", src: "FIBONACCI+CYCLES", dir: "UP", conf: 92, c: "text-emerald-400" },
                                    { t: "09:30", src: "GANN", dir: "DOWN", conf: 68, c: "text-amber-400" },
                                    { t: "11:45", src: "ASTRO+FIB", dir: "UP", conf: 84, c: "text-emerald-400" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-2)]">
                                        <span className="text-[9px] font-mono text-[var(--color-text-secondary)]">{row.t}</span>
                                        <span className="text-[9px] font-black uppercase text-[var(--color-text-primary)] tracking-widest">{row.src}</span>
                                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--color-surface-2)]", row.c)}>{row.conf}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 rounded-lg border border-dashed border-[var(--color-border-hover)] text-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Auto-Trade Executing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
