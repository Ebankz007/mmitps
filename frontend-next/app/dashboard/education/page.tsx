/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { educationService, EducationStats, UserProgress } from "@/lib/api/education";
import { useLanguage } from "@/lib/language-context";
import {
    GraduationCap,
    PlayCircle,
    FileText,
    Trophy,
    Zap,
    ChevronRight,
    Search,
    Clock,
    Library,
    Mountain,
    Clapperboard,
    BookOpen,
    Layout
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function EducationHubPage() {
    const { t } = useLanguage();
    const [stats, setStats] = useState<EducationStats | null>(null);
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [s, p] = await Promise.all([
                    educationService.getLearningStats(),
                    educationService.getMyProgress()
                ]);
                setStats(s);
                setProgress(p);
            } catch (error) {
                console.error("Failed to load education data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-2 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('edu_syncing')}</p>
            </div>
        );
    }

    const categories = [
        {
            label: "All Courses",
            sub: "Browse 45+ courses",
            icon: Library,
            href: "/dashboard/education/courses",
            color: "text-brand-500",
            bg: "bg-brand-500/10"
        },
        {
            label: "Learning Tracks",
            sub: "12 structured paths",
            icon: Mountain,
            href: "/dashboard/education/tracks",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Speed Run",
            sub: "Quick crash courses",
            icon: Zap,
            href: "/dashboard/education/speed-run",
            color: "text-brand-500",
            bg: "bg-brand-500/10"
        },
        {
            label: "Video Library",
            sub: "125+ video lessons",
            icon: Clapperboard,
            href: "/dashboard/education/videos",
            color: "text-gray-400",
            bg: "bg-[var(--color-surface-2)]"
        },
        {
            label: "PDF Library",
            sub: "45+ downloadables",
            icon: FileText,
            href: "/dashboard/education/pdf",
            color: "text-gray-400",
            bg: "bg-[var(--color-surface-2)]"
        },
        {
            label: "Certificates",
            sub: "Your achievements",
            icon: Trophy,
            href: "/dashboard/education/certificates",
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-[#ce8dfb]">
                    <GraduationCap size={28} fill="currentColor" />
                    <h2 className="text-2xl font-black tracking-tight uppercase">MMITPS Trading Academy</h2>
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10">
                    Master the markets with our comprehensive trading education
                </p>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#0A1224] border border-[var(--color-border)] rounded-lg shadow-2xl p-1 md:p-1.5">
                <div className="relative bg-[#0D1529] border border-[var(--color-border)] rounded-[2.3rem] p-10 md:p-16 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-3 bg-[#ce8dfb] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ce8dfb]">Start Your Journey</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase leading-[1.1]">
                                Transform from Beginner to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Professional Trader</span>
                            </h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                                Join over 50,000 traders who have accelerated their trading careers with MMITPS Academy. From forex basics to advanced algorithmic strategies.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/dashboard/education/tracks"
                                className="bg-[#059669] text-[var(--color-text-primary)] px-10 py-5 rounded-lg font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:translate-y-[-2px] transition-all shadow-[0_15px_40px_rgba(30,78,219,0.3)]"
                            >
                                Start Learning Track <ChevronRight size={14} strokeWidth={3} />
                            </Link>
                            <Link
                                href="/dashboard/education/speed-run"
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-8 py-5 rounded-lg font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:bg-[var(--color-surface-3)] transition-all hover:translate-y-[-2px]"
                            >
                                <Zap size={14} className="text-[#10b981]" fill="currentColor" />
                                Quick Start Guide
                            </Link>
                        </div>
                    </div>

                    {/* Academy Stats */}
                    <div className="flex flex-col gap-4 w-full lg:w-48">
                        <div className="p-8 bg-black/40 backdrop-blur-xl border border-[var(--color-border)] rounded-lg text-center space-y-1">
                            <div className="text-3xl font-black text-brand-500 tracking-tighter">125+</div>
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Video Lessons</div>
                        </div>
                        <div className="p-8 bg-black/40 backdrop-blur-xl border border-[var(--color-border)] rounded-lg text-center space-y-1">
                            <div className="text-3xl font-black text-emerald-500 tracking-tighter">45+</div>
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">PDF Guides</div>
                        </div>
                        <div className="p-8 bg-black/40 backdrop-blur-xl border border-[var(--color-border)] rounded-lg text-center space-y-1">
                            <div className="text-3xl font-black text-brand-500 tracking-tighter">12</div>
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Learning Tracks</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your Learning Progress */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Layout size={18} />
                        </div>
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Your Learning Progress</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Level 2: Apprentice</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Courses Completed */}
                    <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Courses Completed</span>
                            <span className="text-sm font-black text-[var(--color-text-primary)]">{stats?.coursesCompleted || 0}/{stats?.totalCourses || 0}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#ce8dfb] rounded-full"
                                style={{ width: `${(stats?.coursesCompleted || 0) / (stats?.totalCourses || 12) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Videos Watched */}
                    <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Videos Watched</span>
                            <span className="text-sm font-black text-[var(--color-text-primary)]">{stats?.videosWatched || 0}/{stats?.totalVideos || 0}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${(stats?.videosWatched || 0) / (stats?.totalVideos || 125) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Quizzes Passed */}
                    <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Quizzes Passed</span>
                            <span className="text-sm font-black text-[var(--color-text-primary)]">{stats?.quizzesPassed || 0}/{stats?.totalQuizzes || 0}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#10b981] rounded-full"
                                style={{ width: `${(stats?.quizzesPassed || 0) / (stats?.totalQuizzes || 15) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Certificates Earned */}
                    <div className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Certificates Earned</span>
                            <span className="text-sm font-black text-[var(--color-text-primary)]">{stats?.certificatesEarned || 0}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: stats?.certificatesEarned ? '100%' : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {categories.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="p-8 bg-[#0A1224] border border-[var(--color-border)] rounded-lg flex flex-col items-center gap-4 transition-all hover:translate-y-[-5px] hover:border-[var(--color-border)] hover:bg-[#0D1529] group shadow-xl"
                    >
                        <div className={cn("p-5 rounded-lg bg-[var(--color-surface-2)] group-hover:scale-110 transition-transform", item.color, item.bg)}>
                            <item.icon size={28} />
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{item.label}</div>
                            <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{item.sub}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Continue Learning */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                        <PlayCircle size={18} />
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Continue Learning</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {progress.length > 0 ? progress.slice(0, 2).map((p, idx) => (
                        <div key={idx} className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 hover:bg-[#0D1529] hover:border-[var(--color-border)] transition-all group overflow-hidden relative">
                            {/* Decorative Background Icon */}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                {idx === 0 ? <Library size={200} /> : <Mountain size={200} />}
                            </div>

                            <div className="w-full md:w-32 h-32 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 shadow-2xl border border-[var(--color-border)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 text-brand-500 opacity-20"></div>
                                <div className={cn("relative z-10", idx === 0 ? "text-brand-500" : "text-emerald-500")}>
                                    {idx === 0 ? <Library size={48} /> : <Mountain size={48} />}
                                </div>
                            </div>

                            <div className="flex-1 space-y-5 w-full relative z-10">
                                <div>
                                    <h4 className="text-[var(--color-text-primary)] font-black uppercase text-base tracking-tight mb-2">
                                        {idx === 0 ? "Technical Analysis Fundamentals" : "Forex Trading Mastery"}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                                            Lesson {idx === 0 ? '5' : '3'} of {idx === 0 ? '12' : '18'} • {p.percentComplete}% Complete
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", idx === 0 ? "bg-[#ce8dfb]" : "bg-emerald-500")}
                                            style={{ width: `${p.percentComplete}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", idx === 0 ? "bg-[#ce8dfb]" : "bg-emerald-500")}></div>
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">In Progress</span>
                                        </div>
                                        <Link
                                            href={`/dashboard/education/courses/${p.courseId}`}
                                            className="text-[10px] font-black text-[var(--color-text-primary)] hover:text-brand-500 uppercase tracking-widest flex items-center gap-2 transition-colors"
                                        >
                                            Resume Course <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-[#0A1224] border border-[var(--color-border)] p-16 rounded-lg text-center space-y-6">
                            <div className="inline-flex p-6 bg-[var(--color-surface-2)] rounded-full text-gray-800">
                                <Library size={48} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500 font-black uppercase tracking-widest italic">No active courses found</p>
                                <p className="text-[10px] text-gray-700 uppercase tracking-widest">Begin your professional trading journey today</p>
                            </div>
                            <Link href="/dashboard/education/courses" className="inline-flex items-center gap-3 text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] bg-brand-500/10 px-8 py-4 rounded-lg hover:bg-brand-500/20 transition-all border border-brand-500/20">
                                Browse Catalog <ChevronRight size={14} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
