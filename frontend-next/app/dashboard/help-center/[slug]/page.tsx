/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    ArrowLeft, 
    Clock, 
    Share2, 
    ThumbsUp, 
    ThumbsDown,
    Calendar,
    ChevronRight,
    Eye
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Article {
    _id: string;
    title: string;
    slug: string;
    content: string;
    category: {
        _id: string;
        name: string;
    };
    updatedAt: string;
    viewCount: number;
}

export default function HelpArticleView() {
    const params = useParams();
    const slug = params.slug as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [related, setRelated] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/v1/help-center/articles/s/${slug}`);
                setArticle(res.data.data);
                
                // Fetch related articles in same category
                const relRes = await api.get(`/api/v1/help-center/articles?category=${res.data.data.category?._id}&status=published`);
                setRelated(relRes.data.data.filter((a: any) => a._id !== res.data.data._id).slice(0, 5));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchArticle();
    }, [slug]);

    if (loading) return <div className="text-center py-40 animate-pulse text-gray-500 uppercase tracking-widest font-black text-xs">Loading Knowledge Base...</div>;
    if (!article) return <div className="text-center py-40 text-rose-500 font-bold">Article not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Breadcrumbs & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="space-y-4">
                    <Link href="/dashboard/help-center" className="flex items-center gap-2 text-brand-500 hover:text-brand-400 transition-colors text-xs font-black uppercase tracking-widest group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Help Center
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                        <span>Help Center</span>
                        <ChevronRight className="h-3 w-3 text-gray-700" />
                        <span className="text-brand-500/80">{article.category?.name}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-500/40" />
                        Updated {new Date(article.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-brand-500/40" />
                        {article.viewCount} Views
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.1]">
                        {article.title}
                    </h1>

                    <div 
                        className={`prose prose-invert prose-brand max-w-none text-gray-400 leading-relaxed text-lg
                            prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                            prose-a:text-brand-500 prose-strong:text-brand-500
                            prose-img:rounded-lg prose-img:border prose-img:border-white/10
                            prose-blockquote:border-brand-500 prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-lg
                            prose-ul:list-disc prose-ol:list-decimal`}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Feedback Section */}
                    <div className="mt-20 p-8 rounded-lg bg-white/[0.02] border border-white/5 text-center space-y-6">
                        <h4 className="text-lg font-black text-white">Was this article helpful?</h4>
                        <div className="flex items-center justify-center gap-4">
                            <button className="flex items-center gap-2 px-8 py-4 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/40 transition-all font-black text-xs uppercase tracking-widest">
                                <ThumbsUp className="h-4 w-4" /> Yes
                            </button>
                            <button className="flex items-center gap-2 px-8 py-4 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 border border-white/5 hover:border-rose-500/40 transition-all font-black text-xs uppercase tracking-widest">
                                <ThumbsDown className="h-4 w-4" /> No
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-12">
                     {/* Related Articles */}
                     <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Related Articles</h3>
                        <div className="space-y-4">
                            {related.length === 0 ? (
                                <p className="text-sm font-medium text-gray-600 italic">No other articles in this category yet.</p>
                            ) : (
                                related.map(rel => (
                                    <Link key={rel._id} href={`/dashboard/help-center/${rel.slug}`} className="block group">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-gray-300 group-hover:text-brand-500 transition-colors">{rel.title}</h4>
                                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{new Date(rel.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                     </div>

                     {/* Quick Contact */}
                     <div className="p-8 rounded-lg bg-brand-500/5 border border-brand-500/20 space-y-6">
                        <h3 className="text-sm font-black text-white tracking-tight">Need more help?</h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">If you couldn't find your answer, please reach out to our dedicated support engine.</p>
                        <Link 
                            href="/dashboard/support/tickets"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-brand-500 hover:bg-brand-600 text-black font-black rounded-lg text-[10px] uppercase tracking-widest transition-all"
                        >
                            Open a Ticket
                        </Link>
                     </div>
                </div>
            </div>
            
            <style jsx global>{`
                .prose p { margin-bottom: 1.5rem; }
                .prose img { max-width: 100%; height: auto; margin: 2rem 0; }
                .prose ul, .prose ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .prose li { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}
