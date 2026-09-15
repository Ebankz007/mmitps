/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
    Play,
    Search,
    ChevronDown,
    Clock,
    Eye,
    Video,
    TrendingUp,
    Zap,
    BarChart3,
    ShieldCheck,
    Newspaper,
    Bot,
    PlayCircle,
    Calendar,
    User,
    ArrowRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CATEGORIES = [
    { name: "All", count: 125, icon: Video },
    { name: "Technical", count: 42, icon: BarChart3 },
    { name: "Fundamental", count: 18, icon: Newspaper },
    { name: "Strategies", count: 28, icon: TrendingUp },
    { name: "Platform", count: 15, icon: Bot },
    { name: "Live Sessions", count: 22, icon: Zap }
];

export default function VideoLibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const featuredVideo = {
        title: "Live Trading Session: NFP Release",
        description: "Watch how professional traders navigate high-impact news events. Real-time analysis, entry execution, and risk management during Non-Farm Payrolls.",
        instructor: "Michael Chen",
        date: "Jan 28, 2026",
        views: "12.4k views",
        duration: "1:24:35",
        category: "LIVE RECORDING",
        isNew: true
    };

    const videos = [
        {
            id: "1",
            title: "Mastering Fibonacci Retracements",
            instructor: "Sarah Williams",
            views: "8.2k",
            duration: "32:15",
            category: "TECHNICAL ANALYSIS",
            color: "bg-brand-600",
            icon: BarChart3
        },
        {
            id: "2",
            title: "Breakout Trading Strategy Explained",
            instructor: "James Martinez",
            views: "15.7k",
            duration: "45:20",
            category: "STRATEGIES",
            color: "bg-[#10b981]",
            icon: TrendingUp
        },
        {
            id: "3",
            title: "The 2% Rule: Protecting Your Capital",
            instructor: "Alex Thompson",
            views: "22.1k",
            duration: "28:45",
            category: "RISK MANAGEMENT",
            color: "bg-emerald-500",
            icon: ShieldCheck
        },
        {
            id: "4",
            title: "Reading Economic Data Like a Pro",
            instructor: "Emma Davis",
            views: "9.5k",
            duration: "52:10",
            category: "FUNDAMENTAL",
            color: "bg-brand-500",
            icon: Newspaper
        },
        {
            id: "5",
            title: "Setting Up MMITPS Trading Bots",
            instructor: "MMITPS Team",
            views: "31.2k",
            duration: "18:30",
            category: "PLATFORM",
            color: "bg-[#ce8dfb]",
            icon: Bot
        },
        {
            id: "6",
            title: "Major vs Minor Currency Pairs",
            instructor: "David Kim",
            views: "14.3k",
            duration: "41:10",
            category: "FOREX",
            color: "bg-sky-500",
            icon: TrendingUp
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
            {/* Header Area */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-rose-500">
                        <Video size={28} fill="currentColor" />
                        <h2 className="text-2xl font-black tracking-tight uppercase">Video Library</h2>
                    </div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-10">
                        125+ professional trading video lessons
                    </p>
                </div>

                {/* Main Filter Bar */}
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="relative flex-1 group w-full lg:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 transition-colors group-hover:text-rose-500" />
                        <input
                            type="text"
                            placeholder="Search videos..."
                            className="w-full bg-[#0A1224] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] placeholder-gray-700 outline-none hover:border-[var(--color-border)] transition-all focus:border-rose-500/50"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative group flex-1">
                            <select className="w-full appearance-none bg-[#0A1224] border border-[var(--color-border)] rounded-lg py-4 pl-6 pr-12 text-xs font-black uppercase tracking-widest text-[#ce8dfb] outline-none hover:border-[var(--color-border)] transition-all cursor-pointer">
                                <option>All Categories</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>
                        <div className="relative group flex-1">
                            <select className="w-full appearance-none bg-[#0A1224] border border-[var(--color-border)] rounded-lg py-4 pl-6 pr-12 text-xs font-black uppercase tracking-widest text-[#ce8dfb] outline-none hover:border-[var(--color-border)] transition-all cursor-pointer">
                                <option>All Duration</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Category Chips */}
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                                "flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all whitespace-nowrap active:scale-95 group",
                                selectedCategory === cat.name
                                    ? "bg-rose-500 border-rose-500 text-[var(--color-text-primary)] shadow-[0_10px_20px_rgba(244,63,94,0.3)]"
                                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-gray-500 hover:border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            <cat.icon size={12} className={cn(selectedCategory === cat.name ? "text-[var(--color-text-primary)]" : "text-gray-600 group-hover:text-rose-500")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.name} ({cat.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Video Hero */}
            <div className="relative bg-[#0A1224] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl group flex flex-col lg:flex-row">
                {/* Thumbnail Layer */}
                <div className="lg:w-[60%] aspect-video relative group/thumb overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-[#0A1224] flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose-500 text-[var(--color-text-primary)] flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.5)] group-hover/thumb:scale-110 transition-transform duration-700 z-20">
                            <Play size={32} fill="currentColor" className="ml-1" />
                        </div>
                    </div>
                    {/* Fake progress/status overlays */}
                    <div className="absolute top-8 left-8 z-20">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg border border-rose-500/30">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase text-rose-500 tracking-[0.2em]">{featuredVideo.category}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-8 z-20 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-[var(--color-text-primary)]">
                        {featuredVideo.duration}
                    </div>
                </div>

                {/* Content Layer */}
                <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center gap-6 relative">
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-rose-500/20">Featured</span>
                        {featuredVideo.isNew && <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-amber-500/20">New</span>}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-none group-hover:text-rose-400 transition-colors">
                            {featuredVideo.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-bold uppercase leading-relaxed tracking-widest max-w-lg">
                            {featuredVideo.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[var(--color-border)]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-rose-500 border border-[var(--color-border)]">
                                <User size={14} />
                            </div>
                            <span className="text-[9px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">{featuredVideo.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600">
                            <Calendar size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{featuredVideo.date}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600">
                            <Eye size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{featuredVideo.views}</span>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/education/videos/nfp-live"
                        className="bg-rose-500 text-[var(--color-text-primary)] px-10 py-4 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all shadow-[0_10px_30px_rgba(244,63,94,0.3)] w-full lg:w-fit active:scale-95"
                    >
                        Watch Now <ArrowRight size={14} strokeWidth={3} />
                    </Link>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {videos.map((video) => (
                    <div key={video.id} className="group flex flex-col space-y-5">
                        {/* Thumbnail Container */}
                        <div className={cn(
                            "relative aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center transition-all duration-700 p-8",
                            video.color
                        )}>
                            {/* Decorative Grid/Noise? */}
                            <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                            {/* Central Icon */}
                            <div className="p-8 bg-[var(--color-surface-3)] backdrop-blur-xl rounded-lg border border-[var(--color-border-hover)] shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                                <video.icon size={56} className="text-[var(--color-text-primary)] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                            </div>

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-16 h-16 rounded-full bg-surface text-black flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                                    <Play size={24} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                                </div>
                            </div>

                            {/* Duration Badge */}
                            <div className="absolute bottom-6 right-6 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[9px] font-black text-[var(--color-text-primary)] border border-[var(--color-border)]">
                                {video.duration}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="px-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{video.category}</span>
                            </div>
                            <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-none group-hover:text-rose-400 transition-colors">
                                {video.title}
                            </h4>
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-gray-600 border border-[var(--color-border)]">
                                        <User size={10} />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{video.instructor}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                    <Eye size={12} />
                                    <span className="text-[9px] font-black tracking-widest">{video.views}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center pt-8">
                <button className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-gray-400 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-border-hover)] px-12 py-5 rounded-lg text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-xl">
                    Load More Videos
                </button>
            </div>
        </div>
    );
}
