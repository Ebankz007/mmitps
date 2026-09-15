/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useBinaryTree } from "@/hooks/use-mlm";
import { useState, useMemo } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Download,
    FileJson,
    FileText,
    SearchX
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/lib/auth-context";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function GenealogyListPage() {
    const { user } = useAuth();
    const { data: nodes = [], isLoading: loading, refetch } = useBinaryTree();
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState("2026-01-31");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Helper to calculate depth/level from the root (current user)
    const nodesWithLevel = useMemo(() => {
        if (!nodes.length || !user) return [];

        const nodeMap = new Map();
        nodes.forEach((n: any) => nodeMap.set(n._id, n));

        // Function to find depth relative to current user
        const getDepth = (nodeId: string): number => {
            let depth = 0;
            let current = nodeMap.get(nodeId);
            while (current && current.user?._id !== user._id && depth < 20) {
                current = nodeMap.get(current.parent || current.sponsor);
                depth++;
            }
            return depth;
        };

        return nodes.map((n: any) => ({
            ...n,
            level: getDepth(n._id)
        }));
    }, [nodes, user]);

    const filteredNodes = useMemo(() => {
        let result = [...nodesWithLevel];

        if (searchQuery && searchQuery !== "All Users") {
            const query = searchQuery.toLowerCase();
            result = result.filter((n: any) =>
                n.user?.username?.toLowerCase().includes(query) ||
                n.user?.name?.toLowerCase().includes(query)
            );
        }

        // Date filtering (dummy-ish as joinDate might not be a real Date object in all cases)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter((n: any) => {
                const join = n.joinDate ? new Date(n.joinDate) : new Date();
                return join >= start && join <= end;
            });
        }

        return result;
    }, [nodesWithLevel, searchQuery, startDate, endDate]);

    const paginatedNodes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredNodes.slice(start, start + itemsPerPage);
    }, [filteredNodes, currentPage]);

    const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);

    return (
        <div className="bg-[#020617] min-h-screen p-8 text-[var(--color-text-primary)] font-sans">
            {/* Header */}
            <div className="mb-8">
                <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#38BDF8] cursor-pointer hover:underline">Dashboard</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 italic">List: Genealogy</span>
                </nav>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] uppercase italic">
                    List: <span className="text-[#10b981]">Genealogy</span>
                </h1>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-6 mb-8 shadow-xl">
                <div className="flex flex-col lg:flex-row items-end gap-6">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Pick Start Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[#020617] border border-[var(--color-border)] rounded-lg py-3 px-4 text-sm font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:border-[#10b981]/50 outline-none transition-all"
                            />
                            <div className="absolute right-4 top-3 flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <div className="w-4 h-4 bg-brand-500 rounded-sm flex items-center justify-center">
                                    <CalendarIcon className="h-2.5 w-2.5 text-[var(--color-text-primary)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Pick End Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[#020617] border border-[var(--color-border)] rounded-lg py-3 px-4 text-sm font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:border-[#10b981]/50 outline-none transition-all"
                            />
                            <div className="absolute right-4 top-3 flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <div className="w-4 h-4 bg-brand-500 rounded-sm flex items-center justify-center">
                                    <CalendarIcon className="h-2.5 w-2.5 text-[var(--color-text-primary)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Username</label>
                        <select
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#020617] border border-[var(--color-border)] rounded-lg py-3 px-4 text-sm font-bold text-[var(--color-text-primary)] appearance-none focus:border-[#10b981]/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="All Users">All Users</option>
                            {nodes.map((n: any) => (
                                <option key={n._id} value={n.user?.username}>{n.user?.username}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="bg-[#059669] hover:bg-brand-500 text-[var(--color-text-primary)] font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-brand-500/20 active:scale-95 whitespace-nowrap"
                    >
                        Get Report
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-[#0B1224]/50 border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]"> NO </th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]"> USERNAME </th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right"> DATE OF JOIN </th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right"> LEVEL </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedNodes.length > 0 ? paginatedNodes.map((node, index) => (
                                <tr key={node._id} className="border-b border-[var(--color-border)] hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-8 py-4 text-xs font-black text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
                                                <Search className="h-4 w-4 text-[#10b981]" />
                                            </div>
                                            <span className="text-sm font-black text-gray-200 uppercase tracking-tight group-hover:text-[var(--color-text-primary)] transition-colors">
                                                {node.user?.username || "loading"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right text-xs font-bold text-gray-400 italic">
                                        {node.joinDate ? new Date(node.joinDate).toLocaleDateString() : '01/15/2026'}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <span className="text-xs font-black text-[var(--color-text-primary)] px-3 py-1 bg-[var(--color-surface-2)] rounded border border-[var(--color-border)] uppercase italic">
                                            LVL {node.level}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        {!loading ? (
                                            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                                                <div className="relative">
                                                    <div className="w-20 h-14 bg-[#0B1224] border border-[var(--color-border)] rounded flex items-center justify-center overflow-hidden">
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                            <div className="w-full h-[1px] bg-surface translate-y-[-4px]"></div>
                                                            <div className="w-full h-[1px] bg-surface translate-y-[0px]"></div>
                                                            <div className="w-full h-[1px] bg-surface translate-y-[4px]"></div>
                                                        </div>
                                                        <SearchX className="h-6 w-6 text-gray-500 relative z-10" />
                                                    </div>
                                                    <div className="absolute -top-4 -right-2 text-xl font-black text-gray-600">&gt;</div>
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-600 italic">No Data Available</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Analyzing Network...</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Card */}
                <div className="mt-auto border-t border-[var(--color-border)] px-8 py-4 flex items-center justify-end gap-2 bg-[#020617]/50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center text-gray-500 hover:text-[var(--color-text-primary)] hover:border-white/30 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages || 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={cn(
                                "w-8 h-8 rounded text-xs font-black transition-all",
                                currentPage === i + 1
                                    ? "bg-[#059669] text-[var(--color-text-primary)] shadow-lg shadow-brand-500/20"
                                    : "border border-[var(--color-border)] text-gray-500 hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center text-gray-500 hover:text-[var(--color-text-primary)] hover:border-white/30 transition-all"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Footer / Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-8 bg-[#0B1224] border border-[var(--color-border)] mt-8 rounded-lg shadow-2xl">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Showing <span className="text-[var(--color-text-primary)]">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredNodes.length)}</span> of <span className="text-[#38BDF8]">{filteredNodes.length}</span> members
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Export:</span>
                    <button className="flex items-center gap-2 bg-[#0C1F21] border border-[#14B8A6]/20 px-4 py-2 rounded text-[10px] font-black text-[#14B8A6] uppercase tracking-widest hover:bg-[#14B8A6]/10 transition-all">
                        <FileJson className="h-3.5 w-3.5" /> CSV
                    </button>
                    <button className="flex items-center gap-2 bg-[#1C161C] border border-[#EC4899]/20 px-4 py-2 rounded text-[10px] font-black text-[#EC4899] uppercase tracking-widest hover:bg-[#EC4899]/10 transition-all">
                        <FileText className="h-3.5 w-3.5" /> PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
