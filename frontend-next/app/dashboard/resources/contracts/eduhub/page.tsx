/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
    Play,
    Info,
    Hash,
    DollarSign,
    Calendar,
    ArrowUpRight,
    Shield,
    Target,
    Zap,
    BookOpen,
    FileText,
    Settings,
    ChevronRight,
    Activity,
    AlertCircle,
    User
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContractSpecsEduHub() {
    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans selection:bg-brand-500/30">
            {/* --- HEADER --- */}
            <div className="max-w-[1600px] mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--color-border)]">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-[10px] font-black tracking-widest text-brand-400 uppercase">
                                Institutional Academy
                            </div>
                            <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />
                            <div className="text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase">
                                v2.0 Protocol
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none mb-4">
                            Contract <span className="text-brand-500">Specifications</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-2xl font-medium tracking-tight leading-relaxed">
                            Master the mechanics of exchange-traded instruments. Our multi-asset framework ensures
                            precision entry, mathematical margin allocation, and zero-lag execution protocols.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-6 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all text-xs font-bold tracking-widest uppercase flex items-center gap-2 group">
                            <FileText className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                            Download Guide
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-brand-500 text-black hover:bg-brand-400 transition-all text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(16, 185, 129,0.2)]">
                            Launch Planner
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TOP SECTION: VIDEO & LEVERAGE --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                {/* Left: Understanding Video */}
                <div className="lg:col-span-7 group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative h-[480px] rounded-lg border border-[var(--color-border)] bg-[#050505] overflow-hidden flex flex-col">
                        <div className="p-8 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                <h3 className="text-xs font-black tracking-[0.2em] text-[var(--color-text-secondary)] uppercase">Video Masterclass</h3>
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Understanding Contract Specifications</h2>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative bg-black/40">
                            {/* Fake Video Player UI */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974717414-78326e5fc5f2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-[2s]" />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(16, 185, 129,0.4)]"
                            >
                                <Play className="w-8 h-8 text-black fill-black ml-1" />
                            </motion.button>
                        </div>

                        <div className="p-6 bg-white/[0.02] border-t border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Duration</span>
                                    <span className="text-xs font-black italic">14:42 MIN</span>
                                </div>
                                <div className="w-px h-8 bg-[var(--color-surface-2)]" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">Language</span>
                                    <span className="text-xs font-black italic">ENGLISH (US)</span>
                                </div>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-brand-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-brand-500/60" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-[var(--color-surface-2)] flex items-center justify-center text-[8px] font-black">
                                    +12k
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Leverage Card */}
                <div className="lg:col-span-5">
                    <div className="h-full rounded-lg border border-[var(--color-border)] bg-[#050505] p-8 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-brand-500/10 transition-colors" />

                        <div className="mb-8">
                            <h3 className="text-[10px] font-black tracking-[0.2em] text-brand-500 uppercase mb-2">Algorithm V3</h3>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight mb-4">How our <span className="text-[var(--color-text-muted)]">leverage</span> works?</h2>
                            <p className="text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed italic">
                                Our dynamic leverage engine adjusts in real-time based on asset volatility and market depth.
                                Institutional protection layers prevent negative balance scenarios.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)]">
                                <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Max Leverage</span>
                                <div className="flex items-end gap-2 text-2xl font-black italic tracking-tighter">
                                    1:500
                                    <span className="text-[10px] text-brand-500 mb-1 leading-none uppercase tracking-widest italic">Dynamic</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)]">
                                <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest block mb-2">Risk Exposure</span>
                                <div className="flex items-end gap-2 text-2xl font-black italic tracking-tighter text-emerald-500">
                                    LOW
                                    <Shield className="w-4 h-4 mb-1" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border)]">
                                <span className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">Equity Protection</span>
                                <span className="font-black italic text-brand-500">ENABLED</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--color-border)]">
                                <span className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">Stop Out Level</span>
                                <span className="font-black italic">50%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">Margin Call</span>
                                <span className="font-black italic">100%</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-8 w-full py-4 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-500 text-xs font-black tracking-widest uppercase hover:bg-brand-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            View All Leverage Tiers
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* --- KEY ELEMENTS ROW --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Symbol", icon: Hash, desc: "Unique naming convention for assets across exchanges", val: "EURUSD" },
                    { label: "Margin", icon: Shield, desc: "Required collateral to maintain open positions", val: "DYNAMIC" },
                    { label: "Pip Value", icon: DollarSign, desc: "Monetary movement per minimum price increment", val: "VARIES" },
                    { label: "Expiry", icon: Calendar, desc: "Contract termination date for futures & options", val: "QUARTERLY" }
                ].map((item, i) => (
                    <div key={i} className="p-8 rounded-lg border border-[var(--color-border)] bg-[#050505] group hover:border-brand-500/30 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-all">
                            <item.icon className="w-6 h-6 text-brand-500" />
                        </div>
                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-2">{item.label}</h4>
                        <div className="text-2xl font-black italic tracking-tighter uppercase mb-4">{item.val}</div>
                        <p className="text-[var(--color-text-muted)] text-xs font-medium leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* --- FUTURES MONTH CODES & ALPHA SELECTION --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                {/* Left: Month Codes */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="p-8 rounded-lg border border-[var(--color-border)] bg-[#050505] flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-brand-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black italic tracking-tighter uppercase leading-none">Futures Month Codes</h3>
                                <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1 italic">Reference Protocol</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {[
                                { m: "JANUARY", c: "F" }, { m: "JULY", c: "N" },
                                { m: "FEBRUARY", c: "G" }, { m: "AUGUST", c: "Q" },
                                { m: "MARCH", c: "H" }, { m: "SEPTEMBER", c: "U" },
                                { m: "APRIL", c: "J" }, { m: "OCTOBER", c: "V" },
                                { m: "MAY", c: "K" }, { m: "NOVEMBER", c: "X" },
                                { m: "JUNE", c: "M" }, { m: "DECEMBER", c: "Z" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] group hover:border-brand-500/20 transition-all">
                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest">{item.m}</span>
                                    <span className="text-xl font-black italic text-brand-400 group-hover:scale-125 transition-transform">{item.c}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Alpha Selection Table */}
                <div className="lg:col-span-8">
                    <div className="p-8 rounded-lg border border-[var(--color-border)] bg-[#050505] h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-brand-500" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black italic tracking-tighter uppercase leading-none">Popular Contracts Alpha Selection</h3>
                                    <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1 italic">High Liquidity Matrix</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest italic cursor-pointer hover:bg-[var(--color-surface-3)] transition-all">
                                    All Assets
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Contract</th>
                                        <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Avg Margin</th>
                                        <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Tick Size</th>
                                        <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Value/Tick</th>
                                        <th className="text-right py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">1 Lot Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: "S\u0026P 500 (ES)", margin: "0.25%", tick: "0.25", val: "$12.50", full: "$12,450.00" },
                                        { name: "Nasdaq 100 (NQ)", margin: "0.30%", tick: "0.25", val: "$5.00", full: "$18,200.00" },
                                        { name: "Gold (GC)", margin: "0.50%", tick: "0.10", val: "$10.00", full: "$8,500.00" },
                                        { name: "Crude Oil (CL)", margin: "0.80%", tick: "0.01", val: "$10.00", full: "$6,200.00" },
                                        { name: "Euro FX (6E)", margin: "0.15%", tick: "0.00005", val: "$6.25", full: "$2,850.00" },
                                        { name: "Bitcoin (BTC)", margin: "2.50%", tick: "5.00", val: "$25.00", full: "$42,600.00" }
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] font-black text-brand-500">
                                                        {row.name.split(' ').pop()}
                                                    </div>
                                                    <span className="text-xs font-black italic">{row.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-xs font-bold text-[var(--color-text-secondary)]">{row.margin}</td>
                                            <td className="py-4 px-2 text-xs font-bold text-[var(--color-text-secondary)] tracking-wider font-mono">{row.tick}</td>
                                            <td className="py-4 px-2 text-xs font-black text-brand-500 tracking-tighter">{row.val}</td>
                                            <td className="py-4 px-2 text-right">
                                                <span className="text-xs font-black italic tracking-tighter text-[var(--color-text-primary)]">{row.full}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-brand-500/[0.03] border border-brand-500/10 flex items-center gap-4">
                            <Info className="w-5 h-5 text-brand-500 shrink-0" />
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed italic">
                                ** Alpha Selection margins may fluctuate based on MMITPS liquidity heatmaps. Ensure your account is
                                properly capitalized before engaging in high-alpha contract variants.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FOOTER LINKS --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Contract Details", icon: FileText, color: "text-brand-500" },
                    { label: "Margin Methodology", icon: Settings, color: "text-brand-500" },
                    { label: "Symbol Rules", icon: AlertCircle, color: "text-emerald-500" }
                ].map((item, i) => (
                    <button key={i} className="p-8 rounded-lg border border-[var(--color-border)] bg-[#050505] flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-4">
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                            <span className="text-xs font-black tracking-widest uppercase italic">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                    </button>
                ))}
            </div>

            {/* --- BOTTOM DECORATION --- */}
            <div className="max-w-[1600px] mx-auto text-center pt-8 border-t border-[var(--color-border)] opacity-20">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase grayscale">Institutional Intelligence Protocol // MMITPS Corp</span>
            </div>
        </div>
    );
}
