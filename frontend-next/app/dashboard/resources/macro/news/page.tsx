"use client";

import { useLatestNews } from "@/hooks/use-cms";
import {
    Newspaper,
    Flame,
    TrendingUp,
    Zap,
    Clock,
    ChevronLeft,
    ShieldCheck,
    LineChart,
    Compass,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MacroNewsPage() {
    const { data: news = [], isLoading } = useLatestNews("macro");
    void news; void isLoading;

    const newsSetups = [
        {
            title: "US NFP (Nonfarm Payroll) Employment | Feb 7, 2026 | Currency News",
            date: "Feb 7, 2026",
            author: "Henry Berido",
            impact: "High Impact",
            description: "US NFP is the first major release of the year and we expect plenty of volatility following the release. In the event we do get our deviation, it's important to follow the plan set forth below: 8:30am (NY Time) US NF Employment Forecast 151K Previous 113K 8:30am (NY Time) US Unemployment Rate Forecast 6.6% [...]",
            icon: "💼",
            image: "/flags/usa.png" // Would be real flags
        },
        {
            title: "CA Employment Change | Feb 7, 2026 | News Trading",
            date: "Feb 7, 2026",
            author: "Henry Berido",
            impact: "Medium Impact",
            description: "We'll be getting the Canadian Employment Change release number today, but since the market is focused on the U.S. Nonfarm Payroll, this release will probably work only if it is going in the same direction as the U.S. news; at any rate, I would recommend to focus on the NFP. 8:30am (NY Time) CAD Employment [...]",
            icon: "CA"
        },
        {
            title: "EU ECB Interest Rate | Feb 6, 2026 | Forex News Trading",
            date: "Feb 6, 2026",
            author: "Henry Berido",
            impact: "High Impact",
            description: "ECB Interest Rate is done in 2 parts, first with the rate decision at 7:45am then followed by the press conference at 8:30am (NY Time). The rate decision usually doesn't move the market unless there's a surprise change. The real volatility comes from Draghi's press conference [...]",
            icon: "EU"
        },
        {
            title: "AU Employment Change | Feb 5, 2026 | News Trading",
            date: "Feb 5, 2026",
            author: "Henry Berido",
            impact: "Medium Impact",
            description: "Australian Employment Change is the key employment figure for the Aussie dollar. Full-time vs part-time breakdown matters significantly. The unemployment rate is released simultaneously. AUD/USD and AUD/JPY are the most reactive pairs for this release [...]",
            icon: "AU"
        }
    ];

    const strengthMeter = [
        { symbol: "USD", score: 5.90, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
        { symbol: "EUR", score: 4.70, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
        { symbol: "GBP", score: 3.80, color: "text-brand-500", bg: "bg-brand-500/10", border: "border-brand-500/20" },
        { symbol: "CHF", score: 8.00, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
        { symbol: "CAD", score: 3.00, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { symbol: "AUD", score: 3.30, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { symbol: "JPY", score: 3.00, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        { symbol: "NZD", score: 5.00, color: "text-brand-500", bg: "bg-brand-500/10", border: "border-brand-500/20" },
    ];

    const currencyOutlook = [
        { curr: "US", symbol: "USD", score: 55, trend: "up" },
        { curr: "EU", symbol: "EUR", score: 60, trend: "down" },
        { curr: "JP", symbol: "JPY", score: 48, trend: "down" },
        { curr: "GB", symbol: "GBP", score: 63, trend: "up" },
        { curr: "CA", symbol: "CAD", score: 45, trend: "down" },
        { curr: "CH", symbol: "CHF", score: 55, trend: "up" },
        { curr: "AU", symbol: "AUD", score: 50, trend: "up" },
        { curr: "NZ", symbol: "NZD", score: 47, trend: "down" },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 md:px-8 text-[var(--color-text-primary)] font-sans selection:bg-[#10b981]/30">
            {/* Main Institutional Header */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#10b981]/5 blur-[160px] rounded-full -mr-30 -mt-30" />
                <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#10b981] drop-shadow-sm">Global Macro + News Trading</span>
                    <h1 className="text-6xl font-black tracking-tighter text-[var(--color-text-primary)] uppercase italic">
                        News Trading <span className="text-[#10b981]">Dashboard</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-lg font-medium leading-relaxed">
                        Trade high-impact economic releases with <span className="text-[#10b981] font-bold">currency strength analysis</span>, outlook trends, and pre-trade setups.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Left Section: News Feed */}
                <div className="xl:col-span-3 space-y-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                            <Newspaper className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Latest News Trading Setups</h2>
                    </div>

                    <div className="space-y-6">
                        {newsSetups.map((setup, i) => (
                            <div key={i} className="group p-10 bg-surface border border-[var(--color-border)] rounded-lg hover:border-[#10b981]/20 transition-all shadow-xl hover:-translate-y-1 duration-500">
                                <div className="flex flex-col md:flex-row gap-10">
                                    {/* Left Icon Panel */}
                                    <div className="w-full md:w-32 h-32 flex-shrink-0 flex items-center justify-center bg-white/[0.02] border border-[var(--color-border)] rounded-lg group-hover:bg-white/[0.04] transition-colors relative">
                                        <span className="text-4xl font-black text-white/10 group-hover:text-[#10b981]/40 transition-colors uppercase tracking-tight">
                                            {setup.icon}
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Content Panel */}
                                    <div className="flex-1 space-y-6">
                                        <h3 className="text-2xl font-black text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors leading-tight">
                                            {setup.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest py-1.5 px-3 bg-[var(--color-surface-2)] rounded-lg">
                                                <Clock className="w-3 h-3 text-[#10b981]" />
                                                {setup.date}
                                            </div>
                                            <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                                By <span className="text-[#10b981]/60">{setup.author}</span>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                setup.impact.includes("High") ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                                            )}>
                                                {setup.impact}
                                            </div>
                                        </div>

                                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium line-clamp-3 group-hover:text-[var(--color-text-secondary)] transition-colors">
                                            {setup.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Section: Sidebar Analysis */}
                <div className="space-y-10">
                    {/* Currency Strength Meter */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Currency Strength Meter</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {strengthMeter.map((curr, idx) => (
                                <div key={idx} className={cn(
                                    "p-6 rounded-lg border transition-all hover:scale-[1.02] cursor-default flex flex-col items-center justify-center gap-1",
                                    curr.bg, curr.border
                                )}>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", curr.color)}>{curr.symbol}</span>
                                    <span className="text-2xl font-black text-[var(--color-text-primary)]">{curr.score.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">Institutional Pulse Feed</span>
                        </div>
                    </div>

                    {/* Currency Outlook Table */}
                    <div className="p-8 bg-surface border border-[var(--color-border)] rounded-lg space-y-6 shadow-xl">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Currency Outlook</h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">
                                <span>Currency</span>
                                <span className="text-center">Score</span>
                                <span className="text-right">Trend</span>
                            </div>
                            {currencyOutlook.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-3 items-center py-1 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-md bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] font-black text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                                            {item.curr}
                                        </div>
                                        <span className="text-[11px] font-black text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{item.symbol}</span>
                                    </div>
                                    <span className="text-xs font-black text-[#10b981] text-center drop-shadow-[0_0_10px_rgba(16, 185, 129,0.2)]">
                                        {item.score}
                                    </span>
                                    <div className="flex justify-end">
                                        {item.trend === "up" ? (
                                            <div className="p-1 rounded bg-green-500/10 border border-green-500/20">
                                                <ArrowUpRight className="w-2.5 h-2.5 text-green-500" />
                                            </div>
                                        ) : (
                                            <div className="p-1 rounded bg-red-500/10 border border-red-500/20">
                                                <ArrowDownRight className="w-2.5 h-2.5 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Heat & Global Trends (Requested Persistence) */}
                    <div className="space-y-8">
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-10 space-y-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <Flame className="w-4 h-4 text-[#10b981] animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.2rem] text-[var(--color-text-muted)]">Market Heat Pulse</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Impact Level</span>
                                        <span className="text-xl font-black text-red-500 uppercase italic">Extreme</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                        <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Sentiment</span>
                                        <span className="text-xl font-black text-[#10b981] uppercase italic">Neutral</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--color-border)]" />

                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-[0.2rem] text-[var(--color-text-muted)]">Trending Macro Themes</h4>
                                <div className="space-y-4">
                                    {["Central Bank Divergence", "Geopolitical Stress", "Supply Chain Shocks"].map((t) => (
                                        <div key={t} className="flex items-center justify-between p-5 bg-white/[0.02] border border-[var(--color-border)] rounded-lg hover:bg-white/[0.05] cursor-pointer transition-all group/item">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] group-hover/item:text-[var(--color-text-primary)]">{t}</span>
                                            <TrendingUp size={14} className="text-[#10b981]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-6">
                            <Zap className="w-3 h-3 text-[#10b981]" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Quick Navigation</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: "News Calendar", icon: Newspaper, href: "/dashboard/news/forex", color: "text-[#10b981]" },
                                { label: "Fundamental Strength", icon: ShieldCheck, href: "/dashboard/resources/macro/strength", color: "text-cyan-500" },
                                { label: "COT Data", icon: LineChart, href: "/dashboard/resources/cot/pro-max", color: "text-emerald-500" },
                                { label: "Global Macro Guide", icon: Compass, href: "/dashboard/resources/macro/outlook", color: "text-brand-500" },
                            ].map((link, idx) => (
                                <Link href={link.href} key={idx} className="flex items-center justify-between p-5 rounded-lg bg-surface border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]", link.color)}>
                                            <link.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{link.label}</span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-[var(--color-text-muted)] rotate-180 group-hover:text-[var(--color-text-primary)] transition-all transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Navigation Footer */}
            <div className="pt-10 flex justify-center border-t border-[var(--color-border)]">
                <Link
                    href="/dashboard/resources/macro/outlook"
                    className="flex items-center gap-3 px-10 py-5 bg-surface border border-[var(--color-border)] rounded-full text-xs font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[#10b981]/50 transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 text-[#10b981] group-hover:-translate-x-1 transition-transform" />
                    Back to Global Macro Guide
                </Link>
            </div>
        </div>
    );
}
