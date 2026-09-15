"use client";

import React, { useState } from "react";
import {
    Zap,
    Target,
    ShieldCheck,
    Activity,
    ChevronRight,
    RefreshCw,
    BarChart3,
    Brain,
    Scale,
    Layers,
    Waves,
    Search,
    Dices,
    Gem,
    PieChart,
    AlertTriangle,
    CheckCircle2,
    Eye,
    Globe,
    Compass,
    Settings,
    Briefcase,
    GraduationCap,
    Heart,
    Repeat
} from "lucide-react";

import { toast } from "sonner";
import api from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// Defining categories and items based on the mockup image
const CATEGORIES = [
    {
        id: 'toolkit',
        label: 'Strategy & Analysis',
        labelSub: 'TRADING TOOLKIT',
        items: [
            { id: 'trading-strategies', title: 'Trading Strategies', icon: Target, desc: 'Rule-based execution frameworks for various market conditions.' },
            { id: 'technical-analysis', title: 'Technical Analysis', icon: BarChart3, desc: 'Chart patterns, indicators, and price action mastery.' },
            { id: 'fundamental-analysis', title: 'Fundamental Analysis', icon: Globe, desc: 'Macroeconomics, interest rates, and global liquidity flows.' },
            { id: 'trading-indicators', title: 'Trading indicators', icon: Activity, desc: 'Proper usage of mathematical price/volume indicators.' },
            { id: 'macro-strategy', title: 'Macro strategy', icon: Compass, desc: 'Top-down approach to global financial ecosystems.' },
            { id: 'arbitrage-basics', title: 'Arbitrage Basics', desc: 'Understanding market inefficiencies and price parity.' }
        ]
    },
    {
        id: 'structure',
        label: 'Market Structure',
        labelSub: 'INSTITUTIONAL CORE',
        items: [
            { id: 'institutional-trading', title: 'Institutional Trading', icon: Briefcase, desc: 'How large-scale smart money executes institutional orders.' },
            { id: 'smc', title: 'Smart Money Concepts', icon: Brain, desc: 'BOS, CHoCH, and Order Block identification mechanics.' },
            { id: 'supply-demand', title: 'Supply and Demand', icon: Layers, desc: 'Identifying zones of extreme buy/sell imbalances.' },
            { id: 'liquidity-man', title: 'Liquidity Management', icon: Waves, desc: 'Trailing liquidity pools and stop-hunt mechanics.' },
            { id: 'order-flow', title: 'Trading Order flow', icon: Search, desc: 'Analyzing the actual tape and buy/sell pressure.' },
            { id: 'mmm', title: 'Market Maker Method', icon: Settings, desc: 'Trading in alignment with market liquidity cycle.' },
            { id: 'market-micro', title: 'Market Microstructure', desc: 'The granular mechanics of spread, slippage and orders.' },
            { id: 'hft', title: 'High Frequency Trading', icon: Zap, desc: 'Algorithmic execution patterns in the sub-second range.' }
        ]
    },
    {
        id: 'risk',
        label: 'Risk & Theory Management',
        labelSub: 'PITAL PRESERVATION',
        items: [
            { id: 'risk-man', title: 'Risk Management', icon: ShieldCheck, desc: 'The most critical rule: preserving your trading capital.' },
            { id: 'risk-metrics', title: 'Risk Theory Metrics', icon: Scale, desc: 'Mathematical metrics for measuring portfolio risk.' },
            { id: 'sl-strategy', title: 'Stop loss Strategy', icon: Target, desc: 'Dynamic and fixed stop-loss placement frameworks.' },
            { id: 'trading-psych', title: 'Trading psychology', icon: Brain, desc: 'Managing emotions during high-stakes execution.' },
            { id: 'market-liq', title: 'Market Liquidity', desc: 'Understanding volume vs depth for execution sizing.' },
            { id: 'scalping-lev', title: 'Scalping with leverage', icon: Zap, desc: 'High-leverage short-term execution mechanics.' },
            { id: 'position-sizing-str', title: 'Position Sizing Strategy', desc: 'Calculated lot allocation for every trading setup.' }
        ]
    },
    {
        id: 'psych',
        label: 'Psychology & Education',
        labelSub: 'MENTAL PERFORMANCE',
        items: [
            { id: 'psych-trading', title: 'Psychological Trading', icon: Heart, desc: 'The mental discipline of elite market participants.' },
            { id: 'behavioral-fin', title: 'Behavioral Finance', icon: GraduationCap, desc: 'How human biases affect capital markets.' },
            { id: 'prob-thinking', title: 'Probabilistic thinking', icon: Dices, desc: 'Trading as a game of percentages, not absolutes.' },
            { id: 'bias-awareness', title: 'Bias Awareness', icon: Eye, desc: 'Neutralizing recency and confirmation biases.' },
            { id: 'discipline-cons', title: 'Discipline & Consistency', icon: CheckCircle2, desc: 'Rule-based execution and consistent routine.' },
            { id: 'trading-journal-psych', title: 'Trading Journal Psychology', desc: 'Logging mental states for performance review.' }
        ]
    },
    {
        id: 'execution',
        label: 'Execution Methods',
        labelSub: 'MARKET ACCESS',
        items: [
            { id: 'forex-trading', title: 'Forex Trading', icon: Globe, desc: 'Mechanics and strategies for global currency markets.' },
            { id: 'trend-wave', title: 'Trend Wave Analysis', icon: Waves, desc: 'Cycle analysis and wave-based trend continuation.' },
            { id: 'scalping', title: 'Scalping', icon: Zap, desc: 'Ultra-short timeframe execution for small moves.' },
            { id: 'arbitrate-trading', title: 'Arbitrate Trading', icon: Repeat, desc: 'Multi-exchange and multi-asset price parity trades.' },
            { id: 'portfolio-opt', title: 'Portfolio Optimization', icon: PieChart, desc: 'Optimizing returns across diversified asset classes.' }
        ]
    }
];

