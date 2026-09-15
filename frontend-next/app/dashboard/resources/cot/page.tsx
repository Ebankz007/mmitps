/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
    BookOpen, Users, Activity, BarChart2, Hash, ArrowRightLeft,
    ShieldAlert, AlertCircle, LineChart as ChartLine, Lightbulb,
    FileText, Zap, Layers, Target, Coins, Briefcase, Eye,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable Section components
function SectionWrapper({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <h2 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-widest">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function GridCard({ title, icon: Icon, desc, highlightColor, highlightText }: any) {
    return (
        <div className="bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-5 md:p-6 space-y-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", `bg-${highlightColor}-500/10 border-${highlightColor}-500/20`)}>
                    <Icon className={cn("w-4 h-4", `text-${highlightColor}-400`)} />
                </div>
                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{title}</h3>
            </div>
            <p className="text-[var(--color-text-muted)] text-xs font-medium leading-relaxed">{desc}</p>
            {highlightText && (
                <div className={cn("pt-4 border-t border-[var(--color-border)] mt-auto", `text-${highlightColor}-400/80`)}>
                    <p className="text-[10px] font-bold tracking-wide italic flex items-start gap-2">
                        <span className="mt-0.5">•</span> {highlightText}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function CotEducationalHub() {
    return (
        <div className="space-y-8 pb-12">
            {/* ═══ HERO HEADER ═══ */}
            <div className="relative bg-surface border border-[var(--color-border)] p-8 md:p-16 rounded-lg overflow-hidden text-center space-y-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 blur-[150px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl mx-auto">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-500/20 flex items-center justify-center border border-[var(--color-border)]">
                        <BarChart2 className="w-6 h-6 text-[var(--color-text-primary)]" />
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Educational Hub & Dashboard Portal</p>
                        <h1 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase">
                            Commitment of Traders (COT) Report
                        </h1>
                    </div>

                    <p className="text-[var(--color-text-muted)] text-sm md:text-base font-medium leading-relaxed max-w-3xl">
                        Learn how to read, interpret, and use the COT report to gain an <span className="text-brand-400">institutional edge</span> in your trading.
                        Understand what the "smart money" is doing before making your trading decisions.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link href="/dashboard/resources/cot/pro-max" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16, 185, 129,0.2)]">
                            View COT Pro Max
                        </Link>
                        <Link href="/dashboard/resources/cot/simplified" className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16, 185, 129,0.2)]">
                            View COT Simplified
                        </Link>
                        <Link href="/dashboard/resources/cot/global" className="px-6 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--color-border)]">
                            View COT Global (Matrix)
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ WHAT IS IT? ═══ */}
            <SectionWrapper title="What is the COT Report?" icon={BookOpen}>
                <div className="space-y-4 text-sm font-medium leading-relaxed">
                    <p className="text-[var(--color-text-secondary)]">
                        The <span className="text-[var(--color-text-primary)] font-bold">Commitments of Traders (COT)</span> report is a weekly publication by the <span className="text-[var(--color-text-primary)] font-bold">Commodity Futures Trading Commission (CFTC)</span> that breaks down the open interest positions in U.S. futures markets. It reveals how different types of traders — from large hedge funds to commercial hedgers — are positioned in the market.
                    </p>
                    <p className="text-[var(--color-text-secondary)]">
                        The data is collected every Tuesday and published on Fridays, reflecting positions held as of Tuesday's close. This 3-day lag means the report shows overall institutional positioning rather than real-time data.
                    </p>
                </div>
            </SectionWrapper>

            {/* ═══ TRADER CATEGORIES ═══ */}
            <SectionWrapper title="The Three Trader Categories" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <GridCard
                        title="Commercial Traders"
                        icon={Briefcase}
                        desc="These are producers, manufacturers, and corporations that use the futures market to hedge their business risks. They are the 'smart money' dealing in the actual physical asset."
                        highlightColor="emerald"
                        highlightText="They scale scale into positions as prices move against them. They look to hedge risk, not speculate for profit. They are often 'right' at major market turning points."
                    />
                    <GridCard
                        title="Large Speculators"
                        icon={TrendingUp}
                        desc="These are funds (hedge funds, CTA, managed money) that trade for profit using chart patterns and trend-following strategies. They hold large positions and drive major market trends."
                        highlightColor="blue"
                        highlightText="They are trend followers. They pile in as the trend continues. When their positions hit extreme highs/lows, it often indicates an exhausted trend."
                    />
                    <GridCard
                        title="Small Speculators"
                        icon={Users}
                        desc="These are small retail traders and smaller funds not meeting the CFTC reporting threshold. They tend to be trend followers but are generally considered the most inexperienced group."
                        highlightColor="amber"
                        highlightText="They are usually 'wrong' at the extremes. They often buy at the very top and sell at the very bottom. They are a classic contrarian indicator."
                    />
                </div>
            </SectionWrapper>

            {/* ═══ KEY TERMS ═══ */}
            <SectionWrapper title="Key COT Terms Explained" icon={Hash}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Long Positions</h4></div>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Contracts bought holding the belief that market prices will rise.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><ArrowRightLeft className="w-3.5 h-3.5 text-red-400" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Short Positions</h4></div>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Contracts sold expecting the market price to decrease.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-brand-400" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Net Positions</h4></div>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Total Longs minus Total Shorts. Shows the overall directional bias.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-amber-400" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Open Interest (OI)</h4></div>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Total number of active contracts in the market not yet settled or closed.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><ChartLine className="w-3.5 h-3.5 text-brand-400" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">COT Index</h4></div>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-medium">A normalized scale (0-100) showing how current positions compare to historical minimums and maximums (e.g. over 6, 18, 36 months).</p>
                    </div>
                </div>
            </SectionWrapper>

            {/* ═══ HOW TO USE DATA ═══ */}
            <SectionWrapper title="How to Use COT Data for Trading" icon={Target}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3 bg-white/[0.01] p-5 border border-[var(--color-border)] rounded-lg">
                        <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-400" /><h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Spot Trend Reversals (Extremes)</h3></div>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-relaxed">When Large Speculators reach historical extremes in their Net Long or Net Short positions, it signals the trend may be exhausted. If everyone has already bought, there's no one left to push the price higher. Watch for Commercials scaling heavily into the opposite direction.</p>
                    </div>
                    <div className="space-y-3 bg-white/[0.01] p-5 border border-[var(--color-border)] rounded-lg">
                        <div className="flex items-center gap-2"><ChartLine className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Trend Confirmation</h3></div>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-relaxed">If prices are rising and Large Speculators are continuously adding to Long positions, while Open Interest is expanding, it confirms the trend is healthy and has momentum behind it.</p>
                    </div>
                    <div className="space-y-3 bg-white/[0.01] p-5 border border-[var(--color-border)] rounded-lg">
                        <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-brand-400" /><h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Identify Smart Money Accumulation</h3></div>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-relaxed">Commercials (Smart Money) are often the first to take positions ahead of major reversals. If prices are still falling but Commercials are aggressively building massive Net Long positions (buying the dip), a major bottom may be forming.</p>
                    </div>
                    <div className="space-y-3 bg-white/[0.01] p-5 border border-[var(--color-border)] rounded-lg">
                        <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-400" /><h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Divergences</h3></div>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium leading-relaxed">If prices continually make higher highs, but Open Interest is shrinking and Speculators are drastically reducing their Long positions, this divergence signals that the uptrend is losing steam.</p>
                    </div>
                </div>
            </SectionWrapper>

            {/* ═══ COT SIMPLIFIED LOGIC ═══ */}
            <SectionWrapper title="COT Simplified — LogiCall Indicator Logic" icon={Lightbulb}>
                <p className="text-[var(--color-text-muted)] text-sm font-medium mb-2">Our COT Simplified page utilizes a traffic-light indicator system based on Commercial COT Index readings:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#111827] border border-[var(--color-border)] p-6 rounded-lg text-center space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none" />
                        <div className="w-6 h-6 rounded-full bg-emerald-500 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-[#111827]" />
                        <div>
                            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Bullish Indicator</h4>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-2 leading-relaxed">Commercials are heavily accumulated (Long bias). They are buying aggressively anticipating a price increase. Generally triggers when Commercial COT Index ≥ 70-80%.</p>
                        </div>
                    </div>
                    <div className="bg-[#111827] border border-[var(--color-border)] p-6 rounded-lg text-center space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none" />
                        <div className="w-6 h-6 rounded-full bg-amber-500 mx-auto shadow-[0_0_20px_rgba(16, 185, 129,0.5)] border-2 border-[#111827]" />
                        <div>
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Neutral / Transition</h4>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-2 leading-relaxed">Positions are mixed or in the middle of their historical ranges. Neither buyers nor sellers have a decisive overwhelming extreme. Wait for clearer setups.</p>
                        </div>
                    </div>
                    <div className="bg-[#111827] border border-[var(--color-border)] p-6 rounded-lg text-center space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none" />
                        <div className="w-6 h-6 rounded-full bg-red-500 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.5)] border-2 border-[#111827]" />
                        <div>
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">Bearish Indicator</h4>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-2 leading-relaxed">Commercials are heavily distributed (Short bias). They are selling aggressively anticipating a price drop. Generally triggers when Commercial COT Index ≤ 20-30%.</p>
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            {/* ═══ REPORT TYPES ═══ */}
            <SectionWrapper title="COT Report Types" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <GridCard
                        title="Legacy Report"
                        icon={FileText}
                        desc="The original format showing Commercial, Non-Commercial (Large Speculators), and Non-Reportable (Small Speculators) positions. Used widely for general analysis."
                        highlightColor="blue"
                    />
                    <GridCard
                        title="TFF Report (Financials)"
                        icon={Coins}
                        desc="Traders in Financial Futures. Breaks down participants into Dealer/Intermediary, Asset Manager/Institutional, Leveraged Funds, and Other Reportables. Ideal for FX and Index traders."
                        highlightColor="purple"
                    />
                    <GridCard
                        title="Disaggregated Report"
                        icon={Layers}
                        desc="Splits Commercials into Producer/Merchant/Processor and Swap Dealers. Splits Non-Commercials into Managed Money and Other Reportables. Ideal for Agricultural and Energy traders."
                        highlightColor="emerald"
                    />
                </div>
            </SectionWrapper>

            {/* ═══ PRO TIPS ═══ */}
            <SectionWrapper title="Pro Tips" icon={Zap}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="border border-[var(--color-border)] bg-white/[0.01] p-5 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Context is King</h4></div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">The COT report is a fundamental/sentiment tool. It tells you *why* a market should turn and *who* is driving it, but not *when*. Always combine COT extremes with technical price action analysis for entry triggers.</p>
                    </div>
                    <div className="border border-[var(--color-border)] bg-white/[0.01] p-5 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Watch the Change (Momentum)</h4></div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">Absolute positioning (Total Longs/Shorts) is important, but the week-over-week *Change* in positions often dictates immediate market momentum. Significant sudden shifts reveal urgency.</p>
                    </div>
                    <div className="border border-[var(--color-border)] bg-white/[0.01] p-5 rounded-lg space-y-2">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-500" /><h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Beware of 'Crowded Trades'</h4></div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-relaxed">When Small Speculators represent an unusually massive proportion of the Open Interest in one direction, it's a prime signal for a 'Squeeze' and a sharp reversal in the opposite direction.</p>
                    </div>
                </div>
            </SectionWrapper>

        </div>
    );
}
