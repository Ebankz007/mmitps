"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
    CalendarDays, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Tag
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/admin/cms/blocks?type=event");
            setEvents(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch events", err);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        Events <span className="text-[var(--color-text-secondary)]">Hub</span>
                    </h1>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mt-1">
                        Coordinate institutional summits, webinars and community events
                    </p>
                </div>

                <Link href="/admin/cms/events/new" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#10b981] text-black text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all">
                    <Plus className="h-4 w-4" />
                    New Event
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
                    />
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                     Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-surface border border-[var(--color-border)] rounded-lg animate-pulse" />
                    ))
                ) : events.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-surface border border-[var(--color-border)] rounded-lg">
                        <CalendarDays className="h-12 w-12 text-white/5 mx-auto mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">No events scheduled</p>
                    </div>
                ) : events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map((event: any) => (
                    <div key={event._id} className="bg-surface border border-[var(--color-border)] rounded-lg p-8 flex flex-col gap-6 hover:border-[#10b981]/30 transition-all group">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${event.isActive ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                {event.isActive ? 'Active' : 'Closed'}
                            </span>
                            <div className="flex items-center gap-2">
                                <Link 
                                    href={`/admin/cms/events/${event._id}`}
                                    className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] hover:text-[#10b981] transition-all"
                                >
                                    <Edit className="h-4 h-4" />
                                </Link>
                                <button className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/20 hover:text-rose-500 transition-all">
                                    <Trash2 className="h-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors leading-tight mb-2">{event.title}</h3>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest">{event.slug}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {event.tags?.map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface-2)] rounded-lg text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
                                <Clock className="h-3 w-3" />
                                {new Date(event.createdAt).toLocaleDateString()}
                            </div>
                            <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-2">
                                Details <Eye className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
