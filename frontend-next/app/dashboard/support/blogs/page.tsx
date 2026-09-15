"use client";

import { useState, useEffect } from "react";
import { cmsService, NewsArticle } from "@/lib/api/cms";
import {
    Search,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Brain,
    LineChart,
    User,
    BookOpen,
    Layout,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface CategoryIcon {
    icon: React.ElementType;
    color: string;
    bg: string;
}

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
    "TRADING EDUCATION": { icon: BarChart3, color: "text-brand-500", bg: "bg-brand-500/10" },
    "MARKET ANALYSIS": { icon: Brain, color: "text-rose-500", bg: "bg-rose-500/10" },
    "TRADING PSYCHOLOGY": { icon: User, color: "text-amber-500", bg: "bg-amber-500/10" },
    "TECHNICAL ANALYSIS": { icon: LineChart, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "default": { icon: BookOpen, color: "text-[#10b981]", bg: "bg-[#10b981]/10" }
};

export default function BlogsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                const data = await cmsService.getLatestNews(selectedCategory === "all" ? undefined : selectedCategory);
                setArticles(data);
            } catch (err) {
                console.error("Failed to load articles:", err);
            } finally {
                setLoading(false);
            }
        };
        loadArticles();
    }, [selectedCategory]);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProduct = selectedProduct === "all" || article.tags?.includes(selectedProduct);
        return matchesSearch && matchesProduct;
    });

    const getIconForCategory = (category: string) => {
        const upperCat = category.toUpperCase();
        return CATEGORY_ICONS[upperCat] || CATEGORY_ICONS["default"];
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8 pt-4 text-[var(--color-text-primary)] min-h-screen">
            {/* Header Section */}
            <div className="space-y-1">
                <h1 className="text-4xl font-black uppercase tracking-tight text-[var(--color-text-primary)]">Blogs</h1>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                    <span>Dashboard</span>
                    <ChevronRight size={10} />
                    <span className="text-[var(--color-text-secondary)]">Blogs</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-6 bg-[#080E1A] border border-[var(--color-border)] rounded-lg shadow-xl">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* Select Product */}
                    <div className="relative group w-full lg:w-64">
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full bg-[#0D1529] border border-[var(--color-border)] rounded-lg py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer group-hover:border-[var(--color-border-hover)] transition-all"
                        >
                            <option value="all">Select Product</option>
                            <option value="forex">Forex</option>
                            <option value="crypto">Crypto</option>
                            <option value="indices">Indices</option>
                            <option value="commodities">Commodities</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
                    </div>

                    {/* Select Category */}
                    <div className="relative group w-full lg:w-64">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-[#0D1529] border border-[var(--color-border)] rounded-lg py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer group-hover:border-[var(--color-border-hover)] transition-all"
                        >
                            <option value="all">Select Category</option>
                            <option value="trading education">Trading Education</option>
                            <option value="market analysis">Market Analysis</option>
                            <option value="trading psychology">Trading Psychology</option>
                            <option value="technical analysis">Technical Analysis</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
                    </div>

                    {/* Search Input Group */}
                    <div className="flex flex-1 w-full gap-2">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0D1529] border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] focus:outline-none focus:border-amber-500/50 group-hover:border-[var(--color-border-hover)] transition-all"
                            />
                        </div>
                        <button className="px-10 py-3 bg-brand-600 hover:bg-brand-500 text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-500/20 transition-all active:scale-95">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {filteredArticles.length === 0 ? (
                    <div className="col-span-full py-20 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                        <Layout className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em]">No Articles Found</p>
                    </div>
                ) : (
                    filteredArticles.map((article) => {
                        const { icon: CategoryIcon, color: catColor, bg: catBg } = getIconForCategory(article.category);
                        return (
                            <Link
                                href={`/dashboard/support/blogs/${article.slug}`}
                                key={article._id}
                                className="group bg-[#080E1A] border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col hover:border-amber-500/30 transition-all shadow-xl"
                            >
                                {/* Thumbnail / Icon Area */}
                                <div className="relative h-48 bg-[#0D1529] flex flex-col items-center justify-center p-6 text-center border-b border-[var(--color-border)]">
                                    <div className={clsx("p-4 rounded-lg border border-[var(--color-border)] mb-4 transition-transform duration-500 group-hover:scale-110 shadow-inner", catBg)}>
                                        <CategoryIcon className={clsx("w-8 h-8", catColor)} />
                                    </div>
                                    <span className={clsx("text-[9px] font-black uppercase tracking-[0.2em]", catColor)}>
                                        {article.category}
                                    </span>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 space-y-4 flex-1 flex flex-col">
                                    <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                        {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] leading-tight uppercase group-hover:text-amber-500 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 uppercase tracking-tight">
                                        {article.summary}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            {/* Footer Section */}
            <footer className="pt-20 pb-10 text-center border-t border-[var(--color-border)]">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-400">
                        MMITPS INC • Trading Insights & Education
                    </h4>
                    <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">
                        Stay updated with the latest market analysis and trading strategies
                    </p>
                </div>
            </footer>
        </div>
    );
}
