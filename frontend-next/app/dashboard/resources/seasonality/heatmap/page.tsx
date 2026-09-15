"use client";

import { useState } from "react";
import { useHeatmap } from "@/hooks/use-resources";
import {
    Calendar,
    ChevronDown,
    ArrowUpRight,
    Lightbulb,
    Target,
    Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SeasonalHeatmapPage() {
    const { data: heatmapData, isLoading } = useHeatmap();
    const [category, setCategory] = useState("Forex");

    const getHeatmapColor = (value: number) => {
        if (value > 2) return "bg-emerald-500 text-[var(--color-text-primary)] font-black";
        if (value > 0.5) return "bg-emerald-500/80 text-[var(--color-text-primary)] font-bold";
        if (value > 0) return "bg-emerald-500/20 text-emerald-400 font-bold";
        if (value === 0) return "bg-[var(--color-surface-2)] text-gray-500 font-medium";
        if (value > -0.5) return "bg-rose-500/20 text-rose-400 font-bold";
        if (value > -2) return "bg-rose-500/80 text-[var(--color-text-primary)] font-bold";
        return "bg-rose-500 text-[var(--color-text-primary)] font-black";
    };

    // Derived statistics calculation
    let bestMonth = { name: "April", asset: "EURUSD", value: 4.2 };
    let worstMonth = { name: "August", asset: "EURUSD", value: -2.1 };
    let avgMonthly = 0.3;
    let avgWinRate = 58;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topPerformers: any[] = [];

    // Process backend data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableData: any[] = [];
    if (heatmapData) {
        let totalReturn = 0;
        let totalWinRate = 0;
        let count = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [asset, months] of Object.entries(heatmapData as any)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row: { asset: string; months: any[]; avgValue: number; avgWin: number } = { asset, months: [], avgValue: 0, avgWin: 0 };

            let rowReturnSum = 0;
            let rowWinSum = 0;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (months as any[]).forEach((m: any) => {
                const val = parseFloat(m.averageReturn);
                const win = parseInt(m.winningYears);

                row.months.push({ month: m.month, value: val, winRate: win });
                rowReturnSum += val;
                rowWinSum += win;

                // global stats
                totalReturn += val;
                totalWinRate += win;
                count++;

                if (val > bestMonth.value) {
                    bestMonth = { name: m.month, asset, value: val };
                }
                if (val < worstMonth.value) {
                    worstMonth = { name: m.month, asset, value: val };
                }
            });

            row.avgValue = rowReturnSum / 12;
            row.avgWin = rowWinSum / 12;
            tableData.push(row);
        }

        if (count > 0) {
            avgMonthly = totalReturn / count;
            avgWinRate = Math.round(totalWinRate / count);
        }

        // Generate mock top performers for the current month section
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topPerformers = tableData.slice(0, 6).map((r: any) => ({
            asset: r.asset,
            value: r.months[new Date().getMonth()].value,
            sector: category
        })).sort((a, b) => b.value - a.value);
    }

    // Chart mock data aggregating the specific columns
    const monthlyAverages = MONTHS.map((m, i) => {
        if (!heatmapData) return 0;
        let sum = 0;
        let items = 0;
        tableData.forEach(row => { sum += row.months[i].value; items++; });
        return items > 0 ? sum / items : 0;
    });

    const monthlyWinRates = MONTHS.map((m, i) => {
        if (!heatmapData) return 50;
        let sum = 0;
        let items = 0;
        tableData.forEach(row => { sum += row.months[i].winRate; items++; });
        return items > 0 ? sum / items : 50;
    });


    if (isLoading) {
        return (
            <div className="h-[600px] flex items-center justify-center border border-[var(--color-border)] bg-surface rounded-lg">
                <div className="w-8 h-8 rounded-full border-t border-r border-[#10b981] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-12 font-sans">
            {/* Header & Filter */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Seasonality <span className="text-emerald-400">Heat Map</span></h1>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] font-medium tracking-wide">Historical monthly performance patterns • Based on 10+ years of data</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        10 Years <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-[var(--color-text-primary)] text-xs font-bold rounded-lg transition-colors shadow-lg shadow-brand-500/20">
                        Export Data
                    </button>
                </div>
            </div>

            {/* Top 4 Stat Modules */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#041A24] border border-[#0A3245] rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="text-lg font-black text-emerald-400">{bestMonth.name}</div>
                    <div className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">BEST MONTH</div>
                </div>
                <div className="bg-[#240A0F] border border-[#450A15] rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-lg font-black text-rose-400">{worstMonth.name}</div>
                    <div className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest mt-1">WORST MONTH</div>
                </div>
                <div className="bg-surface border border-amber-500/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-lg font-black text-amber-400">{avgMonthly > 0 ? `+${avgMonthly.toFixed(1)}` : avgMonthly.toFixed(1)}%</div>
                    <div className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mt-1">AVG MONTHLY</div>
                </div>
                <div className="bg-[#06152F] border border-[#0D2447] rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-lg font-black text-brand-400">{avgWinRate}%</div>
                    <div className="text-[9px] font-black text-brand-500/60 uppercase tracking-widest mt-1">WIN RATE</div>
                </div>
            </div>

            {/* Deep Performance Matrix */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Monthly Performance Heat Map</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {["Forex", "Stocks", "Commodities", "Indices", "Crypto"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-colors",
                                    category === cat ? "bg-emerald-500/20 text-emerald-400" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]")}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="p-3 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest w-[120px]">Asset</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="p-3 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-center">{m}</th>
                                ))}
                                <th className="p-3 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest text-center border-l border-[var(--color-border)] text-brand-400">AVG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {tableData.map((row: any) => (
                                <tr key={row.asset} className="hover:bg-white/[0.02]">
                                    <td className="p-3 text-[10px] font-black text-emerald-400 tracking-wider border-r border-[var(--color-border)]">{row.asset}</td>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {row.months.map((m: any, j: number) => (
                                        <td key={j} className="p-1">
                                            <div className={cn("w-full h-8 flex flex-col items-center justify-center rounded-[4px]", getHeatmapColor(m.value))}>
                                                <span className="text-[10px] drop-shadow-sm">{m.value > 0 ? `+${m.value.toFixed(1)}%` : `${m.value.toFixed(1)}%`}</span>
                                            </div>
                                        </td>
                                    ))}
                                    <td className="p-1 border-l border-[var(--color-border)]">
                                        <div className="w-full h-8 flex items-center justify-center rounded-[4px] bg-brand-500/10 text-brand-400 text-[10px] font-black">
                                            {row.avgValue > 0 ? `+${row.avgValue.toFixed(1)}%` : `${row.avgValue.toFixed(1)}%`}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between p-3 border-t border-[var(--color-border)] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Color Intensity Scale:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-rose-600 rounded-sm"></div>
                            <div className="w-3 h-3 bg-rose-500/60 rounded-sm"></div>
                            <div className="w-3 h-3 bg-[var(--color-surface-2)] rounded-sm"></div>
                            <div className="w-3 h-3 bg-emerald-500/60 rounded-sm"></div>
                            <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                        </div>
                    </div>
                    <div className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-1">
                        Historical data is not a guarantee of future returns
                    </div>
                </div>
            </div>

            {/* Embedded Mini Charts */}
            <div className="grid grid-cols-2 gap-4">
                {/* Average Returns Dots */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                        <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Monthly Average Returns</h3>
                    </div>
                    <div className="h-[80px] w-full flex items-end justify-between px-2 pl-6 relative">
                        {/* Horizontal zero line */}
                        <div className="absolute left-6 right-2 top-1/2 border-t border-[var(--color-border)] border-dashed transform -translate-y-1/2" />

                        {monthlyAverages.map((val, idx) => {
                            const isPositive = val >= 0;
                            // scale dots max range assuming approx +/- 2%
                            const heightPercent = Math.min(Math.abs(val) * 25, 40);

                            return (
                                <div key={idx} className="flex flex-col items-center relative h-full w-full">
                                    <div
                                        className={cn("absolute w-1.5 h-1.5 rounded-full z-10", isPositive ? "bg-emerald-500" : "bg-rose-500")}
                                        style={isPositive ? { bottom: `calc(50% + ${heightPercent}%)` } : { top: `calc(50% + ${heightPercent}%)` }}
                                    />
                                    <span
                                        className={cn("absolute text-[7px] font-bold", isPositive ? "text-emerald-500" : "text-rose-500")}
                                        style={isPositive ? { bottom: `calc(50% + ${heightPercent}% + 10px)` } : { top: `calc(50% + ${heightPercent}% + 10px)` }}
                                    >
                                        {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between px-2 pl-6 mt-2">
                        {MONTHS.map(m => (
                            <span key={m} className="text-[7px] font-black text-[var(--color-text-muted)] uppercase tracking-widest w-full text-center">{m.charAt(0)}</span>
                        ))}
                    </div>
                </div>

                {/* Win Rate Bars */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-3.5 h-3.5 text-amber-500" />
                        <h3 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Win Rate by Month</h3>
                    </div>
                    <div className="h-[80px] w-full flex items-end justify-between px-2 pl-6">
                        {monthlyWinRates.map((val, idx) => {
                            // Scale 50-100% to 0-100% height map
                            const heightPercent = Math.max((val - 40) * 1.66, 5);
                            return (
                                <div key={idx} className="flex flex-col items-center justify-end h-full w-full group relative">
                                    <span className="text-[7px] font-black text-brand-400 absolute opacity-0 group-hover:opacity-100 transition-opacity -top-4">{Math.round(val)}%</span>
                                    <div className="w-1.5 bg-brand-500 rounded-t-sm transition-all" style={{ height: `${heightPercent}%` }} />
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between px-2 pl-6 mt-2">
                        {MONTHS.map(m => (
                            <span key={m} className="text-[7px] font-black text-[var(--color-text-muted)] uppercase tracking-widest w-full text-center">{m.charAt(0)}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Sector Highlights */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-surface border border-[var(--color-border)] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Top Seasonal Performers: This Month</h3>
                        </div>
                        <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{MONTHS[new Date().getMonth()]} Stats</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {topPerformers.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-[var(--color-border)] rounded-lg hover:border-emerald-500/20 transition-colors">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest block">{p.sector}</span>
                                    <span className="text-sm font-black text-[var(--color-text-primary)]">{p.asset}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span className="text-base font-black">+{p.value.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#05181E] border border-[#0A3D4A] rounded-lg p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">How to Read the Heat Map</h3>
                                <p className="text-[9px] font-medium text-emerald-500/70 tracking-wide mt-0.5">Understanding seasonal patterns</p>
                            </div>
                        </div>
                        <ul className="space-y-3 mt-4">
                            <li className="flex items-start gap-2 text-[10px] text-emerald-100/60 leading-relaxed font-medium">
                                <span className="font-black text-emerald-400">1. Green cells</span> indicate historically positive months with average gains.
                            </li>
                            <li className="flex items-start gap-2 text-[10px] text-emerald-100/60 leading-relaxed font-medium">
                                <span className="font-black text-rose-400">2. Red cells</span> indicate historically negative months with average losses.
                            </li>
                            <li className="flex items-start gap-2 text-[10px] text-emerald-100/60 leading-relaxed font-medium">
                                <span className="font-black text-[var(--color-text-primary)]">3. Color Intensity</span> reflects the magnitude of historical performance.
                            </li>
                            <li className="flex items-start gap-2 text-[10px] text-emerald-100/60 leading-relaxed font-medium">
                                <span className="font-black text-brand-400">4. AVG column</span> shows the average annual return for each asset.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
}
