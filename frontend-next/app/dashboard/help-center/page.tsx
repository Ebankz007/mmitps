/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    Search, 
    HelpCircle, 
    Book, 
    ChevronRight, 
    ArrowRight,
    MessageSquare,
    LifeBuoy,
    FileText,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
}

interface Article {
    _id: string;
    title: string;
    slug: string;
    viewCount: number;
}

export default function HelpCenterLanding() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [trending, setTrending] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [catRes, trendRes] = await Promise.all([
                    api.get("/api/v1/help-center/categories"),
                    api.get("/api/v1/help-center/articles?status=published")
                ]);
                setCategories(catRes.data.data);
                // Sort by views for trending
                const sorted = trendRes.data.data.sort((a: any, b: any) => b.viewCount - a.viewCount).slice(0, 5);
                setTrending(sorted);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await api.get(`/api/v1/help-center/articles/search?q=${encodeURIComponent(val)}`);
            setSearchResults(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero Search Section */}
            <div className="relative py-16 px-8 rounded-lg bg-gradient-to-br from-brand-600/20 via-blue-600/5 to-transparent border border-[var(--color-border)] overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <LifeBuoy className="w-64 h-64 text-[var(--color-text-primary)]" />
                </div>
                
                <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
                    <div className="space-y-3">
                        <h1 className="text-5xl font-black tracking-tighter text-[var(--color-text-primary)]">
                            How can we <span className="text-brand-500 underline decoration-brand-500/30 underline-offset-8">help?</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-medium">Search our dynamic knowledge base for guides, tutorials, and instant answers.</p>
                    </div>

                    <div className="relative group/search">
                        <div className="absolute inset-0 bg-brand-500/20 blur-3xl opacity-0 group-hover/search:opacity-50 transition-opacity duration-500" />
                        <div className="relative bg-black/40 backdrop-blur-3xl border border-[var(--color-border)] group-hover/search:border-brand-500/40 rounded-lg p-2 flex items-center shadow-2xl transition-all duration-300">
                            <Search className="ml-4 h-6 w-6 text-gray-500 group-hover/search:text-brand-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="E.g. How to deposit, COT Data guide, withdrawal limits..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none py-4 px-4 text-[var(--color-text-primary)] placeholder:text-gray-600 focus:ring-0 text-lg font-medium"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.length > 1 && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-surface border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden z-20 animate-in slide-in-from-top-4">
                                <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Results</span>
                                    {searching && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {searchResults.length === 0 && !searching ? (
                                        <div className="p-8 text-center text-gray-500 italic text-sm">No articles found matching "{searchQuery}"</div>
                                    ) : (
                                        searchResults.map(art => (
                                            <Link 
                                                key={art._id}
                                                href={`/dashboard/help-center/${art.slug}`}
                                                className="flex items-center gap-4 p-5 hover:bg-brand-500/10 border-b border-[var(--color-border)] transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-gray-500 group-hover:text-brand-500 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors">{art.title}</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium">Read Article</p>
                                                </div>
                                                <ChevronRight className="ml-auto h-4 w-4 text-gray-700 group-hover:text-brand-500" />
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Categories Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                            <Book className="h-5 w-5 text-brand-500" /> Knowledge Categories
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading ? (
                             Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-[var(--color-surface-2)] rounded-lg animate-pulse" />)
                        ) : (
                            categories.map(cat => (
                                <Link 
                                    key={cat._id}
                                    href={`/dashboard/help-center?category=${cat._id}`}
                                    className="group p-8 bg-surface border border-[var(--color-border)] hover:border-brand-500/20 rounded-lg transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/5 rounded-full group-hover:bg-brand-500/10 transition-colors blur-2xl" />
                                    
                                    <div className="w-14 h-14 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] group-hover:border-brand-500/40 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                                        <HelpCircle className="h-7 w-7 text-gray-400 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                    
                                    <h3 className="text-lg font-black text-[var(--color-text-primary)] mb-2 group-hover:text-brand-500 transition-colors">{cat.name}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed transition-colors group-hover:text-gray-400">
                                        {cat.description || "Discover useful guides and information about " + cat.name}
                                    </p>
                                    
                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                        Browse Articles <ArrowRight className="h-3 w-3" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Trending & Quick Links */}
                <div className="space-y-8">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2 mb-2">
                             <TrendingUp className="h-4 w-4 text-emerald-500" /> Popular Guides
                        </h3>
                        <div className="space-y-4">
                            {trending.map(art => (
                                <Link 
                                    key={art._id}
                                    href={`/dashboard/help-center/${art.slug}`}
                                    className="block group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-brand-500/40 group-hover:bg-brand-500 transition-colors" />
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-300 group-hover:text-[var(--color-text-primary)] transition-colors">{art.title}</h4>
                                            <p className="text-[10px] text-gray-600 mt-1 font-mono uppercase tracking-widest">{art.viewCount} Views</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Support Call to Action */}
                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-lg p-8 text-[var(--color-text-primary)] space-y-6 relative overflow-hidden shadow-2xl shadow-brand-500/20">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                            <MessageSquare className="w-32 h-32" />
                        </div>
                         
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black tracking-tight leading-tight">Couldn't find what you were looking for?</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm font-medium">Our support team is online and ready to help you with any issues.</p>
                            
                            <Link 
                                href="/dashboard/support/tickets"
                                className="inline-flex items-center gap-3 bg-surface text-black px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <MessageSquare className="h-4 w-4" /> Open Support Ticket
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
