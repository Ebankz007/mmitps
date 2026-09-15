/* eslint-disable */
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
    Activity,
    Settings,
    RefreshCw,
    Power,
    Globe,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SystemService {
    name: string;
    url: string;
    apiKey?: string;
    healthEndpoint: string;
    status: 'online' | 'offline' | 'degraded' | 'maintenance';
    isActive: boolean;
    lastHealthCheck?: string;
    description?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminServicesPage() {
    const [services, setServices] = useState<SystemService[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SystemService | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<SystemService>>({
        name: "",
        url: "",
        apiKey: "",
        healthEndpoint: "/health",
        isActive: true,
        description: ""
    });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/admin/services");
            const data = res.data.data;
            // The backend returns an object keyed by name, convert to array
            const servicesArray = Object.values(data) as SystemService[];
            setServices(servicesArray);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const handleTestHealth = async (name: string) => {
        setActionLoading(`test-${name}`);
        try {
            const res = await api.post(`/api/v1/admin/services/${name}/health`);
            const updatedSvc = res.data.data;
            setServices(prev => prev.map(s => s.name === name ? updatedSvc : s));
        } catch (err) {
            console.error("Health test failed", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleStatus = async (service: SystemService) => {
        setActionLoading(`toggle-${service.name}`);
        try {
            const newIsActive = !service.isActive;
            await api.put(`/api/v1/admin/services/${service.name}`, { isActive: newIsActive });
            setServices(prev => prev.map(s => s.name === service.name ? { ...s, isActive: newIsActive } : s));
        } catch (err) {
            console.error("Failed to toggle service status", err);
        } finally {
            setActionLoading(null);
        }
    };

    const openModal = (service?: SystemService) => {
        if (service) {
            setSelected(service);
            setFormData(service);
        } else {
            setSelected(null);
            setFormData({
                name: "",
                url: "",
                apiKey: "",
                healthEndpoint: "/health",
                isActive: true,
                description: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading("save");
        try {
            if (selected) {
                await api.put(`/api/v1/admin/services/${selected.name}`, formData);
            } else {
                await api.post("/api/v1/admin/services", {
                    serviceName: formData.name,
                    ...formData
                });
            }
            fetchServices();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save service", err);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-400';
            case 'offline': return 'text-rose-400';
            case 'degraded': return 'text-amber-400';
            default: return 'text-[var(--color-text-muted)]';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter italic uppercase">
                        Core <span className="text-amber-500">Services</span>
                    </h1>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mt-1">
                        System Interconnectivity & Health
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-widest rounded-sm transition-all shadow-lg shadow-brand-500/10"
                >
                    + Register Service
                </button>
            </div>

            {/* ── Services Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-lg bg-[var(--color-surface-2)] animate-pulse border border-[var(--color-border)]" />
                    ))
                ) : (
                    services.map(svc => (
                        <div key={svc.name} className="group relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-white/[0.02] p-6 hover:border-amber-500/30 transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-amber-500">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[var(--color-text-primary)] uppercase tracking-tight">{svc.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${svc.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(svc.status)}`}>
                                                {svc.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleTestHealth(svc.name)}
                                        disabled={actionLoading === `test-${svc.name}`}
                                        className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all disabled:opacity-50"
                                        title="Pulse Check"
                                    >
                                        <RefreshCw size={14} className={actionLoading === `test-${svc.name}` ? "animate-spin" : ""} />
                                    </button>
                                    <button
                                        onClick={() => openModal(svc)}
                                        className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all font-bold"
                                        title="Configure"
                                    >
                                        <Settings size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-1">Target Endpoint</p>
                                    <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => window.open(svc.url, '_blank')}>
                                        <code className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] px-2 py-1 rounded border border-[var(--color-border)] truncate flex-1">
                                            {svc.url}
                                        </code>
                                        <ExternalLink size={10} className="text-[var(--color-text-muted)] group-hover/link:text-amber-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-y border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-[var(--color-text-muted)]" />
                                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Last Sync</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                                        {svc.lastHealthCheck ? new Date(svc.lastHealthCheck).toLocaleTimeString() : 'NEVER'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${svc.isActive ? "text-amber-500/50" : "text-white/10"}`}>
                                    {svc.isActive ? "Active Duty" : "Deactivated"}
                                </span>
                                <button
                                    onClick={() => handleToggleStatus(svc)}
                                    disabled={actionLoading === `toggle-${svc.name}`}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${svc.isActive
                                        ? "border-red-500/20 text-red-500/60 hover:bg-red-500/10"
                                        : "border-green-500/20 text-green-500/60 hover:bg-green-500/10"
                                        }`}
                                >
                                    <Power size={10} />
                                    {svc.isActive ? "Kill Switch" : "Activate"}
                                </button>
                            </div>

                            {/* Decorative Background Icon */}
                            <Activity className="absolute -bottom-4 -right-4 h-24 w-24 text-white/[0.02] -rotate-12 group-hover:text-amber-500/[0.03] transition-colors" />
                        </div>
                    ))
                )}
            </div>

            {/* ── Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-surface border border-[var(--color-border)] rounded-lg p-8 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />

                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] italic uppercase tracking-tighter mb-8">
                            {selected ? "Edit" : "Register"} <span className="text-amber-500">Service</span>
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Service Identity</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!!selected}
                                        required
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm outline-none focus:border-amber-500/50 disabled:opacity-50"
                                        placeholder="e.g., AUTH_ENGINE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Target URL</label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        required
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm outline-none focus:border-amber-500/50"
                                        placeholder="https://api.example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Health Path</label>
                                        <input
                                            type="text"
                                            value={formData.healthEndpoint}
                                            onChange={e => setFormData({ ...formData, healthEndpoint: e.target.value })}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm outline-none focus:border-amber-500/50"
                                            placeholder="/health"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Access Key</label>
                                        <input
                                            type="password"
                                            value={formData.apiKey}
                                            onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm outline-none focus:border-amber-500/50"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-xs outline-none focus:border-amber-500/50 resize-none"
                                        placeholder="Brief purpose of this service..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-black text-[10px] uppercase tracking-widest rounded-lg hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === "save"}
                                    className="flex-1 px-6 py-4 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                >
                                    {actionLoading === "save" ? "Committing..." : "Save Config"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
