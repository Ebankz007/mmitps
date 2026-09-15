"use client";

import { useState } from "react";
import {
    Scale,
    ChevronLeft,
    Zap,
    Target,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

export default function RRCalculatorPage() {
    const [entry, setEntry] = useState(1.1050);
    const [stopLoss, setStopLoss] = useState(1.1030);
    const [takeProfit, setTakeProfit] = useState(1.1110);
    const [direction, setDirection] = useState<"long" | "short">("long");

    const pipsRisk = Math.abs(entry - stopLoss);
    const pipsReward = Math.abs(takeProfit - entry);
    const rrRatio = pipsReward / pipsRisk;

    const winRateNeeded = (1 / (1 + rrRatio)) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/resources/quant/calculators" className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg transition-all border border-[var(--color-border)]">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">Risk-to-Reward Visualizer</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visualizer Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Visual Bar */}
                            <div className="w-full md:w-32 h-[400px] bg-[var(--color-surface-2)] rounded-lg overflow-hidden relative flex flex-col p-2 gap-2">
                                <div
                                    className={clsx(
                                        "w-full rounded-lg transition-all duration-500 relative group flex items-center justify-center",
                                        direction === "long" ? "bg-green-500/20 border border-green-500/30 flex-1 order-1" : "bg-red-500/20 border border-red-500/30 h-[150px] order-2"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-[10px] font-black text-green-500 uppercase rotate-90 md:rotate-0">Take Profit</span>
                                </div>
                                <div className="h-px bg-[var(--color-surface-3)] w-full shrink-0 relative order-2">
                                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-[#10b981]"></div>
                                    <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-[#10b981]"></div>
                                </div>
                                <div
                                    className={clsx(
                                        "w-full rounded-lg transition-all duration-500 relative group flex items-center justify-center",
                                        direction === "long" ? "bg-red-500/20 border border-red-500/30 h-[120px] order-3" : "bg-green-500/20 border border-green-500/30 flex-1 order-1"
                                    )}
                                >
                                    <span className="text-[10px] font-black text-red-500 uppercase rotate-90 md:rotate-0">Stop Loss</span>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 space-y-6">
                                <div className="flex bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)] max-w-[200px]">
                                    <button
                                        onClick={() => setDirection("long")}
                                        className={clsx("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", direction === "long" ? "bg-green-500 text-black" : "text-gray-500")}
                                    >Long</button>
                                    <button
                                        onClick={() => setDirection("short")}
                                        className={clsx("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", direction === "short" ? "bg-red-500 text-[var(--color-text-primary)]" : "text-gray-500")}
                                    >Short</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Entry Price</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={entry}
                                            onChange={(e) => setEntry(Number(e.target.value))}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-2xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-red-500 uppercase tracking-widest block">Stop Loss</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={stopLoss}
                                                onChange={(e) => setStopLoss(Number(e.target.value))}
                                                className="w-full bg-red-500/5 border border-red-500/20 rounded-lg py-3 px-4 text-lg font-black text-red-200 focus:outline-none focus:border-red-500/50 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-green-500 uppercase tracking-widest block">Take Profit</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={takeProfit}
                                                onChange={(e) => setTakeProfit(Number(e.target.value))}
                                                className="w-full bg-green-500/5 border border-green-500/20 rounded-lg py-3 px-4 text-lg font-black text-green-200 focus:outline-none focus:border-green-500/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card border border-[var(--color-border)] p-6 rounded-lg flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-[#10b981]" />
                                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Live RR Ratio</span>
                                    </div>
                                    <div className="text-3xl font-black text-[#10b981] tracking-tighter">1:{rrRatio.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Statistical Probability</h4>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-[9px] text-brand-400 font-black uppercase mb-1">Win Rate Needed</div>
                                    <div className="text-2xl font-black text-[var(--color-text-primary)]">{winRateNeeded.toFixed(1)}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-gray-500 font-black uppercase mb-1">Expectancy</div>
                                    <div className="text-lg font-black text-green-500">+1.24R</div>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full mt-4 overflow-hidden">
                                <div className="bg-brand-500 h-full w-[35%]"></div>
                            </div>
                        </div>
                        <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                                <Target className="h-6 w-6 text-brand-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Risk Assessment</h4>
                                <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">Setup Score: 7.8/10</div>
                                <div className="text-[8px] font-bold text-gray-600 mt-1 uppercase">Recommended for G10 Majors</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                            The Edge Formula
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-6">
                            Trading success is a function of (RR x WinRate). You do not need a 90% win rate to be profitable if your RR is greater than 1:1.5.
                        </p>
                        <div className="space-y-4">
                            {[
                                { ratio: "1:1", win: "50%", color: "text-gray-500" },
                                { ratio: "1:2", win: "33%", color: "text-[#10b981]" },
                                { ratio: "1:3", win: "25%", color: "text-green-500" },
                            ].map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] font-black uppercase">
                                    <span className="text-gray-400">{row.ratio} RR</span>
                                    <span className={row.color}>Breakeven: {row.win}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-brand-500/5 to-[#0D0D0D] border border-[var(--color-border)] p-6 rounded-lg border-b-4 border-b-brand-500">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-4 w-4 text-brand-400" />
                            <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">The "Golden" Ratio</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                            Institutional algorithms often look for setups with at least 1:3 RR before commitment. This allows for a "Series of Losses" protection.
                        </p>
                    </div>

                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-6 rounded-lg text-center">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Current Risk Level</div>
                        <div className="relative inline-block">
                            <Scale className="h-16 w-16 text-gray-800" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-[#10b981]">
                                {rrRatio > 2 ? "A+" : "B"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
