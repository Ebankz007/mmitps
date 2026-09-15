"use client";

import {
    Zap,
    AlertTriangle,
    Activity,
    ShieldCheck,
    HelpCircle,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";


export default function TriggerSheetPage() {

    const regionalReports = [
        {
            region: "US Reports",
            color: "bg-brand-600",
            reports: [
                { name: "Core CPI m/m", trigger: "0.20%", range: "40 pips", rangeType: "high" },
                { name: "Core Retail Sales m/m", trigger: "0.40%", range: "35 pips", rangeType: "mid" },
                { name: "Initial Jobless Claims", trigger: "10K", range: "25 pips", rangeType: "low" },
                { name: "Non-Farm Payroll (NFP)", trigger: "70K", range: "85 pips", rangeType: "high" },
                { name: "ADP Employment Change", trigger: "50K", range: "30 pips", rangeType: "mid" },
                { name: "ISM Manufacturing PMI", trigger: "1.5", range: "45 pips", rangeType: "high" },
                { name: "ISM Non-Manufacturing PMI", trigger: "1.5", range: "45 pips", rangeType: "high" },
                { name: "Core Price Index", trigger: "0.20%", range: "35 pips", rangeType: "mid" },
                { name: "Chicago PMI", trigger: "3.0", range: "30 pips", rangeType: "mid" },
            ]
        },
        {
            region: "Canada Reports",
            color: "bg-red-600",
            reports: [
                { name: "Core CPI m/m", trigger: "0.3%", range: "60 pips", rangeType: "high" },
                { name: "Retail Sales m/m", trigger: "0.5%", range: "50 pips", rangeType: "high" },
                { name: "Employment Change", trigger: "30K", range: "75 pips", rangeType: "high" },
                { name: "GDP m/m", trigger: "0.2%", range: "45 pips", rangeType: "mid" },
                { name: "Ivey PMI", trigger: "3.5", range: "40 pips", rangeType: "mid" },
            ]
        },
        {
            region: "United Kingdom Reports",
            color: "bg-brand-600",
            reports: [
                { name: "CPI y/y", trigger: "0.3%", range: "55 pips", rangeType: "high" },
                { name: "Retail Sales m/m", trigger: "0.6%", range: "50 pips", rangeType: "high" },
                { name: "Claimant Count Change", trigger: "10K", range: "45 pips", rangeType: "mid" },
                { name: "Manufacturing PMI", trigger: "1.2", range: "40 pips", rangeType: "mid" },
                { name: "Services PMI", trigger: "1.2", range: "40 pips", rangeType: "mid" },
            ]
        }
    ];

    const smallerReports = [
        {
            region: "New Zealand Reports",
            color: "bg-cyan-600",
            reports: [
                { name: "CPI q/q", trigger: "0.4%", range: "125 pips" },
                { name: "Employment Change", trigger: "0.5%", range: "115 pips" },
                { name: "Retail Sales q/q", trigger: "0.8%", range: "95 pips" },
            ]
        },
        {
            region: "Australia Reports",
            color: "bg-brand-600",
            reports: [
                { name: "CPI y/y", trigger: "0.3%", range: "110 pips" },
                { name: "Employment Change", trigger: "25K", range: "105 pips" },
                { name: "Retail Sales m/m", trigger: "0.5%", range: "85 pips" },
            ]
        }
    ];

    return (
        <div className="max-w-[1700px] mx-auto space-y-16 pb-20 px-4 md:px-12 text-[var(--color-text-primary)] font-sans">
            {/* Centered Institutional Header */}
            <div className="text-center space-y-6 pt-10">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-[var(--color-text-muted)]">Global Macro - Official Get Settings Guide</span>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase text-[#10b981] drop-shadow-[0_0_30px_rgba(16, 185, 129,0.2)]">
                        Forex News <span className="text-[var(--color-text-primary)]">Triggersheet</span>
                    </h1>
                </div>
                <p className="max-w-3xl mx-auto text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed">
                    Cheat-Sheet Report — For tradable news releases, their **tradable triggers**, and expected **unexpect volatility** trades.
                </p>
            </div>

            {/* Explanation Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="p-10 rounded-lg bg-surface border border-[var(--color-border)] space-y-6 relative overflow-hidden group hover:border-[#10b981]/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <HelpCircle className="w-6 h-6 text-cyan-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest italic">What is the Triggersheet?</h3>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed">
                        The Forex News Triggersheet report lists each **Report of trading** considering its volatility, institutional bank tracking, and final pulling everything together in this page here.
                        It&apos;s what we have been using to trade the news, and we&apos;d love to see you!! Feel it&apos;s valuable to your trading; over if only for better economic news releases.
                        The figures are periodic and has **Traded some news releases**, that provides deviations and their expected movement range in pips after news — it's tradable.
                    </p>
                </div>

                <div className="p-10 rounded-lg bg-surface border border-[var(--color-border)] space-y-6 relative overflow-hidden group hover:border-orange-500/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-brand-500/10 border border-orange-500/20">
                            <Zap className="w-6 h-6 text-brand-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest italic">How to Use It</h3>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed">
                        The basic idea here is to **compare the actual release with the forecast**. If the difference is equal to or greater than the trigger, then you have a reason to take the trade.
                        You can use either the **retrospective trade method** or the **spike trading method**.
                    </p>
                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-[10px] font-black uppercase text-red-400 leading-relaxed italic">
                            * Sometimes New Releases can be a double edged sword! Be careful and wait for the market reaction if the trigger is met but the market moves in the opposite direction, about checking &quot;The Surprise Event&quot; in the resources.
                        </p>
                    </div>
                </div>
            </div>

            {/* Regional Blocks */}
            <div className="space-y-12">
                {regionalReports.map((section, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-[var(--color-border)] bg-surface shadow-2xl">
                        <div className={cn("px-10 py-6 flex items-center gap-4", section.color)}>
                            <Globe className="w-5 h-5 text-[var(--color-text-primary)]" />
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--color-text-primary)] italic">{section.region}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-[var(--color-border)]">
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] w-1/3">Report</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-[#10b981] text-center w-1/3">Tradable Trigger</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-right w-1/3">Movement Range</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.reports.map((row, i) => (
                                        <tr key={i} className="border-b border-[var(--color-border)] group hover:bg-white/[0.01] transition-colors">
                                            <td className="px-10 py-6 text-xs font-black uppercase tracking-tighter text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{row.name}</td>
                                            <td className="px-10 py-6 text-center text-xs font-black text-[var(--color-text-primary)] italic drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{row.trigger}</td>
                                            <td className="px-10 py-6 text-right">
                                                <span className={cn(
                                                    "px-6 py-2 rounded-lg text-[10px] font-black uppercase italic tracking-widest border",
                                                    row.rangeType === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                                                        row.rangeType === 'mid' ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" :
                                                            "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                                                )}>
                                                    {row.range}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smaller Regional Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {smallerReports.map((section, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-[var(--color-border)] bg-surface shadow-xl">
                        <div className={cn("px-8 py-5 flex items-center gap-4", section.color)}>
                            <Globe className="w-4 h-4 text-[var(--color-text-primary)]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--color-text-primary)] italic">{section.region}</h2>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.01] border-b border-[var(--color-border)]">
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Report</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[#10b981] text-center">Trigger</th>
                                    <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-right">Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.reports.map((row, i) => (
                                    <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-5 text-[10px] font-black uppercase tracking-tighter text-[var(--color-text-secondary)]">{row.name}</td>
                                        <td className="px-8 py-5 text-center text-xs font-black text-[var(--color-text-primary)] italic">{row.trigger}</td>
                                        <td className="px-8 py-5 text-right text-[10px] font-black text-red-500 italic">{row.range}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Legend & Rules Section */}
            <div className="space-y-12">
                <div className="flex flex-wrap items-center gap-8 justify-center p-8 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[var(--color-text-muted)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Movement Range Legend:</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">High Volatility (80+ pips)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#10b981] shadow-[0_0_10px_rgba(16, 185, 129,0.5)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Medium Volatility (40-70 pips)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-cyan-600 shadow-[0_0_10px_rgba(8,145,178,0.5)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Low Volatility (20-30 pips)</span>
                    </div>
                </div>

                <div className="p-12 rounded-lg bg-surface border border-[var(--color-border)] space-y-8 relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-brand-500" />
                        <h3 className="text-xl font-black uppercase tracking-[0.4em] italic text-[#10b981]">POINT RULES</h3>
                    </div>
                    <div className="space-y-6 max-w-6xl">
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed italic">
                            It&apos;s important to understand that news releases can behave different with different news sources, as they are usually not standardized; it it is important to **stay out of the market unless the trigger is met**, or you may risk the market going against you.
                        </p>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed italic">
                            So if it falls into this rule, forex Trading is a **VERY DANGEROUS**, and risk is very great with it.
                        </p>
                    </div>
                    <div className="absolute bottom-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-40 h-40 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Institutional Footer Navigation */}
            <div className="flex justify-center pt-10">
                <div className="flex items-center p-2 rounded-full bg-surface border border-[var(--color-border)] shadow-2xl">
                    {[
                        { label: "Currency Outlook", href: "/dashboard/resources/macro/outlook" },
                        { label: "News Calendar", href: "/dashboard/news/forex" },
                        { label: "Global Macro Guide", href: "/dashboard/resources/macro/outlook" },
                    ].map((nav, idx) => (
                        <Link
                            key={idx}
                            href={nav.href}
                            className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all"
                        >
                            {nav.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
