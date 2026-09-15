"use client";

import { useState } from "react";
import { useSeasonalityPlanner } from "@/hooks/use-resources";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    CalendarCheck2,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SeasonalPlannerPage() {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [marketFilter, setMarketFilter] = useState("All");
    const [signalFilter, setSignalFilter] = useState("All Signals");
    const { addNotification } = useNotifications();

    // Fetch API Data
    const { data: plannerData, isLoading } = useSeasonalityPlanner(currentYear, currentMonth);

    // Month Navigation logic
    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    // Derived statistics for the top-right block (assuming data is loaded)
    let bullishCount = 0;
    let bearishCount = 0;
    let avgWinRate = 0;
    let totalSignals = 0;

    if (plannerData?.signals) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(plannerData.signals).forEach((daySignals: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (daySignals as any[]).forEach((signal: any) => {
                if (signal.bias === "Bullish") bullishCount++;
                if (signal.bias === "Bearish") bearishCount++;
                avgWinRate += signal.probability;
                totalSignals++;
            });
        });
        if (totalSignals > 0) {
            avgWinRate = Math.round(avgWinRate / totalSignals);
        }
    }

    const handleNotify = (sig: any, dayNum: number) => {
        addNotification({
            title: "Seasonal Alert Set",
            message: `You will be notified for: ${sig.asset} (${sig.bias}) on ${MONTHS[currentMonth - 1]} ${dayNum}, ${currentYear}`,
            type: "system"
        });
    };

    // Build Calendar Grid (Monday-Friday logic based on real month offset)
    const renderCalendarGrid = () => {
        if (isLoading || !plannerData) {
            return (
                <div className="h-[600px] flex items-center justify-center border border-[var(--color-border)] bg-surface rounded-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-t border-r border-[#10b981] animate-spin" />
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-black">Loading Temporal Data...</p>
                    </div>
                </div>
            );
        }

        const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 (Sun) - 6 (Sat)
        const daysInMonth = plannerData.daysRaw;

        // Offset for rendering: mapping 0: Sun, 1: Mon... We only want Mon-Fri blocks.
        // Actually, looking at the mockup, it displays M T W T F headers, and the grid maps correctly.
        // Let's create an array representing weeks
        const weeks = [];
        let currentWeek = [];
        let currentDayDisplay = 1;

        // Skip leading empty days for the first row to align to Monday=1..Friday=5
        const startingWeekday = firstDayOfMonth === 0 ? 7 : firstDayOfMonth; // 1-7 (Mon-Sun)

        for (let i = 1; i < startingWeekday; i++) {
            if (i <= 5) currentWeek.push(null); // padding for mon-fri
        }

        while (currentDayDisplay <= daysInMonth) {
            const thisDayOfWeek = new Date(currentYear, currentMonth - 1, currentDayDisplay).getDay();
            const isWeekend = thisDayOfWeek === 0 || thisDayOfWeek === 6;

            if (!isWeekend) {
                currentWeek.push(currentDayDisplay);
                if (currentWeek.length === 5) {
                    weeks.push(currentWeek);
                    currentWeek = [];
                }
            }
            currentDayDisplay++;
        }
        if (currentWeek.length > 0) {
            while (currentWeek.length < 5) currentWeek.push(null);
            weeks.push(currentWeek);
        }

        return (
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col">
                {/* Headers */}
                <div className="grid grid-cols-5 border-b border-[var(--color-border)] opacity-40">
                    {["MON", "TUE", "WED", "THU", "FRI"].map(day => (
                        <div key={day} className="px-4 py-3 text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-center border-r last:border-r-0 border-[var(--color-border)]">
                            {day}
                        </div>
                    ))}
                </div>
                {/* Grid */}
                <div className="flex flex-col flex-1 divide-y divide-white/5">
                    {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="grid grid-cols-5 divide-x divide-white/5 flex-1 min-h-[140px]">
                            {week.map((dayNum, dIdx) => {
                                const daySignals = dayNum ? plannerData.signals[dayNum.toString()] || [] : [];
                                const isToday = dayNum === today.getDate() && currentMonth === (today.getMonth() + 1) && currentYear === today.getFullYear();

                                return (
                                    <div key={dIdx} className={cn("p-3 flex flex-col gap-2 relative group hover:bg-white/[0.02] transition-colors overflow-hidden", isToday && "bg-brand-500/[0.03]")}>
                                        {dayNum && (
                                            <>
                                                {isToday && <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-500" />}
                                                <div className="text-[10px] font-black text-[var(--color-text-secondary)] mb-1">{dayNum.toString().padStart(2, '0')}</div>

                                                {daySignals.length === 0 ? (
                                                    <div className="flex-1 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase">No signals</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1 z-10">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        {daySignals.map((sig: any, sIdx: number) => {
                                                            const isBull = sig.bias === "Bullish";
                                                            const color = isBull ? "emerald" : "rose";
                                                            return (
                                                                <div key={sIdx} className={cn("flex items-center justify-between px-2 py-1 rounded text-[9px] border group/sig cursor-pointer", `bg-${color}-500/[0.05] border-${color}-500/10 hover:border-${color}-500/30`)}>
                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                        {isBull ? <ArrowUpRight className={cn("w-2.5 h-2.5 min-w-[10px]", `text-${color}-500`)} /> : <ArrowDownRight className={cn("w-2.5 h-2.5 min-w-[10px]", `text-${color}-500`)} />}
                                                                        <span className={cn("font-black tracking-widest uppercase truncate", `text-${color}-400`)}>{sig.asset}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button 
                                                                             onClick={(e) => { e.stopPropagation(); handleNotify(sig, dayNum); }}
                                                                             className="opacity-0 group-hover/sig:opacity-100 transition-opacity text-amber-500 hover:text-amber-400"
                                                                             title="Notify Me"
                                                                        >
                                                                            <Bell size={10} />
                                                                        </button>
                                                                        <span className={cn("font-bold min-w-[24px] text-right", `text-${color}-500/80`)}>{sig.probability}%</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
            {/* ═══ Header Section ═══ */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                        <Target className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Seasonality</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">
                            Your Next Trade —<br />
                            <span className="text-emerald-400">Handpicked for You</span>
                        </h1>
                        <p className="mt-4 text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed max-w-lg">
                            Discover market moves before they happen. Our Seasonal Trading Software pinpoints the start of optimal seasonal trends, helping you identify high-probability opportunities with precision. No guesswork — just data-driven insights tailored to your strategy.
                        </p>
                    </div>
                    <div className="pt-2 space-y-2">
                        <h4 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">How it Works:</h4>
                        <ul className="space-y-1.5">
                            <li className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Choose the asset you want to trade
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Find the next high probability pattern
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Enter the market with confidence
                            </li>
                        </ul>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-500/80 pt-2 tracking-wide block">Take control of your trading — simpler, faster, smarter.</p>
                </div>

                {/* Top Right Stats */}
                {!isLoading && plannerData && (
                    <div className="flex items-center gap-2 h-fit">
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-4 w-[100px] text-center space-y-1">
                            <div className="text-2xl font-black text-emerald-400">{bullishCount}</div>
                            <div className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Bullish</div>
                        </div>
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-4 w-[100px] text-center space-y-1">
                            <div className="text-2xl font-black text-rose-400">{bearishCount}</div>
                            <div className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Bearish</div>
                        </div>
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-4 w-[100px] text-center space-y-1">
                            <div className="text-2xl font-black text-amber-400">{avgWinRate}%</div>
                            <div className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Avg Win</div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Planner Controls ═══ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                <div className="flex items-center bg-surface border border-[var(--color-border)] rounded-lg p-1.5">
                    <div className="px-3 py-1.5 flex items-center gap-2 border-r border-[var(--color-border)]">
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Seasonal Planner</span>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-[var(--color-surface-2)] rounded transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" /></button>
                        <span className="text-[10px] font-black text-emerald-400 w-[90px] text-center uppercase tracking-widest">{MONTHS[currentMonth - 1]} {currentYear}</span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-[var(--color-surface-2)] rounded transition-colors"><ChevronRight aria-label="Next month" $2 className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select value={signalFilter} onChange={(e) => setSignalFilter(e.target.value)} className="bg-surface border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest outline-none focus:border-amber-500/50 appearance-none min-w-[140px] text-center">
                        <option value="All Signals">All Signals</option>
                        <option value="Bullish Only">Bullish Only</option>
                        <option value="Bearish Only">Bearish Only</option>
                    </select>
                    <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="bg-surface border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest outline-none focus:border-amber-500/50 appearance-none min-w-[140px] text-center">
                        <option value="All">Select market type</option>
                        <option value="Forex">Forex</option>
                        <option value="Indices">Indices</option>
                        <option value="Commodities">Commodities</option>
                    </select>
                </div>
            </div>

            {/* ═══ Calendar Grid ═══ */}
            {renderCalendarGrid()}

            {/* ═══ Legend & Information Info ═══ */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Bullish (Long)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Bearish (Short)</span></div>
                    <div className="flex items-center gap-2"><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">80% = Win Rate</span></div>
                </div>
                <div className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest text-right">
                    Based on 15+ years of historical data analysis.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Understanding Seasonality */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 flex items-start gap-4 hover:border-brand-500/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex flex-shrink-0 items-center justify-center">
                        <CalendarCheck2 className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="space-y-3 w-full">
                        <div>
                            <h3 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Understanding Seasonality</h3>
                            <p className="text-[9px] font-bold text-brand-400 uppercase tracking-wide">Data-driven trading patterns</p>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">
                            Seasonal patterns occur due to recurring events such as earnings seasons, tax periods, holidays, and economic cycles. Our algorithm analyzes 15+ years of historical data to identify statistically significant patterns.
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-brand-500/5 border border-brand-500/10 rounded-lg py-2.5 text-center">
                                <span className="text-sm font-black text-brand-400 tracking-tighter block leading-none">15+</span>
                                <span className="text-[7px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mt-1 block">Years Data</span>
                            </div>
                            <div className="bg-brand-500/5 border border-brand-500/10 rounded-lg py-2.5 text-center">
                                <span className="text-sm font-black text-brand-400 tracking-tighter block leading-none">500+</span>
                                <span className="text-[7px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mt-1 block">Assets</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-surface border border-amber-500/10 rounded-lg p-6 flex flex-col justify-between hover:border-amber-500/20 transition-colors">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-shrink-0 items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <div>
                                <h3 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Important Disclaimer</h3>
                                <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-wide">Use as part of your strategy</p>
                            </div>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">
                                Seasonal patterns are statistical tendencies, not guarantees. Past performance does not guarantee future results. Always combine seasonality analysis with technical analysis, fundamental research, and proper risk management.
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-lg text-center mt-auto">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                            <span className="text-amber-300">💡 Pro Tip:</span> Use seasonality to identify WHEN to look for trades, then use technical analysis to determine IF and HOW to enter.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
