/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
    Target,
    ChevronRight,
    TrendingUp,
    BarChart3,
    Zap,
    Bitcoin,
    Bot,
    Clock,
    PlayCircle,
    CheckCircle2,
    Flame,
    Award,
    Library
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function LearningTracksPage() {
    const [activeTrack, setActiveTrack] = useState({
        title: "Forex Trading Professional",
        stage: 2,
        totalStages: 5,
        progress: 35
    });

    const tracks = [
        {
            id: "forex-prof",
            title: "Forex Trading Professional",
            description: "Master forex trading from currency basics to advanced institutional strategies. Includes 5 courses, 45 video lessons, and live trading simulations.",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500",
            badges: ["POPULAR", "IN PROGRESS"],
            progress: 35,
            stats: { courses: 5, videos: 45, hours: 32, quizzes: 12 },
            stages: [
                { name: "Basics", completed: true },
                { name: "Technical", active: true },
                { name: "Fundamental", completed: false },
                { name: "Strategies", completed: false },
                { name: "Mastery", completed: false }
            ]
        },
        {
            id: "tech-expert",
            title: "Technical Analysis Expert",
            description: "Become a chart reading expert. Master candlesticks, indicators, patterns, and multi-timeframe analysis used by professional traders.",
            icon: BarChart3,
            color: "text-brand-500",
            bg: "bg-brand-500",
            badges: ["BESTSELLER"],
            progress: 0,
            stats: { courses: 4, videos: 38, hours: 26, quizzes: 10 },
            stages: [
                { name: "Foundation", completed: false },
                { name: "Indicators", completed: false },
                { name: "Patterns", completed: false },
                { name: "MTF Analysis", completed: false }
            ]
        },
        {
            id: "crypto-spec",
            title: "Crypto Trading Specialist",
            description: "Complete cryptocurrency education covering Bitcoin, altcoins, DeFi, NFTs, and on-chain analysis for profitable crypto trading.",
            icon: Bitcoin,
            color: "text-brand-500",
            bg: "bg-brand-500",
            badges: ["TRENDING"],
            progress: 0,
            stats: { courses: 5, videos: 42, hours: 30, quizzes: 8 },
            stages: [
                { name: "Blockchain", completed: false },
                { name: "Trading", completed: false },
                { name: "DeFi", completed: false },
                { name: "On-Chain", completed: false }
            ]
        },
        {
            id: "algo-dev",
            title: "Algo Trading Developer",
            description: "Learn to code trading bots, backtest strategies, and deploy automated systems on MT4/MT5 and cloud platforms.",
            icon: Bot,
            color: "text-brand-500",
            bg: "bg-brand-500",
            badges: ["ADVANCED"],
            progress: 0,
            stats: { courses: 6, videos: 52, hours: 40, projects: 15 },
            stages: [
                { name: "MQL5", completed: false },
                { name: "Python", completed: false },
                { name: "Backtesting", completed: false },
                { name: "Deployment", completed: false }
            ]
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-[#30f2ff]">
                    <Target size={28} fill="currentColor" />
                    <h2 className="text-2xl font-black tracking-tight uppercase">Learning Tracks</h2>
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10">
                    Follow structured paths from beginner to professional trader
                </p>
            </div>

            {/* Active Track Banner */}
            {activeTrack && (
                <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-surface-2)]">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-500 transition-all duration-1000"
                            style={{ width: `${activeTrack.progress}%` }}
                        />
                    </div>
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">Your Active Track</span>
                            </div>
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">{activeTrack.title}</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Stage {activeTrack.stage} of {activeTrack.totalStages} • {activeTrack.progress}% Complete
                            </p>
                        </div>
                        <Link
                            href={`/dashboard/education/tracks/${activeTrack.title.toLowerCase().replace(/ /g, '-')}`}
                            className="bg-[#059669] text-[var(--color-text-primary)] px-8 py-4 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 hover:translate-y-[-2px] transition-all shadow-[0_10px_30px_rgba(30,78,219,0.3)] shrink-0"
                        >
                            Continue Learning <ChevronRight size={14} strokeWidth={3} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Tracks List */}
            <div className="space-y-8">
                {tracks.map((track) => (
                    <div key={track.id} className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch group hover:border-[var(--color-border)] transition-all">
                        {/* Icon Block */}
                        <div className={cn("lg:w-48 shrink-0 flex items-center justify-center p-12 transition-all duration-700", track.bg)}>
                            <div className="p-6 bg-surface shadow-2xl rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <track.icon size={48} className="text-black" />
                            </div>
                        </div>

                        {/* Content Block */}
                        <div className="flex-1 p-8 lg:p-12 space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {track.badges.map(badge => (
                                            <span key={badge} className={cn(
                                                "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                badge === 'IN PROGRESS' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                    badge === 'POPULAR' ? "bg-[#ce8dfb]/20 text-[#ce8dfb] border border-[#ce8dfb]/30" :
                                                        badge === 'BESTSELLER' ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" :
                                                            badge === 'TRENDING' ? "bg-brand-500/20 text-brand-400 border border-orange-500/30" :
                                                                "bg-[var(--color-surface-2)] text-gray-500 border border-[var(--color-border)]"
                                            )}>
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-none group-hover:text-brand-400 transition-colors">
                                        {track.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-3xl">
                                        {track.description}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">{track.progress}%</div>
                                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{track.progress > 0 ? 'Complete' : 'Not Started'}</div>
                                </div>
                            </div>

                            {/* Segmented Stages */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
                                {track.stages.map((stage: any, idx) => (
                                    <div
                                        key={stage.name}
                                        className={cn(
                                            "relative p-5 rounded-lg border text-center transition-all",
                                            stage.completed || stage.active
                                                ? "bg-white/[0.03] border-[var(--color-border)]"
                                                : "bg-transparent border-[var(--color-border)] opacity-40"
                                        )}
                                    >
                                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{idx + 1}</div>
                                        <div className={cn(
                                            "text-[10px] font-black uppercase tracking-widest truncate",
                                            stage.active ? "text-brand-400" : "text-[var(--color-text-primary)]"
                                        )}>
                                            {stage.name}
                                        </div>
                                        {stage.completed && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-[var(--color-text-primary)] rounded-full p-1 shadow-lg border-2 border-[#0A1224]">
                                                <CheckCircle2 size={10} strokeWidth={4} />
                                            </div>
                                        )}
                                        {stage.active && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-brand-500 text-[var(--color-text-primary)] rounded-full p-1 shadow-lg border-2 border-[#0A1224] animate-bounce">
                                                <TrendingUp size={10} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Stats & CTA */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6 border-t border-[var(--color-border)]">
                                <div className="flex flex-wrap items-center gap-8">
                                    {Object.entries(track.stats).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                                            <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tighter">
                                                {val} <span className="text-gray-600 font-bold ml-1">{key.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`/dashboard/education/tracks/${track.id}`}
                                    className={cn(
                                        "px-10 py-4 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 transition-all",
                                        track.progress > 0
                                            ? "bg-[#059669] text-[var(--color-text-primary)] shadow-[0_10px_30px_rgba(30,78,219,0.3)]"
                                            : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
                                    )}
                                >
                                    {track.progress > 0 ? (
                                        <>Continue <ChevronRight size={14} /></>
                                    ) : (
                                        <>Start Track <ChevronRight size={14} /></>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advisory Note */}
            <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="p-6 bg-emerald-500/10 rounded-lg shrink-0 text-emerald-500">
                    <Award size={48} />
                </div>
                <div className="space-y-3">
                    <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Institutional Pathway Advisory</h4>
                    <p className="text-sm text-gray-500 font-bold uppercase leading-relaxed tracking-widest">
                        Learning tracks are high-density architectural paths. Each module is prerequisite for the next. We strictly recommend completing the <span className="text-emerald-500">Forex Professional</span> track before attempting <span className="text-brand-500">Algo Trading Development</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
