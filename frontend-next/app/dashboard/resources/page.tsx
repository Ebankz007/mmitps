"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
    Compass,
    LineChart,
    Calendar,
    FileSearch,
    Target,
    Activity,
    BarChart3,
    Clock,
    Eye,
    Brain,
    Book,
    Gamepad2,
    Copy,
    Tv,
    Coins,
    Server,
    ArrowUpRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResourceCard {
    id: string;
    label: string;
    description: string;
    icon: any;
    href: string;
    category: "analysis" | "trading" | "education" | "infrastructure";
    stats?: { label: string; value: string; color: string };
}

const RESOURCES: ResourceCard[] = [
    {
        id: "macro",
        label: "Global Macro",
        description: "Analyze cross-asset fundamental global financial markets strength.",
        icon: Compass,
        href: "/dashboard/resources/macro",
        category: "analysis",
        stats: { label: "Indicators", value: "12 Active", color: "text-brand-400" }
    },
    {
        id: "cot",
        label: "COT Data",
        description: "Institutional positioning and sentiment through Commitment of Traders.",
        icon: LineChart,
        href: "/dashboard/resources/cot",
        category: "analysis",
        stats: { label: "Sentiment", value: "Bullish", color: "text-green-400" }
    },
    {
        id: "seasonality",
        label: "Seasonality",
        description: "Historical price tendencies and recurring seasonal patterns.",
        icon: Calendar,
        href: "/dashboard/resources/seasonality/heatmap",
        category: "analysis",
        stats: { label: "Probabilities", value: "+75%", color: "text-brand-400" }
    },
    {
        id: "contracts",
        label: "Contract Specs",
        description: "Detailed parameters for global trading instruments and assets.",
        icon: FileSearch,
        href: "/dashboard/resources/contracts/eduhub",
        category: "infrastructure",
        stats: { label: "Assets", value: "500+", color: "text-cyan-400" }
    },
    {
        id: "quant",
        label: "Quantitative Methodology",
        description: "Advanced mathematical modeling and quantitative trading systems.",
        icon: Target,
        href: "/dashboard/resources/quant/calculators",
        category: "trading",
        stats: { label: "Accuracy", value: "92.4%", color: "text-emerald-400" }
    },
    {
        id: "geometry",
        label: "Geometry Intelligence",
        description: "Geometric pattern recognition and price-action harmonic analysis.",
        icon: Activity,
        href: "/dashboard/resources/geometry",
        category: "analysis",
        stats: { label: "Confluence", value: "High", color: "text-brand-400" }
    },
    {
        id: "vmid",
        label: "MMITPS-VMID PRO",
        description: "Volumetric market intelligence and distribution profiles.",
        icon: BarChart3,
        href: "/dashboard/resources/vmid/pro",
        category: "analysis",
        stats: { label: "Volume", value: "Real-time", color: "text-pink-400" }
    },
    {
        id: "ptd",
        label: "MMITPS-PTD PRO",
        description: "Predictive time and direction forecasting algorithms.",
        icon: Clock,
        href: "/dashboard/resources/ptd/pro",
        category: "trading",
        stats: { label: "Signals", value: "Active", color: "text-brand-400" }
    },
    {
        id: "sentiment",
        label: "Sentimental Methodology",
        description: "Retail vs Institutional sentiment divergence analysis.",
        icon: Eye,
        href: "/dashboard/resources/sentiment/retail",
        category: "analysis",
        stats: { label: "Bias", value: "Neutral", color: "text-yellow-400" }
    },
    {
        id: "ai-analyst",
        label: "AI Agent Analyst",
        description: "Autonomous artificial intelligence market analysis and insights.",
        icon: Brain,
        href: "/dashboard/resources/ai-analyst",
        category: "analysis",
        stats: { label: "Uptime", value: "100%", color: "text-[var(--color-text-primary)]" }
    },
    {
        id: "journal",
        label: "Trade Journal",
        description: "Comprehensive trading log for performance tracking and review.",
        icon: Book,
        href: "/dashboard/resources/journal",
        category: "trading",
        stats: { label: "Trades", value: "128", color: "text-zinc-400" }
    },
    {
        id: "tcp",
        label: "TradeControl Panel",
        description: "Centralized execution and position management console.",
        icon: Gamepad2,
        href: "/dashboard/resources/tcp/positions",
        category: "trading",
        stats: { label: "Status", value: "Connected", color: "text-green-500" }
    },
    {
        id: "copy-trading",
        label: "Copy Trading",
        description: "Automated social trading following master trader strategies.",
        icon: Copy,
        href: "/dashboard/resources/copy-trading",
        category: "trading",
        stats: { label: "Followers", value: "1.2k", color: "text-brand-500" }
    },
    {
        id: "livestream",
        label: "Live Stream",
        description: "Real-time market analysis and trading floor broadcasts.",
        icon: Tv,
        href: "/dashboard/resources/livestream",
        category: "education",
        stats: { label: "Live", value: "Now", color: "text-red-500" }
    },
    {
        id: "token-pool",
        label: "Tokenization Pool",
        description: "Diversified asset groups and staking reward systems.",
        icon: Coins,
        href: "/dashboard/resources/token-pool/all",
        category: "infrastructure",
        stats: { label: "TVL", value: "$3.4M", color: "text-yellow-500" }
    },
    {
        id: "vps",
        label: "VPS Station",
        description: "Ultra-low latency virtual private server hosting infrastructure.",
        icon: Server,
        href: "/dashboard/resources/vps",
        category: "infrastructure",
        stats: { label: "Latency", value: "1ms", color: "text-cyan-500" }
    }
];

