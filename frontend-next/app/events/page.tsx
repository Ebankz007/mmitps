"use client";

import React, { useEffect, useState } from "react";
import { 
    Calendar, 
    MapPin, 
    Search, 
    Filter, 
    Globe, 
    ArrowRight, 
    ChevronRight,
    Video,
    Users,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        region: "All Regions",
        category: "All Types",
        search: ""
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get("/api/v1/cms?type=event");
            setEvents(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const regions = [
        "All Regions", 
        "Africa", 
        "Asia", 
        "Europe", 
        "Middle East", 
        "America", 
        "North America", 
        "Global"
    ];
    const categories = ["All Types", "Webinar", "Seminar", "Summit", "Workshop"];

    const filteredEvents = events.filter((evt: any) => {
        const matchesRegion = filter.region === "All Regions" || evt.data?.region === filter.region;
        const matchesCategory = filter.category === "All Types" || evt.data?.category === filter.category;
        const matchesSearch = evt.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                             evt.content.toLowerCase().includes(filter.search.toLowerCase());
        return matchesRegion && matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#05070A] text-[var(--color-text-primary)] font-inter">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-[var(--color-border)] bg-[#05070A]/80 backdrop-blur-xl">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ChevronLeft className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-brand-500 transition-colors" />
                        <Logo className="h-8" />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">Platform</Link>
                        <Link href="/#pricing" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">Pricing</Link>
                        <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-brand-500 transition-all underline decoration-brand-500/30 underline-offset-8">Events</Link>
                    </div>
                    <Link href="/login" className="px-6 py-2.5 rounded-lg bg-surface text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all">
                        Portal Access
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-[1440px] mx-auto">
                {/* Hero Header */}
                <div className="mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500 mb-4 block">Global Connectivity</span>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
                        Institutional <br /> <span className="text-[var(--color-text-muted)]">Events Hub</span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl font-medium">
                        Connect with the world's leading institutional traders through our global summits, 
                        intensive workshops, and weekly strategic webinars.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-brand-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search events, topics, or locations..."
                            value={filter.search}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg">
                            <Globe size={16} className="text-[var(--color-text-muted)]" />
                            <select 
                                value={filter.region}
                                onChange={(e) => setFilter(prev => ({ ...prev, region: e.target.value }))}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                            >
                                {regions.map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg">
                            <Filter size={16} className="text-[var(--color-text-muted)]" />
                            <select 
                                value={filter.category}
                                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                            >
                                {categories.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] rounded-lg bg-white/[0.02] border border-[var(--color-border)] animate-pulse" />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((evt: any) => (
                            <div 
                                key={evt._id}
                                className={cn(
                                    "flex flex-col rounded-lg border border-[var(--color-border)] bg-surface overflow-hidden group hover:border-brand-500/30 transition-all duration-500",
                                    evt.data?.isMajor && "md:col-span-2 lg:col-span-1 border-brand-500/20 bg-gradient-to-b from-brand-500/[0.02] to-transparent"
                                )}
                            >
                                <div className="relative h-48 overflow-hidden">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={evt.data?.banner || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop"} 
                                        alt="" 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] to-transparent" />
                                    <div className="absolute bottom-4 left-6">
                                        <span className="px-3 py-1 bg-brand-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                                            {evt.data?.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
                                            <Calendar size={14} className="text-brand-500" />
                                            {new Date(evt.data?.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {evt.data?.region && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
                                                <MapPin size={14} className="text-brand-500" />
                                                {evt.data.region}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight group-hover:text-brand-500 transition-colors mb-3">
                                            {evt.title}
                                        </h3>
                                        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-3">
                                            {evt.content}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                                        <div className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                                            {evt.data?.time}
                                        </div>
                                        <button className="flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest group/btn">
                                            Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center opacity-20 border border-dash border-[var(--color-border)] rounded-lg">
                        <Globe size={60} className="mx-auto mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">No matching events</h2>
                        <button 
                            onClick={() => setFilter({ region: "All Regions", category: "All Types", search: "" })}
                            className="mt-6 text-brand-500 font-bold uppercase text-[10px] tracking-[0.3em] hover:underline"
                        >
                            Reset Global Filters
                        </button>
                    </div>
                )}
            </main>

            {/* CTA Footer */}
            <section className="py-32 px-6 border-t border-[var(--color-border)] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
                <div className="max-w-4xl mx-auto text-center space-y-8">
                     <div className="w-20 h-20 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-10">
                        <Users className="text-brand-500 w-10 h-10" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase italic leading-none">
                        Host Your Local <br /> <span className="text-[var(--color-text-muted)]">Institutional Meetup</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-lg font-medium max-w-xl mx-auto">
                        Interested in organizing an MMITPS seminar in your region? 
                        Apply for institutional support today.
                    </p>
                    <button className="px-12 py-5 bg-brand-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-400 transition-all shadow-2xl shadow-brand-500/20">
                        Partner With Us
                    </button>
                </div>
            </section>
        </div>
    );
}
