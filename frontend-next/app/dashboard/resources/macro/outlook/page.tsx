"use client";

import { useState } from "react";
import {
    Compass,
    BarChart3,
    ChevronDown,
    Flame,
    Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useStrengthScores } from "@/hooks/use-resources";

export default function MacroOutlookPage() {
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const { data: strengthScores = [] } = useStrengthScores();
    void strengthScores;

    const majorCurrencies = [
        { symbol: "USD", name: "US Dollar", flag: "🇺🇸" },
        { symbol: "EUR", name: "Euro", flag: "🇪🇺" },
        { symbol: "GBP", name: "British Pound", flag: "🇬🇧" },
        { symbol: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
        { symbol: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
        { symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
        { symbol: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
        { symbol: "NZD", name: "NZ Dollar", flag: "🇳🇿" },
    ];

    const outlookData = {
        USD: {
            score: 56,
            sentiment: "BULLISH",
            bias: "Long-term Buy Bias",
            description: "USD's current outlook score of 56 shows that the long-term outlook is bullish; traders with a trading timeline of 3 months or more should be looking to position long USD. The latest economic indicators released out of United States have added 3 to the total Fundamental Outlook score of 56. This represents a low rate of growth in recent months. More specifically, the most recent economic release with the greatest impact for USD was the US FOMC Meeting Minutes, which took place on March 12, 2026 at 2:00pm GMT.",
            upcomingNews: [
                { date: "March 12, 2026 - 12:00am GMT", event: "Australian Employment Change" },
                { date: "March 15, 2026 - 12:30pm GMT", event: "US Core Retail Sales" },
                { date: "March 17, 2026 - 1:15pm GMT", event: "Fed Chair Powell Speaks" }
            ],
            indicators: [
                { date: "2026-06-21", event: "US Hardcore Payroll (NFP)", forecast: "175K", actual: "186K", impact: 6 },
                { date: "2026-06-12", event: "US Retail Sales YoY", forecast: "2.1%", actual: "2.4%", impact: 4 },
                { date: "2026-06-05", event: "US ISM Manufacturing PMI", forecast: "48.5", actual: "49.2", impact: 3 },
                { date: "2026-05-28", event: "US Quarterly GDP", forecast: "1.2%", actual: "1.4%", impact: 2 },
                { date: "2026-05-15", event: "US Core CPI YoY", forecast: "3.2%", actual: "3.1%", impact: -2 },
                { date: "2026-05-01", event: "US ADP Non-Farm Employment Change", forecast: "155K", actual: "148K", impact: -4 },
            ]
        }
        // ... (Would repeat for other currencies or pull from API)
    };

    const currentData = outlookData[selectedCurrency as keyof typeof outlookData] || outlookData.USD;

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 md:px-8 text-[var(--color-text-primary)] font-sans selection:bg-[#10b981]/30">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
                        <Compass className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#10b981]">Strategy Vision</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Currency <span className="text-[#10b981]">Outlook</span></h1>
                        <p className="text-[var(--color-text-secondary)] text-sm font-medium tracking-wide">Fundamental Outlook Score & Economic Impact Analysis for 8 Major Currencies</p>
                    </div>
                </div>
            </div>

            {/* Horizontal Currency Selector */}
            <div className="flex flex-wrap gap-3 pb-2 border-b border-[var(--color-border)]">
                {majorCurrencies.map((curr) => {
                    const isActive = selectedCurrency === curr.symbol;
                    return (
                        <button
                            key={curr.symbol}
                            onClick={() => setSelectedCurrency(curr.symbol)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-lg border transition-all group",
                                isActive
                                    ? "bg-[#10b981] border-[#10b981] text-black shadow-[0_0_30px_rgba(16, 185, 129,0.2)]"
                                    : "bg-surface border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                            )}
                        >
                            <span className="text-xl">{curr.flag}</span>
                            <span className="text-xs font-black uppercase tracking-widest">{curr.symbol}</span>
                        </button>
                    );
                })}
            </div>

            {/* Analysis Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedCurrency}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                >
                    {/* Fundamental Analysis Box */}
                    <div className="p-12 rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[#0D1117] to-[#161b22] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                                <div className="space-y-2">
                                    <h2 className="text-xs font-black text-[#10b981] uppercase tracking-[0.3em]">{majorCurrencies.find(c => c.symbol === selectedCurrency)?.name}</h2>
                                    <h3 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{selectedCurrency} Fundamental Analysis</h3>
                                </div>
                                <div className="flex gap-6">
                                    <div className="px-8 py-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex flex-col items-center">
                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Fundamental Score</span>
                                        <span className="text-4xl font-black text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">{currentData.score}</span>
                                    </div>
                                    <div className="px-8 py-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex flex-col items-center">
                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">Outlook Bias</span>
                                        <span className="text-xs font-black text-green-400 mt-2 uppercase tracking-[0.2em]">{currentData.sentiment}</span>
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-tighter">{currentData.bias}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[var(--color-text-secondary)] text-base leading-relaxed font-medium max-w-5xl">
                                {currentData.description}
                            </p>

                            {/* Upcoming News Sub-Box */}
                            <div className="p-8 rounded-lg bg-white/[0.02] border border-[#10b981]/10 space-y-4">
                                <h4 className="flex items-center gap-3 text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                    <Flame className="w-4 h-4 text-[#10b981]" />
                                    Market will be focusing on these upcoming Forex News for short-term directions:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {currentData.upcomingNews.map((news, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">{news.date}</span>
                                            <span className="text-xs font-black text-[var(--color-text-secondary)]">{news.event}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-[11px] text-[var(--color-text-muted)] font-medium italic border-t border-[var(--color-border)] pt-6 leading-relaxed">
                                Although the current score for {selectedCurrency} is {currentData.score}, please understand that this merely reflects the long-term view based on official economic data out of {majorCurrencies.find(c => c.symbol === selectedCurrency)?.name.split(' ').pop()}. This outlook score does not account for market sentiment, namely risk appetite or risk aversion, under fire, or any breaking news that has the potential of changing the short-term market trend.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[120px] -mr-48 -mt-48" />
                    </div>

                    {/* Data Table Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-[#10b981]" />
                                Recent Economic Indicators And Impact Score For {majorCurrencies.find(c => c.symbol === selectedCurrency)?.name}
                            </h4>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-surface">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-[var(--color-border)]">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Date</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Event Description</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] text-center">Forecast</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] text-center">Actual</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] text-right">Impact Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.indicators.map((row, i) => (
                                        <tr key={i} className="border-b border-[var(--color-border)] hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-6 text-[11px] font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-secondary)] transition-colors uppercase tracking-widest">{row.date}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] transition-colors">{row.event}</span>
                                                    <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center text-[11px] font-black text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">{row.forecast}</td>
                                            <td className="px-8 py-6 text-center text-[11px] font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] transition-colors">{row.actual}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={cn(
                                                    "inline-block px-4 py-1.5 rounded-lg text-xs font-black",
                                                    row.impact > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {row.impact > 0 ? `+${row.impact}` : row.impact}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-6 text-center bg-white/[0.01]">
                                <button className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-[var(--color-text-primary)] transition-colors">Show more results</button>
                            </div>
                        </div>
                    </div>

                    {/* Headlines Strip */}
                    <div className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6">
                        <div className="flex items-center gap-3">
                            <Newspaper className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <h5 className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Latest Macro Headlines</h5>
                        </div>
                        <div className="space-y-4">
                            {[
                                "G7 to tighten sanctions on Russian crude oil as price cap proves ineffective",
                                "FED's Daly: Rate path remains data dependent but 2026 terminal targets hold firm",
                                "ECB's Lagarde hints at potential June policy shift amid cooling inflation data",
                            ].map((headline, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer selection:bg-cyan-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                    <p className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors uppercase tracking-tight italic">{headline}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Institutional Footer Navigation */}
            <div className="flex justify-center pt-20">
                <div className="flex items-center p-2 rounded-full bg-surface border border-[var(--color-border)] shadow-2xl">
                    {[
                        { label: "Fundamental Strength", href: "/dashboard/resources/macro/strength" },
                        { label: "News Trading", href: "/dashboard/resources/macro/news" },
                        { label: "Global Macro Guide", href: "/dashboard/resources/macro/outlook", active: true },
                    ].map((nav, idx) => (
                        <Link
                            key={idx}
                            href={nav.href}
                            className={cn(
                                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                nav.active
                                    ? "bg-[#10b981] text-black shadow-lg"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                            )}
                        >
                            {nav.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
