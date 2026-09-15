/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, use } from "react";
import { educationService, Course, Section, Lesson } from "@/lib/api/education";
import {
    PlayCircle,
    CheckCircle2,
    Lock,
    Clock,
    Shield,
    Star,
    ChevronDown,
    ChevronUp,
    FileText,
    Play,
    User,
    ArrowLeft,
    Share2,
    Bookmark,
    LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SecurityNotice } from "@/components/security/SecurityNotice";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        const loadCourse = async () => {
            setLoading(true);
            try {
                const data = await educationService.getCourseBySlug(slug);
                setCourse(data);
                if (data?.curriculum?.length > 0) {
                    setExpandedSections([data.curriculum[0]._id]);
                }
            } catch (error) {
                console.error("Failed to load course details:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCourse();

        // Check enrollment status (mocked check for now)
    }, [slug]);

    const handleEnroll = async () => {
        if (!course) return;
        setEnrolling(true);
        try {
            await educationService.enrollInCourse(course._id);
            setEnrolled(true);
        } catch (error) {
            console.error("Enrollment failed:", error);
        } finally {
            setEnrolling(false);
        }
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-2 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Decrypting Course Content...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20 bg-[#0D0D0D] border border-white/5 rounded-lg">
                <h2 className="text-2xl font-black text-white uppercase italic">Course not found</h2>
                <Link href="/dashboard/education/courses" className="mt-4 inline-block text-[#8B5CF6] text-xs font-black uppercase tracking-widest">Return to Academy</Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/education/courses" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                    <ArrowLeft size={16} />
                    Back to Catalog
                </Link>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><Bookmark size={20} /></button>
                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><Share2 size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Player / Content */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                course.level === 'Beginner' ? "bg-emerald-500/20 text-emerald-500" :
                                    course.level === 'Intermediate' ? "bg-blue-500/20 text-blue-500" :
                                        "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                            )}>
                                {course.level}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{course.category} masterclass</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-[1.1]">
                            {course.title}
                        </h1>
                    </div>

                    {/* Preview / Player Placeholder */}
                    <div className="aspect-video bg-[#0D0D0D] border border-white/10 rounded-lg overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-transparent to-black/60"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {!enrolled ? (
                                <div className="text-center space-y-6 max-w-sm px-6">
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4">
                                        <Lock size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-white font-black uppercase tracking-tighter text-xl leading-none">Access Restricted</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Enroll to bypass institutional firewall and unlock curriculum data.</p>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full bg-[#8B5CF6] text-white py-4 rounded-lg font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                                    >
                                        {enrolling ? "Syncing..." : "Purchase Enrollment"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)] mx-auto cursor-pointer group hover:scale-110 transition-all">
                                        <Play size={40} fill="currentColor" className="text-white ml-2" />
                                    </div>
                                    <div className="text-white font-black uppercase tracking-widest text-[10px] animate-pulse">Ready to Stream</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <div className="flex border-b border-white/5 gap-8">
                            <button className="pb-4 border-b-2 border-[#8B5CF6] text-white text-[10px] font-black uppercase tracking-widest">Overview</button>
                            <button className="pb-4 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Resources</button>
                            <button className="pb-4 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Reviews</button>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            {course.description}
                        </p>
                    </div>
                </div>

                {/* Sidebar - Curriculum */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0D0D0D] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-white/10 bg-white/[0.02]">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <LayoutGrid size={14} className="text-[#8B5CF6]" />
                                Course Curriculum
                            </h3>
                            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <span>{course.totalLessons} Lessons</span>
                                <span>•</span>
                                <span>{course.duration} Total</span>
                            </div>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                            {(course.curriculum ?? []).map((section) => (
                                <div key={section._id} className="border-b border-white/5 last:border-0">
                                    <button
                                        onClick={() => toggleSection(section._id)}
                                        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-[#8B5CF6] uppercase tracking-[0.2em] block">Section {section.title.split(' ')[0]}</span>
                                            <span className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{section.title}</span>
                                        </div>
                                        {expandedSections.includes(section._id) ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                    </button>

                                    {expandedSections.includes(section._id) && (
                                        <div className="bg-black/40 px-6 pb-6 space-y-2">
                                            {section.lessons.map((lesson) => (
                                                <button
                                                    key={lesson._id}
                                                    disabled={!enrolled}
                                                    className={cn(
                                                        "w-full p-4 rounded-lg flex items-center justify-between transition-all group",
                                                        activeLesson?._id === lesson._id ? "bg-[#8B5CF6]/10 border border-[#8B5CF6]/20" : "hover:bg-white/5 border border-transparent",
                                                        !enrolled && "opacity-40 grayscale"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {lesson.type === 'video' ? <PlayCircle size={18} className="text-[#8B5CF6]" /> : <FileText size={18} className="text-blue-400" />}
                                                        <div className="text-left">
                                                            <div className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-[#8B5CF6] transition-colors">{lesson.title}</div>
                                                            <div className="text-[9px] font-bold text-gray-600 uppercase mt-0.5">{lesson.duration}</div>
                                                        </div>
                                                    </div>
                                                    {!enrolled && <Lock size={12} className="text-gray-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructor */}
                    <div className="p-8 bg-[#0D0D0D] border border-white/10 rounded-lg flex items-center gap-6 shadow-xl">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-blue-500 flex items-center justify-center shrink-0">
                            <User size={32} className="text-black" />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-[#8B5CF6] uppercase tracking-widest mb-1">Chief Instructor</div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{course.instructor.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Quantitative Analyst</p>
                        </div>
                    </div>
                </div>
            </div>

            <SecurityNotice />
        </div>
    );
}
