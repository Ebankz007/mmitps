"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    Settings,
    Globe,
    FileText,
    Eye,
    Loader2,
    ChevronUp,
    ChevronDown,
    Layout,
    Image as ImageIcon,
    Type,
    Layers,
    MousePointer2
} from "lucide-react";
import Link from "next/link";

interface PageData {
    _id?: string;
    title: string;
    slug: string;
    published: boolean;
    layout: string;
    seo: {
        title: string;
        description: string;
        keywords: string[];
        ogImage: string;
    };
    content: any[]; // These will be our blocks
}

const BLOCK_TYPES = [
    { type: 'hero', label: 'Hero Section', icon: Layout },
    { type: 'text', label: 'Rich Text', icon: Type },
    { type: 'features', label: 'Features Grid', icon: Layers },
    { type: 'cta', label: 'Call to Action', icon: MousePointer2 },
    { type: 'gallery', label: 'Image Gallery', icon: ImageIcon },
];

export default function PageEditor() {
    const { id } = useParams();
    const router = useRouter();
    const isNew = id === 'new';

    const [page, setPage] = useState<PageData>({
        title: "",
        slug: "",
        published: false,
        layout: "default",
        seo: { title: "", description: "", keywords: [], ogImage: "" },
        content: []
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');

    useEffect(() => {
        if (!isNew) {
            fetchPage();
        }
    }, [id]);

    const fetchPage = async () => {
        try {
            const res = await api.get(`/api/v1/admin/cms/pages/${id}`);
            setPage(res.data.data);
        } catch (err) {
            console.error("Failed to fetch page", err);
            router.push('/admin/cms/pages');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const res = await api.post('/api/v1/admin/cms/pages', page);
                router.push(`/admin/cms/pages/${res.data.data._id}`);
            } else {
                await api.put(`/api/v1/admin/cms/pages/${id}`, page);
                alert("Page updated successfully!");
            }
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save page.");
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: string) => {
        const newBlock = {
            type,
            content: type === 'text' ? { html: "" } : {},
            order: page.content.length,
            isActive: true
        };
        setPage({ ...page, content: [...page.content, newBlock] });
    };

    const removeBlock = (index: number) => {
        const newContent = [...page.content];
        newContent.splice(index, 1);
        setPage({ ...page, content: newContent });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newContent = [...page.content];
        if (direction === 'up' && index > 0) {
            [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
        } else if (direction === 'down' && index < newContent.length - 1) {
            [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
        }
        setPage({ ...page, content: newContent });
    };

    const updateBlockContent = (index: number, field: string, value: any) => {
        const newContent = [...page.content];
        newContent[index].content[field] = value;
        setPage({ ...page, content: newContent });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 opacity-20">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Constructing Interface...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* ── Fixed Toolbar ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-lg bg-[#0D1117] border border-white/5 sticky top-4 z-50 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/admin/cms/pages" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-white">{isNew ? "New Page" : page.title}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/30 font-mono">/{page.slug || 'untitled-slug'}</span>
                            {page.published && <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-[8px] font-black text-green-500 uppercase">Live</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                        {(['content', 'seo', 'settings'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white/10 text-[#10b981]" : "text-white/30 hover:text-white/60"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Left Side: Main Editor ── */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/20">Canvas Blocks</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/20 font-bold uppercase">{page.content.length} Total</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {page.content.map((block, idx) => (
                                    <div key={idx} className="group relative rounded-lg border border-white/5 bg-[#0D1117] p-8 hover:border-[#10b981]/20 transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 text-[#10b981]">
                                                    {BLOCK_TYPES.find(b => b.type === block.type)?.icon({ className: "h-4 w-4" }) || <Layers className="h-4 w-4" />}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                                    {BLOCK_TYPES.find(b => b.type === block.type)?.label || block.type} Block
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => moveBlock(idx, 'up')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/30">
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => moveBlock(idx, 'down')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/30">
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => removeBlock(idx)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Block-specific inputs */}
                                        <div className="space-y-4">
                                            {block.type === 'text' ? (
                                                <textarea
                                                    value={block.content.html || ""}
                                                    onChange={(e) => updateBlockContent(idx, 'html', e.target.value)}
                                                    placeholder="Enter HTML or Text content..."
                                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-4 text-sm text-white/80 min-h-[150px] outline-none focus:border-[#10b981]/20 transition-all font-mono"
                                                />
                                            ) : (
                                                <div className="p-8 rounded-lg bg-white/5 border border-dashed border-white/10 text-center text-white/20 italic text-xs">
                                                    {block.type} Editor Component Not Yet Implemented
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {page.content.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center bg-white/[0.01] rounded-lg border border-dashed border-white/10 border-spacing-8">
                                        <Layers className="h-12 w-12 text-white/10 mb-4" />
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Empty Canvas</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-8">
                                    {BLOCK_TYPES.map((bt) => (
                                        <button
                                            key={bt.type}
                                            onClick={() => addBlock(bt.type)}
                                            className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#10b981]/40 hover:bg-white/10 transition-all gap-2 group"
                                        >
                                            <bt.icon className="h-5 w-5 text-white/30 group-hover:text-[#10b981] transition-colors" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/60 transition-colors text-center">{bt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="rounded-lg border border-white/5 bg-[#0D1117] p-10 space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <Globe className="h-5 w-5 text-blue-400" />
                                SEO Optimization
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Meta Title</label>
                                    <input
                                        type="text"
                                        value={page.seo.title}
                                        onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]/50"
                                        placeholder="Institutional Grade Title"
                                    />
                                    <p className="text-[9px] text-white/20">Recommended: 50-60 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Meta Description</label>
                                    <textarea
                                        value={page.seo.description}
                                        onChange={(e) => setPage({ ...page, seo: { ...page.seo, description: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]/50 min-h-[100px]"
                                        placeholder="Describe the institutional value proposition..."
                                    />
                                    <p className="text-[9px] text-white/20">Recommended: 150-160 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Keywords (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={page.seo.keywords.join(", ")}
                                        onChange={(e) => setPage({ ...page, seo: { ...page.seo, keywords: e.target.value.split(",").map(k => k.trim()) } })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]/50"
                                        placeholder="trading, institutional, quantitative"
                                    />
                                </div>

                                <div className="p-8 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <h4 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-widest">Google Preview</h4>
                                    <p className="text-blue-400 text-lg hover:underline cursor-pointer truncate">{page.seo.title || page.title || "Untitled Page"}</p>
                                    <p className="text-green-500/60 text-[11px] mb-1">https://mmitps.com/{page.slug}</p>
                                    <p className="text-white/40 text-xs line-clamp-2">{page.seo.description || "No description provided yet. Institutional search engine spiders will find it harder to index this node."}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="rounded-lg border border-white/5 bg-[#0D1117] p-10 space-y-8">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <Settings className="h-5 w-5 text-brand-400" />
                                Base Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Internal Layout</label>
                                    <select
                                        value={page.layout}
                                        onChange={(e) => setPage({ ...page, layout: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]/50"
                                    >
                                        <option value="default">Default Framework</option>
                                        <option value="blank">Full Canvas (Blank)</option>
                                        <option value="landing">Landing Performance</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Publication Status</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setPage({ ...page, published: !page.published })}
                                            className={`flex-1 p-4 rounded-lg border transition-all flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest ${page.published
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                    : 'bg-white/5 border-white/10 text-white/20'
                                                }`}
                                        >
                                            {page.published ? <CheckCircle2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            {page.published ? 'Live' : 'Draft'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Side: Info & Quick Settings ── */}
                <div className="space-y-6">
                    <div className="rounded-lg border border-white/5 bg-[#0D1117] p-8 space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Page Identity</h3>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Display Title</label>
                            <input
                                type="text"
                                value={page.title}
                                onChange={(e) => setPage({ ...page, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981]"
                                placeholder="Page Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">URL Slug</label>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 group focus-within:border-[#10b981] transition-colors">
                                <span className="text-white/20 font-bold select-none text-xs">/</span>
                                <input
                                    type="text"
                                    value={page.slug}
                                    onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-transparent border-none px-0 py-3 text-sm text-[#10b981] outline-none font-mono"
                                    placeholder="my-custom-page"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-[#0D1117] p-8 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Analytics Snapshot</h3>
                        <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                            <p className="text-3xl font-black text-white/10">0</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Direct Impressions</p>
                        </div>
                        <p className="text-[9px] text-white/20 text-center uppercase tracking-tighter">Live data available after 24h of publication</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
