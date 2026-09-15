"use client";

import React from "react";
import {
    Activity,
    Radio,
    ShieldCheck,
    LineChart,
    Play,
    Pause,
    MoreHorizontal,
    Monitor,
    Cpu,
} from "lucide-react";
import { clsx } from "clsx";

const ACTIVE_POSITIONS = [
    { id: "p1", symbol: "XAUUSD", type: "BUY", size: "2.5 Lots", entry: 2154.20, current: 2162.45, pnl: 2062.50, status: "Active" },
    { id: "p2", symbol: "EURUSD", type: "SELL", size: "10 Lots", entry: 1.0850, current: 1.0842, pnl: 800.00, status: "Active" },
];

const BOTS = [
    { id: "b1", name: "AlphaTrend v4", strategy: "Mean Reversion", state: "Running", uptime: "14d 2h", pnl: "+12.4%" },
    { id: "b2", name: "MacroFlow", strategy: "Fundamental Divergence", state: "Paused", uptime: "0d", pnl: "-2.1%" },
];

export default function TradeControlPanelPage() {
    return (
        <div className="space-y-6">
            {/* Live Status Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-[var(--color-border)] p-4 rounded-lg">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Live Execution Stream</span>
                    </div>
                    <div className="h-4 w-px bg-[var(--color-surface-3)] hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <Monitor className="h-4 w-4 text-brand-400" />
                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Terminal: MMITPS-CORE-01</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[9px] font-bold text-gray-500 uppercase">System Latency: <span className="text-green-500">12ms</span></div>
                    <div className="px-3 py-1 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Bridge: MetaTrader 5
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Trades Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                        <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Active Market Exposure</h3>
                            <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline">
                                Close All Positions
                            </button>
                        </div>
                        <div className="p-2 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black text-gray-600 uppercase tracking-widest border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="px-6 py-4">Instrument</th>
                                        <th className="px-6 py-4">Type/Size</th>
                                        <th className="px-6 py-4">Entry/Current</th>
                                        <th className="px-6 py-4">Unrealized PnL</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {ACTIVE_POSITIONS.map((p) => (
                                        <tr key={p.id} className="group hover:bg-white/[0.01] transition-all">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center font-black text-[var(--color-text-primary)] text-xs">
                                                        {p.symbol.substring(0, 3)}
                                                    </div>
                                                    <span className="text-xs font-black text-[var(--color-text-primary)]">{p.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={clsx("text-[10px] font-black uppercase", p.type === "BUY" ? "text-green-500" : "text-red-500")}>
                                                    {p.type} {p.size}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-mono text-xs">
                                                <div className="text-gray-400 opacity-60">{p.entry.toFixed(p.symbol === "XAUUSD" ? 2 : 4)}</div>
                                                <div className="text-[var(--color-text-primary)] font-black">{p.current.toFixed(p.symbol === "XAUUSD" ? 2 : 4)}</div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={clsx("text-lg font-black tracking-tighter", p.pnl >= 0 ? "text-green-500" : "text-red-500")}>
                                                    {p.pnl >= 0 ? `+$${p.pnl.toLocaleString()}` : `-$${Math.abs(p.pnl).toLocaleString()}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-gray-700 hover:text-[var(--color-text-primary)] transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Graph Placeholder */}
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden h-[300px] flex flex-col justify-center items-center">
                        <div className="absolute top-6 left-8 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#10b981]" />
                            <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Account Growth (Live)</span>
                        </div>
                        <LineChart className="h-32 w-32 text-white/[0.03] absolute" />
                        <div className="text-center relative z-10">
                            <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">$14,245.82</div>
                            <div className="text-xs font-black text-green-500 uppercase tracking-widest mt-2">+12.4% THIS MONTH</div>
                        </div>
                    </div>
                </div>

                {/* Automation & Bots Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-[#10b981]" />
                            Automated Analysts
                        </h3>
                        <div className="space-y-4">
                            {BOTS.map((bot) => (
                                <div key={bot.id} className="p-5 bg-white/[0.02] border border-[var(--color-border)] rounded-lg group hover:border-[#10b981]/30 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">{bot.name}</h4>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase">{bot.strategy}</span>
                                        </div>
                                        <button className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] rounded-lg transition-all border border-[var(--color-border)]">
                                            {bot.state === "Running" ? <Pause className="h-3 w-3 text-[#10b981]" /> : <Play className="h-3 w-3 text-green-500 fill-green-500" />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-gray-600 uppercase">Uptime</span>
                                            <span className="text-[10px] font-bold text-gray-400">{bot.uptime}</span>
                                        </div>
                                        <div className="text-right flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-gray-600 uppercase">Performance</span>
                                            <span className={clsx("text-xs font-black", bot.pnl.startsWith("+") ? "text-green-500" : "text-red-500")}>
                                                {bot.pnl}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] transition-all">
                            Configure New Agent
                        </button>
                    </div>

                    <div className="bg-card border border-[#10b981]/20 p-6 rounded-lg border-l-4 border-l-[#10b981]">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                            <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">TradeControl Guard</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                            Global drawdown protection is enabled. Execution will be restricted if account equity drops below <span className="text-[var(--color-text-primary)]">$8,500</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
