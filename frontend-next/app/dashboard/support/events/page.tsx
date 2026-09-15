"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Users,
    Video,
    Zap,
    ArrowRight,
    MapPin,
    Trophy,
    Megaphone,
    ChevronDown,
    Star,
    Globe,
    ExternalLink,
    PlayCircle
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import Link from "next/link";
import { cmsService } from "@/lib/api/cms";

const TESTIMONIALS = [
    {
        name: "Sofia Garcia",
        role: "Institutional Trader",
        content: "The MMITPS community is unparalleled. The volumetric insights shared during the Dubai Summit completely changed how I view liquidity nodes.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "David Chen",
        role: "Quantitative Analyst",
        content: "Accessing the Global Macro triggers through the community portal is a game changer. Exceptional institutional support.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "Mark Rousso",
        role: "Regional Leader",
        content: "The event at Portugal was mind-blowing. The level of professionalism and networking opportunities is exactly what elite traders need.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
    }
];

const BROADCAST_LOG = [
    { title: "Weekly Macro Triggers Live", time: "2 Hours Ago", tag: "LIVE" },
    { title: "Dubai Summit Early Bird Ending", time: "5 Hours Ago", tag: "HOT" },
    { title: "New Volumetric Algo Update", time: "Yesterday", tag: "CODE" }
];

