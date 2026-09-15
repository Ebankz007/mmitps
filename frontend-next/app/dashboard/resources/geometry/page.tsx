"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Activity,
    Compass,
    Zap,
    ShieldCheck,
    ChevronRight,
    BarChart3,
    Hexagon,
    Triangle,
    GitBranch,
    Eye,
    Cpu
} from "lucide-react";
import { clsx } from "clsx";

const TOOLS = [
    {
        id: "pro-max",
        label: "Geometry Intelligence Pro Max",
        badge: "PRO",
        badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        icon: Hexagon,
        iconColor: "text-amber-500",
        glowColor: "bg-amber-500/5",
        borderHover: "hover:border-amber-500/30",
        description:
            "Full formation scanner with XABCD harmonic overlays, Andrews Pitchfork analysis, and TradeSeeker™ confluence scoring.",
        features: ["Harmonic Pattern Detection", "Structural BOS/CHoCH", "Pitchfork Median Lines", "PRZ Confluence Engine"],
        href: "/dashboard/resources/geometry/pro-max",
    },
    {
        id: "patterns",
        label: "Chart & Candle Scanner",
        badge: "NEW",
        badgeColor: "text-brand-500 bg-brand-500/10 border-brand-500/20",
        icon: BarChart3,
        iconColor: "text-brand-500",
        glowColor: "bg-brand-500/5",
        borderHover: "hover:border-brand-500/30",
        description:
            "Dedicated scanner for classic chart formations (wedges, flags, head & shoulders) and candlestick reversal patterns.",
        features: ["Candlestick Reversals", "Classic Chart Patterns", "Breakout Detection"],
        href: "/dashboard/resources/geometry/patterns",
    },
];

const PATTERN_TYPES = [
    {
        icon: Triangle,
        label: "Harmonic Patterns",
        description: "XABCD structures including Bat, Gartley, Butterfly, Crab and Deep Crab",
        color: "text-amber-500",
        bg: "bg-amber-500/5",
        border: "border-amber-500/10",
    },
    {
        icon: GitBranch,
        label: "Market Structure",
        description: "Break of Structure (BOS) and Change of Character (CHoCH) detection across timeframes",
        color: "text-brand-400",
        bg: "bg-brand-500/5",
        border: "border-brand-500/10",
    },
    {
        icon: Compass,
        label: "Pitchfork Analysis",
        description: "Andrews Pitchfork with median lines, Schiff, and Modified Schiff variants",
        color: "text-green-400",
        bg: "bg-green-500/5",
        border: "border-green-500/10",
    },
    {
        icon: BarChart3,
        label: "Classic Formations",
        description: "Wedges, flags, pennants, head & shoulders and all standard price formations",
        color: "text-brand-400",
        bg: "bg-brand-500/5",
        border: "border-brand-500/10",
    },
];

const STATS = [
    { label: "Patterns Tracked", value: "24+", sub: "across all categories" },
    { label: "Avg Confluence", value: "87%", sub: "composite score" },
    { label: "Timeframes", value: "9", sub: "M1 to Monthly" },
    { label: "Markets Covered", value: "50+", sub: "Forex, Metals, Indices" },
];

export default function GeometryOverviewPage() {
    const router = useRouter();
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">

            {/* ── Hero ── */}
            <div className="relative bg-gradient-to-br from-[#0D0D0D] via-[#111111] to-[#0D0D0D] border border-[var(--color-border)] rounded-lg p-10 lg:p-14 overflow-hidden">
                {/* Glow blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[140px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-500/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

                {/* SVG decorative pattern */}
                <svg className="absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden lg:block" width="320" height="320" viewBox="0 0 320 320">
                    <polygon points="160,20 300,240 20,240" fill="none" stroke="#10b981" strokeWidth="2" />
                    <polygon points="160,60 270,230 50,230" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="6,4" />
                    <circle cx="160" cy="240" r="6" fill="#10b981" />
                    <circle cx="20" cy="240" r="6" fill="#10b981" />
                    <circle cx="300" cy="240" r="6" fill="#10b981" />
                    <circle cx="160" cy="20" r="6" fill="#10b981" />
                    <line x1="160" y1="20" x2="160" y2="240" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                </svg>

                <div className="relative z-10 space-y-5 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <Activity className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Formation Intelligence Suite</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
                        Market <span className="text-amber-500">Geometry</span>
                    </h1>
                    <p className="text-gray-400 text-base font-medium leading-relaxed">
                        Identify institutional footprints through harmonic structures, price geometry, and dynamic structural analysis. Every formation carries a probability — know yours before entering.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            onClick={() => router.push("/dashboard/resources/geometry/pro-max")}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
                        >
                            <Cpu className="h-4 w-4" />
                            Launch Pro Max Scanner
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] text-xs font-black uppercase tracking-widest rounded-lg border border-[var(--color-border)] transition-all">
                            <Eye className="h-4 w-4" />
                            View Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats Bar ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s, i) => (
                    <div key={i} className="bg-surface border border-[var(--color-border)] rounded-lg p-6 text-center">
                        <div className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">{s.value}</div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">{s.label}</div>
                        <div className="text-[10px] text-gray-500 font-bold mt-0.5">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Pattern Type Grid ── */}
            <div>
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-5">What We Detect</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PATTERN_TYPES.map((p) => (
                        <div key={p.label} className={clsx("p-6 rounded-lg border", p.bg, p.border)}>
                            <div className={clsx("mb-4", p.color)}>
                                <p.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight mb-2">{p.label}</h3>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{p.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tool Cards ── */}
            <div>
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-5">Available Tools</h2>
                <div className="grid grid-cols-1 gap-5">
                    {TOOLS.map((tool) => (
                        <div
                            key={tool.id}
                            onClick={() => router.push(tool.href)}
                            onMouseEnter={() => setHovered(tool.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={clsx(
                                "group relative bg-surface border border-[var(--color-border)] rounded-lg p-8 cursor-pointer transition-all duration-300 overflow-hidden",
                                tool.borderHover
                            )}
                        >
                            {/* Card glow on hover */}
                            <div className={clsx(
                                "absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 transition-opacity duration-500 pointer-events-none",
                                tool.glowColor,
                                hovered === tool.id ? "opacity-100" : "opacity-0"
                            )} />

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                                <div className={clsx("p-5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] shrink-0", tool.iconColor)}>
                                    <tool.icon className="h-8 w-8" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                                            {tool.label}
                                        </h3>
                                        <span className={clsx("text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest", tool.badgeColor)}>
                                            {tool.badge}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">{tool.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tool.features.map((f) => (
                                            <span key={f} className="text-[10px] font-black text-gray-500 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg uppercase tracking-widest">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <div className="p-3 bg-[var(--color-surface-2)] group-hover:bg-amber-500/10 border border-[var(--color-border)] group-hover:border-amber-500/30 rounded-lg transition-all">
                                        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-amber-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Educational Callout ── */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 flex flex-col lg:flex-row items-center gap-8">
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-lg shrink-0">
                    <ShieldCheck className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-2">Why Geometry Matters</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        Price doesn't move randomly. Institutional algorithms execute at geometric ratios derived from Fibonacci mathematics.
                        Recognising these formations lets you anticipate potential reversal zones (PRZ) before retail traders even notice the setup —
                        giving you a structured, rules-based edge on every trade.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/resources/geometry/pro-max")}
                    className="shrink-0 flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest rounded-lg border border-amber-500/20 transition-all whitespace-nowrap"
                >
                    <Zap className="h-4 w-4" />
                    Open Scanner
                </button>
            </div>

        </div>
    );
}
