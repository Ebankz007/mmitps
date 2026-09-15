"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
    Newspaper, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    Eye,
    CheckCircle,
    XCircle,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminNewsPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/admin/cms/news");
            setArticles(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch news", err);
            toast.error("Failed to load news articles");
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (id: string, currentStatus: boolean) => {
        try {
            // This would normally be a dedicated endpoint or PUT /news/:id
            await api.put(`/api/v1/news/${id}`, { isPublished: !currentStatus });
            toast.success(`Article ${!currentStatus ? 'published' : 'unpublished'}`);
            fetchArticles();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        News <span className="text-[var(--color-text-secondary)]">Articles</span>
                    </h1>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mt-1">
                        Manage platform-wide market updates and institutional news
                    </p>
                </div>

                <Link href="/admin/cms/news/new" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#10b981] text-black text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all">
                    <Plus className="h-4 w-4" />
                    Create Article
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                    <Filter className="h-3 w-3" />
                    Filters
                </button>
            </div>

            {/* Articles Table */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-white/[0.02]">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Article</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Category</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Date</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-8">
                                            <div className="h-4 bg-[var(--color-surface-2)] rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Newspaper className="h-12 w-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">No articles found</p>
                                    </td>
                                </tr>
                            ) : articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map((article: any) => (
                                <tr key={article._id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors">{article.title}</span>
                                            <span className="text-[10px] text-[var(--color-text-muted)] uppercase mt-1">{article.slug}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/10 rounded-full text-[9px] font-black uppercase">
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <button 
                                            onClick={() => togglePublish(article._id, article.isPublished)}
                                            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${article.isPublished ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}
                                        >
                                            {article.isPublished ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {article.isPublished ? 'Published' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-secondary)] hover:text-[#10b981] transition-all">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500/40 hover:text-rose-500 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
