/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
    BrainCircuit,
    Cpu,
    Zap,
    MessageSquare,
    Activity,
    ShieldCheck,
    LineChart,
    BarChart3,
    Clock,
    Search,
    Filter,
    ArrowRight,
    Star,
    Globe,
    Lock,
    Microscope,
    Sparkles,
    RefreshCw
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

const ANALYSTS = [
    {
        id: "macro-ai",
        name: "MacroMind AI",
        specialty: "Global Fundamentals",
        status: "Online",
        accuracy: "92%",
        desc: "Specializes in G10 economic divergence, interest rate modeling, and cross-border capital flows.",
        capabilities: ["GDP Analysis", "Bond Yield Mapping", "Policy Forecasting"]
    },
    {
        id: "technical-ai",
        name: "VectorQuant AI",
        specialty: "Technical Patterns",
        status: "Syncing",
        accuracy: "88%",
        desc: "Advanced neural network for detecting institutional PO3 setups and liquidity sweep zones in real-time.",
        capabilities: ["Order Flow", "Pattern Rec", "Trend Exhaustion"]
    },
    {
        id: "sentiment-ai",
        name: "VoxPopuli AI",
        specialty: "Market Sentiment",
        status: "Online",
        accuracy: "94%",
        desc: "Analyzes over 1.2M retail data points and social signals to identify extreme contrarian opportunities.",
        capabilities: ["Crowd Bias", "Social Heatmaps", "Extreme Reversion"]
    },
];

export default function AIAgentAnalystHub() {
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-surface border border-[var(--color-border)] p-10 rounded-lg relative overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#10b981]/5 to-transparent blur-[120px] opacity-20 pointer-events-none"></div>
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981]/10 rounded-full border border-[#10b981]/20">
                        <Sparkles className="h-4 w-4 text-[#10b981]" />
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Neural Intelligence Active</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter max-w-4xl mx-auto leading-tight">
                        Experience the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-brand-500">Autonomous Market Alpha</span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
                        Connect with specialized AI agents trained on decades of institutional data. Get real-time deep-dives and predictive modeling at the speed of light.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button className="px-8 py-4 bg-[#10b981] hover:bg-[#10b981]/80 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16, 185, 129,0.2)]">
                            Launch Global Overview
                        </button>
                        <button className="px-8 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-xs font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>

            {/* Analyst Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ANALYSTS.map((analyst) => (
                    <div key={analyst.id} className="bg-surface border border-[var(--color-border)] rounded-lg p-8 flex flex-col h-full group hover:border-[#10b981]/30 transition-all relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BrainCircuit className="h-7 w-7 text-[#10b981]" />
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Intelligence</div>
                                <div className="text-xl font-black text-[var(--color-text-primary)]">{analyst.accuracy}</div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">{analyst.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    analyst.status === "Online" ? "bg-green-500" : "bg-brand-500"
                                )}></span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{analyst.specialty}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed font-medium mb-8">
                            {analyst.desc}
                        </p>

                        <div className="space-y-3 mb-10">
                            {analyst.capabilities.map(cap => (
                                <div key={cap} className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-[#10b981]"></div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{cap}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-auto py-4 bg-[var(--color-surface-2)] hover:bg-[#10b981] rounded-lg text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest border border-[var(--color-border)] hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(16, 185, 129,0.1)]">
                            Start Consultation
                            <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* System Status / Meta */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Cpu className="h-4 w-4 text-brand-400" />
                            <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Compute Load: 14%</span>
                        </div>
                        <div className="h-4 w-px bg-[var(--color-surface-3)]"></div>
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-green-500" />
                            <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Nodes Sync: 102/102</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Last Update: Just Now</span>
                        <RefreshCw className="h-3 w-3 text-gray-700 animate-spin-slow" />
                    </div>
                </div>
                <div className="bg-[#10b981] p-6 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-[#10b981]/90 transition-all">
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Live Engine Logs</span>
                    <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
}
