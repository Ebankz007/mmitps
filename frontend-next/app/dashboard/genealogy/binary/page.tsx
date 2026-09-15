/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useBinaryTree } from "@/hooks/use-mlm";
import { useState, useMemo } from "react";
import { BinaryTree } from "@/components/genealogy/BinaryTree";
import {
    Search,
    RefreshCcw,
    User,
    Shield,
    Calendar,
    ArrowLeft,
    ArrowRight,
    Trophy,
    BarChart3,
    Layers,
    Users
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function BinaryGenealogyPage() {
    const { data: nodes = [], isLoading: loading, refetch } = useBinaryTree();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // Default to root node if no selection
    const displayNode = useMemo(() => {
        if (selectedNode) return selectedNode;
        return nodes.find((n: any) => n.position === 'root') || null;
    }, [selectedNode, nodes]);

    const handleSearch = () => {
        // Implementation for searching a specific user in the tree
    };

    const resetTree = () => {
        setSearchQuery("");
        setSelectedNode(null);
        refetch();
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)] uppercase italic">Binary: <span className="text-[#10b981]">Genealogy</span></h1>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                        <span className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Dashboard</span>
                        <span>•</span>
                        <span className="text-[#10b981]">Binary: Genealogy</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search User"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg py-2.5 px-4 text-xs font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:border-[#10b981]/50 transition-all outline-none w-48"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-[#047857] hover:bg-brand-600 text-[var(--color-text-primary)] px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-brand-500/10"
                    >
                        Search User
                    </button>
                    <button
                        onClick={resetTree}
                        className="bg-[#0B0E14] border border-[var(--color-border)] text-gray-400 px-4 py-2.5 rounded-lg text-xs font-bold hover:text-[var(--color-text-primary)] transition-all flex items-center gap-2"
                    >
                        Reset <RefreshCcw className="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                {/* Main Tree View (8 or 9 cols) */}
                <div className="lg:col-span-9 bg-[#0B0E14]/50 border border-[var(--color-border)] rounded-lg p-4 relative min-h-[750px] shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#10b981]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                    <BinaryTree
                        nodes={nodes}
                        onNodeClick={(node) => setSelectedNode(node)}
                    />
                </div>

                {/* Sidebar Details (3 cols) */}
                <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-right-4 duration-700">
                    <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-8 space-y-8 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#10b981]/10 to-transparent"></div>

                        {/* User Header */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Name</div>
                                    <div className="text-sm font-black text-[var(--color-text-primary)]">{displayNode?.attributes?.fullName || "-"}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#10b981]/10 rounded-lg border border-[#10b981]/20">
                                    <Layers className="h-5 w-5 text-[#10b981]" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Username</div>
                                    <div className="text-sm font-black text-[var(--color-text-primary)]">{displayNode?.name || "-"}</div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-[var(--color-border)]" />

                        {/* Individual Stats */}
                        <div className="space-y-6">
                            <StatItem
                                icon={<Trophy className="h-4 w-4 text-brand-400" />}
                                label="Current Rank"
                                value={displayNode?.attributes?.rank || "Starter"}
                                accent="text-brand-400"
                            />
                            <StatItem
                                icon={<Calendar className="h-4 w-4 text-emerald-400" />}
                                label="Date of Join"
                                value={displayNode?.attributes?.joinDate ? new Date(displayNode.attributes.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <StatItem
                                    icon={<BarChart3 className="h-4 w-4 text-brand-400" />}
                                    label="Weekly BV (Left)"
                                    value={(0).toFixed(2)}
                                />
                                <StatItem
                                    icon={<BarChart3 className="h-4 w-4 text-brand-400" />}
                                    label="Weekly BV (Right)"
                                    value={(0).toFixed(2)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <StatItem
                                    icon={<BarChart3 className="h-4 w-4 text-brand-400" />}
                                    label="Total BV (Left)"
                                    value={(displayNode?.attributes?.leftVolume || 0).toFixed(2)}
                                />
                                <StatItem
                                    icon={<BarChart3 className="h-4 w-4 text-rose-400" />}
                                    label="Total BV (Right)"
                                    value={(displayNode?.attributes?.rightVolume || 0).toFixed(2)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2 group transition-colors hover:border-brand-500/20">
                                    <div className="p-2 bg-brand-500/10 rounded-lg w-fit">
                                        <ArrowLeft className="h-4 w-4 text-brand-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Left Users</div>
                                        <div className="text-lg font-black text-[var(--color-text-primary)]">{displayNode?.attributes?.leftCount || 0}</div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-[var(--color-border)] p-4 rounded-lg space-y-2 group transition-colors hover:border-emerald-500/20">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg w-fit">
                                        <ArrowRight className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Right Users</div>
                                        <div className="text-lg font-black text-[var(--color-text-primary)]">{displayNode?.attributes?.rightCount || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ icon, label, value, accent }: { icon: any, label: string, value: string, accent?: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="p-2.5 bg-white/[0.02] border border-[var(--color-border)] rounded-lg group-hover:bg-[var(--color-surface-2)] transition-colors shadow-sm">
                {icon}
            </div>
            <div className="space-y-0.5">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.1em]">{label}</div>
                <div className={cn("text-sm font-black", accent || "text-[var(--color-text-primary)]")}>{value}</div>
            </div>
        </div>
    );
}
