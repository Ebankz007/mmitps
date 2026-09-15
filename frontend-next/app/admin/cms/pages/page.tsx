"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Copy,
    Eye
} from "lucide-react";
import Link from "next/link";

interface Page {
    _id: string;
    title: string;
    slug: string;
    published: boolean;
    updatedAt: string;
    content: any[];
}

export default function PageManagement() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/admin/cms/pages');
            setPages(res.data.data);
        } catch (err) {
            console.error("Failed to fetch pages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            await api.delete(`/api/v1/admin/cms/pages/${id}`);
            setPages(pages.filter(p => p._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Dynamic Pages</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">Create and manage content for custom platform pages.</p>
                </div>

                <Link
                    href="/admin/cms/pages/new"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all font-bold"
                >
                    <Plus className="h-4 w-4" />
                    Create New Page
                </Link>
            </div>

            {/* ── Search & Filter ── */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-surface border border-[var(--color-border)]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search by title or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-colors"
                    />
                </div>
            </div>

            {/* ── Pages Table ── */}
            <div className="rounded-lg border border-[var(--color-border)] bg-surface overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                                <th className="px-8 py-4">Title & Slug</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Blocks</th>
                                <th className="px-8 py-4">Last Updated</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6">
                                            <div className="h-4 w-full bg-[var(--color-surface-2)] rounded" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPages.length > 0 ? (
                                filteredPages.map((page) => (
                                    <tr key={page._id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-bold text-[var(--color-text-primary)]">{page.title}</p>
                                                <p className="text-[10px] text-[#10b981]/60 font-mono mt-0.5">/{page.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border ${page.published
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                    : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                                }`}>
                                                {page.published ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                <span className="text-[10px] font-black uppercase tracking-wider">{page.published ? 'Published' : 'Draft'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-[var(--color-text-secondary)]">{page.content?.length || 0} Blocks</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs text-[var(--color-text-muted)]">{new Date(page.updatedAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/cms/pages/${page._id}`}
                                                    className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[#10b981] hover:text-black text-[var(--color-text-secondary)] transition-all"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(page._id)}
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all shadow-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/${page.slug}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-brand-500 hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)] transition-all"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center opacity-20">
                                        <FileText className="h-10 w-10 mx-auto mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">No pages started yet</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
