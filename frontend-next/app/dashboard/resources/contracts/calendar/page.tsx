/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import {
    CalendarDays,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    Filter,
    Search,
    Download,
    Info,
    ArrowRightCircle,
    ChevronDown,
    Activity,
    ChevronLeft,
    ChevronRight,
    Settings,
    FileCheck
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useContractCalendar, useContractStats } from "@/hooks/use-resources";

export default function ContractCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1)); // February 2026 as per mockup
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const { data: calendarData, isLoading: calendarLoading } = useContractCalendar(year, month);
    const { data: statsData, isLoading: statsLoading } = useContractStats();

    const nextMonth = () => setCurrentDate(new Date(year, month, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const markers = calendarData?.calendar?.markers || {};
    const schedule = calendarData?.schedule || [];
    const stats = statsData?.stats || { expiringSoon: 0, inRollover: 0, activeContracts: 0, thisMonth: 0 };
    const alerts = statsData?.alerts || [];

    const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans selection:bg-brand-500/30">
            {/* --- HEADER --- */}
            <div className="max-w-[1600px] mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-[10px] font-black tracking-widest text-brand-400 uppercase">
                                Institutional Resource
                            </div>
                            <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />
                            <div className="text-[10px] font-medium text-[var(--color-text-secondary)] tracking-widest uppercase italic">
                                EXCH-PROTO V4.1
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none mb-2">
                            Contract <span className="text-brand-500">Calendar</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-[11px] font-bold uppercase tracking-widest leading-none">
                            Track expiration dates, rollover periods, and first notice days.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-1 mr-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-all">
                                <ChevronLeft aria-label="Previous" $2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            </button>
                            <span className="text-[10px] font-black tracking-widest uppercase px-4 whitespace-nowrap">
                                {monthName} {year}
                            </span>
                            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-all">
                                <ChevronRight aria-label="Next" $2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            </button>
                        </div>
                        <button className="px-4 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                            <Download className="w-3.5 h-3.5 text-brand-500" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CRITICAL ALERT --- */}
            <AnimatePresence>
                {alerts.length > 0 && alerts.map((alert: any) => (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={alert.id}
                        className="max-w-[1600px] mx-auto mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center animate-pulse">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black italic tracking-widest uppercase text-[var(--color-text-primary)]">Upcoming Expirations This Week</h4>
                                <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-tight mt-0.5">
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-black tracking-widest uppercase hover:bg-red-500/20 transition-all">
                            View Details
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* --- STATS GRID --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Expiring Soon", val: stats.expiringSoon, icon: Clock, color: "text-red-500", bg: "bg-red-500/5" },
                    { label: "In Rollover", val: stats.inRollover, icon: Activity, color: "text-brand-500", bg: "bg-brand-500/5" },
                    { label: "Active Contracts", val: stats.activeContracts, icon: FileCheck, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                    { label: "This Month", val: stats.thisMonth, icon: CalendarDays, color: "text-brand-500", bg: "bg-brand-500/5" }
                ].map((item, i) => (
                    <div key={i} className="p-6 rounded-lg border border-[var(--color-border)] bg-[#050505] flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[var(--color-border)] transition-all relative overflow-hidden">
                        <div className={`absolute inset-0 ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="text-3xl font-black italic tracking-tighter mb-1 relative z-10">{item.val}</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] relative z-10 group-hover:text-[var(--color-text-secondary)] transition-colors">{item.label}</div>
                    </div>
                ))}
            </div>

            {/* --- MAIN LAYOUT --- */}
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Left: Monthly Calendar */}
                <div className="lg:col-span-12">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[#050505] overflow-hidden">
                        <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="w-4 h-4 text-brand-500" />
                                <h3 className="text-xs font-black italic tracking-tighter uppercase leading-none">
                                    {monthName} <span className="text-[var(--color-text-muted)]">{year}</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] transition-all">
                                    <ChevronLeft className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                                </button>
                                <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] transition-all">
                                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Days of Week Header */}
                                <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
                                    {DAYS.map(day => (
                                        <div key={day} className="py-4 text-center text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7">
                                    {/* Padding for first day */}
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`pad-${i}`} className="h-28 border-r border-b border-[var(--color-border)] bg-white/[0.01]" />
                                    ))}

                                    {/* Days */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dayMarkers = markers[day] || [];

                                        return (
                                            <div key={day} className="h-28 border-r border-b border-[var(--color-border)] p-4 flex flex-col group hover:bg-white/[0.02] transition-all relative">
                                                <span className="text-xs font-black text-[var(--color-text-secondary)] group-hover:text-brand-500 transition-colors">{day}</span>
                                                <div className="mt-2 space-y-1">
                                                    {dayMarkers.map((m: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className={clsx(
                                                                "px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter italic border",
                                                                m.type === 'exp' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                                    m.type === 'roll' ? "bg-brand-500/10 border-brand-500/20 text-brand-400" :
                                                                        m.type === 'fnd' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                                            "bg-brand-500/10 border-brand-500/20 text-brand-400"
                                                            )}
                                                        >
                                                            {m.symbol} <span className="opacity-40">{m.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Bottom Padding to fill grid */}
                                    {Array.from({ length: (7 - (firstDayOfMonth + daysInMonth) % 7) % 7 }).map((_, i) => (
                                        <div key={`end-pad-${i}`} className="h-28 border-r border-b border-[var(--color-border)] bg-white/[0.01]" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Calendar Legend */}
                        <div className="p-4 bg-white/[0.02] border-t border-[var(--color-border)] flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[9px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">Expiration</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[9px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">First Notice Day / Rollover</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                                <span className="text-[9px] font-black uppercase text-[var(--color-text-secondary)] tracking-widest">Settlement</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- EXPIRATION SCHEDULE --- */}
            <div className="max-w-[1600px] mx-auto rounded-lg border border-[var(--color-border)] bg-[#050505] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brand-500" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black italic tracking-tighter uppercase leading-none">Expiration Schedule - {monthName} {year}</h3>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-1 italic italic">Contract Specific Metadata</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Contract</th>
                                <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Symbol</th>
                                <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">First Notice</th>
                                <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Last Trade</th>
                                <th className="text-left py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Expiration</th>
                                <th className="text-right py-4 px-2 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {schedule.map((row: any, i: number) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                                    <td className="py-6 px-2">
                                        <span className="text-xs font-black italic uppercase text-[var(--color-text-primary)]">{row.contract}</span>
                                    </td>
                                    <td className="py-6 px-2">
                                        <div className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded inline-block">
                                            <span className={clsx("text-[10px] font-black italic tracking-widest uppercase", row.color)}>
                                                {row.symbol}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-2 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">{row.firstNotice}</td>
                                    <td className="py-6 px-2 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">{row.lastTrade}</td>
                                    <td className="py-6 px-2 text-[11px] font-black italic text-brand-500 uppercase">{row.expiration}</td>
                                    <td className="py-6 px-2 text-right">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            row.status === 'Expiring' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                row.status === 'In Rollover' ? "bg-brand-500/10 text-brand-500 border-brand-500/20" :
                                                    row.status === 'FND Soon' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- BOTTOM DECORATION --- */}
            <div className="max-w-[1600px] mx-auto text-center pt-8 mt-12 border-t border-[var(--color-border)] opacity-20">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase grayscale">Contract Intelligence Protocol // Rollover Matrix V4 // MMITPS Corp</span>
            </div>
        </div>
    );
}