export default function ResourcesOverview() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const filteredResources = RESOURCES.filter(res => {
        const matchesSearch = res.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "all" || res.category === activeCategory;
        const hasAccess = user?.role === "admin" || user?.role === "super_admin" ||
            (res.id !== "vps" && res.id !== "token-pool"); // Basic mockup access logic

        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "analysis", "trading", "infrastructure", "education"];

    return (
        <div className="flex flex-col min-h-screen bg-black text-[var(--color-text-primary)] p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        RESOURCES HUB <span className="text-brand-500">PRO</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-xl">
                        Central intelligence center for all MMITPS proprietary trading tools, quantitative methodologies,
                        and infrastructure resources.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            activeCategory === cat
                                ? "bg-brand-500 text-[var(--color-text-primary)] shadow-lg shadow-brand-500/20"
                                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-secondary)]"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.map((resource) => (
                    <Link
                        key={resource.id}
                        href={resource.href}
                        className="group relative bg-surface border border-[var(--color-border)] rounded-lg p-6 transition-all duration-300 hover:border-brand-500/30 hover:bg-surface/80 hover:-translate-y-1 overflow-hidden"
                    >
                        {/* Status Light */}
                        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] group-hover:border-brand-500/20 transition-colors">
                            <div className={cn("h-1 w-1 rounded-full animate-pulse", resource.category === 'trading' ? 'bg-green-400' : 'bg-cyan-400')} />
                            <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)] tracking-tight">{resource.category}</span>
                        </div>

                        {/* Icon */}
                        <div className="w-12 h-12 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-500 group-hover:text-[var(--color-text-primary)] transition-all duration-300">
                            <resource.icon className="h-6 w-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] transition-colors mb-2">
                            {resource.label}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-8 min-h-[48px]">
                            {resource.description}
                        </p>

                        {/* Bottom Stats */}
                        <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                            {resource.stats && (
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest">{resource.stats.label}</span>
                                    <span className={cn("text-xs font-black", resource.stats.color)}>{resource.stats.value}</span>
                                </div>
                            )}
                            <div className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-all">
                                <ArrowUpRight className="h-3 w-3 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
                            </div>
                        </div>

                        {/* Hover Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {filteredResources.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-[var(--color-surface-2)] border border-[var(--color-border)] border-dashed rounded-lg">
                    <Search className="h-12 w-12 text-white/10 mb-4" />
                    <h3 className="text-xl font-bold text-[var(--color-text-secondary)]">No tools found matching your search.</h3>
                    <button
                        onClick={() => { setSearchQuery(""); setActiveCategory("all") }}
                        className="mt-4 text-brand-500 text-sm font-bold hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}
