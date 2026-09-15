"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Key,
    Database,
    Sliders,
    Globe,
    Save,
    RefreshCcw,
    Plus,
    Trash2,
    Info,
    CheckCircle2,
    AlertCircle,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConfigType = {
    providers: Record<string, { key: string; status: 'active' | 'inactive'; priority: number }>;
    marketFeeds: {
        refreshInterval: number;
        enableSocketUpdates: boolean;
        providers: Record<string, Record<string, string | number | boolean>>;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };
    vps: {
        provider: string;
        apiKey: string;
    };
    payments: Record<string, any>;
    ai: {
        openai: {
            apiKey: string;
            model: string;
        };
    };
    fundamentalAnalysis: {
        currencies: string[];
        indicators: { name: string; weight: number }[];
    };
    marketInstruments: Record<string, string[]>;
};

export default function ApiManagerPage() {
    const [config, setConfig] = useState<ConfigType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<"providers" | "fundamental" | "markets" | "marketFeeds" | "infrastructure" | "financials" | "ai">("providers");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newService, setNewService] = useState({ name: '', category: 'providers' });

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/admin/api-manager");
            setConfig(res.data.data);
        } catch (err) {
            console.error("Failed to fetch API config", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await api.put("/api/v1/admin/api-manager", config);
            toast.success("Configuration saved successfully!");
        } catch (err) {
            console.error("Failed to save config", err);
            toast.error("Error saving global configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateService = async <T extends keyof ConfigType>(category: T, name: string, data: Partial<ConfigType[T]>) => {
        try {
            // Update individual service instead of full config
            const res = await api.put(`/api/v1/admin/api-manager/${category}/${name}`, data);
            setConfig(res.data.data); // Server returns updated masked config
            toast.success(`Updated ${name} successfully!`);
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as any).response?.data?.message : "Unknown error";
            toast.error(message || `Failed to update ${name}`);
        }
    };

    const handleDeleteProvider = async (category: string, name: string) => {
        if (!confirm(`Are you sure you want to permanently delete the ${name} service?`)) return;
        try {
            const res = await api.delete(`/api/v1/admin/api-manager/${category}/${name}`);
            setConfig(res.data.data);
            toast.success(`Removed ${name} successfully`);
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as any).response?.data?.message : "Unknown error";
            toast.error(message || `Failed to remove ${name}`);
        }
    };

    const handleTestConnection = async (category: string, name: string) => {
        toast.loading(`Testing ${name} connection...`, { id: `test-${name}` });
        try {
            const res = await api.post(`/api/v1/admin/api-manager/${category}/${name}/test`);
            toast.success(res.data.message || 'Connection successful', { id: `test-${name}` });
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as any).response?.data?.message : "Unknown error";
            toast.error(message || 'Connection failed', { id: `test-${name}` });
        }
    };

    const handleUpdateSection = async (section: keyof ConfigType, data: Partial<ConfigType[typeof section]>) => {
        try {
            const res = await api.put(`/api/v1/admin/api-manager/section/${section}`, data);
            setConfig(res.data.data);
            toast.success(`Updated ${section} successfully!`);
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as any).response?.data?.message : "Unknown error";
            toast.error(message || `Failed to update ${section}`);
        }
    };

    const handleUpdateProperty = async (path: string, data: unknown) => {
        try {
            const res = await api.patch(`/api/v1/admin/api-manager/property`, { path, data });
            setConfig(res.data.data);
            toast.success(`Updated ${path} successfully!`);
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as any).response?.data?.message : "Unknown error";
            toast.error(message || `Failed to update ${path}`);
        }
    };

    const updateProviderKey = (provider: string, key: string) => {
        if (!config) return;
        setConfig({
            ...config,
            providers: {
                ...config.providers,
                [provider]: { ...config.providers[provider], key }
            }
        });
    };

    const updateIndicatorWeight = (index: number, weight: number) => {
        if (!config) return;
        const newIndicators = [...config.fundamentalAnalysis.indicators];
        newIndicators[index].weight = weight;
        setConfig({
            ...config,
            fundamentalAnalysis: { ...config.fundamentalAnalysis, indicators: newIndicators }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                <RefreshCcw className="w-8 h-8 animate-spin text-amber-500 mr-3" />
                <p className="font-bold uppercase tracking-widest text-xs">Synchronizing API Protocols...</p>
            </div>
        );
    }


    const handleAddIndicator = () => {
        if (!config) return;
        const newIndicators = [...config.fundamentalAnalysis.indicators, { name: 'New Indicator', weight: 0 }];
        setConfig({
            ...config,
            fundamentalAnalysis: { ...config.fundamentalAnalysis, indicators: newIndicators }
        });
    };

    const handleDeleteIndicator = (index: number) => {
        if (!config) return;
        const newIndicators = config.fundamentalAnalysis.indicators.filter((_, i) => i !== index);
        setConfig({
            ...config,
            fundamentalAnalysis: { ...config.fundamentalAnalysis, indicators: newIndicators }
        });
    };

    const handleAddInstrument = (market: string) => {
        if (!config) return;
        const instrument = prompt(`Enter new instrument for ${market}:`);
        if (!instrument) return;

        const currentInstruments = config.marketInstruments[market] || [];
        if (currentInstruments.includes(instrument.toUpperCase())) return;

        setConfig({
            ...config,
            marketInstruments: {
                ...config.marketInstruments,
                [market]: [...currentInstruments, instrument.toUpperCase()]
            }
        });
    };

    const handleDeleteInstrument = (market: string, instrument: string) => {
        if (!config) return;
        setConfig({
            ...config,
            marketInstruments: {
                ...config.marketInstruments,
                [market]: config.marketInstruments[market].filter(i => i !== instrument)
            }
        });
    };

    const handleAddService = async () => {
        if (!newService.name) return;
        try {
            const res = await api.post("/api/v1/admin/api-manager/service", {
                category: newService.category,
                name: newService.name,
                data: { key: '', status: 'active', priority: 1 }
            });
            setConfig(res.data.data);
            setIsAddModalOpen(false);
            setNewService({ name: '', category: 'providers' });
            toast.success("Service registered properly!");
        } catch (err: unknown) {
            console.error("Failed to add service", err);
            const message = err instanceof Error
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message
                : "Error adding service.";
            toast.error(message);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                            System Infrastructure
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        APIs <span className="text-[var(--color-text-secondary)]">Manager</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setNewService({ ...newService, category: activeSection });
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs hover:bg-[var(--color-surface-3)] transition-all"
                    >
                        <Plus className="w-4 h-4 text-[#10b981]" />
                        Add Service
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#10b981] text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit Changes
                    </button>
                </div>
            </div>

            {/* Modal for adding service */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 shadow-2xl">
                        <h2 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">Register New Service</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-2 block">Service Category</label>
                                <select
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]"
                                    value={newService.category}
                                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                >
                                    <option value="providers">External Providers</option>
                                    <option value="marketFeeds">Market Price Feeds</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="ai">AI Protocols</option>
                                    <option value="payments">Financial / Payment Gateways</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-2 block">Technical Name (Internal)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. polygon_api"
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-[10px] hover:bg-[var(--color-surface-2)] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddService}
                                className="flex-1 px-6 py-3 rounded-lg bg-[#10b981] text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                            >
                                Add Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
                {[
                    { id: "providers", label: "External Providers", icon: Globe },
                    { id: "marketFeeds", label: "Market Price Feeds", icon: Activity },
                    { id: "infrastructure", label: "Infrastructure", icon: Database },
                    { id: "financials", label: "Financials", icon: Sliders },
                    { id: "ai", label: "AI Protocols", icon: Globe },
                    { id: "fundamental", label: "Fundamental Weights", icon: Sliders },
                    { id: "markets", label: "Market Mapping", icon: Database }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as keyof ConfigType | any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                            activeSection === tab.id
                                ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xl"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-8">
                {activeSection === "providers" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {config && Object.entries(config.providers).map(([name, data]) => (
                            <div key={name} className="p-6 rounded-lg border border-[var(--color-border)] bg-surface space-y-4 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleTestConnection('providers', name)}
                                        className="p-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-[var(--color-text-primary)] transition-all"
                                        title="Test API Connection"
                                    >
                                        <Activity className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProvider('providers', name)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--color-text-primary)] transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{name}</h3>
                                    <button
                                        onClick={() => handleUpdateService('providers', name, { status: data.status === 'active' ? 'inactive' : 'active' })}
                                        className={cn(
                                            "px-3 py-1 mr-20 rounded-md text-[9px] font-black uppercase tracking-tighter border hover:opacity-80 transition-opacity cursor-pointer",
                                            data.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}
                                    >
                                        {data.status}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                                        <input
                                            type="text"
                                            value={data.key}
                                            onChange={(e) => updateProviderKey(name, e.target.value)}
                                            placeholder="Enter New API Secret Key"
                                            className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-[var(--color-text-secondary)] focus:outline-none focus:border-[#10b981]/50 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdateService('providers', name, { key: data.key })}
                                        className="px-4 py-3 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
                                    <span>Priority: {data.priority}</span>
                                    <span>•</span>
                                    <span>Tier: Institutional</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === "marketFeeds" && config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleUpdateSection('marketFeeds', (config as Required<ConfigType>).marketFeeds)}
                                    className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
                                    title="Save Feed Configuration"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mt-2">Feed Configuration</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase mb-2 block">Refresh Interval (ms)</label>
                                    <input
                                        type="number"
                                        value={config.marketFeeds.refreshInterval}
                                        onChange={(e) => setConfig({ ...config, marketFeeds: { ...config.marketFeeds, refreshInterval: parseInt(e.target.value) } })}
                                        className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] transition-all">
                                    <span className="text-[10px] font-bold text-[var(--color-text-primary)] uppercase">Enable Real-Time Updates</span>
                                    <button
                                        onClick={() => {
                                            const newVal = !config.marketFeeds.enableSocketUpdates;
                                            setConfig({ ...config, marketFeeds: { ...config.marketFeeds, enableSocketUpdates: newVal } });
                                            handleUpdateSection('marketFeeds', { enableSocketUpdates: newVal });
                                        }}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            config.marketFeeds.enableSocketUpdates ? "bg-[#10b981]" : "bg-[var(--color-surface-3)]"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-surface transition-all",
                                            config.marketFeeds.enableSocketUpdates ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "infrastructure" && config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SMTP Config */}
                        <div className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleUpdateSection('email', config.email)}
                                    className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
                                    title="Save SMTP Settings"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mt-2">SMTP Infrastructure</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="SMTP Host"
                                    value={config.email.host}
                                    onChange={(e) => setConfig({ ...config, email: { ...config.email, host: e.target.value } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs text-[var(--color-text-primary)]"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Port"
                                        value={config.email.port}
                                        onChange={(e) => setConfig({ ...config, email: { ...config.email, port: parseInt(e.target.value) } })}
                                        className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs text-[var(--color-text-primary)]"
                                    />
                                    <div className="flex items-center justify-between px-3 bg-white/[0.03] border border-[var(--color-border)] rounded-lg">
                                        <span className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">SSL</span>
                                        <button
                                            onClick={() => {
                                                const newVal = !config.email.secure;
                                                setConfig({ ...config, email: { ...config.email, secure: newVal } });
                                                handleUpdateSection('email', { secure: newVal });
                                            }}
                                            className={cn("w-8 h-4 rounded-full relative", config.email.secure ? "bg-[#10b981]" : "bg-[var(--color-surface-3)]")}
                                        >
                                            <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-surface transition-all", config.email.secure ? "left-4.5" : "left-0.5")} />
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="User / Email"
                                    value={config.email.user}
                                    onChange={(e) => setConfig({ ...config, email: { ...config.email, user: e.target.value } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs text-[var(--color-text-primary)]"
                                />
                                <input
                                    type="password"
                                    placeholder="Password (Masked)"
                                    value={config.email.pass}
                                    onChange={(e) => setConfig({ ...config, email: { ...config.email, pass: e.target.value } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)]"
                                />
                            </div>
                        </div>

                        {/* VPS Config */}
                        <div className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleUpdateSection('vps', config.vps)}
                                    className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
                                    title="Save VPS Settings"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mt-2">VPS Management</h3>
                            <div className="space-y-4">
                                <select
                                    value={config.vps.provider}
                                    onChange={(e) => setConfig({ ...config, vps: { ...config.vps, provider: e.target.value } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs text-[var(--color-text-primary)]"
                                >
                                    <option value="default">Select Provider</option>
                                    <option value="digitalocean">DigitalOcean</option>
                                    <option value="aws">AWS</option>
                                    <option value="vultr">Vultr</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="API Key (Masked)"
                                    value={config.vps.apiKey}
                                    onChange={(e) => setConfig({ ...config, vps: { ...config.vps, apiKey: e.target.value } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "financials" && config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(config.payments).map(([name, data]: [string, any]) => (
                            <div key={name} className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleUpdateProperty(`payments.${name}`, config.payments[name])}
                                        className="p-2 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all"
                                        title={`Save ${name} Settings`}
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{name}</h3>
                                    <button
                                        onClick={() => {
                                            const newStatus = data.status === 'active' || data.status === undefined ? 'inactive' : 'active';
                                            setConfig({
                                                ...config,
                                                payments: {
                                                    ...config.payments,
                                                    [name]: { ...data, status: newStatus }
                                                }
                                            });
                                        }}
                                        className={cn(
                                            "px-3 py-1 mr-12 rounded-md text-[9px] font-black uppercase tracking-tighter border hover:opacity-80 transition-opacity cursor-pointer",
                                            data.status === 'active' || data.status === undefined ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}
                                    >
                                        {data.status || 'active'}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(data).filter(([k]) => k !== 'status').map(([key, value]) => (
                                        <div key={key}>
                                            <input
                                                type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('pass') ? 'password' : 'text'}
                                                placeholder={key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                                                value={(value as string) || ''}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    payments: {
                                                        ...config.payments,
                                                        [name]: { ...config.payments[name], [key]: e.target.value }
                                                    }
                                                })}
                                                className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === "ai" && config && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-lg border border-[var(--color-border)] bg-surface space-y-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleTestConnection('ai', 'openai')}
                                    className="p-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-[var(--color-text-primary)] transition-all"
                                    title="Test API Connection"
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleUpdateService('ai', 'openai', config.ai.openai)}
                                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-[var(--color-text-primary)] transition-all"
                                    title="Save OpenAI Settings"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mt-2">OpenAI Integration</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="API Key (Re-enter to Override)"
                                    value={config.ai.openai.apiKey}
                                    onChange={(e) => setConfig({ ...config, ai: { ...config.ai, openai: { ...config.ai.openai, apiKey: e.target.value } } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--color-text-secondary)] focus:outline-none focus:border-[#10b981]/50"
                                />
                                <input
                                    type="text"
                                    placeholder="Model (e.g. gpt-4)"
                                    value={config.ai.openai.model}
                                    onChange={(e) => setConfig({ ...config, ai: { ...config.ai, openai: { ...config.ai.openai, model: e.target.value } } })}
                                    className="w-full bg-white/[0.03] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs text-[var(--color-text-primary)]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "fundamental" && config && (
                    <div className="rounded-lg border border-[var(--color-border)] bg-surface overflow-hidden">
                        <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Global Scoring Weighted Matrix</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">Total Weight must equal 100% for mathematical integrity</p>
                                </div>
                                <button
                                    onClick={() => handleUpdateSection('fundamentalAnalysis', config.fundamentalAnalysis)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all font-black uppercase text-[10px]"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Matrix
                                </button>
                            </div>
                            <div className={cn(
                                "px-4 py-2 rounded-lg text-xs font-black uppercase border",
                                config?.fundamentalAnalysis.indicators.reduce((acc, curr) => acc + curr.weight, 0) === 100
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                TOTAL: {config?.fundamentalAnalysis.indicators.reduce((acc, curr) => acc + curr.weight, 0).toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                                        <th className="px-8 py-4">Indicator Name</th>
                                        <th className="px-8 py-4 text-center">Score Weight (%)</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {config?.fundamentalAnalysis.indicators.map((ind, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-4 text-sm font-bold text-[var(--color-text-secondary)]">{ind.name}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center justify-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                        value={ind.weight}
                                                        onChange={(e) => updateIndicatorWeight(idx, parseFloat(e.target.value))}
                                                        className="w-48 h-1.5 bg-[var(--color-surface-2)] rounded-full appearance-none cursor-pointer accent-[#10b981]"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={ind.weight}
                                                        onChange={(e) => updateIndicatorWeight(idx, parseFloat(e.target.value) || 0)}
                                                        className="w-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs font-mono text-center text-[var(--color-text-primary)]"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteIndicator(idx)}
                                                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-white/[0.02] border-t border-[var(--color-border)]">
                            <button
                                onClick={handleAddIndicator}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all"
                            >
                                <Plus className="w-3 h-3 text-[#10b981]" />
                                Add Economic Indicator
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === "markets" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {config && Object.entries(config.marketInstruments).map(([market, instruments]) => (
                            <div key={market} className="rounded-lg border border-[var(--color-border)] bg-surface p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-black text-[#10b981] uppercase tracking-widest">{market} Category</h3>
                                        <button
                                            onClick={() => handleUpdateSection('marketInstruments', { [market]: instruments })}
                                            className="p-1.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                                            title="Save Market Instruments"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleAddInstrument(market)}
                                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {instruments.map(inst => (
                                        <div key={inst} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center gap-3 group">
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-tighter">{inst}</span>
                                            <button
                                                onClick={() => handleDeleteInstrument(market, inst)}
                                                className="text-white/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] text-[var(--color-text-muted)] font-bold italic uppercase tracking-widest">
                                    Linked Instruments detect real-time liquidity protocols
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Integrity Warning */}
            <div className="p-6 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1">Administrative Critical Warning</h4>
                    <p className="text-xs text-amber-200/60 leading-relaxed">
                        Modifying API provider keys or re-weighting economic indicators will trigger a global recalculation of the Fundamental Strength Matrix.
                        This operation affects all active institutional dashboards and may cause temporary lag during synchronization.
                    </p>
                </div>
            </div>
        </div>
    );
}
