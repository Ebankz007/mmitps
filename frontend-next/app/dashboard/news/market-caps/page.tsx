/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Coins, TrendingUp, TrendingDown, Search, BarChart3, Activity } from "lucide-react";
import { clsx } from "clsx";

export default function MarketCapsPage() {
    const assets = [
        { name: "Bitcoin", symbol: "BTC", cap: "$1.2T", change: "+4.2%", volume: "$35B", rank: 1 },
        { name: "Ethereum", symbol: "ETH", cap: "$280B", change: "-1.5%", volume: "$12B", rank: 2 },
        { name: "Solana", symbol: "SOL", cap: "$45B", change: "+12.8%", volume: "$4.5B", rank: 5 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-12 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Coins className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Market Capitalizations</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Real-Time Asset Ranking</p>
                        </div>
                    </div>
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input type="text" placeholder="Search Assets..." className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg pl-12 pr-4 py-3 text-xs font-bold focus:outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {assets.map((a) => (
                        <div key={a.symbol} className="p-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg flex items-center justify-between hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-black text-gray-600">#{a.rank}</span>
                                <div>
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight">{a.name}</h4>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{a.symbol}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-12">
                                <div className="text-center hidden sm:block">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Market Cap</p>
                                    <p className="text-xl font-black text-[var(--color-text-primary)]">{a.cap}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">24h Change</p>
                                    <p className={clsx("text-xl font-black", a.change.startsWith("+") ? "text-green-500" : "text-red-500")}>{a.change}</p>
                                </div>
                                <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <Activity className="text-amber-500" size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
