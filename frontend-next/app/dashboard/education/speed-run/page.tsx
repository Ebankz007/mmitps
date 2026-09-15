/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
    Zap,
    Play,
    CheckCircle2,
    Clock,
    ShieldCheck,
    BarChart3,
    Newspaper,
    Bot,
    Calculator,
    CornerDownRight,
    PlayCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SpeedRunPage() {
    const [stats] = useState({
        totalRuns: 15,
        completed: 4,
        watchTime: "2h",
        progress: 27
    });

    const items = [
        {
            id: "1",
            title: "What is Forex Trading?",
            description: "Introduction to currency markets, pairs, and how forex works",
            duration: "12 min",
            status: "COMPLETED",
            icon: ShieldCheck,
            buttonLabel: "Rewatch"
        },
        {
            id: "2",
            title: "Reading Candlestick Charts",
            description: "Understanding OHLC, candlestick anatomy, and basic patterns",
            duration: "15 min",
            status: "COMPLETED",
            icon: BarChart3,
            buttonLabel: "Rewatch"
        },
        {
            id: "3",
            title: "Your First Trade in 10 Minutes",
            description: "Step-by-step guide to placing your first forex trade",
            duration: "10 min",
            status: "UP NEXT",
            icon: PlayCircle,
            buttonLabel: "Start Now",
            isActive: true
        },
        {
            id: "4",
            title: "Setting Stop Loss & Take Profit",
            description: "Essential risk management in under 15 minutes",
            duration: "14 min",
            icon: ShieldCheck,
            buttonLabel: "Watch"
        },
        {
            id: "5",
            title: "Support & Resistance Basics",
            description: "Identify key levels where price reacts",
            duration: "18 min",
            icon: BarChart3,
            buttonLabel: "Watch"
        },
        {
            id: "6",
            title: "Trading the News",
            description: "How economic events affect currency prices",
            duration: "20 min",
            icon: Newspaper,
            buttonLabel: "Watch"
        },
        {
            id: "7",
            title: "MMITPS Bot Setup Guide",
            description: "Connect and configure your first trading bot",
            duration: "8 min",
            status: "PLATFORM",
            icon: Bot,
            buttonLabel: "Watch"
        },
        {
            id: "8",
            title: "Position Sizing Made Simple",
            description: "Calculate proper lot sizes for any account",
            duration: "12 min",
            icon: Calculator,
            buttonLabel: "Watch"
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-brand-500">
                    <Zap size={28} fill="currentColor" />
                    <h2 className="text-2xl font-black tracking-tight uppercase italic font-mono transition-transform group-hover:scale-105">Speed Run Courses</h2>
                </div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-10 font-mono">
                    Quick crash courses to get you trading fast — each under 20 minutes
                </p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg text-center space-y-2 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-3xl font-black text-[var(--color-text-primary)] relative z-10">{stats.totalRuns}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">Speed Runs</p>
                </div>
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg text-center space-y-2 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-3xl font-black text-[var(--color-text-primary)] relative z-10">{stats.completed}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">Completed</p>
                </div>
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg text-center space-y-2 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-3xl font-black text-[var(--color-text-primary)] relative z-10">{stats.watchTime}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">Total Watch Time</p>
                </div>
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg text-center space-y-2 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-3xl font-black text-[#ce8dfb] relative z-10">{stats.progress}%</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">Progress</p>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 px-4 mb-2">
                    <CornerDownRight size={18} className="text-gray-500" />
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-[0.2em] font-mono">Quick Start Essentials</h3>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                "group p-6 rounded-lg border transition-all flex flex-col md:flex-row items-center gap-6",
                                item.isActive
                                    ? "bg-gradient-to-r from-brand-500/10 to-transparent border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]"
                                    : "bg-white/[0.02] border-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-white/[0.04]"
                            )}
                        >
                            {/* Status Icon */}
                            <div className={cn(
                                "w-16 h-16 rounded-lg flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105",
                                item.status === 'COMPLETED' ? "bg-emerald-500 text-black" :
                                    item.status === 'UP NEXT' ? "bg-brand-500 text-[var(--color-text-primary)]" :
                                        "bg-brand-500 text-[var(--color-text-primary)]"
                            )}>
                                {item.status === 'COMPLETED' ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <item.icon size={28} strokeWidth={2} />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-1 text-center md:text-left w-full">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight italic">{item.title}</h4>
                                    {item.status && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                            item.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                item.status === 'UP NEXT' ? "bg-brand-500/10 text-brand-500 border-orange-500/20" :
                                                    "bg-[#ce8dfb]/10 text-[#ce8dfb] border-[#ce8dfb]/20"
                                        )}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.description}</p>
                            </div>

                            {/* Action Area */}
                            <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <Clock size={14} className="text-gray-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.duration}</span>
                                </div>
                                <button className={cn(
                                    "px-8 py-3 rounded-lg font-black uppercase text-[9px] tracking-[0.2em] transition-all min-w-[120px] active:scale-95",
                                    item.isActive
                                        ? "bg-brand-500 text-[var(--color-text-primary)] shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:translate-y-[-2px] hover:bg-orange-400"
                                        : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-gray-500 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-border-hover)]"
                                )}>
                                    {item.buttonLabel}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
