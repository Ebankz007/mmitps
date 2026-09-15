"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, BarChart3, Shield, Zap, ArrowLeft, Target, Award, Activity } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function PerformancePage() {
    return (
        <div className="min-h-screen bg-surface text-[var(--color-text-primary)] font-manrope selection:bg-brand-500/30 overflow-x-hidden">
            {/* Header / Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-[90px] px-6 md:px-[120px] flex items-center justify-between backdrop-blur-md border-b border-[var(--color-border)] bg-black/20">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <Logo size="sm" />
                </Link>
                <div className="flex items-center gap-8">
                    <Link 
                        href="/register" 
                        className="hidden md:block text-[12px] font-black uppercase tracking-widest text-brand-500 hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        Join Institutional
                    </Link>
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </Link>
                </div>
            </nav>

            <main className="pt-[160px] pb-[120px] px-6">
                <div className="max-w-[1440px] mx-auto">
                    {/* Hero Stats */}
                    <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                                <Activity size={14} className="text-brand-500" />
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Live Performance Audit</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-medium tracking-tighter italic font-instrument leading-[0.9]">
                                Verified <br />
                                <span className="text-[var(--color-text-muted)]">Alpha Generation.</span>
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-xl max-w-xl leading-relaxed">
                                MMITPS utilizes proprietary Institutional algorithms to deliver consistent market edges across 42+ asset classes.
                            </p>
                            <div className="flex gap-4">
                                <Link 
                                    href="/register" 
                                    className="px-8 py-4 bg-brand-500 rounded-lg text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20"
                                >
                                    Get Access Now
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Success Rate", value: "74.2%", icon: <Target className="text-brand-500" /> },
                                { label: "Monthly Alpha", value: "+12.4%", icon: <TrendingUp className="text-brand-500" /> },
                                { label: "Risk Factor", value: "Low-Med", icon: <Shield className="text-brand-500" /> },
                                { label: "Active Signals", value: "1.2k+", icon: <Zap className="text-brand-500" /> },
                            ].map((stat, idx) => (
                                <div key={idx} className="p-8 rounded-lg bg-white/[0.02] border border-[var(--color-border)] backdrop-blur-3xl group hover:border-brand-500/20 transition-all">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl font-bold tracking-tighter text-[var(--color-text-primary)] mb-2">{stat.value}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Visualization Placeholder (Premium SVG) */}
                    <div className="mb-32">
                        <div className="p-1 md:p-12 rounded-lg bg-white/[0.01] border border-[var(--color-border)] relative overflow-hidden">
                            <div className="absolute top-10 left-10 z-10">
                                <h3 className="text-2xl font-bold tracking-tight mb-2">Aggregate Equity Curve</h3>
                                <p className="text-[var(--color-text-muted)] text-sm font-manrope">Consolidated performance across all MMITPS Institutional Portfolios.</p>
                            </div>
                            
                            {/* Abstract Premium SVG Chart */}
                            <div className="w-full aspect-[21/9] flex items-end px-4 py-8">
                                <svg className="w-full h-full opacity-40" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 0.2 }} />
                                            <stop offset="100%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <path 
                                        d="M0,280 Q50,250 100,260 T200,220 T300,180 T400,200 T500,120 T600,140 T700,80 T800,90 T900,40 L1000,20 L1000,300 L0,300 Z" 
                                        fill="url(#gradient)" 
                                    />
                                    <path 
                                        d="M0,280 Q50,250 100,260 T200,220 T300,180 T400,200 T500,120 T600,140 T700,80 T800,90 T900,40 L1000,20" 
                                        fill="none" 
                                        stroke="#10b981" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                        className="animate-[draw_3s_ease-out_forwards]"
                                        style={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
                                    />
                                    {/* Grid Lines */}
                                    <line x1="0" y1="50" x2="1000" y2="50" stroke="white" strokeOpacity="0.03" />
                                    <line x1="0" y1="150" x2="1000" y2="150" stroke="white" strokeOpacity="0.03" />
                                    <line x1="0" y1="250" x2="1000" y2="250" stroke="white" strokeOpacity="0.03" />
                                </svg>
                            </div>
                            
                            {/* Tags */}
                            <div className="absolute bottom-10 right-10 flex gap-4">
                                <div className="px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Equity Growth</div>
                                <div className="px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Drawdown: 4.2% Max</div>
                            </div>
                        </div>
                    </div>

                    {/* Sector Performance */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { sector: "Global Forex", alpha: "+18.4%", desc: "Major & Minor pairs G10 focus." },
                            { sector: "Crypto Indices", alpha: "+24.1%", desc: "Institutional grade digital assets." },
                            { sector: "Commodities", alpha: "+9.8%", desc: "Energy and Metals algorithmic cycle." },
                        ].map((item, idx) => (
                            <div key={idx} className="p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                <h4 className="text-[var(--color-text-muted)] uppercase tracking-[3px] text-[10px] font-black mb-4">{item.sector}</h4>
                                <div className="text-4xl font-bold mb-4">{item.alpha}</div>
                                <p className="text-[var(--color-text-secondary)] text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
                .font-instrument { font-family: 'Instrument Serif', serif; }
                .font-manrope { font-family: 'Manrope', sans-serif; }
            `}</style>
        </div>
    );
}
