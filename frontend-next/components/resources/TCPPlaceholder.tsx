"use client";

import React from "react";
import {
    Gamepad2,
    Activity,
    TrendingUp,
    ShieldAlert,
    BarChart2,
    Settings,
    ArrowRight
} from "lucide-react";
import { clsx } from "clsx";

export function TCPPlaceholder({ module }: { module: string }) {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16, 185, 129,0.05),transparent_60%)]" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                        <Gamepad2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">TradeControl Panel</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
                        TCP <span className="text-amber-500 italic">{module}</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-xl">
                        Execution-grade interface for professional {module.toLowerCase()} management. Powered by the MMITPS low-latency core.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-8 bg-black/40 border border-[var(--color-border)] rounded-lg flex items-center gap-6 shadow-[0_0_50px_rgba(16, 185, 129,0.1)]">
                        <Activity className="text-amber-500 animate-pulse" size={40} />
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">System Status</p>
                            <p className="text-4xl font-black text-green-500 uppercase tracking-tighter">Optimal</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Live Execution", icon: TrendingUp, status: "Active" },
                    { label: "Safety Guards", icon: ShieldAlert, status: "Active" },
                    { label: "System Metrics", icon: BarChart2, status: "Standby" },
                ].map((s) => (
                    <div key={s.label} className="p-10 bg-surface border border-[var(--color-border)] rounded-lg hover:border-amber-500/20 transition-all space-y-6 group">
                        <div className="flex items-center justify-between">
                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group-hover:bg-amber-500 group-hover:text-black transition-all">
                                <s.icon size={24} />
                            </div>
                            <Settings size={18} className="text-gray-600 hover:text-[var(--color-text-primary)] transition-colors cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">{s.label}</h4>
                            <div className="flex items-center gap-2">
                                <div className={clsx("w-1.5 h-1.5 rounded-full", s.status === "Active" ? "bg-green-500" : "bg-gray-600")} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.status}</span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:gap-4 transition-all">
                            Configure Module <ArrowRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
