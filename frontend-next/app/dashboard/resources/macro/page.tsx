"use client";


import {
    Globe,
    Compass,
    Newspaper,
    ShieldCheck,
    Zap,
    BarChart3,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    RefreshCcw,
    Target,
    LineChart,
    Clock,
    Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStrengthScores } from "@/hooks/use-resources";

const MACRO_SECTIONS = [
    {
        id: "strength",
        title: "Macro Strength",
        subtitle: "Fundamental Intelligence Matrix",
        description: "Quantitative scoring of 8 major currencies across 15+ economic indicators. Rankings, radar charts and pair suggestions—all in one dashboard.",
        href: "/dashboard/resources/macro/strength",
        icon: ShieldCheck,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        glow: "shadow-[0_0_40px_rgba(34,211,238,0.08)]",
        badge: "LIVE DATA",
        badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        stats: [
            { label: "Currencies Tracked", value: "8" },
            { label: "Indicators", value: "15+" },
            { label: "Update Interval", value: "Daily" },
        ],
    },
    {
        id: "news",
        title: "News Trading",
        subtitle: "Global Macro + News Setups",
        description: "High-impact economic releases analyzed with pre-trade setups, entry logic, and currency strength context. Master event-driven trading.",
        href: "/dashboard/resources/macro/news",
        icon: Newspaper,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        glow: "shadow-[0_0_40px_rgba(16, 185, 129,0.08)]",
        badge: "HOT",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        stats: [
            { label: "Active Setups", value: "4+" },
            { label: "Covered Regions", value: "8" },
            { label: "Impact Level", value: "High" },
        ],
    },
    {
        id: "outlook",
        title: "Currency Outlook",
        subtitle: "Fundamental Outlook Score & Bias",
        description: "Long-term fundamental analysis for each major currency with scoring, sentiment bias, upcoming catalysts, and economic indicator impact tables.",
        href: "/dashboard/resources/macro/outlook",
        icon: Compass,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        glow: "shadow-[0_0_40px_rgba(52,211,153,0.08)]",
        badge: "STRATEGIC",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        stats: [
            { label: "Major Currencies", value: "8" },
            { label: "Data Points", value: "6+" },
            { label: "Time Horizon", value: "3M+" },
        ],
    },
    {
        id: "trigger",
        title: "Trigger Sheet",
        subtitle: "Forex News Triggersheet",
        description: "Cheat-sheet with exact deviation triggers and expected pip ranges for US, CA, UK, NZ, and AU economic releases. Know when to trade the news.",
        href: "/dashboard/resources/macro/trigger",
        icon: Zap,
        color: "text-brand-400",
        bg: "bg-brand-500/10",
        border: "border-orange-500/20",
        glow: "shadow-[0_0_40px_rgba(251,146,60,0.08)]",
        badge: "REFERENCE",
        badgeColor: "bg-brand-500/10 text-brand-400 border-orange-500/20",
        stats: [
            { label: "Regions", value: "5" },
            { label: "Reports Tracked", value: "25+" },
            { label: "Pip Ranges", value: "Calibrated" },
        ],
    },
];

const CURRENCY_PAIRS_WATCH = [
    { pair: "EURUSD", base: "EUR", quote: "USD", trend: "up", change: "+0.42%" },
    { pair: "GBPUSD", base: "GBP", quote: "USD", trend: "down", change: "-0.18%" },
    { pair: "USDJPY", base: "USD", quote: "JPY", trend: "up", change: "+0.61%" },
    { pair: "USDCHF", base: "USD", quote: "CHF", trend: "down", change: "-0.33%" },
    { pair: "AUDUSD", base: "AUD", quote: "USD", trend: "up", change: "+0.27%" },
    { pair: "USDCAD", base: "USD", quote: "CAD", trend: "down", change: "-0.15%" },
];

