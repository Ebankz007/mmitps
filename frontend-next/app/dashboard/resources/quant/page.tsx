"use client";

import { useState } from "react";
import {
    Calculator,
    Zap,
    ShieldCheck,
    Search,
    Filter,
    ArrowRight,
    Lock,
    Scale,
    Layers,
    LineChart
} from "lucide-react";
import Link from "next/link";

const TOOL_CATEGORIES = [
    {
        name: "Risk & Sizing",
        icon: Scale,
        tools: [
            { name: "Lot Size Calculator", desc: "Calculate precise trade volume based on risk %.", path: "lot-calculator" },
            { name: "Risk-to-Reward", desc: "Visualize profit/loss ratios for execution.", path: "rr-calculator" },
            { name: "Portfolio Heat", desc: "Track aggregate drawdown risk.", path: "portfolio-heat" },
            { name: "Slippage Estimator", desc: "Model cost impact on high-lot entries.", path: "slippage" }
        ]
    },
    {
        name: "Market Dynamics",
        icon: LineChart,
        tools: [
            { name: "Volatility (ATR)", desc: "Determine dynamic stop-loss levels.", path: "volatility" },
            { name: "Correlation Matrix", desc: "Identify cross-asset dependencies.", path: "correlation" },
            { name: "Liquidity Gaps", desc: "Spot institutional imbalance zones.", path: "liquidity" }
        ]
    },
    {
        name: "Strategy Logic",
        icon: Zap,
        tools: [
            { name: "Fibonacci Master", desc: "Project institutional reversal levels.", path: "fibonacci" },
            { name: "Pivot Point Desk", desc: "Calculate standard & woodie pivots.", path: "pivots" },
            { name: "Order Flow Depth", desc: "Visualize buy/sell depth imbalance.", path: "order-flow" }
        ]
    },
];

export default function QuantitativeHubPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] rotate-12">
                    <Calculator className="h-32 w-32 text-[var(--color-text-primary)]" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#10b981]/10 rounded-lg">
                            <Layers className="h-5 w-5 text-[#10b981]" />
                        </div>
                        <span className="text-xs font-black text-[#10b981] uppercase tracking-widest">Statistical Edge</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-4">Quantitative Methodology Hub</h1>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        Access our complete suite of 30+ specialized mathematical tools and calculators. Every tool is designed to provide institutional-grade precision for your trading system.
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="h-4 w-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search for a tool (e.g. Lot Size, ATR)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3.5 pl-12 pr-6 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-bold"
                            />
                        </div>
                        <button className="px-6 py-3.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-xs font-black uppercase tracking-widest border border-[var(--color-border)] transition-all flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 gap-12">
                {TOOL_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                            <div className="flex items-center gap-3">
                                <category.icon className="h-5 w-5 text-[#10b981]" />
                                <h2 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-widest">{category.name}</h2>
                            </div>
                            <Link href="#" className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline">
                                View all {category.tools.length} tools
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {category.tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map((tool) => (
                                <Link
                                    key={tool.name}
                                    href={`/dashboard/resources/quantitative/${tool.path}`}
                                    className="group bg-surface border border-[var(--color-border)] p-6 rounded-lg hover:border-[#10b981]/30 transition-all hover:bg-white/[0.02] relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight mb-2 group-hover:text-[#10b981] transition-colors">{tool.name}</h3>
                                        <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight opacity-70 mb-4">{tool.desc}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-[#10b981] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                            Open Tool
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-white/[0.01] group-hover:bg-[#10b981]/5 rounded-full transition-all"></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured / Premium Tool */}
            <div className="bg-surface border border-[#10b981]/20 p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#10b981]"></div>
                <div className="w-16 h-16 rounded-lg bg-[#10b981]/10 flex items-center justify-center shrink-0 border border-[#10b981]/20">
                    <ShieldCheck className="h-8 w-8 text-[#10b981]" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-3.5 w-3.5 text-[#10b981]" />
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Premium Strategy</span>
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Institutional Formation Scanner</h3>
                    <p className="text-xs text-gray-400 font-medium mt-2 leading-relaxed">
                        Our most advanced algorithmic scanner. Automatically detects complex 3-drive patterns, harmonic Cyphers, and institutional PO3 setups across 28 FX pairs.
                    </p>
                </div>
                <button className="px-8 py-4 bg-[#10b981] hover:bg-[#10b981]/80 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xl">
                    Coming Soon
                </button>
            </div>
        </div>
    );
}
