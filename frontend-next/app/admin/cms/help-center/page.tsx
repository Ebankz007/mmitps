/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    Plus, 
    Trash2, 
    Edit3, 
    Search,
    Filter,
    FileText,
    Eye,
    Settings2,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface Article {
    _id: string;
    title: string;
    slug: string;
    category: {
        name: string;
    };
    status: string;
    updatedAt: string;
    viewCount: number;
}

export default function HelpCenterDashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/help-center/articles");
            setArticles(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/api/v1/help-center/admin/articles/${id}`);
            fetchArticles();
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = articles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)]">
                        Knowledge <span className="text-amber-500">Base</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Manage articles, guides & documentation</p>
                </div>
                <div className="flex gap-3">
                    <Link 
                        href="/admin/cms/help-center/categories"
                        className="px-6 py-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-black rounded-lg transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        <Settings2 className="h-4 w-4 text-amber-500" /> Categories
                    </Link>
                    <Link 
                        href="/admin/cms/help-center/editor"
                        className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-lg transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        <Plus className="h-4 w-4" /> Create Article
                    </Link>
                </div>
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by title, keywords or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50"
                    />
                </div>
                <button className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-6 flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase cursor-not-allowed">
                    <Filter className="h-4 w-4" /> Filters
                </button>
            </div>

            {/* List */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-[var(--color-border)] text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <th className="px-8 py-5">Article & Path</th>
                                <th className="px-8 py-5 text-center">Category</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-center">Performance</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-[var(--color-surface-2)] rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center opacity-20">
                                        <FileText className="h-16 w-16 mx-auto mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest">Knowledge Base is Empty</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((art) => (
                                    <tr key={art._id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-gray-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-0.5">{art.title}</h4>
                                                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter">/{art.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[var(--color-text-primary)] transition-colors">
                                                {art.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                art.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {art.status === 'published' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                {art.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-black text-[var(--color-text-primary)]">{art.viewCount}</span>
                                                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Views</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/dashboard/help-center/${art.slug}`}
                                                    target="_blank"
                                                    className="p-2.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-400 hover:text-[var(--color-text-primary)] transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <Link 
                                                    href={`/admin/cms/help-center/editor?id=${art._id}`}
                                                    className="p-2.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-amber-500 text-gray-400 hover:text-black transition-all"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(art._id)}
                                                    className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all shadow-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