export default function StrategiesPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [strategyContent, setStrategyContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenStrategy = async (id: string) => {
        setSelectedId(id);
        setIsLoading(true);

        try {
            const response = await api.get(`/resources/strategies/${id}`);
            if (response.data?.success) {
                setStrategyContent(response.data.data);
            } else {
                throw new Error("Failed to load strategy details");
            }
        } catch (err) {
            console.error("Strategy Fetch Error:", err);
            toast.error("Fetch Failed", { description: "Could not retrieve strategy blueprints." });
            setSelectedId(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans pb-32">
            {/* Header section (premium design) */}
            <div className="max-w-[1600px] mx-auto mb-24">
                <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] font-black tracking-[0.4em] text-brand-500 uppercase mb-4">MMITPS INC • STRATEGIC ALPHA</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-tight mb-6">
                        Trading <span className="text-brand-500">Strategies</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-[11px] md:text-xs max-w-3xl font-bold tracking-widest leading-relaxed uppercase italic mb-10">
                        Developing the best trading strategies is an ongoing process that requires education, discipline, and willingness to adapt.
                        MMITPS INC strategies integrate proprietary technical analysis, risk management, and market psychology.
                    </p>

                    <div className="flex items-center gap-4">
                        <button className="px-8 py-3 rounded-full bg-brand-500 text-black text-[10px] font-black tracking-[0.2em] uppercase hover:bg-surface transition-all">
                            Request Demo
                        </button>
                        <button className="px-8 py-3 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[var(--color-surface-3)] transition-all">
                            Advisory
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="max-w-[1800px] mx-auto space-y-32">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-10">
                        {/* Section Header */}
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em] mb-1">{cat.labelSub}</span>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)] flex items-center gap-3">
                                    {cat.label}
                                    <span className="text-[10px] not-italic px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] font-bold border border-[var(--color-border)]">{cat.items.length} INDEX</span>
                                </h2>
                            </div>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {/* Strategy Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                            {cat.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleOpenStrategy(item.id)}
                                    className="group flex flex-col p-6 bg-[#050505] border border-[var(--color-border)] rounded-lg hover:bg-white/[0.02] hover:border-brand-500/30 transition-all duration-300 relative overflow-hidden text-left h-full"
                                >
                                    <div className="absolute top-4 right-4 text-[7px] font-bold text-white/5 uppercase tracking-widest group-hover:text-brand-500/20 transition-colors">MMITPS INC</div>

                                    <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
                                        {item.icon ? (
                                            <item.icon className="w-6 h-6 text-[var(--color-text-muted)] group-hover:text-brand-500 transition-all" />
                                        ) : (
                                            <Gem className="w-6 h-6 text-[var(--color-text-muted)] group-hover:text-brand-500 transition-all" />
                                        )}
                                    </div>

                                    <h3 className="text-sm font-black italic tracking-tighter uppercase text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors mb-2 line-clamp-1">
                                        {item.title}
                                    </h3>

                                    <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase leading-relaxed tracking-wide group-hover:text-[var(--color-text-secondary)] transition-colors line-clamp-2">
                                        {item.desc || "proprietary institutional trading strategy for professional execution."}
                                    </p>

                                    {/* Bottom Info */}
                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500/30 group-hover:bg-brand-500 transition-colors" />
                                            <span className="text-[8px] font-black uppercase text-white/10 group-hover:text-[var(--color-text-muted)] transition-colors tracking-widest">Active</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-white/5 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                                    </div>

                                    {/* Decorative subtle glow */}
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Branding */}
            <div className="max-w-[1800px] mx-auto mt-40 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="px-4 py-1.5 rounded-full bg-brand-500/5 border border-brand-500/10 text-[8px] font-black text-brand-500 uppercase tracking-widest">Risk Warning</div>
                    <div className="px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Compliant</div>
                </div>
                <p className="text-[10px] font-black text-white/10 tracking-[0.5em] uppercase italic underline underline-offset-8 decoration-brand-500/30">MMITPS INC — TRADING STRATEGY MATRIX</p>
            </div>

            {/* Strategy Detail Modal */}
            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <DialogContent className="max-w-4xl bg-[#080808] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden text-[var(--color-text-primary)]">
                    {isLoading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-6">
                            <RefreshCw className="w-12 h-12 text-brand-500 animate-spin" />
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black italic uppercase tracking-tighter">Initializing Blueprints</span>
                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.4em] mt-2">Connecting to secure strategy server...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <DialogHeader className="p-10 pb-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="px-3 py-1 rounded-full bg-brand-500 text-black text-[8px] font-black uppercase tracking-widest">Institutional</div>
                                    <div className="px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-[8px] font-black uppercase tracking-widest">v2.4.0</div>
                                </div>
                                <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">
                                    {strategyContent?.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-bold italic">
                                    Strategic Alpha Engine • Last Profile Update: {strategyContent?.lastUpdated}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-10 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="prose prose-invert max-w-none">
                                    <div className="bg-white/[0.03] border border-[var(--color-border)] rounded-lg p-8 mb-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <AlertTriangle className="w-5 h-5 text-brand-500" />
                                            <span className="text-sm font-black italic uppercase tracking-widest text-brand-500">Execution Alert</span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium italic">
                                            This framework is designed for high-precision institutional execution. Improper application of leverage or disregard for the core principles outlined here can lead to significant drawdown.
                                        </p>
                                    </div>

                                    {/* Strategy Content rendering */}
                                    <div className="space-y-6 text-[var(--color-text-primary)]">
                                        {strategyContent?.content.split('\n\n').map((para: string, idx: number) => (
                                            <p key={idx} className="text-sm leading-relaxed font-medium">
                                                {para.startsWith('###') ? (
                                                    <span className="text-lg font-black italic uppercase tracking-tight text-[var(--color-text-primary)] block mb-2">{para.replace('### ', '')}</span>
                                                ) : para.startsWith('####') ? (
                                                    <span className="text-sm font-black uppercase tracking-widest text-brand-500 block mb-1">{para.replace('#### ', '')}</span>
                                                ) : para.startsWith('- ') ? (
                                                    <span className="block pl-4 border-l-2 border-brand-500/30 py-1">{para}</span>
                                                ) : (
                                                    para
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-[var(--color-border)] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-card border-2 border-[#080808] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)]">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">142 Traders Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toast.success("Strategy Bookmarked", { description: "Added to your personal research lab." })}
                                        className="px-6 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[var(--color-surface-3)] transition-all"
                                    >
                                        Bookmark
                                    </button>
                                    <button
                                        onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), {
                                            loading: "Initializing execution engine...",
                                            success: "Terminal Sync Successful",
                                            error: "Sync Failed"
                                        })}
                                        className="px-8 py-3 rounded-lg bg-brand-500 text-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-surface transition-all shadow-lg shadow-brand-500/10"
                                    >
                                        Deploy to Terminal
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Custom Styles for scrollbar */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.4);
                }
            `}</style>
        </div>
    );
}
