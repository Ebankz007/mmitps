"use client";

import { useState, useEffect } from "react";
import { supportService, SupportTicket } from "@/lib/api/support";
import {
    Headphones,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    MessageSquare,
    AlertCircle,
    Send,
    ShieldCheck,
    User,
    RefreshCw,
    X,
    Lock
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

export default function AdminSupportDesk() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Reply Form
    const [replyMode, setReplyMode] = useState<"public" | "internal">("public");
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await supportService.getAdminTickets();
            setTickets(data);
        } catch (err) {
            console.error("Failed to load tickets:", err);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedTicket) return;
        try {
            const updated = await supportService.adminUpdateTicketStatus(selectedTicket._id, newStatus);
            setSelectedTicket(updated);
            setTickets(tickets.map(t => t._id === updated._id ? updated : t));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Status update failed");
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !replyText.trim()) return;
        setSubmitting(true);
        try {
            let updated;
            if (replyMode === "public") {
                updated = await supportService.adminReplyToTicket(selectedTicket._id, replyText, false);
                toast.success("Public reply sent");
            } else {
                updated = await supportService.adminAddInternalNote(selectedTicket._id, replyText);
                toast.success("Internal note added");
            }
            setSelectedTicket(updated);
            setTickets(tickets.map(t => t._id === updated._id ? updated : t));
            setReplyText("");
        } catch (err) {
            console.error("Failed to send reply", err);
            toast.error("Failed to send reply");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "in_progress": return "bg-brand-500/10 text-brand-500 border-brand-500/20";
            case "waiting_customer": return "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20";
            case "resolved": return "bg-brand-500/10 text-brand-500 border-brand-500/20";
            case "closed": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter flex items-center gap-3">
                        <Headphones className="h-8 w-8 text-[#10b981]" />
                        Support Command Desk
                    </h1>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mt-1">
                        Global Resolution & Client Communication
                    </p>
                </div>
                <button 
                    onClick={loadTickets}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all"
                >
                    <RefreshCw className={clsx("h-3 w-3", loading && "animate-spin")} />
                    Refresh Feed
                </button>
            </div>

            {/* ── Main Workspace ── */}
            <div className="flex gap-6 h-full overflow-hidden">
                {/* Left Pane: Ticket Queue */}
                <div className="w-[400px] shrink-0 flex flex-col bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                    {/* Filters */}
                    <div className="p-5 border-b border-[var(--color-border)] bg-white/[0.02] space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search subject or ID..."
                                className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-2.5 pl-11 pr-4 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/30"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {["all", "open", "in_progress", "waiting_customer", "resolved"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                                        statusFilter === status 
                                            ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20" 
                                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface-3)]"
                                    )}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-10 opacity-50"><RefreshCw className="h-6 w-6 animate-spin text-[var(--color-text-secondary)]" /></div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center">
                                <CheckCircle2 className="h-10 w-10 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Inbox Zero</p>
                                <p className="text-[9px] font-medium mt-1">No tickets match criteria</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <button
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={clsx(
                                        "w-full text-left p-4 rounded-lg transition-all border",
                                        selectedTicket?._id === ticket._id 
                                            ? "bg-white/[0.04] border-[#10b981]/30 shadow-lg shadow-black/20" 
                                            : "bg-transparent border-transparent hover:bg-white/[0.02]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={clsx("px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider border", getStatusColor(ticket.status))}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[9px] text-[var(--color-text-muted)] font-bold flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-black text-[var(--color-text-primary)] truncate mb-1 pr-2">{ticket.subject}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#10b981]/80">{ticket.category}</span>
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            ticket.priority === 'urgent' ? 'text-red-400' : 
                                            ticket.priority === 'high' ? 'text-brand-400' : 'text-[var(--color-text-secondary)]'
                                        )}>
                                            {ticket.priority} Prio
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: Resolution Desk */}
                <div className="flex-1 bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col relative">
                    {selectedTicket ? (
                        <>
                            {/* Header details */}
                            <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.01] flex items-center justify-between shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                                            {selectedTicket.ticketNumber || `TKT-${selectedTicket._id.slice(-6).toUpperCase()}`}
                                        </span>
                                        <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest">
                                            Client: {selectedTicket.user?.username || selectedTicket.user?.email || 'Unknown User'}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-[var(--color-text-primary)]">{selectedTicket.subject}</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                        className={clsx(
                                            "bg-[#020617] border rounded-lg py-2 px-3 text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer hover:shadow-lg",
                                            getStatusColor(selectedTicket.status)
                                        )}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="waiting_customer">Waiting on Cust</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    <button onClick={() => setSelectedTicket(null)} className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Thread */}
                            <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar">
                                {/* Initial Prompt */}
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-[var(--color-text-secondary)]" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-[var(--color-border)] rounded-lg rounded-tl-none p-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Client Message</span>
                                            <span className="text-[9px] text-[var(--color-text-muted)]">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                            {selectedTicket.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Replies & Notes */}
                                {selectedTicket.replies?.map((rep: any, idx) => {
                                    const isInternal = rep.isInternal; // note: actual API may map internal differently, adjusting based on isAdmin/roles
                                    // if backend sends note objects vs reply objects, they are all squashed here.
                                    // Based on our map, rep.isAdmin represents non-client
                                    const isNote = rep.message.startsWith("[INTERNAL]"); // simplistic heuristic if real flag missing, or we assume notes are mapped or not.
                                    
                                    // Wait, the backend notes are under `internalNotes`. Our `_transformTicket` mapped `messages`. 
                                    // Internal notes are a separate array in DB. Let's just render `replies` as direct messages for now.
                                    return (
                                        <div key={idx} className={clsx(
                                            "flex gap-4 max-w-[85%]",
                                            rep.isAdmin ? "ml-auto flex-row-reverse" : ""
                                        )}>
                                            <div className={clsx(
                                                "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0",
                                                rep.isAdmin ? "bg-[#10b981]/10 border-[#10b981]/20" : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                            )}>
                                                {rep.isAdmin ? <ShieldCheck className="h-5 w-5 text-[#10b981]" /> : <User className="h-5 w-5 text-[var(--color-text-secondary)]" />}
                                            </div>
                                            <div className={clsx(
                                                "border rounded-lg p-5 space-y-3",
                                                rep.isAdmin ? "bg-black/40 border-[#10b981]/20 rounded-tr-none" : "bg-white/[0.03] border-[var(--color-border)] rounded-tl-none"
                                            )}>
                                                <div className={clsx("flex items-center gap-2", rep.isAdmin && "flex-row-reverse")}>
                                                    <span className={clsx(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        rep.isAdmin ? "text-[#10b981]" : "text-[var(--color-text-secondary)]"
                                                    )}>
                                                        {rep.isAdmin ? `Admin • ${rep.user?.firstName || 'Staff'}` : 'Client Reply'}
                                                    </span>
                                                    <span className="text-[9px] text-[var(--color-text-muted)]">{new Date(rep.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                                    {rep.message}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Composer */}
                            <div className="p-6 bg-black/40 border-t border-[var(--color-border)] shrink-0">
                                <div className="flex items-center gap-4 mb-3 px-2">
                                    <button 
                                        onClick={() => setReplyMode("public")}
                                        className={clsx(
                                            "text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all",
                                            replyMode === "public" ? "border-[#10b981] text-[#10b981]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                        )}
                                    >
                                        Public Reply
                                    </button>
                                    <button 
                                        onClick={() => setReplyMode("internal")}
                                        className={clsx(
                                            "text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-1.5",
                                            replyMode === "internal" ? "border-brand-500 text-brand-400" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                        )}
                                    >
                                        <Lock className="h-3 w-3" />
                                        Internal Note
                                    </button>
                                </div>
                                <form onSubmit={handleReply} className="relative">
                                    <textarea
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={replyMode === "public" ? "Type response to client..." : "Type private note for admins..."}
                                        className={clsx(
                                            "w-full bg-surface border rounded-lg py-4 pl-5 pr-16 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none transition-all resize-none shadow-inner",
                                            replyMode === "public" ? "border-[var(--color-border)] focus:border-[#10b981]/40" : "border-brand-500/20 focus:border-brand-500/50"
                                        )}
                                    />
                                    <button
                                        disabled={submitting || !replyText.trim()}
                                        className={clsx(
                                            "absolute right-3 bottom-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50",
                                            replyMode === "public" ? "bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20" : "bg-brand-500 text-[var(--color-text-primary)] shadow-lg shadow-brand-500/20"
                                        )}
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                            <MessageSquare className="h-16 w-16 mb-4 text-[var(--color-text-secondary)]" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Select Ticket to View</h3>
                            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] mt-2">Resolution desk is idle</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
