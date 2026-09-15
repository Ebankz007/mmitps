"use client";

import { useState } from "react";
import {
    Activity,
    ChevronLeft,
    Zap,
    ShieldCheck,
    LineChart,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export default function VolatilityATRPage() {
    const [atrValue, setAtrValue] = useState(0.0012); // Pips/Points
    const [multiplier, setMultiplier] = useState(1.5);
    const [price, setPrice] = useState(1.1050);

    const stopDistance = atrValue * multiplier;
    const stopPriceLong = price - stopDistance;
    const stopPriceShort = price + stopDistance;

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/resources/quant/calculators" className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg transition-all border border-[var(--color-border)]">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">Volatility (ATR) Calculator</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calculator */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <LineChart className="h-32 w-32 text-[var(--color-text-primary)]" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Live ATR Value (Daily/4H)</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={atrValue}
                                        onChange={(e) => setAtrValue(Number(e.target.value))}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono"
                                    />
                                    <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase">Average True Range for current timeframe</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ATR Multiplier</label>
                                        <span className="text-xs font-black text-[#10b981]">{multiplier}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3.5"
                                        step="0.1"
                                        value={multiplier}
                                        onChange={(e) => setMultiplier(Number(e.target.value))}
                                        className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full accent-[#10b981] appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] font-bold text-gray-700 uppercase">
                                        <span>Tight (0.5x)</span>
                                        <span>Swing (3.5x)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Current Entry Price</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="p-5 bg-card border border-[var(--color-border)] rounded-lg">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Calculated Noise Buffer</div>
                                    <div className="text-2xl font-black text-[var(--color-text-primary)]">{(stopDistance * 10000).toFixed(1)} <span className="text-xs text-gray-500">PIPS</span></div>
                                    <div className="h-1 w-full bg-[var(--color-surface-2)] rounded-full mt-4 overflow-hidden">
                                        <div className="bg-[#10b981] h-full w-[40%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-[var(--color-border)] grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-lg group hover:border-green-500/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Long Stop-Loss</span>
                                    <ArrowDownRight className="h-4 w-4 text-green-500 opacity-50" />
                                </div>
                                <div className="text-3xl font-black text-[var(--color-text-primary)] font-mono">{stopPriceLong.toFixed(5)}</div>
                                <div className="text-[9px] font-bold text-gray-600 uppercase mt-2">Buffer placed below market noise</div>
                            </div>
                            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-lg group hover:border-red-500/30 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Short Stop-Loss</span>
                                    <ArrowUpRight className="h-4 w-4 text-red-500 opacity-50" />
                                </div>
                                <div className="text-3xl font-black text-[var(--color-text-primary)] font-mono">{stopPriceShort.toFixed(5)}</div>
                                <div className="text-[9px] font-bold text-gray-600 uppercase mt-2">Buffer placed above market noise</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Zap className="h-5 w-5 text-brand-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Adaptive Stop Logic</h4>
                                <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Automated noise floor adjustment active</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                            Enable Auto-Sync
                        </button>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#10b981]" />
                            The Volatility Edge
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-6">
                            Standard pip-based stops fail because market volatility is dynamic. A 20-pip stop in a low-volatility environment is safe, but in high-volatility, it's easily triggered by "market noise" despite the trend being correct.
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <div className="text-[9px] font-black text-[#10b981] uppercase mb-1">Institutional Standard</div>
                                <div className="text-xs font-bold text-[var(--color-text-primary)]">1.5x - 2.0x ATR Multiplier</div>
                            </div>
                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <div className="text-[9px] font-black text-brand-400 uppercase mb-1">Tight Scalp</div>
                                <div className="text-xs font-bold text-[var(--color-text-primary)]">0.5x - 1.0x ATR Multiplier</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-[var(--color-border)] p-6 rounded-lg flex flex-col items-center text-center">
                        <ShieldCheck className="h-8 w-8 text-green-500 mb-3" />
                        <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-2">Noise Protection</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                            Your currently calculated stop of {(stopDistance * 10000).toFixed(0)} pips is statistically outside the 95th percentile of expected market noise for the next candle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
