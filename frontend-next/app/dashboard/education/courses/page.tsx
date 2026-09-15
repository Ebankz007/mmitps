/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { educationService, Course } from "@/lib/api/education";
import {
    Search,
    ChevronDown,
    Clock,
    Star,
    ChevronRight,
    BarChart3,
    TrendingUp,
    Bitcoin,
    Bot,
    Brain,
    ShieldAlert,
    LineChart,
    PlayCircle,
    Flame,
    Zap,
    LayoutGrid,
    Target
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CourseCatalogPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("All Levels");
    const [sortFilter, setSortFilter] = useState("Most Popular");

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            try {
                const data = await educationService.getCourses();
                setCourses(data.data || []);
            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    const categories = [
        { label: "All", icon: LayoutGrid, count: courses.length, color: "text-brand-400", bg: "bg-brand-400/10" },
        { label: "Technical", icon: BarChart3, count: courses.filter(c => c.category === "Technical").length || 12, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Forex", icon: TrendingUp, count: courses.filter(c => c.category === "Forex").length || 8, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Crypto", icon: Bitcoin, count: courses.filter(c => c.category === "Crypto").length || 6, color: "text-brand-400", bg: "bg-orange-400/10" },
        { label: "Algo", icon: Bot, count: courses.filter(c => c.category === "Algo").length || 5, color: "text-brand-400", bg: "bg-brand-400/10" },
        { label: "Psychology", icon: Brain, count: courses.filter(c => c.category === "Psychology").length || 4, color: "text-pink-400", bg: "bg-pink-400/10" },
        { label: "Risk", icon: ShieldAlert, count: courses.filter(c => c.category === "Risk").length || 4, color: "text-red-400", bg: "bg-red-400/10" },
        { label: "Stocks", icon: LineChart, count: courses.filter(c => c.category === "Stocks").length || 6, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    ];

    const filteredCourses = courses.filter(c => {
        const matchesCategory = category === "All" || c.category === category || (category === "Risk" && c.category === "Risk Management");
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === "All Levels" || c.level === levelFilter;
        return matchesCategory && matchesSearch && matchesLevel;
    });

    // Mock data for illustrations to match the mockup's visual variety
    const getCourseVisual = (course: Course, idx: number) => {
        const icons = [
            { icon: BarChart3, color: "bg-brand-500", text: "bg-brand-600/20 text-brand-400" },
            { icon: TrendingUp, color: "bg-emerald-500", text: "bg-emerald-600/20 text-emerald-400" },
            { icon: Bitcoin, color: "bg-brand-500", text: "bg-brand-600/20 text-brand-400" },
            { icon: Bot, color: "bg-brand-500", text: "bg-brand-600/20 text-brand-400" },
            { icon: Brain, color: "bg-pink-500", text: "bg-pink-600/20 text-pink-400" },
            { icon: ShieldAlert, color: "bg-red-500", text: "bg-red-600/20 text-red-400" },
            { icon: LineChart, color: "bg-cyan-500", text: "bg-cyan-600/20 text-cyan-400" },
            { icon: Flame, color: "bg-brand-600", text: "bg-orange-700/20 text-brand-400" },
        ];
        return icons[idx % icons.length];
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-[#ce8dfb]">
                    <Target size={28} fill="currentColor" />
                    <h2 className="text-2xl font-black tracking-tight uppercase">Course Catalog</h2>
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10">
                    45+ courses to master every aspect of trading
                </p>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-4 flex flex-col lg:flex-row items-center gap-4 shadow-2xl">
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full bg-white/[0.02] border border-[var(--color-border)] rounded-lg py-4 pl-14 pr-6 text-[11px] font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:border-[#ce8dfb]/30 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 lg:flex-none">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="appearance-none bg-white/[0.02] border border-[var(--color-border)] rounded-lg py-4 pl-6 pr-12 text-[11px] font-black uppercase tracking-widest text-gray-500 focus:text-[var(--color-text-primary)] outline-none cursor-pointer hover:bg-white/[0.05] transition-all w-full"
                        >
                            <option value="All">All Categories</option>
                            <option value="Technical">Technical</option>
                            <option value="Forex">Forex</option>
                            <option value="Crypto">Crypto</option>
                            <option value="Algo">Algo</option>
                            <option value="Psychology">Psychology</option>
                            <option value="Risk">Risk</option>
                            <option value="Stocks">Stocks</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-700 pointer-events-none" strokeWidth={3} />
                    </div>

                    <div className="relative group flex-1 lg:flex-none">
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="appearance-none bg-white/[0.02] border border-[var(--color-border)] rounded-lg py-4 pl-6 pr-12 text-[11px] font-black uppercase tracking-widest text-gray-500 focus:text-[var(--color-text-primary)] outline-none cursor-pointer hover:bg-white/[0.05] transition-all w-full"
                        >
                            <option value="All Levels">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-700 pointer-events-none" strokeWidth={3} />
                    </div>

                    <div className="relative group flex-1 lg:flex-none">
                        <select
                            value={sortFilter}
                            onChange={(e) => setSortFilter(e.target.value)}
                            className="appearance-none bg-white/[0.02] border border-[var(--color-border)] rounded-lg py-4 pl-6 pr-12 text-[11px] font-black uppercase tracking-widest text-gray-500 focus:text-[var(--color-text-primary)] outline-none cursor-pointer hover:bg-white/[0.05] transition-all w-full"
                        >
                            <option value="Most Popular">Sort: Most Popular</option>
                            <option value="Newest">Sort: Newest</option>
                            <option value="Highest Rated">Sort: Highest Rated</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-700 pointer-events-none" strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none px-2">
                {categories.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => setCategory(cat.label)}
                        className={cn(
                            "group px-6 py-3 rounded-full flex items-center gap-3 transition-all whitespace-nowrap border-2 shadow-xl",
                            category === cat.label
                                ? "bg-[#059669] border-[#059669] text-[var(--color-text-primary)] scale-105"
                                : "bg-[#0A1224] border-[var(--color-border)] text-gray-500 hover:border-[var(--color-border)] hover:bg-[#0D1529]"
                        )}
                    >
                        <cat.icon size={16} className={cn("transition-colors", category === cat.label ? "text-[var(--color-text-primary)]" : cat.color)} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label} ({cat.count})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="bg-[#0A1224] border border-[var(--color-border)] h-[400px] rounded-lg animate-pulse shadow-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredCourses.map((course, idx) => {
                        const visual = getCourseVisual(course, idx);
                        return (
                            <Link
                                key={course._id}
                                href={`/dashboard/education/courses/${course.slug}`}
                                className="group bg-[#0A1224] border border-[var(--color-border)] rounded-lg overflow-hidden hover:translate-y-[-8px] hover:border-[var(--color-border)] hover:bg-[#0D1529] transition-all duration-500 shadow-2xl flex flex-col h-full active:scale-[0.98]"
                            >
                                {/* Course Branding/Illustration */}
                                <div className={cn("h-44 relative shrink-0 transition-all duration-700", visual.color)}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                    {/* Difficulty Badge */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg",
                                            course.level === 'Beginner' ? "bg-emerald-500 text-[var(--color-text-primary)]" :
                                                course.level === 'Intermediate' ? "bg-brand-500 text-[var(--color-text-primary)]" :
                                                    "bg-red-500 text-[var(--color-text-primary)]"
                                        )}>
                                            {course.level}
                                        </span>
                                        {(idx === 2 || idx === 3) && (
                                            <span className="px-3 py-1.5 rounded-lg bg-[#10b981] text-[var(--color-text-primary)] text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                <Flame size={10} fill="currentColor" /> {idx === 2 ? 'HOT' : 'NEW'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Duration Badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg flex items-center gap-2 text-[8px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                        <Clock size={10} /> {course.duration}
                                    </div>

                                    {/* Large Illustration Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                        <div className="p-6 bg-surface shadow-2xl rounded-lg group-hover:rounded-lg transition-all">
                                            <visual.icon size={48} className="text-black" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8 space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-3 flex-1">
                                        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", visual.text.split(' ')[1])}>
                                            {course.category}
                                        </p>
                                        <h3 className="text-[var(--color-text-primary)] font-black text-base uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-brand-400 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed line-clamp-2 uppercase tracking-wide">
                                            {course.description}
                                        </p>
                                    </div>

                                    {/* Stats & Tier */}
                                    <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Star size={12} className="text-[#10b981]" fill="currentColor" />
                                                <span className="text-[10px] font-black text-[var(--color-text-primary)]">{course.rating || 0}</span>
                                                <span className="text-[10px] font-bold text-gray-600">({(course.reviewCount || 0).toLocaleString()})</span>
                                            </div>
                                            <div className={cn(
                                                "text-[11px] font-black uppercase tracking-widest",
                                                course.price > 0 ? "text-[#ce8dfb]" : "text-emerald-500"
                                            )}>
                                                {course.price > 0 ? 'PRO' : 'FREE'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredCourses.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-12 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <button className="px-5 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--color-text-primary)] transition-all cursor-not-allowed">← Prev</button>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 bg-brand-600 text-[var(--color-text-primary)] rounded-lg text-[11px] font-black flex items-center justify-center shadow-[0_5px_15px_rgba(37,99,235,0.3)]">1</button>
                            <button className="w-10 h-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-gray-500 hover:text-[var(--color-text-primary)] text-[11px] font-black flex items-center justify-center transition-all">2</button>
                            <button className="w-10 h-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-gray-500 hover:text-[var(--color-text-primary)] text-[11px] font-black flex items-center justify-center transition-all">3</button>
                            <span className="text-gray-700">...</span>
                            <button className="w-10 h-10 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-gray-500 hover:text-[var(--color-text-primary)] text-[11px] font-black flex items-center justify-center transition-all">6</button>
                        </div>
                        <button className="px-5 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--color-text-primary)] transition-all">Next →</button>
                    </div>
                </div>
            )}

            {filteredCourses.length === 0 && !loading && (
                <div className="bg-[#0A1224] border border-[var(--color-border)] p-24 rounded-lg text-center space-y-6 shadow-2xl">
                    <div className="inline-flex p-8 bg-[var(--color-surface-2)] rounded-full text-gray-700">
                        <Search size={56} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-[var(--color-text-primary)] font-black uppercase text-2xl leading-none">No Courses Found</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] italic">Adjust your filters to see more results</p>
                    </div>
                    <button
                        onClick={() => {
                            setCategory("All");
                            setSearchQuery("");
                            setLevelFilter("All Levels");
                        }}
                        className="inline-flex items-center gap-3 text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] bg-brand-500/10 px-8 py-4 rounded-lg hover:bg-brand-500/20 transition-all border border-brand-500/20"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
