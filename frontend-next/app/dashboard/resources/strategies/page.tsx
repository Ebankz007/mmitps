"use client";

import { useState } from "react";
import {
    BookOpen,
    Search,
    ArrowRight,
    Star,
    PlayCircle
} from "lucide-react";

const STRATEGIES = [
    {
        id: "macro-1",
        name: "G10 Divergence Masterclass",
        category: "Macro",
        difficulty: "Institutional",
        rating: 4.9,
        author: "Antigravity Research",
        wins: "72%",
        desc: "Identifying structural imbalances between central bank policies and retail flow.",
        tags: ["Forex", "Fundamental", "Long-term"]
    },
    {
        id: "technical-1",
        name: "PO3 Liquidity Sweep",
        category: "Price Action",
        difficulty: "Professional",
        rating: 4.8,
        author: "Smart Money Lab",
        wins: "68%",
        desc: "Trading the Power of 3 (Accumulation, Manipulation, Distribution) across session overlaps.",
        tags: ["Intraday", "SMC", "Scalping"]
    },
    {
        id: "crypto-1",
        name: "BTC Halving Cycle Pro",
        category: "Crypto",
        difficulty: "Advanced",
        rating: 5.0,
        author: "Institutional Desk",
        wins: "84%",
        desc: "Leveraging 4-year halving cycles to identify peak accumulation and blow-off top phases.",
        tags: ["Crypto", "Cycle", "Macro"]
    },
    {
        id: "commodity-1",
        name: "Gold Seasonality Suite",
        category: "Commodities",
        difficulty: "Master",
        rating: 4.7,
        author: "Macro Analyst",
        wins: "65%",
        desc: "Standardized seasonal playbooks for Gold and Silver based on physical demand cycles.",
        tags: ["Gold", "Seasonal", "Safe Haven"]
    }
];

export default function StrategyRepositoryPage() {
    const [search, setSearch] = useState("");

    const filteredStrategies = STRATEGIES.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 h-64 w-64 bg-[#10b981]/5 rounded-full blur-[100px]"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="h-4 w-4 text-[#10b981] fill-[#10b981]" />
                            <span className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Institutional Library</span>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight mb-4">Precision Strategy Repository</h1>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            A curated selection of the world&apos;s most powerful institutional trading playbooks. From SMC liquidity sweeps to global macro divergence, access the edges used by Tier 1 desks.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-[var(--color-surface-2)] p-6 rounded-lg border border-[var(--color-border)]">
                        <div className="text-center px-4 border-r border-[var(--color-border)]">
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Strategies</div>
                            <div className="text-2xl font-black text-[var(--color-text-primary)]">42+</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Success Rate</div>
                            <div className="text-2xl font-black text-green-500">Avg 68%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search strategies/tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-[var(--color-border)] rounded-lg py-3.5 pl-12 pr-6 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-bold"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["All", "Macro", "Price Action", "Crypto", "SMC"].map((cat) => (
                        <button key={cat} className="px-5 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg text-xs font-black uppercase tracking-widest border border-[var(--color-border)] transition-all whitespace-nowrap">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStrategies.map((strategy) => (
                    <div key={strategy.id} className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden group hover:border-[#10b981]/30 transition-all relative">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                        <BookOpen className="h-5 w-5 text-[#10b981]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{strategy.category}</div>
                                        <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tight group-hover:text-[#10b981] transition-colors">{strategy.name}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-[#10b981] uppercase mb-1">Avg Win</div>
                                    <div className="text-xl font-black text-[var(--color-text-primary)]">{strategy.wins}</div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed font-medium mb-8">
                                {strategy.desc}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {strategy.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/[0.03] border border-[var(--color-border)] rounded-full text-[9px] font-black text-gray-500 uppercase group-hover:text-[var(--color-text-primary)] transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0D0D0D] bg-gray-800"></div>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">124 Traders Active</span>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface-2)] group-hover:bg-[#10b981] rounded-lg text-[10px] font-black text-gray-400 group-hover:text-black uppercase tracking-widest transition-all">
                                    View Playbook
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Callout */}
            <div className="bg-gradient-to-r from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-8 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="flex items-center gap-8 flex-1">
                    <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shrink-0 relative">
                        <PlayCircle className="h-10 w-10 text-brand-400" />
                        <div className="absolute inset-0 bg-brand-400/10 rounded-full animate-ping"></div>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Strategy Masterclass Series</h3>
                        <p className="text-sm text-gray-400 font-medium mt-1">Video deep-dives into every professional execution model.</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] transition-all">
                    Access Library
                </button>
            </div>
        </div>
    );
}
