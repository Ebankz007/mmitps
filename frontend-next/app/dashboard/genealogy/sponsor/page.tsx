/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useSponsorTree } from "@/hooks/use-mlm";
import { useState, useMemo } from "react";
import { BinaryTree } from "@/components/genealogy/BinaryTree";
import {
    Users,
    Search,
    RefreshCcw,
    Network,
    Zap,
    TrendingUp,
    Shield
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SponsorTreePage() {
    const { data: nodes = [], isLoading: loading, refetch } = useSponsorTree();
    const [searchQuery, setSearchQuery] = useState("");

    const stats = useMemo(() => {
        if (!nodes || nodes.length === 0) return { directs: 0, total: 0, active: 0, depth: 0 };

        const directs = nodes.filter((n: any) => !n.sponsor || nodes.findIndex((p: any) => p.user._id === n.sponsor) === -1).length;
        const total = nodes.length;
        const active = nodes.filter((n: any) => n.isActive !== false).length;

        // Simple depth calculation (max depth from the top nodes in this set)
        const depth = Math.max(...nodes.map((n: any) => n.depth || 0)) || 1;

        return { directs, total, active, depth };
    }, [nodes]);

    const resetTree = () => {
        setSearchQuery("");
        refetch();
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)] uppercase italic">Sponsor: <span className="text-[#10b981]">Genealogy</span></h1>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                        <span className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">Dashboard</span>
                        <span>•</span>
                        <span className="text-[#10b981]">Sponsor: Genealogy</span>
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

            {/* Tree Section */}
            <div className="bg-[#0B0E14]/30 border border-[var(--color-border)] rounded-lg p-4 relative min-h-[650px] shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <BinaryTree nodes={nodes} type="unilevel" />
            </div>

            {/* Bottom Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LevelStatCard
                    label="Direct Referrals"
                    value={stats.directs}
                    color="from-blue-600/20 to-brand-500/5"
                    textColor="text-brand-400"
                />
                <LevelStatCard
                    label="Total Team Size"
                    value={stats.total}
                    color="from-brand-500/20 to-brand-400/5"
                    textColor="text-cyan-400"
                />
                <LevelStatCard
                    label="Active Members"
                    value={stats.active}
                    color="from-brand-600/20 to-brand-500/5"
                    textColor="text-brand-400"
                />
                <LevelStatCard
                    label="Network Depth"
                    value={stats.depth}
                    color="from-brand-600/20 to-brand-500/5"
                    textColor="text-brand-400"
                />
            </div>
        </div>
    );
}

function LevelStatCard({ label, value, color, textColor }: { label: string, value: number, color: string, textColor: string }) {
    return (
        <div className={cn(
            "bg-gradient-to-br border border-[var(--color-border)] rounded-lg p-8 flex flex-col items-center justify-center space-y-2 shadow-xl transition-all hover:-translate-y-1 hover:border-[var(--color-border)]",
            color
        )}>
            <div className={cn("text-4xl font-black italic", textColor)}>
                {value}
            </div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {label}
            </div>
        </div>
    );
}
