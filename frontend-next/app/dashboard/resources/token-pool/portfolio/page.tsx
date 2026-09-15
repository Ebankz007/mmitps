"use client";

import {
    PieChart,
    ChevronLeft,
    TrendingUp,
    ShieldCheck,
    Activity,
    Calendar,
    Wallet,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

export default function TokenizationPortfolioPage() {
    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/resources/tokenization/pools" className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg transition-all border border-[var(--color-border)]">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">My Tokenized Holdings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Stats */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Total Invested", val: "$45,200", icon: Wallet, color: "text-[#10b981]" },
                            { label: "Unrealized Yield", val: "+$3,420", icon: TrendingUp, color: "text-green-500" },
                            { label: "Avg APY", val: "14.2%", icon: Activity, color: "text-brand-400" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-surface border border-[var(--color-border)] p-6 rounded-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <stat.icon className="h-24 w-24 text-[var(--color-text-primary)]" />
                                </div>
                                <stat.icon className={clsx("h-5 w-5 mb-4", stat.color)} />
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-2xl font-black text-[var(--color-text-primary)]">{stat.val}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                        <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Active Stakes</h3>
                            <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Manage All</button>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[
                                { name: "Macro Liquidity Alpha", amount: "$25,000", apy: "18%", maturity: "24 Nov 2026", progress: 65 },
                                { name: "G10 Bond Arbitrage", amount: "$12,000", apy: "12%", maturity: "12 Jan 2027", progress: 40 },
                                { name: "BTC Spot Alpha", amount: "$8,200", apy: "22%", maturity: "02 Oct 2026", progress: 85 },
                            ].map((s, idx) => (
                                <div key={idx} className="p-8 hover:bg-white/[0.01] transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center font-black text-[#10b981] text-sm">
                                                {s.name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight">{s.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Calendar className="h-3 w-3 text-gray-600" />
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Maturity: {s.maturity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Holding</div>
                                            <div className="text-lg font-black text-[var(--color-text-primary)]">{s.amount}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black text-gray-600 uppercase">
                                            <span>Maturity Progress</span>
                                            <span className="text-[#10b981]">{s.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                            <div className="bg-[#10b981] h-full transition-all duration-1000" style={{ width: `${s.progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Allocation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg flex flex-col items-center text-center">
                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                            <PieChart className="h-32 w-32 text-gray-800" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-black text-[var(--color-text-primary)]">45k</span>
                                <span className="text-[9px] font-black text-gray-600 uppercase">Equity</span>
                            </div>
                        </div>
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6">Sector Allocation</h3>
                        <div className="w-full space-y-4">
                            {[
                                { label: "Forex", val: "55%", color: "bg-brand-500" },
                                { label: "Crypto", val: "18%", color: "bg-[#10b981]" },
                                { label: "Bonds", val: "27%", color: "bg-green-500" },
                            ].map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] font-black uppercase">
                                    <div className="flex items-center gap-2">
                                        <div className={clsx("w-2 h-2 rounded-full", row.color)}></div>
                                        <span className="text-gray-400">{row.label}</span>
                                    </div>
                                    <span className="text-[var(--color-text-primary)]">{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-6 rounded-lg flex items-start gap-4">
                        <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-1">Insurance Active</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                All tokenized holdings are covered by the MMITPS Capital Protection Fund. Your principal capital is secured up to $100k.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