const FAQS = [
    { q: "How do I register for physical summits?", a: "Institutional summits require a prior application or an active PRO membership. You can apply directly through the &apos;Seminar Events&apos; section." },
    { q: "Are webinars recorded for later viewing?", a: "Yes, all webinar sessions are archived and accessible within the &apos;Past Archives&apos; hub 24 hours after the live session." },
    { q: "Can I host an MMITPS event in my city?", a: "Regional leaders can apply through the &apos;Host an Institutional Event&apos; form. Our events team will review your local trading community reach." }
];

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            try {
                const res = await cmsService.getBlocks("event");
                setEvents(res.data || []);
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    const majorEvents = events.filter(e => e.data?.isMajor).slice(0, 2);
    const regularEvents = events.filter(e => !e.data?.isMajor);

    return (
        <div className="max-w-[1600px] mx-auto space-y-16 pb-24 px-4 md:px-8 xl:px-12 text-[var(--color-text-primary)] min-h-screen pt-4">

            {/* ── Welcome Header ── */}
            <div className="text-center space-y-4 py-8">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500">Welcome To Our</span>
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)] leading-none">
                    Community
                </h1>
                <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-xs font-bold uppercase tracking-tight leading-relaxed">
                    Connecting institutional minds across 120 countries. Access elite insights, real-time broadcasts, and global networking events.
                </p>
            </div>

            {/* ── High-Impact Banners (Dynamic from CMS) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto lg:min-h-[400px]">
                {loading ? (
                    <>
                        <div className="h-[400px] rounded-lg bg-[var(--color-surface-2)] animate-pulse" />
                        <div className="h-[400px] rounded-lg bg-[var(--color-surface-2)] animate-pulse" />
                    </>
                ) : majorEvents.length > 0 ? (
                    majorEvents.map((evt, i) => (
                        <div 
                            key={evt._id}
                            className={clsx(
                                "relative group rounded-lg overflow-hidden p-12 flex flex-col justify-end shadow-2xl transition-transform duration-700 hover:scale-[1.01]",
                                i === 0 ? "bg-gradient-to-br from-emerald-600 to-brand-600" : "bg-gradient-to-br from-amber-500 to-emerald-500"
                            )}
                        >
                            {evt.data?.banner && (
                                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={evt.data.banner} alt="" className="w-full h-full object-cover grayscale" />
                                </div>
                            )}
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                {i === 0 ? <MapPin size={160} className="text-[var(--color-text-primary)]" /> : <Globe size={160} className="text-[var(--color-text-primary)]" />}
                            </div>
                            <div className="relative z-10 space-y-4">
                                <span className="px-4 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] border border-[var(--color-border)]">
                                    {evt.data?.category || "Upcoming Major"}
                                </span>
                                <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]">{evt.title}</h2>
                                <Link 
                                    href={evt.data?.link || "#"}
                                    className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] transition-all"
                                >
                                    {evt.data?.link?.includes('archive') ? 'Access Archives' : 'View Logistics'} <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                         <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em]">No Major Events Scheduled</p>
                    </div>
                )}
            </div>

            {/* ── Core Navigation Modules ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Side: Events Discovery */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Upcoming Events", icon: Calendar, color: "text-brand-400", bg: "bg-brand-400/10" },
                            { label: "Past Archives", icon: Video, color: "text-amber-400", bg: "bg-amber-400/10" },
                            { label: "Webinar Event", icon: PlayCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                            { label: "Seminar Events", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10" }
                        ].map((mod, i) => (
                            <button key={i} className="bg-[#080E1A] border border-[var(--color-border)] p-6 rounded-lg hover:border-[var(--color-border)] transition-all group flex flex-col items-center justify-center text-center gap-4">
                                <div className={clsx("p-3 rounded-lg border border-[var(--color-border)] shadow-inner group-hover:scale-110 transition-transform", mod.bg)}>
                                    <mod.icon className={clsx("w-6 h-6", mod.color)} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                                    {mod.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Events List (Institutional Feed) */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-10 space-y-8 min-h-[400px]">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Institutional Feed</h3>
                            <Link href="/events" className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-2">
                                Public Hub <ExternalLink size={12} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-20">
                                <div className="w-12 h-12 border-2 border-t-amber-500 border-[var(--color-border)] rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Event Data...</span>
                            </div>
                        ) : regularEvents.length > 0 ? (
                            <div className="space-y-6">
                                {regularEvents.map((evt) => (
                                    <div key={evt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg hover:border-amber-500/30 transition-all group/item">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{evt.data?.category}</span>
                                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-tight">
                                                    {new Date(evt.data?.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-[var(--color-text-primary)] group-hover/item:text-amber-500 transition-colors uppercase tracking-tight">{evt.title}</h4>
                                        </div>
                                        <Link 
                                            href={evt.data?.link || "#"}
                                            className="mt-4 sm:mt-0 px-6 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center h-64 gap-6">
                                    <Megaphone size={48} className="text-white/5" />
                                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em]">No Live Feed Items</p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-10 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-[var(--color-surface-3)] transition-all"
                                    >
                                        Refresh Feed
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Meta Modules */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Broadcast Log */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[80px] pointer-events-none group-hover:opacity-100 transition-all duration-700" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-3">
                            <Megaphone className="text-rose-500" size={16} /> Broadcast Log
                        </h3>
                        <div className="space-y-6">
                            {BROADCAST_LOG.map((log, i) => (
                                <div key={i} className="flex flex-col gap-1 group/log">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-rose-500/80 tracking-widest uppercase">{log.tag}</span>
                                        <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase">{log.time}</span>
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase text-[var(--color-text-secondary)] group-hover/log:text-[var(--color-text-primary)] transition-colors tracking-tight">{log.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Global Ranking */}
                    <div className="bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-10 space-y-8 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] pointer-events-none group-hover:opacity-100 transition-all duration-700" />
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-3">
                            <Trophy className="text-amber-500" size={16} /> Global Ranking
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "Eagle One Desk", xp: "12,450", rank: 1, color: "text-amber-500" },
                                { name: "Alpha Node Hub", xp: "9,820", rank: 2, color: "text-[var(--color-text-secondary)]" },
                                { name: "Zenith Institutional", xp: "8,750", rank: 3, color: "text-[var(--color-text-secondary)]" }
                            ].map((rank, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <div className="flex items-center gap-4">
                                        <span className={clsx("text-[10px] font-black", rank.color)}>{rank.rank}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tight text-[var(--color-text-primary)]">{rank.name}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-amber-500">{rank.xp} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Host Module */}
                    <div className="bg-amber-500 text-black p-10 rounded-lg space-y-6 shadow-2xl shadow-brand-500/20">
                        <Zap size={40} className="text-black/20" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Host An Institutional Event</h3>
                        <p className="text-xs font-bold uppercase leading-relaxed tracking-tight opacity-70">
                            Apply to coordinate local MMITPS summits. Our events team supports regional leaders with institutional toolsets.
                        </p>
                        <button className="w-full py-5 bg-black text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            Start Application
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Testimonials Carousel Design (Mockup Row) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TESTIMONIALS.map((t, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        key={i}
                        className="bg-surface p-10 rounded-lg shadow-2xl space-y-6 group"
                    >
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-lg object-cover border-2 border-amber-500/20" />
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-black italic tracking-widest">{t.name}</h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{t.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                        </div>
                        <p className="text-gray-600 font-bold text-xs uppercase tracking-tight leading-relaxed italic">
                            &quot;{t.content}&quot;
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* ── CTA / Report Section ── */}
            <div className="relative bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-12 lg:p-20 overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-[120px]" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-[-0.05em] leading-none">
                            Change Your <br />
                            <span className="text-emerald-500 italic font-black">Results</span>
                        </h2>
                        <p className="text-[var(--color-text-secondary)] font-bold uppercase text-xs tracking-[0.2em]">Join the elite 1% of institutional market participants.</p>
                        <button className="px-16 py-6 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-2xl shadow-emerald-500/30 hover:scale-110 active:scale-95">
                            Get Our Free Report
                        </button>
                    </div>
                    <div className="flex-1 max-w-sm">
                        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 rounded-lg transform rotate-3 hover:rotate-0 transition-transform duration-700">
                            <div className="aspect-square bg-[#0D1529] rounded-lg flex items-center justify-center p-8">
                                <Zap className="w-16 h-16 text-emerald-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FAQ / Bottom Links ── */}
            <div className="max-w-4xl mx-auto space-y-4">
                <h3 className="text-center text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-text-muted)] mb-8">Platform Orientation</h3>
                {FAQS.map((faq, i) => (
                    <div key={i} className="group bg-[#080E1A] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-border-hover)] transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase text-[var(--color-text-primary)] tracking-widest">{faq.q}</span>
                            <ChevronDown size={14} className="text-[var(--color-text-muted)] group-hover:text-amber-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Final Footer CTA ── */}
            <div className="text-center space-y-12 py-20 border-t border-[var(--color-border)]">
                <div className="space-y-4">
                    <h2 className="text-5xl font-black uppercase tracking-tighter">Join MMITPS Trading Community</h2>
                    <p className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-[0.4em]">Proprietary Execution. Institutional Wisdom.</p>
                </div>
                <button className="px-20 py-6 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-brand-500/40 hover:scale-[1.05] transition-all">
                    Be Part Now
                </button>
            </div>
        </div>
    );
}
