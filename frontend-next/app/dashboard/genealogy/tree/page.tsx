/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useBinaryTree } from "@/hooks/use-mlm";
import { useState, useMemo, useEffect } from "react";
import {
    Search,
    RotateCcw,
    ChevronRight,
    ChevronDown,
    User,
    Shield,
    Clock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/lib/auth-context";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Tree Member Component ───────────────────────────────────────────────────
interface TreeMemberProps {
    node: any;
    allNodes: any[];
    level: number;
    isLast: boolean;
    searchQuery: string;
}

const TreeMember = ({ node, allNodes, level, isLast, searchQuery }: TreeMemberProps) => {
    const [isExpanded, setIsExpanded] = useState(level < 2 || !!searchQuery);

    // Find children in the sponsor tree
    const children = useMemo(() => {
        return allNodes.filter(n => n.sponsor === node._id || n.parent === node._id);
    }, [allNodes, node._id]);

    const hasChildren = children.length > 0;
    const isMatched = searchQuery && (
        node.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-expand if child is matched
    useEffect(() => {
        if (searchQuery) {
            const hasMatchedChild = (n: any): boolean => {
                const results = allNodes.filter(child => child.sponsor === n._id || child.parent === n._id);
                return results.some(child =>
                    child.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hasMatchedChild(child)
                );
            };
            if (hasMatchedChild(node)) setIsExpanded(true);
        }
    }, [searchQuery, node, allNodes]);

    const getRankColor = (r: string) => {
        switch (r?.toLowerCase()) {
            case 'admin': return '#10b981';
            case 'pro': return '#10b981';
            case 'enterprise': return '#EC4899';
            default: return '#10B981';
        }
    };

    const rankColor = getRankColor(node.rank || node.user?.rank);

    return (
        <div className="relative">
            {/* Connection Lines */}
            {level > 0 && (
                <div className="absolute left-[-28px] top-[-24px] bottom-0 border-l border-[var(--color-border)]">
                    <div className="absolute top-[36px] left-0 w-6 border-t border-[var(--color-border)]"></div>
                </div>
            )}

            <div className={cn(
                "flex items-center gap-3 py-3 group cursor-pointer transition-all",
                isMatched && "bg-brand-500/5 -mx-4 px-4 rounded-lg"
            )}>
                {/* Expand/Collapse Toggle */}
                <div
                    onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center transition-all z-10",
                        !hasChildren ? "bg-[var(--color-surface-2)] opacity-30" :
                            isExpanded ? "bg-[#059669] shadow-lg shadow-brand-500/20" : "bg-[var(--color-surface-3)] group-hover:bg-[var(--color-surface-3)]"
                    )}
                >
                    {isExpanded ? <ChevronDown className="h-3 w-3 text-[var(--color-text-primary)]" /> : <ChevronRight className="h-3 w-3 text-[var(--color-text-secondary)]" />}
                </div>

                {/* Avatar */}
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full bg-[#161B22] border-2 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl"
                        style={{ borderColor: rankColor }}
                    >
                        {node.rank === 'Admin' ? (
                            <Shield className="h-5 w-5" style={{ color: rankColor }} />
                        ) : (
                            <User className="h-5 w-5" style={{ color: rankColor }} />
                        )}
                    </div>
                    {isMatched && (
                        <div className="absolute inset-0 rounded-full animate-ping border border-blue-400 opacity-50"></div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <span className={cn(
                        "text-sm font-black uppercase tracking-tight transition-colors",
                        isMatched ? "text-brand-400" : "text-gray-300 group-hover:text-[var(--color-text-primary)]"
                    )}>
                        {node.user?.username || "loading..."}
                    </span>
                    {node.user?.name && (
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter -mt-1">
                            {node.user.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Recursion for Children */}
            {hasChildren && isExpanded && (
                <div className="ml-12 border-l border-[var(--color-border)] pl-4 pb-2">
                    {children.map((child, idx) => (
                        <TreeMember
                            key={child._id}
                            node={child}
                            allNodes={allNodes}
                            level={level + 1}
                            isLast={idx === children.length - 1}
                            searchQuery={searchQuery}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function GenealogyTreePage() {
    const { user } = useAuth();
    const { data: nodes = [], isLoading: loading, refetch } = useBinaryTree();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const rootNode = useMemo(() => {
        if (!nodes.length || !user) return null;
        return nodes.find((n: any) => n.user?._id === user._id) || nodes[0];
    }, [nodes, user]);

    const handleReset = () => {
        setSearchQuery("");
        setActiveSearch("");
        refetch();
    };

    return (
        <div className="bg-[#020617] min-h-screen p-8 text-[var(--color-text-primary)] font-sans">
            {/* Header */}
            <div className="mb-8">
                <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#38BDF8] cursor-pointer hover:underline">Dashboard</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 italic">Tree: Genealogy</span>
                </nav>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] uppercase italic">
                    Tree: <span className="text-[#10b981]">Genealogy</span>
                </h1>
            </div>

            {/* Content Container */}
            <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg shadow-2xl relative flex flex-col min-h-[700px]">

                {/* Toolbar */}
                <div className="p-6 border-b border-[var(--color-border)] flex flex-wrap items-center gap-4">
                    <div className="relative group w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Search User"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setActiveSearch(searchQuery)}
                            className="w-full bg-[#020617] border border-[var(--color-border)] rounded-lg py-3 px-10 text-xs font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:border-[#10b981]/50 outline-none transition-all"
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>

                    <button
                        onClick={() => setActiveSearch(searchQuery)}
                        className="bg-[#059669] hover:bg-brand-500 text-[var(--color-text-primary)] font-black text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        Search User
                    </button>

                    <button
                        onClick={handleReset}
                        className="bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] font-black text-[11px] uppercase tracking-widest px-8 py-3.5 rounded-lg transition-all flex items-center gap-2 border border-[var(--color-border)]"
                    >
                        Reset <RotateCcw className="h-4 w-4" />
                    </button>
                </div>

                {/* Tree Viewport */}
                <div className="flex-1 p-8 overflow-auto scrollbar-thin scrollbar-thumb-white/5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Mapping Organization...</p>
                        </div>
                    ) : rootNode ? (
                        <div className="max-w-4xl mx-auto">
                            <TreeMember
                                node={rootNode}
                                allNodes={nodes}
                                level={0}
                                isLast={true}
                                searchQuery={activeSearch}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <Clock className="h-10 w-10 text-gray-800" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">No Network Data Available</p>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-6 right-6 pointer-events-none">
                    <div className="w-24 h-24 bg-brand-600/5 blur-[50px] rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
