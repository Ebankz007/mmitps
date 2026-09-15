"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar,
    Filter,
    Search,
    Download,
    Eye,
    Zap,
    ArrowUpRight,
    MoreHorizontal,
    Share2,
    BarChart3,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useNotifications } from "@/hooks/use-notifications";

interface NewsEvent {
    id: string;
    time: string;
    currency: string;
    impact: "High" | "Medium" | "Low";
    event: string;
    actual?: string | number;
    forecast?: string | number;
    previous?: string | number;
    revised?: string | number;
    deviation?: string | number;
    date: string;
}

interface KeyEvent {
    id: string;
    title: string;
    currency: string;
    timeLabel: string;
    outcome?: string;
    sentiment?: "bullish" | "bearish" | "neutral";
    deviation?: string;
}

const IMPACT_LEVELS = ["High", "Medium", "Low"] as const;

export function NewsCalendar({ category }: { category: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedImpacts, setSelectedImpacts] = useState<string[]>(["High", "Medium", "Low"]);
    const [events, setEvents] = useState<NewsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotifications();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/v1/market-data/calendar");
            if (response.data.success) {
                // Sorting and potentially transforming dates
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedEvents = response.data.data.map((e: any) => ({
                    ...e,
                    id: e.id || Math.random().toString(36).substr(2, 9),
                    event: e.title || e.event,
                    date: e.date || new Date().toISOString()
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch news calendar:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.currency.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesImpact = selectedImpacts.includes(e.impact);
        return matchesSearch && matchesImpact;
    });

    // Grouping events by date
    const groupedEvents: Record<string, NewsEvent[]> = filteredEvents.reduce((acc, event) => {
        const dateKey = new Date(event.date).toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, NewsEvent[]>);

    const keyEvents: KeyEvent[] = [
        { id: "k1", title: "US Consumer Confidence", currency: "USD", timeLabel: "8 Hours", outcome: "114.8", sentiment: "bullish", deviation: "+0.2" },
        { id: "k2", title: "NZ Interest Rate", currency: "NZD", timeLabel: "13 Days", outcome: "5.50%", sentiment: "neutral" },
        { id: "k3", title: "Australian Employment", currency: "AUD", timeLabel: "2 Days", sentiment: "bearish" },
        { id: "k4", title: "UK Core Retail Sales", currency: "GBP", timeLabel: "5 Hours", outcome: "3.4%", sentiment: "bullish" }
    ];

    const toggleImpact = (impact: string) => {
        setSelectedImpacts(prev =>
            prev.includes(impact) ? prev.filter(i => i !== impact) : [...prev, impact]
        );
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "High": return "bg-[#ff3b3b]";
            case "Medium": return "bg-[#10b981]";
            case "Low": return "bg-[#30d158]";
            default: return "bg-gray-500";
        }
    };

    const downloadCSV = () => {
        const headers = ["Date", "Time", "Currency", "Event", "Impact", "Actual", "Forecast", "Previous"];
        const rows = filteredEvents.map(e => [
            new Date(e.date).toLocaleDateString(),
            new Date(e.date).toLocaleTimeString(),
            e.currency,
            e.event,
            e.impact,
            e.actual || "",
            e.forecast || "",
            e.previous || ""
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `MMITPS_Calendar_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleNotify = (event: NewsEvent) => {
        addNotification({
            title: "News Alert Set",
            message: `You will be notified for: ${event.currency} - ${event.event}`,
            type: "system"
        });
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase italic flex items-center gap-3">
                            <span className="text-[#10b981]">{category}</span> News Calendar
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-gray-500 text-sm font-medium tracking-tight">
                                High-impact economic events with live statistics for currency pairs
                            </p>
                            <span className="text-gray-700">|</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Times In:</span>
                                <span className="text-[var(--color-text-primary)] uppercase">(GMT-05:00) Eastern Time (US & Canada)</span>
                                <button className="text-[#10b981] hover:underline uppercase tracking-widest ml-1">Set Time Zone</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-[#10b98110] border border-[#10b98130] text-[#10b981] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#10b98120] transition-all">
                            <Zap size={14} /> My Price Feed
                        </a>
                    </div>
                </div>

                {/* Filter & Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-8 bg-surface border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search economic events..."
                                className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg pl-12 pr-4 py-3 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {IMPACT_LEVELS.map(level => (
                                <button
                                    key={level}
                                    onClick={() => toggleImpact(level)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                        selectedImpacts.includes(level)
                                            ? "bg-[var(--color-surface-3)] border-[var(--color-border-hover)] text-[var(--color-text-primary)]"
                                            : "bg-transparent border-transparent text-gray-600 hover:text-gray-400"
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={downloadCSV}
                            className="p-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg text-gray-400 hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            <Download size={18} />
                        </button>
                        <button className="p-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg text-gray-400 hover:text-[var(--color-text-primary)] transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="p-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg text-gray-400 hover:text-[var(--color-text-primary)] transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Week Banner */}
            <div className="relative py-4 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.05]"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-8 bg-[#010101] text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 italic">
                        Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} <span className="text-[#10b981]">| High Impact News Calendar</span>
                    </span>
                </div>
            </div>

            {/* Events Table */}
            <div className="space-y-8 pb-12">
                {loading ? (
                    <div className="py-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981]"></div>
                    </div>
                ) : (
                    Object.entries(groupedEvents).map(([date, dayEvents]) => (
                        <div key={date} className="space-y-4">
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-2 bg-[#10b98110] rounded-lg border border-[#10b98120]">
                                    <Calendar className="text-[#10b981]" size={14} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest italic">{date}</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[9px] font-black uppercase text-gray-600 tracking-[0.2em]">
                                            <th className="px-6 pb-2">Date</th>
                                            <th className="px-6 pb-2">Time</th>
                                            <th className="px-6 pb-2">Event</th>
                                            <th className="px-6 pb-2 text-center">Actual</th>
                                            <th className="px-6 pb-2 text-center">Forecast</th>
                                            <th className="px-6 pb-2 text-center">Previous</th>
                                            <th className="px-6 pb-2 text-center">Revised</th>
                                            <th className="px-6 pb-2">Stats & Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="before:block before:h-2">
                                        {dayEvents.map((e) => (
                                            <tr key={e.id} className="group">
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-l border-[var(--color-border)] rounded-l-2xl text-[11px] font-bold text-gray-400 transition-colors">
                                                    {new Date(e.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] text-[11px] font-bold text-gray-400 transition-colors">
                                                    {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-4 bg-[var(--color-surface-3)] rounded-sm overflow-hidden flex items-center justify-center text-[8px] font-black">
                                                            {e.currency.substring(0, 2)}
                                                        </div>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", getImpactColor(e.impact))} />
                                                        <span className="text-[11px] font-bold text-gray-200 group-hover:text-[var(--color-text-primary)] transition-colors">{e.event}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] text-center transition-colors">
                                                    <span className={cn(
                                                        "text-[11px] font-black",
                                                        e.actual && (Number(e.actual) > Number(e.forecast) ? "text-[#30d158]" : "text-[#ff3b3b]") || "text-gray-600"
                                                    )}>
                                                        {e.actual || "---"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] text-[11px] font-bold text-gray-500 text-center transition-colors">
                                                    {e.forecast || "---"}
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] text-[11px] font-bold text-gray-500 text-center transition-colors">
                                                    {e.previous || "---"}
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-[var(--color-border)] text-[11px] font-bold text-[#10b981] text-center transition-colors italic">
                                                    {e.revised || "---"}
                                                </td>
                                                <td className="px-6 py-5 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-r border-[var(--color-border)] rounded-r-2xl transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleNotify(e)}
                                                            title="Notify Me" 
                                                            className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                                        >
                                                            <Bell size={12} />
                                                        </button>
                                                        <button title="View Stats" className="p-1.5 bg-[#10b98110] text-[#10b981] rounded-lg hover:bg-[#10b98120] transition-all border border-[#10b98120]"><BarChart3 size={12} /></button>
                                                        <button title="Quick View" className="p-1.5 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500/20 transition-all border border-brand-500/20"><Eye size={12} /></button>
                                                        <button title="More Actions" className="p-1.5 bg-[var(--color-surface-2)] text-gray-400 rounded-lg hover:bg-[var(--color-surface-3)] transition-all border border-[var(--color-border)]"><MoreHorizontal size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Advanced Stats Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[var(--color-border)] bg-white/[0.01] rounded-lg px-8">
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">2H-50+</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">= % of 50+ pips in 2hrs</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Range</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">= Avg range in 2hrs</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Direction</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">= % match news direction</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Spike</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">= Initial avg spike</div>
                </div>
            </div>

            {/* Bottom Key Events Section */}
            <div className="space-y-8 border-t border-[var(--color-border)] pt-12 mt-12">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ff3b3b] animate-pulse"></div>
                    <h2 className="text-xl font-black text-[var(--color-text-primary)] italic uppercase tracking-tighter">This Week&apos;s Key Events</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {keyEvents.map((item) => (
                        <div key={item.id} className="relative group overflow-hidden bg-surface border border-[var(--color-border)] rounded-lg p-6 hover:border-[#10b98140] transition-all duration-500">
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#10b98105] to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center text-[10px] font-black text-[var(--color-text-primary)]">
                                            {item.currency}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.timeLabel}</div>
                                    </div>
                                    <ArrowUpRight className="text-gray-700 group-hover:text-[#10b981] transition-colors" size={14} />
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-300 group-hover:text-[var(--color-text-primary)] transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] uppercase font-black text-gray-600 tracking-wider italic">Historical Outcome:</span>
                                        <span className={cn(
                                            "text-[10px] font-black italic",
                                            item.sentiment === "bullish" ? "text-[#30d158]" : item.sentiment === "bearish" ? "text-[#ff3b3b]" : "text-gray-400"
                                        )}>
                                            {item.outcome || "PENDING..."}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                            item.sentiment === "bullish" ? "bg-[#30d15810] text-[#30d158] border border-[#30d15820]" :
                                                item.sentiment === "bearish" ? "bg-[#ff3b3b10] text-[#ff3b3b] border border-[#ff3b3b20]" :
                                                    "bg-[var(--color-surface-2)] text-gray-500 border border-[var(--color-border)]"
                                        )}>
                                            {item.sentiment || "NEUTRAL"}
                                        </div>
                                        {item.deviation && (
                                            <span className="text-[9px] font-black text-[#10b981] italic">{item.deviation} Deviation</span>
                                        )}
                                    </div>
                                    <button className="text-[9px] font-black text-gray-500 hover:text-[var(--color-text-primary)] uppercase tracking-widest transition-colors">See Stats</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="text-center py-8">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.2em] leading-relaxed max-w-4xl mx-auto">
                    MMITPS ECONOMIC CALENDAR: Professional Markets Feed | Real-time Data v2.0 | Trading Requires Risk Management | Ensure Capital Is Protected
                </p>
            </div>
        </div>
    );
}
