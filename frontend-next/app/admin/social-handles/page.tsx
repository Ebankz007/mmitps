/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Globe,
    ExternalLink,
    Save,
    X,
    LayoutGrid,
    Search,
    Filter
} from "lucide-react";
import { socialService, SocialHandle } from "@/lib/api/social";
import { cn } from "@/lib/utils";

export default function AdminSocialHandlesPage() {
    const [handles, setHandles] = useState<SocialHandle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHandle, setEditingHandle] = useState<Partial<SocialHandle> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"basic" | "connection">("basic");

    useEffect(() => {
        fetchHandles();
    }, []);

    const fetchHandles = async () => {
        try {
            setLoading(true);
            const data = await socialService.getAllHandles();
            setHandles(data);
        } catch (error) {
            console.error("Failed to fetch handles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (handle?: SocialHandle) => {
        setEditingHandle(handle || {
            platform: "",
            handle: "",
            url: "",
            category: "Global",
            icon: "ExternalLink",
            color: "#22c55e",
            order: 0,
            isActive: true,
            connectionStatus: 'Disconnected',
            apiCredentials: {}
        });
        setActiveTab("basic");
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHandle) return;

        try {
            if (editingHandle._id) {
                await socialService.updateHandle(editingHandle._id, editingHandle);
            } else {
                await socialService.createHandle(editingHandle);
            }
            setIsModalOpen(false);
            fetchHandles();
        } catch (error) {
            console.error("Failed to save handle:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this handle?")) return;
        try {
            await socialService.deleteHandle(id);
            fetchHandles();
        } catch (error) {
            console.error("Failed to delete handle:", error);
        }
    };

    const filteredHandles = handles.filter(h =>
        h.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-[#22c55e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Institutional Assets</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Social <span className="text-[#22c55e]">Resources</span></h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Manage public communication channels and platform presence.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter platforms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all w-64 uppercase tracking-widest"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3 bg-[#22c55e] text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#1eb054] transition-all flex items-center gap-2"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Register New Channel
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-[var(--color-border)]">
                                <th className="px-8 py-5">Platform</th>
                                <th className="px-8 py-5">Handle/ID</th>
                                <th className="px-8 py-5">Region</th>
                                <th className="px-8 py-5">Connection</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Retrieving Archive...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHandles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                        No social channels registered.
                                    </td>
                                </tr>
                            ) : filteredHandles.map((handle) => (
                                <tr key={handle._id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-primary)]"
                                                style={{ backgroundColor: handle.color }}
                                            >
                                                <LayoutGrid size={16} />
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-tight text-[var(--color-text-primary)]">{handle.platform}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{handle.handle}</span>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        {handle.category}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                            handle.connectionStatus === 'Connected' ? "bg-brand-500/10 border-brand-500/20 text-brand-500" :
                                                handle.connectionStatus === 'Error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                    "bg-gray-500/10 border-gray-500/20 text-gray-500"
                                        )}>
                                            <div className={cn("w-1 h-1 rounded-full",
                                                handle.connectionStatus === 'Connected' ? "bg-brand-500" :
                                                    handle.connectionStatus === 'Error' ? "bg-red-500" : "bg-gray-500"
                                            )} />
                                            {handle.connectionStatus || 'Disconnected'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                            handle.isActive ? "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]" : "bg-red-500/10 border-red-500/20 text-red-500"
                                        )}>
                                            <div className={cn("w-1 h-1 rounded-full", handle.isActive ? "bg-[#22c55e]" : "bg-red-500")} />
                                            {handle.isActive ? "Operational" : "Offline"}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={handle.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] transition-all"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <button
                                                onClick={() => handleOpenModal(handle)}
                                                className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] text-[#22c55e] transition-all"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(handle._id)}
                                                className="p-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-surface border border-[var(--color-border)] rounded-lg w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-[var(--color-border)] space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">
                                    {editingHandle?._id ? "Edit" : "New"} <span className="text-[#22c55e]">Channel</span>
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[var(--color-surface-2)] rounded-full hover:bg-[var(--color-surface-3)] text-gray-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-4 border-b border-[var(--color-border)]">
                                <button
                                    onClick={() => setActiveTab("basic")}
                                    className={cn(
                                        "pb-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                                        activeTab === "basic" ? "text-[#22c55e] border-b-2 border-[#22c55e]" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                                    )}
                                >
                                    Basic Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("connection")}
                                    className={cn(
                                        "pb-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                                        activeTab === "connection" ? "text-[#22c55e] border-b-2 border-[#22c55e]" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                                    )}
                                >
                                    API Connection
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            {activeTab === "basic" ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Platform Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. YouTube"
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                                value={editingHandle?.platform || ""}
                                                onChange={(e) => setEditingHandle({ ...editingHandle, platform: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Username/Handle</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. @MMITPS"
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                                value={editingHandle?.handle || ""}
                                                onChange={(e) => setEditingHandle({ ...editingHandle, handle: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Channel URL</label>
                                        <input
                                            required
                                            type="url"
                                            placeholder="https://"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                            value={editingHandle?.url || ""}
                                            onChange={(e) => setEditingHandle({ ...editingHandle, url: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Region</label>
                                            <select
                                                className="w-full bg-surface-2 border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                                value={editingHandle?.category || "Global"}
                                                onChange={(e) => setEditingHandle({ ...editingHandle, category: e.target.value as SocialHandle['category'] })}
                                            >
                                                <option value="Global">Global</option>
                                                <option value="Asian">Asian</option>
                                                <option value="European">European</option>
                                                <option value="Middle East">Middle East</option>
                                                <option value="African">African</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Brand Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="h-10 w-10 bg-transparent border-none cursor-pointer"
                                                    value={editingHandle?.color || "#22c55e"}
                                                    onChange={(e) => setEditingHandle({ ...editingHandle, color: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                                    value={editingHandle?.color || ""}
                                                    onChange={(e) => setEditingHandle({ ...editingHandle, color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => setEditingHandle({ ...editingHandle, isActive: !editingHandle?.isActive })}
                                        >
                                            <div className={cn(
                                                "w-10 h-5 rounded-full relative transition-all duration-300",
                                                editingHandle?.isActive ? "bg-[#22c55e]" : "bg-[var(--color-surface-3)]"
                                            )}>
                                                <div className={cn(
                                                    "absolute top-1 w-3 h-3 bg-surface rounded-full transition-all duration-300",
                                                    editingHandle?.isActive ? "left-6" : "left-1"
                                                )} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Broadcast Status</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-lg mb-4">
                                        <p className="text-[10px] text-[#22c55e] font-bold uppercase tracking-widest">
                                            Configure API keys to allow the Broadcast Guard to automatically post signals and market updates to this specific channel.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Webhook URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://discord.com/api/webhooks/..."
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                            value={editingHandle?.apiCredentials?.webhookUrl || ""}
                                            onChange={(e) => setEditingHandle({
                                                ...editingHandle!,
                                                apiCredentials: { ...editingHandle!.apiCredentials, webhookUrl: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bot Token</label>
                                        <input
                                            type="password"
                                            placeholder="Enter bot token (e.g. Telegram Bot Token)"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                            value={editingHandle?.apiCredentials?.botToken || ""}
                                            onChange={(e) => setEditingHandle({
                                                ...editingHandle!,
                                                apiCredentials: { ...editingHandle!.apiCredentials, botToken: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Channel / Chat ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. @my_telegram_channel or 123456789"
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50"
                                            value={editingHandle?.apiCredentials?.channelId || ""}
                                            onChange={(e) => setEditingHandle({
                                                ...editingHandle!,
                                                apiCredentials: { ...editingHandle!.apiCredentials, channelId: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[var(--color-surface-3)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-[#22c55e] text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#1eb054] flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/10"
                                >
                                    <Save size={14} />
                                    Authorize Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
