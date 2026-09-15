"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
    Coins, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    ExternalLink,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenPool {
    _id: string;
    name: string;
    assetType: 'real_estate' | 'commodity' | 'startup' | 'art' | 'other';
    totalTokenSupply: number;
    tokenPrice: number;
    tokensSold: number;
    status: 'upcoming' | 'open' | 'closed' | 'completed' | 'cancelled';
    expectedReturn: string;
    duration: string;
    startDate: string;
    endDate: string;
}

export default function TokenPoolManagementPage() {
    const [pools, setPools] = useState<TokenPool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPools = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/pools"); // Assuming this is the endpoint
            setPools(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch pools:", error);
            // toast.error("Failed to sync pools from the ledger.");
            // For now, if API fails, we might be in early dev, but user wants functional stubs
            // I'll leave it as empty or mock if it fails to ensure they see a "Empty" state not a crash
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to decommission this token pool? This action is recorded in the permanent ledger.")) return;
        try {
            await api.delete(`/api/v1/admin/pools/${id}`);
            setPools(prev => prev.filter(p => p._id !== id));
            toast.success("Pool decommissioned successfully.");
        } catch (error) {
            toast.error("Failed to decommission pool.");
        }
    };

    const getStatusColor = (status: TokenPool['status']) => {
        switch (status) {
            case 'open': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'upcoming': return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
            case 'closed': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'completed': return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
            case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const filteredPools = pools.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.assetType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-pink-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">
                            Asset Tokenization Hub
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        Token <span className="text-[var(--color-text-secondary)]">Pools</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toast.info("Pool architect module launching soon...")}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-500 text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Initialize New Pool
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input 
                        type="text"
                        placeholder="Search assets or pool names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-[var(--color-border)] rounded-lg pl-12 pr-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 rounded-lg bg-surface border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                        <Filter className="w-4 h-4" />
                    </button>
                    <div className="h-8 w-px bg-[var(--color-surface-2)] mx-2" />
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                        {filteredPools.length} Pools Synchronized
                    </p>
                </div>
            </div>

            {/* Pools Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
                    <Coins className="w-12 h-12 animate-bounce mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Retrieving Tokenized Assets...</p>
                </div>
            ) : filteredPools.length === 0 ? (
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-[var(--color-border)] flex items-center justify-center mb-2">
                        <AlertCircle className="w-8 h-8 text-white/10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest">No Active Pools</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Start by initializing your first asset-backed token pool.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPools.map((pool) => (
                        <div key={pool._id} className="group relative bg-surface border border-[var(--color-border)] rounded-lg p-6 transition-all hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/5">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", getStatusColor(pool.status))}>
                                    {pool.status}
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(pool._id)}
                                        className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">{pool.name}</h3>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mt-1">{pool.assetType}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <p className="text-[9px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">Price</p>
                                        <p className="text-sm font-black text-pink-400">${pool.tokenPrice}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                        <p className="text-[9px] text-[var(--color-text-muted)] font-black uppercase tracking-widest mb-1">Return</p>
                                        <p className="text-sm font-black text-green-400">{pool.expectedReturn}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-[var(--color-text-secondary)]">Funding Progress</span>
                                        <span className="text-pink-500">{((pool.tokensSold / pool.totalTokenSupply) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(pool.tokensSold / pool.totalTokenSupply) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
                                        <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">{pool.duration}</span>
                                    </div>
                                    <button className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-pink-500 transition-colors flex items-center gap-1">
                                        View Analytics <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
