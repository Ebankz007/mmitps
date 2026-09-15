"use client";

import {
    Cloud,
    Server,
    Zap,
    Cpu,
    ShieldCheck,
    Globe,
    Activity,
    Plus,
    Terminal,
    HardDrive,
    Signal,
    Power
} from "lucide-react";
import { clsx } from "clsx";

const VPS_INSTANCES = [
    { id: "vps-01", name: "NY-PRO-HUB", location: "New York (Equinix NY4)", status: "Active", ip: "104.24.112.5", cpu: "14%", ram: "4.2GB / 16GB", latency: "1ms" },
    { id: "vps-02", name: "LD-ALGO-01", location: "London (LD5)", status: "Active", ip: "185.42.12.84", cpu: "28%", ram: "8.1GB / 32GB", latency: "2ms" },
    { id: "vps-03", name: "TK-BACKTEST", location: "Tokyo (TY3)", status: "Standby", ip: "210.14.8.12", cpu: "0%", ram: "1.2GB / 16GB", latency: "145ms" },
];

export default function VPSStationPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Cloud className="h-48 w-48 text-[var(--color-text-primary)]" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="h-4 w-4 text-[#10b981]" />
                            <span className="text-xs font-black text-[#10b981] uppercase tracking-widest">Cloud Infrastructure</span>
                        </div>
                        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">Institutional VPS Station</h1>
                        <p className="text-gray-400 text-sm mt-1 max-w-xl font-medium">
                            Ultra-low latency cloud terminals co-located with major exchange data centers. Deploy your algorithms with 0ms execution slippage.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-[#10b981] hover:bg-[#10b981]/80 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16, 185, 129,0.2)] flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Deploy New Instance
                    </button>
                </div>
            </div>

            {/* Network Health */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Global Network", val: "Operational", icon: Globe, color: "text-green-500" },
                    { label: "Aggregate CPU", val: "22%", icon: Cpu, color: "text-brand-400" },
                    { label: "Avg Latency", val: "1.2ms", icon: Signal, color: "text-[#10b981]" },
                    { label: "System Uptime", val: "99.99%", icon: ShieldCheck, color: "text-green-500" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-surface border border-[var(--color-border)] p-5 rounded-lg flex items-center gap-4">
                        <div className={clsx("p-3 rounded-lg bg-[var(--color-surface-2)]", stat.color)}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase mb-0.5">{stat.label}</div>
                            <div className="text-sm font-black text-[var(--color-text-primary)]">{stat.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instances List */}
            <div className="grid grid-cols-1 gap-4">
                {VPS_INSTANCES.map((vps) => (
                    <div key={vps.id} className="bg-surface border border-[var(--color-border)] rounded-lg p-6 group hover:border-[var(--color-border-hover)] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={clsx(
                                "w-14 h-14 rounded-lg flex items-center justify-center border transition-all",
                                vps.status === "Active" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-gray-600"
                            )}>
                                <Terminal className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[var(--color-text-primary)] uppercase tracking-tight mb-1">{vps.name}</h3>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-gray-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{vps.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-2xl">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">IP Address</span>
                                <div className="text-[11px] font-mono text-[var(--color-text-primary)]">{vps.ip}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">CPU / RAM</span>
                                <div className="text-[11px] font-black text-[var(--color-text-primary)]">{vps.cpu} · {vps.ram}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Edge Latency</span>
                                <div className="text-[11px] font-black text-green-500">{vps.latency}</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                                <div className={clsx("text-[10px] font-black uppercase tracking-widest", vps.status === "Active" ? "text-green-500" : "text-gray-500")}>
                                    {vps.status}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] transition-all group/btn">
                                <Activity className="h-4 w-4 group-hover/btn:text-[#10b981]" />
                            </button>
                            <button className="px-6 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                                Connect RDP
                            </button>
                            <button className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg border border-red-500/10 transition-all">
                                <Power className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pro Sidebar / Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-brand-400" />
                            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Shared Algorithmic Storage</h3>
                        </div>
                        <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">1.4TB / 5TB Used</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden mb-8">
                        <div className="bg-blue-400 h-full w-[28%] transition-all duration-1000"></div>
                    </div>
                    <button className="px-6 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                        Browse Scripts
                    </button>
                </div>

                <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-8 rounded-lg text-center flex flex-col items-center justify-center">
                    <Zap className="h-10 w-10 text-[#10b981] mb-4 animate-pulse" />
                    <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-2">Automated Backups</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                        Snapshots taken every 4 hours. Restore any instance to its previous state in under 60 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
