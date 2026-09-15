"use client";

import { useState, useEffect } from "react";
import { supportService, SupportTicket } from "@/lib/api/support";
import {
    MessageSquare,
    Plus,
    Send,
    User,
    ShieldCheck,
    Archive,
    Search,
    X,
    ArrowLeft
} from "lucide-react";
import { clsx } from "clsx";

export default function TicketsPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    // Form states
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "technical",
        priority: "medium",
        description: ""
    });
    const [reply, setReply] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await supportService.getMyTickets();
            setTickets(data);
        } catch (err) {
            console.error("Failed to load tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const ticket = await supportService.createTicket(newTicket);
            setTickets([ticket, ...tickets]);
            setShowCreate(false);
            setNewTicket({ subject: "", category: "technical", priority: "medium", description: "" });
            setSelectedTicket(ticket);
        } catch (err) {
            console.error("Failed to create ticket:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !reply.trim()) return;
        setSubmitting(true);
        try {
            const updated = await supportService.replyToTicket(selectedTicket._id, reply);
            setSelectedTicket(updated);
            setReply("");
            // Update in list
            setTickets(tickets.map(t => t._id === updated._id ? updated : t));
        } catch (err) {
            console.error("Failed to reply:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Tickets Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface border border-[var(--color-border)] p-8 rounded-lg">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">Communication Hub</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Support Resolution Desk</p>
                </div>
                {!showCreate && !selectedTicket && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#10b981]/10 hover:scale-105"
                    >
                        <Plus className="h-4 w-4" />
                        Create News Ticket
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Tickets List */}
                <div className={clsx(
                    "lg:col-span-4 space-y-4",
                    (selectedTicket || showCreate) && "hidden lg:block"
                )}>
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-[var(--color-border)] bg-white/[0.02]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-3 pl-11 pr-4 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/30"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                            {tickets.length === 0 ? (
                                <div className="p-8 text-center space-y-4 opacity-50">
                                    <Archive className="h-10 w-10 text-gray-700 mx-auto" />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Active Tickets</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <button
                                        key={ticket._id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={clsx(
                                            "w-full p-6 text-left transition-all hover:bg-white/[0.02] group relative",
                                            selectedTicket?._id === ticket._id && "bg-[#10b981]/5 border-r border-[#10b981]"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={clsx(
                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                                ticket.priority === "urgent" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                    ticket.priority === "high" ? "bg-brand-500/10 text-brand-400 border-orange-500/20" :
                                                        "bg-brand-500/10 text-brand-400 border-brand-500/20"
                                            )}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-[9px] text-gray-600 font-bold uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase truncate mb-1">{ticket.subject}</h4>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tight">
                                            <div className={clsx(
                                                "w-1.5 h-1.5 rounded-full",
                                                ticket.status === "open" ? "bg-green-500" :
                                                    ticket.status === "in_progress" ? "bg-[#10b981]" :
                                                        "bg-gray-600"
                                            )}></div>
                                            <span className="text-gray-500">{ticket.status}</span>
                                            <span className="text-gray-700">•</span>
                                            <span className="text-gray-500">{ticket.category}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Ticket Detail / Create Form */}
                <div className="lg:col-span-8">
                    {showCreate ? (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-8 border-b border-[var(--color-border)] bg-white/[0.02] flex items-center justify-between">
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Initialize Connection</h3>
                                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-[var(--color-text-primary)]"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleCreateTicket} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Topic Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                            placeholder="e.g. Account liquidity access issue"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                                            <select
                                                value={newTicket.category}
                                                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-4 text-xs font-black text-[var(--color-text-primary)] uppercase outline-none"
                                            >
                                                <option value="technical">Technical</option>
                                                <option value="billing">Billing</option>
                                                <option value="account">Account</option>
                                                <option value="mlm">MLM Hub</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority</label>
                                            <select
                                                value={newTicket.priority}
                                                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-4 text-xs font-black text-[var(--color-text-primary)] uppercase outline-none"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Detail Description</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50"
                                        placeholder="Provide comprehensive details for institutional audit..."
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        disabled={submitting}
                                        className="px-12 py-5 bg-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#10b981]/20"
                                    >
                                        {submitting ? "Opening Tunnel..." : "Broadcast Ticket"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : selectedTicket ? (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col h-[750px] animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Ticket View Header */}
                            <div className="p-8 border-b border-[var(--color-border)] bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden text-gray-500"><ArrowLeft className="h-5 w-5" /></button>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Ticket #{selectedTicket._id.slice(-6)}</span>
                                            <span className="text-gray-800">•</span>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{selectedTicket.category}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">{selectedTicket.subject}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                        selectedTicket.status === "open" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-800 text-gray-500 border-[var(--color-border)]"
                                    )}>
                                        {selectedTicket.status}
                                    </div>
                                    <button className="p-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] rounded-lg border border-[var(--color-border)] text-gray-500 transition-all">
                                        <Archive className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Conversation Feed */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Initial Description */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)] shrink-0">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 max-w-2xl">
                                        <p className="text-sm font-medium text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                                        <div className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(selectedTicket.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                </div>

                                {selectedTicket.replies?.map((rep) => (
                                    <div key={rep._id} className={clsx("flex gap-4", rep.isAdmin && "flex-row-reverse")}>
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                                            rep.isAdmin ? "bg-[#10b981]/10 border-[#10b981]/20" : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                        )}>
                                            {rep.isAdmin ? <ShieldCheck className="h-5 w-5 text-[#10b981]" /> : <User className="h-5 w-5 text-gray-600" />}
                                        </div>
                                        <div className={clsx(
                                            "rounded-lg p-6 max-w-2xl border",
                                            rep.isAdmin ? "bg-black/40 border-[#10b981]/10" : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                        )}>
                                            {rep.isAdmin && <div className="text-[8px] font-black text-[#10b981] uppercase tracking-widest mb-2">Institutional Support • {rep.user?.role}</div>}
                                            <p className="text-sm font-medium text-gray-300 leading-relaxed">{rep.message}</p>
                                            <div className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(rep.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Box */}
                            <div className="p-8 border-t border-[var(--color-border)] bg-white/[0.01]">
                                <form onSubmit={handleReply} className="relative">
                                    <textarea
                                        rows={2}
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type your response to the support agent..."
                                        className="w-full bg-black/60 border border-[var(--color-border)] rounded-lg py-5 pl-8 pr-16 text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/40 transition-all resize-none"
                                    />
                                    <button
                                        disabled={submitting || !reply.trim()}
                                        className="absolute right-4 bottom-4 w-10 h-10 bg-[#10b981] text-black rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex flex-col items-center justify-center h-[750px] bg-surface border border-[var(--color-border)] border-dashed rounded-lg opacity-30">
                            <MessageSquare className="h-16 w-16 text-gray-800 mb-4" />
                            <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest">Select a ticket to view institutional log</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
