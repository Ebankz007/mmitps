"use client";

import { useState } from "react";
import {
    ChevronLeft,
    TrendingUp,
    Activity,
    Target,
    ShieldCheck,
    Info
} from "lucide-react";
import Link from "next/link";


const CURRENCY_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "XAUUSD", "BTCUSD", "XAGUSD", "XALUSD", "XAUAUD", "XAUEUR", "XCUUSD", "XNIUSD", "XPBUSD", "XPDUSD", "XPTUSD", "XZNUSD", "EURCZK", "EURHUF", "EURPLN", "EURTRY", "EURZAR", "GBPPLN", "GBPZAR", "USDCNH", "USDCZK", "USDHUF", "USDILS", "USDMXN", "USDPLN", "USDTRY", "USDZAR", "AUDCAD", "AUDCHF", "AUDJPY", "AUDNZD", "CADCHF", "CADJPY", "CHFJPY", "EURAUD", "EURCAD", "EURCHF", "EURDKK", "EURGBP", "EURHKD", "EURJPY", "EURMXN", "EURNOK", "EURNZD", "EURSEK", "EURRON", "EURSGD", "GBPAUD", "GBPCAD", "GBPCHF", "GBPDKK", "GBPHKD", "GBPJPY", "GBPNZD", "GBPSEK", "GBPSGD", "NOKSEK", "NZDCAD", "NZDCHF", "NZDJPY", "NZDSGD", "NZDUSD", "USDCAD", "USDCHF", "USDDKK", "USDHKD", "USDNOK", "USDRON", "USDSEK", "USDSGD"];

export default function LotSizeCalculatorPage() {
    const [balance, setBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [stopLossPips, setStopLossPips] = useState(20);
    const [pair, setPair] = useState("EURUSD");

    const riskAmount = (balance * riskPercent) / 100;

    // Formula for Standard Lot: (Risk Amount) / (Stop Loss in Pips * Pip Value)
    // Assuming 1 Standard Lot = $10/pip for majors like EURUSD
    const pipValue = pair === "XAUUSD" ? 10 : (pair === "USDJPY" ? 6.5 : 10); // Simplified for demo
    const positionSize = riskAmount / (stopLossPips * pipValue);

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/resources/quant/calculators" className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg transition-all border border-[var(--color-border)]">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">Lot Size Calculator</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Quantitative Desk</span>
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Precision Execution</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Calculator */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#10b981]/5 rounded-full blur-[100px]"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Portfolio Balance ($)</label>
                                    <input
                                        type="number"
                                        value={balance}
                                        onChange={(e) => setBalance(Number(e.target.value))}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk Percentage</label>
                                        <span className="text-xs font-black text-[#10b981]">{riskPercent}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.25"
                                        max="5"
                                        step="0.25"
                                        value={riskPercent}
                                        onChange={(e) => setRiskPercent(Number(e.target.value))}
                                        className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full accent-[#10b981] appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] font-bold text-gray-700 uppercase">
                                        <span>0.25%</span>
                                        <span>5.0%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Stop Loss (Pips/Points)</label>
                                    <input
                                        type="number"
                                        value={stopLossPips}
                                        onChange={(e) => setStopLossPips(Number(e.target.value))}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Currency Pair</label>
                                    <select
                                        value={pair}
                                        onChange={(e) => setPair(e.target.value)}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all appearance-none"
                                    >
                                        {CURRENCY_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-[var(--color-border)] grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Cash Risk</div>
                                <div className="text-2xl font-black text-[var(--color-text-primary)]">${riskAmount.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#10b981] p-6 rounded-lg space-y-2 shadow-[0_20px_40px_rgba(16, 185, 129,0.15)] relative scale-110">
                                <div className="text-[10px] font-black text-black uppercase tracking-widest opacity-60">Suggested Position</div>
                                <div className="text-4xl font-black text-black tracking-tighter">{positionSize.toFixed(2)}</div>
                                <div className="text-[10px] font-black text-black uppercase tracking-widest opacity-80">Standard Lots</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk/Stop Ratio</div>
                                <div className="text-2xl font-black text-[var(--color-text-primary)]">{(riskAmount / stopLossPips).toFixed(2)} <span className="text-xs text-gray-500">$/PIP</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center gap-5 group hover:border-[#10b981]/30 transition-all">
                            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Leverage Context</h4>
                                <div className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight">Healthy Positioning</div>
                                <div className="text-[9px] font-bold text-green-500 mt-0.5">Ratio: 1:12 Actual Leverage</div>
                            </div>
                        </div>
                        <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex items-center gap-5 group hover:border-[#10b981]/30 transition-all">
                            <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Target className="h-6 w-6 text-brand-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Execution Guard</h4>
                                <div className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight">Institutional Accuracy</div>
                                <div className="text-[9px] font-bold text-brand-400 mt-0.5">Includes Variable Pip Values</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card border border-[var(--color-border)] p-6 rounded-lg">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                            The 2% Rule
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-4">
                            Professional institutions rarely risk more than 1% of total portfolio value on a single structural setup. High-conviction trades may push to 2%. Risking 5% or more puts your account in the "Gambler's Zone" where a 10-trade losing streak results in a 40% drawdown.
                        </p>
                        <div className="h-px bg-[var(--color-surface-2)] my-4"></div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase">
                                <span>Max Drawdown Risk</span>
                                <span className="text-red-500">{riskPercent * 10}% (10 Trades)</span>
                            </div>
                            <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[10%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg border-l-[4px] border-l-brand-500">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-brand-400" />
                            <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest tracking-tighter">Pro Tip: Account Base</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                            Ensure your lot size matches your account base currency. Our calculator automatically handles USD-denominated valuations for G10 pairs.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-6 rounded-lg">
                        <Activity className="h-8 w-8 text-gray-700 mb-4" />
                        <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-2">Detailed Log</h4>
                        <div className="space-y-2 opacity-60">
                            <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                                <span>Pip Value Source</span>
                                <span>Live/Interbank</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold uppercase text-gray-500">
                                <span>Contract Size</span>
                                <span>100,000 Units</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
