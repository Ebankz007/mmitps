"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Activity,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    ShieldAlert,
    Database,
    Server,
    Settings,
    ShieldCheck,
    History,
    FileSearch,
    Loader2
} from "lucide-react";

interface AnnealingReport {
    type: string;
    status: 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
    details?: any;
}

interface SiteStatus {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    version: string;
    health: {
        status: 'healthy' | 'degraded' | 'critical';
        lastChecked: string;
    };
    annealingReports: AnnealingReport[];
}

export default function SiteHealth() {
    const [status, setStatus] = useState<SiteStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [runningAnneal, setRunningAnneal] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/admin/cms/status');
            setStatus(res.data.data);
        } catch (err) {
            console.error("Failed to fetch status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnneal = async () => {
        setRunningAnneal(true);
        try {
            const res = await api.post('/api/v1/admin/cms/anneal');
            fetchStatus();
            alert("Self-annealing process completed successfully.");
        } catch (err) {
            console.error("Annealing failed", err);
            alert("Annealing process failed. Check system logs.");
        } finally {
            setRunningAnneal(false);
        }
    };

    const toggleMaintenance = async () => {
        if (!status) return;
        const newState = !status.isMaintenanceMode;
        if (!confirm(`Are you sure you want to ${newState ? 'ENABLE' : 'DISABLE'} Maintenance Mode?`)) return;

        try {
            const res = await api.put('/api/v1/admin/cms/maintenance', {
                isMaintenanceMode: newState,
                maintenanceMessage: newState ? "Platform is currently undergoing scheduled institutional maintenance." : ""
            });
            setStatus(res.data.data);
        } catch (err) {
            console.error("Failed to toggle maintenance", err);
        }
    };

    if (loading && !status) {
        return (
            <div className="flex flex-col items-center justify-center py-40 opacity-20">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Diagnostic Initialization...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">System <span className="text-[var(--color-text-secondary)]">Integrity</span></h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mt-1">Autonomous Site Health & Self-Annealing Engine</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAnneal}
                        disabled={runningAnneal}
                        className="flex items-center gap-3 px-6 py-3 rounded-lg bg-surface border border-[#10b981]/30 text-[#10b981] text-[10px] font-black uppercase tracking-widest hover:bg-[#10b981] hover:text-black transition-all disabled:opacity-50 shadow-xl"
                    >
                        <RefreshCw className={`h-4 w-4 ${runningAnneal ? 'animate-spin' : ''}`} />
                        {runningAnneal ? 'Processing...' : 'Trigger Full Annealing'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Status Overview ── */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-lg border border-[var(--color-border)] bg-surface p-8 space-y-8">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)] ${status?.health?.status === 'healthy' ? 'text-green-400' : 'text-rose-400'
                                }`}>
                                <Activity className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">
                                    {status?.health?.status || 'UNKNOWN'}
                                </h3>
                                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Cluster Health Score</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <Server className="h-4 w-4 text-brand-400" />
                                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">Core Version</span>
                                </div>
                                <span className="text-xs font-mono text-[#10b981]">v{status?.version}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">Security Grid</span>
                                </div>
                                <span className="text-[9px] font-black uppercase text-green-500">Active</span>
                            </div>
                        </div>

                        <button
                            onClick={toggleMaintenance}
                            className={`w-full py-4 rounded-lg border font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${status?.isMaintenanceMode
                                    ? 'bg-rose-500 text-[var(--color-text-primary)] border-rose-600 shadow-rose-500/10'
                                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]'
                                }`}
                        >
                            {status?.isMaintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                        </button>
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-surface p-8">
                        <h4 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Session Metrics
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Database Load</span>
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">12%</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-500 w-[12%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Storage Utilization</span>
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">48.2 GB</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#10b981] w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Annealing Reports ── */}
                <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-surface flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <FileSearch className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Annealing Ledger</h3>
                                <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">
                                    Last Audit: {status?.health?.lastChecked ? new Date(status.health.lastChecked).toLocaleString() : 'PENDING'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[700px]">
                        {status?.annealingReports?.slice().reverse().map((report, i) => (
                            <div key={i} className="group relative p-6 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-[var(--color-border)] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${report.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                                report.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {report.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">{report.type} Check</span>
                                            <p className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-text-primary)] transition-colors">{report.message}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/10 font-bold">
                                        {new Date(report.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>

                                {report.details && (
                                    <div className="ml-10 mt-4 p-4 rounded-lg bg-black/40 border border-[var(--color-border)] overflow-hidden">
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(report.details).map(([key, val]: any, k) => (
                                                <div key={k} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                                    <span className="text-[8px] font-black uppercase text-[var(--color-text-muted)] block">{key}</span>
                                                    <span className="text-[10px] font-mono text-brand-400">{JSON.stringify(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!status?.annealingReports || status.annealingReports.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 filter grayscale">
                                <Database className="h-20 w-20 mb-6 drop-shadow-2xl" />
                                <h3 className="text-sm font-black uppercase tracking-[0.3em]">No Diagnostic Data</h3>
                                <p className="text-[10px] font-bold mt-2">Trigger a full annealing scan to begin calibration</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-white/[0.02] border-t border-[var(--color-border)] text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Watchdog Engine Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
