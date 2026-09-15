/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Users,
    Zap,
    ShieldCheck,
    BarChart3,
    Cpu,
    Database,
    Globe,
    Settings,
    ArrowUpRight,
    Search,
    Filter,
    Activity as ActivityIcon
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

// ─── Mock Data for Charts ─────────────────────────────────────────────────────
const data = [
    { name: "Mon", revenue: 4000, users: 2400 },
    { name: "Tue", revenue: 3000, users: 1398 },
    { name: "Wed", revenue: 2000, users: 9800 },
    { name: "Thu", revenue: 2780, users: 3908 },
    { name: "Fri", revenue: 1890, users: 4800 },
    { name: "Sat", revenue: 2390, users: 3800 },
    { name: "Sun", revenue: 3490, users: 4300 },
];

interface AdminStats {
    totalRevenue: number;
    activeUsers: number;
    // Add other fields as per API response if known, or use Record
    [key: string]: unknown;
}

interface MetricCard {
    label: string;
    value: string;
    trend: string;
    icon: React.ElementType;
    color: string;
}

export default function AdminCommandCenter() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get("/api/v1/admin/subscriptions/stats");
                setStats(res.data.data);
            } catch (err) {
                console.error("Stats fetch failed", err);
            }
        }
        
        async function fetchLogs() {
            try {
                setLoadingLogs(true);
                const res = await api.get("/api/v1/admin/logs");
                setLogs(res.data.data || []);
            } catch (err) {
                console.error("Logs fetch failed", err);
            } finally {
                setLoadingLogs(false);
            }
        }

        fetchStats();
        fetchLogs();
    }, []);

    const cards: MetricCard[] = [
        { label: "Total Liquidity", value: "$4.8M", trend: "+12.4%", icon: BarChart3, color: "text-amber-400" },
        { label: "Active Institutions", value: "842", trend: "+5.1%", icon: Users, color: "text-brand-400" },
        { label: "Bot Execution", value: "99.99%", trend: "Stable", icon: Cpu, color: "text-green-400" },
        { label: "Compliance (KYC)", value: "12 Pending", trend: "High Priority", icon: ShieldCheck, color: "text-rose-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                            Institutional Command Center
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        Platform <span className="text-[var(--color-text-secondary)]">Nexus</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
                    {["overview", "tools", "users", "system"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                ? "bg-[#10b981] text-black shadow-lg"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Metrics Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-surface p-6 transition-all hover:border-[#10b981]/30 hover:shadow-2xl hover:shadow-brand-500/5">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg bg-white/[0.03] border border-[var(--color-border)] ${card.color}`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-[10px] font-bold ${card.trend.startsWith('+') ? 'text-green-400' : 'text-amber-400'}`}>
                                    {card.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">{card.label}</p>
                                <p className="text-2xl font-black text-[var(--color-text-primary)]">{card.value}</p>
                            </div>
                        </div>
                        {/* Decorative Gradient */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-[#10b981]/5 transition-colors" />
                    </div>
                ))}
            </div>

            {/* ── Main Analytics & Control Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue/User Analytics */}
                <div className="lg:col-span-2 rounded-lg border border-[var(--color-border)] bg-surface p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Market Liquidity Index</h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">Real-time platform throughput</p>
                        </div>
                        <select className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text-secondary)] outline-none focus:border-[#10b981]">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Health & Status */}
                <div className="rounded-lg border border-[var(--color-border)] bg-surface p-8 flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-brand-400" />
                        Network Hub
                    </h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { name: "Auth Engine", status: "Healthy", lag: "12ms", color: "bg-green-400" },
                            { name: "Trade Execution", status: "Healthy", lag: "8ms", color: "bg-green-400" },
                            { name: "Market Data Feed", status: "Nominal", lag: "45ms", color: "bg-green-400" },
                            { name: "COT Sync", status: "Syncing", lag: "1.2s", color: "bg-amber-400" },
                            { name: "Payment Grid", status: "Healthy", lag: "210ms", color: "bg-green-400" },
                        ].map((srv, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] group hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-1.5 w-1.5 rounded-full ${srv.color}`} />
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{srv.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">{srv.status}</p>
                                    <p className="text-[9px] font-bold text-[#10b981]">{srv.lag}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all flex items-center justify-center gap-2 group">
                        <Settings className="h-3 w-3 group-hover:rotate-90 transition-transform" />
                        System Diagnostics
                    </button>
                </div>
            </div>

            {/* ── Recent Actions & Logs ── */}
            <div className="rounded-lg border border-[var(--color-border)] bg-surface overflow-hidden">
                <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Institutional Ledger</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                            <input
                                type="text"
                                placeholder="Filter records..."
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] focus:outline-none focus:border-[#10b981]/50 transition-colors w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                                <th className="px-8 py-4">Participant</th>
                                <th className="px-8 py-4">Action Type</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Timestamp</th>
                                <th className="px-8 py-4 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingLogs ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                                            <ActivityIcon className="w-8 h-8 animate-pulse mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-[var(--color-text-muted)]">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Recent Auditor Activity Recorded</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group cursor-pointer">
                                        <td className="px-8 py-5 text-sm font-bold text-[var(--color-text-primary)]">
                                            {row.user?.email || "System_Node"}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">{row.action || row.description}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                                                <div className={cn("h-1.5 w-1.5 rounded-full", row.status === 'success' ? 'bg-green-400' : 'bg-[#10b981]')} />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">{row.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-[var(--color-text-muted)]">
                                            {new Date(row.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono text-[10px] text-[#10b981]/50 group-hover:text-[#10b981] transition-colors">
                                            {(row._id || row.id || "").substring(0, 8).toUpperCase()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-white/[0.01] border-t border-[var(--color-border)] text-center">
                    <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10b981] hover:text-[#D97706] transition-colors">
                        View Complete Audit Log &rsaquo;
                    </button>
                </div>
            </div>
        </div>
    );
}
