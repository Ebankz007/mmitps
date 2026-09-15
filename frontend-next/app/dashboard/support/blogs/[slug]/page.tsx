"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cmsService, NewsArticle } from "@/lib/api/cms";
import {
    Calendar,
    Clock,
    ArrowLeft,
    Share2,
    Bookmark,
    Facebook,
    Twitter,
    Linkedin as LinkedIn,
    MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArticle = async () => {
            if (!params.slug) return;
            setLoading(true);
            try {
                const data = await cmsService.getArticle(params.slug as string);
                setArticle(data);
            } catch (err) {
                console.error("Failed to load article:", err);
            } finally {
                setLoading(false);
            }
        };
        loadArticle();
    }, [params.slug]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
    );

    if (!article) return (
        <div className="text-center py-20 px-4">
            <h1 className="text-2xl font-black uppercase text-white/20 mb-6 tracking-widest">Article Not Found</h1>
            <button
                onClick={() => router.back()}
                className="px-10 py-4 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:bg-white/10 transition-all"
            >
                Back to Blogs
            </button>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-12 pb-20 px-4 md:px-0 pt-4"
        >
            <button
                onClick={() => router.back()}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
                <ArrowLeft size={14} /> Back to Hub
            </button>

            {/* Header section */}
            <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {article.category}
                    </span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} /> 12 MIN READ
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight uppercase">
                    {article.title}
                </h1>

                <p className="text-xl font-bold text-white/60 leading-relaxed italic border-l-4 border-brand-500/50 pl-6">
                    {article.summary}
                </p>
            </div>

            {/* Featured Image */}
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/5 shadow-2xl relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={article.thumbnail || "https://images.unsplash.com/photo-1611974717482-4740263f90b9?q=80&w=2070&auto=format&fit=crop"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Social Share bar */}
            <div className="sticky top-24 float-left -ml-24 hidden lg:flex flex-col gap-4">
                {[
                    { icon: Share2, label: "Share" },
                    { icon: Facebook, label: "Facebook" },
                    { icon: Twitter, label: "Twitter" },
                    { icon: LinkedIn, label: "LinkedIn" },
                    { icon: Bookmark, label: "Save" }
                ].map((social, i) => (
                    <button key={i} className="w-12 h-12 rounded-lg bg-[#080E1A] border border-white/5 flex items-center justify-center text-white/20 hover:text-brand-500 hover:border-brand-500/30 transition-all">
                        <social.icon size={18} />
                    </button>
                ))}
            </div>

            {/* Content area */}
            <div className="prose prose-invert prose-amber max-w-none">
                <div
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className="text-white/70 font-medium text-lg leading-loose space-y-6"
                />
            </div>

            {/* Footer / Meta */}
            <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-black font-black text-xl">
                        {article.author.firstName[0]}{article.author.lastName[0]}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Written By</div>
                        <div className="text-lg font-black text-white uppercase tracking-tight">
                            {article.author.firstName} {article.author.lastName}
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-10 py-5 bg-brand-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        Join Community <MessageCircle size={14} />
                    </button>
                </div>
            </div>
            {/* Footer Section */}
            <footer className="pt-20 pb-10 text-center border-t border-white/5 mt-10">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
                        MMITPS INC • Trading Insights & Education
                    </h4>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        Stay updated with the latest market analysis and trading strategies
                    </p>
                </div>
            </footer>
        </motion.div>
    );
}
