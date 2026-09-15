"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    FileText,
    Menu as MenuIcon,
    Image as ImageIcon,
    Activity,
    Plus,
    ArrowRight,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Newspaper,
    CalendarDays,
    GraduationCap
} from "lucide-react";
import Link from "next/link";

interface CMSStats {
    pages: number;
    menus: number;
    media: number;
    health: string;
}

export default function CMSDashboard() {
    const [stats, setStats] = useState<CMSStats>({ pages: 0, menus: 0, media: 0, health: 'healthy' });
    const [siteStatus, setSiteStatus] = useState<any>(null);
    const [isAnnealing, setIsAnnealing] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/api/v1/admin/cms/status');
            setSiteStatus(res.data.data);
            // In a real app, we'd fetch counts too
            setStats({
                pages: 12, // Mock for now
                menus: 4,
                media: 156,
                health: res.data.data.health.status
            });
        } catch (err) {
            console.error("Failed to fetch CMS status", err);
        }
    };

    const handleAnneal = async () => {
        setIsAnnealing(true);
        try {
            await api.post('/api/v1/admin/cms/anneal');
            await fetchStatus();
        } catch (err) {
            console.error("Annealing failed", err);
        } finally {
            setIsAnnealing(false);
        }
    };

    const StatusIcon = stats.health === 'healthy' ? CheckCircle2 : stats.health === 'degraded' ? AlertTriangle : ShieldAlert;
    const healthColor = stats.health === 'healthy' ? 'text-green-400' : stats.health === 'degraded' ? 'text-amber-400' : 'text-rose-400';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Welcome & Quick Controls ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        CMS <span className="text-[var(--color-text-secondary)]">Nexus</span>
                    </h1>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mt-1">
                        Global Content & System Integrity Command
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAnneal}
                        disabled={isAnnealing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:bg-[var(--color-surface-3)] transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3 w-3 ${isAnnealing ? 'animate-spin' : ''}`} />
                        {isAnnealing ? 'Annealing...' : 'Run Site Annealing'}
                    </button>
                    <Link href="/admin/cms/pages/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981] text-black text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all">
                        <Plus className="h-3 w-3" />
                        New Page
                    </Link>
                </div>
            </div>

            {/* ── Status Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Dynamic Pages", value: stats.pages, icon: FileText, color: "text-brand-400" },
                    { label: "Active Menus", value: stats.menus, icon: MenuIcon, color: "text-brand-400" },
                    { label: "Media Assets", value: stats.media, icon: ImageIcon, color: "text-emerald-400" },
                    { label: "System Health", value: stats.health.toUpperCase(), icon: StatusIcon, color: healthColor },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-4">
                        <div className={`p-3 rounded-lg bg-white/[0.03] border border-[var(--color-border)] w-fit ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-[var(--color-text-primary)]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Module Shortcut ── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-muted)] px-2">Management Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "Site Content", desc: "Manage landing page & public page content", href: "/admin/cms/site-content", icon: FileText },
                            { title: "Navigation Engine", desc: "Manage top bar, footer, and submenus", href: "/admin/cms/menus", icon: MenuIcon },
                            { title: "Page Constructor", desc: "Edit dynamic pages and SEO meta", href: "/admin/cms/pages", icon: FileText },
                            { title: "News Articles", desc: "Publish institutional news and updates", href: "/admin/cms/news", icon: Newspaper },
                            { title: "Events Hub", desc: "Coordinate summits, webinars and events", href: "/admin/cms/events", icon: CalendarDays },
                            { title: "Education CMS", desc: "Build courses, upload videos & PDFs", href: "/admin/cms/education", icon: GraduationCap },
                            { title: "Media Library", desc: "Upload and optimize images & videos", href: "/admin/cms/media", icon: ImageIcon },
                            { title: "Health Watchdog", desc: "Self-annealing reports and site status", href: "/admin/cms/health", icon: Activity },
                        ].map((module, i) => (
                            <Link
                                key={i}
                                href={module.href}
                                className="group p-6 rounded-[28px] border border-[var(--color-border)] bg-surface hover:border-[#10b981]/30 hover:bg-white/[0.02] transition-all flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] group-hover:text-[#10b981] transition-colors">
                                        <module.icon className="h-4 w-4" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-white/10 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors">{module.title}</h4>
                                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{module.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Site Status & Annealing Log ── */}
                <div className="rounded-lg border border-[var(--color-border)] bg-surface flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">System Self-Annealing</h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">Last check: {siteStatus?.health?.lastChecked ? new Date(siteStatus.health.lastChecked).toLocaleString() : 'Never'}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${siteStatus?.isMaintenanceMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
                            }`}>
                            {siteStatus?.isMaintenanceMode ? 'MAINTENANCE ON' : 'SITE LIVE'}
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
                        {siteStatus?.annealingReports?.slice(-5).reverse().map((report: any, i: number) => (
                            <div key={i} className="p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] flex gap-4">
                                <div className={`p-2 rounded-lg h-fit ${report.status === 'success' ? 'bg-green-500/10 text-green-500' :
                                        report.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{report.type}</span>
                                        <span className="h-1 w-1 bg-[var(--color-surface-3)] rounded-full" />
                                        <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(report.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">{report.message}</p>
                                </div>
                            </div>
                        ))}

                        {(!siteStatus?.annealingReports || siteStatus.annealingReports.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-20">
                                <Activity className="h-10 w-10 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No reports yet</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/[0.02] border-t border-[var(--color-border)]">
                        <Link href="/admin/cms/health" className="block text-center text-[10px] font-black uppercase tracking-widest text-[#10b981]/60 hover:text-[#10b981] transition-colors">
                            View Full Diagnostic History &rsaquo;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