const MACRO_STATS_OVERVIEW = [
    { label: "Strong Buy", value: "2", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Buy", value: "2", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { label: "Neutral", value: "1", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Sell", value: "2", color: "text-brand-400", bg: "bg-brand-500/10", border: "border-orange-500/20" },
    { label: "Strong Sell", value: "1", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
];

export default function GlobalMacroHubPage() {
    const { data: strengthScores = [], isLoading, refetch } = useStrengthScores();

    const sortedStrength = [...strengthScores].sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-10 pb-20 text-[var(--color-text-primary)]">
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-1">
                <div className="relative bg-[#0D1529] border border-[var(--color-border)] rounded-[2.3rem] px-10 md:px-16 py-14 flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full -ml-20 -mb-20" />

                    <div className="flex-1 space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-amber-400 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">
                                MMITPS Intelligence Suite
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-[1.05] text-[var(--color-text-primary)]">
                                Global Macro
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                                    Analysis Hub
                                </span>
                            </h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl mt-4">
                                A complete institutional-grade intelligence suite for fundamental analysis, news trading, currency outlook, and event trigger cheat sheets.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/dashboard/resources/macro/strength"
                                className="bg-[#10b981] text-black px-8 py-4 rounded-lg font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:translate-y-[-2px] transition-all shadow-[0_15px_40px_rgba(16, 185, 129,0.25)]"
                            >
                                Explore Strength Matrix <ChevronRight size={14} strokeWidth={3} />
                            </Link>
                            <Link
                                href="/dashboard/resources/macro/news"
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-8 py-4 rounded-lg font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:bg-[var(--color-surface-3)] transition-all hover:translate-y-[-2px]"
                            >
                                <Newspaper size={14} className="text-amber-400" />
                                News Setups
                            </Link>
                        </div>
                    </div>

                    {/* Right Stats */}
                    <div className="flex flex-col gap-4 w-full lg:w-52 relative z-10 shrink-0">
                        {MACRO_STATS_OVERVIEW.map((s) => (
                            <div
                                key={s.label}
                                className={cn(
                                    "p-5 rounded-lg border flex items-center justify-between",
                                    s.bg, s.border
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">{s.label}</span>
                                <span className={cn("text-2xl font-black", s.color)}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Section Navigation Cards ── */}
            <div>
                <div className="flex items-center gap-3 px-2 mb-6">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <Globe size={18} />
                    </div>
                    <h2 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Macro Intelligence Modules</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {MACRO_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={section.id}
                                href={section.href}
                                className={cn(
                                    "group block p-8 rounded-lg border transition-all duration-500 hover:translate-y-[-4px] relative overflow-hidden",
                                    "bg-[#0A1224] hover:bg-[#0D1529]",
                                    section.border,
                                    section.glow
                                )}
                            >
                                {/* Background decorative element */}
                                <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700", section.bg)} style={{ transform: "translate(50%, -50%)" }} />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn("p-4 rounded-lg border", section.bg, section.border)}>
                                            <Icon size={28} className={section.color} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                                section.badgeColor
                                            )}>
                                                {section.badge}
                                            </span>
                                            <ChevronRight
                                                size={18}
                                                className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                                            {section.subtitle}
                                        </div>
                                        <h3 className={cn("text-2xl font-black uppercase tracking-tight", section.color)}>
                                            {section.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            {section.description}
                                        </p>
                                    </div>

                                    {/* Mini stats row */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
                                        {section.stats.map((stat, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className={cn("text-base font-black", section.color)}>{stat.value}</div>
                                                <div className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ── Currency Strength Quick View + Pair Watchlist ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strength Meter */}
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <BarChart3 size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Currency Strength</h3>
                                <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">Fundamental Rankings</p>
                            </div>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all group"
                        >
                            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <RefreshCcw className="w-6 h-6 animate-spin text-cyan-500" />
                            <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-black">Loading strength data...</p>
                        </div>
                    ) : sortedStrength.length > 0 ? (
                        <div className="space-y-4">
                            {sortedStrength.map((item, idx) => {
                                const isTop = idx < 3;
                                const isBottom = idx >= sortedStrength.length - 2;
                                const barColor = isTop ? "bg-emerald-500" : isBottom ? "bg-red-500" : "bg-cyan-500";
                                const labelColor = isTop ? "text-emerald-400" : isBottom ? "text-red-400" : "text-cyan-400";

                                return (
                                    <div key={item.symbol} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-[var(--color-text-muted)] w-4 text-right">{idx + 1}</span>
                                                <span className="text-xs font-black text-[var(--color-text-primary)] font-mono">{item.symbol}</span>
                                                {isTop && <Star size={10} className="text-emerald-400" fill="currentColor" />}
                                            </div>
                                            <span className={cn("text-xs font-black", labelColor)}>
                                                {item.score?.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", barColor)}
                                                style={{ width: `${Math.min(100, (item.score || 0))}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <ShieldCheck size={40} className="text-white/5" />
                            <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-black">No strength data yet. Add data in the Strength Matrix.</p>
                        </div>
                    )}

                    <Link
                        href="/dashboard/resources/macro/strength"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    >
                        View Full Analysis <ChevronRight size={12} />
                    </Link>
                </div>

                {/* Pairs Watchlist */}
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Pairs Watchlist</h3>
                            <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">Major Forex Pairs</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {CURRENCY_PAIRS_WATCH.map((item) => (
                            <div
                                key={item.pair}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border)] transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-[var(--color-text-primary)] font-mono">{item.pair}</span>
                                        <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                            {item.base} / {item.quote}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-xs font-black",
                                        item.trend === "up" ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {item.change}
                                    </span>
                                    {item.trend === "up" ? (
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <ArrowUpRight size={12} className="text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <ArrowDownRight size={12} className="text-red-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/dashboard/resources/macro/outlook"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                        Full Currency Outlook <ChevronRight size={12} />
                    </Link>
                </div>
            </div>

            {/* ── Quick Reference + Cross Links ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trigger Sheet Quick Reference */}
                <div className="bg-[#0A1224] border border-orange-500/10 p-8 rounded-lg space-y-5 col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
                            <Target size={18} />
                        </div>
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Trigger Cheat Sheet</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            { report: "US NFP", trigger: "70K deviation", range: "85 pips", color: "text-red-400" },
                            { report: "US CPI m/m", trigger: "0.20% deviation", range: "40 pips", color: "text-amber-400" },
                            { report: "CA Employment", trigger: "30K deviation", range: "75 pips", color: "text-red-400" },
                            { report: "UK CPI y/y", trigger: "0.30% deviation", range: "55 pips", color: "text-amber-400" },
                            { report: "NZ CPI q/q", trigger: "0.40% deviation", range: "125 pips", color: "text-red-400" },
                        ].map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group hover:border-orange-500/20 transition-all">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-tight">{row.report}</span>
                                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{row.trigger}</span>
                                </div>
                                <span className={cn("text-[10px] font-black", row.color)}>{row.range}</span>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/dashboard/resources/macro/trigger"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-brand-500/5 border border-orange-500/10 text-[10px] font-black uppercase tracking-widest text-brand-400 hover:bg-brand-500/10 transition-all"
                    >
                        Full Trigger Sheet <ChevronRight size={12} />
                    </Link>
                </div>

                {/* Latest News Setups + Upcoming Events */}
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-5 col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Clock size={18} />
                        </div>
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Upcoming High-Impact Events</h3>
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                event: "US Non-Farm Payroll (NFP)",
                                date: "Mar 7, 2026 | 8:30 AM EST",
                                currency: "USD",
                                impact: "High",
                                impactColor: "text-red-400 border-red-500/20 bg-red-500/10",
                                forecast: "165K",
                                previous: "143K",
                            },
                            {
                                event: "US Core CPI m/m",
                                date: "Mar 12, 2026 | 8:30 AM EST",
                                currency: "USD",
                                impact: "High",
                                impactColor: "text-red-400 border-red-500/20 bg-red-500/10",
                                forecast: "0.3%",
                                previous: "0.4%",
                            },
                            {
                                event: "CA Employment Change",
                                date: "Mar 7, 2026 | 8:30 AM EST",
                                currency: "CAD",
                                impact: "High",
                                impactColor: "text-red-400 border-red-500/20 bg-red-500/10",
                                forecast: "15K",
                                previous: "-2.8K",
                            },
                            {
                                event: "Fed Chair Powell Speech",
                                date: "Mar 17, 2026 | 1:15 PM EST",
                                currency: "USD",
                                impact: "Medium",
                                impactColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
                                forecast: "—",
                                previous: "Hawkish",
                            },
                            {
                                event: "ECB Interest Rate Decision",
                                date: "Mar 20, 2026 | 7:45 AM EST",
                                currency: "EUR",
                                impact: "High",
                                impactColor: "text-red-400 border-red-500/20 bg-red-500/10",
                                forecast: "3.40%",
                                previous: "3.65%",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-5 items-center gap-4 p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-amber-500/10 hover:bg-white/[0.04] transition-all group cursor-pointer"
                            >
                                <div className="col-span-2 flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
                                        {item.event}
                                    </span>
                                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{item.date}</span>
                                </div>
                                <div className="flex justify-center">
                                    <span className="text-[9px] font-black text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] px-2 py-1 rounded-lg border border-[var(--color-border)]">
                                        {item.currency}
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <span className={cn(
                                        "text-[8px] font-black uppercase px-2 py-1 rounded-lg border",
                                        item.impactColor
                                    )}>
                                        {item.impact}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Forecast</span>
                                    <span className="text-[10px] font-black text-amber-400">{item.forecast}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/resources/macro/news"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-all"
                        >
                            View Trading Setups <ChevronRight size={12} />
                        </Link>
                        <Link
                            href="/dashboard/news/forex"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)] transition-all"
                        >
                            Full Calendar <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Related Resources Footer ── */}
            <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)]">
                        <LineChart size={18} />
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Complementary Intelligence Tools</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "COT Data", sub: "Institutional positioning", href: "/dashboard/resources/cot/pro-max", color: "text-cyan-400", bg: "bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/20" },
                        { label: "Seasonality", sub: "Historical patterns", href: "/dashboard/resources/seasonality/heatmap", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20" },
                        { label: "News Calendar", sub: "Live economic events", href: "/dashboard/news/forex", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/20" },
                        { label: "AI Analyst", sub: "AI-powered analysis", href: "/dashboard/resources/ai-analyst", color: "text-brand-400", bg: "bg-brand-500/5 border-brand-500/10 hover:border-brand-500/20" },
                    ].map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className={cn(
                                "p-6 rounded-lg border flex flex-col items-center text-center gap-3 transition-all hover:translate-y-[-2px] group",
                                link.bg
                            )}
                        >
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", link.color)}>{link.label}</span>
                            <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{link.sub}</span>
                            <ChevronRight size={12} className={cn("opacity-0 group-hover:opacity-100 transition-all", link.color)} />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
