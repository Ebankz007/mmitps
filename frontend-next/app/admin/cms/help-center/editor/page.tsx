"use client";

import { clsx } from "clsx";

import { useState, useEffect, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { 
    Save, 
    ArrowLeft, 
    Check, 
    Trash2, 
    Globe, 
    Eye,
    Type,
    FileText,
    Settings2,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "react-quill/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
    ssr: false,
    loading: () => <div className="h-96 w-full bg-[var(--color-surface-2)] animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Editor...</div>
});

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'item': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];

function HelpCenterEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id");

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        category: "",
        status: "draft",
        order: 0,
        tags: ""
    });

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            if (articleId) {
                await fetchArticle();
            } else {
                setLoading(false);
            }
        };
        init();
    }, [articleId]);

    const fetchCategories = async () => {
        try {
            const res = await api.get("/api/v1/help-center/categories");
            setCategories(res.data.data);
            if (!articleId && res.data.data.length > 0) {
                setFormData(prev => ({ ...prev, category: res.data.data[0]._id }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchArticle = async () => {
        try {
            const res = await api.get(`/api/v1/help-center/admin/articles/${articleId}`);
            const art = res.data.data;
            setFormData({
                title: art.title,
                slug: art.slug,
                content: art.content,
                category: art.category?._id || art.category,
                status: art.status,
                order: art.order || 0,
                tags: art.tags?.join(", ") || ""
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content || !formData.category) {
            alert("Title, Content, and Category are required.");
            return;
        }

        setSaving(true);
        try {
            const body = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
            };

            if (articleId) {
                await api.put(`/api/v1/help-center/admin/articles/${articleId}`, body);
            } else {
                await api.post("/api/v1/help-center/admin/articles", body);
            }
            router.push("/admin/cms/help-center");
        } catch (error: any) {
            console.error(error);
            alert("Error saving: " + (error.response?.data?.message || "Check console"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-600 animate-pulse">Initializing Editor...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Link href="/admin/cms/help-center" className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-text-primary)] transition-colors text-xs font-black uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" /> Back to List
                </Link>
                <div className="flex gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-lg transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save Article</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Editor Side */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-[#10b981] block ml-1">Article Title</label>
                             <input 
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'')})}
                                placeholder="e.g. How to connect your MetaTrader account"
                                className="w-full bg-transparent border-none text-3xl font-black text-[var(--color-text-primary)] placeholder:text-white/10 focus:ring-0 p-0"
                             />
                        </div>

                        <div className="min-h-[500px] border border-[var(--color-border)] rounded-lg overflow-hidden bg-black/20">
                            <ReactQuill 
                                theme="snow" 
                                value={formData.content} 
                                onChange={(val) => setFormData({...formData, content: val})} 
                                modules={modules}
                                formats={formats}
                                className="help-center-quill"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Side */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-6 sticky top-8">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-amber-500" /> Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 ml-1">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-xs outline-none focus:border-amber-500/40 appearance-none"
                                >
                                    {categories.map(c => <option key={c._id} value={c._id} className="bg-black text-[var(--color-text-primary)]">{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 ml-1">URL Slug</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                    <input 
                                        type="text" 
                                        value={formData.slug}
                                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-amber-500/40 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 ml-1">Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'draft'})}
                                        className={clsx(
                                            "py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                            formData.status === 'draft' ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-lg shadow-brand-500/5" : "bg-[var(--color-surface-2)] border-transparent text-gray-500"
                                        )}
                                    >
                                        Draft
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'published'})}
                                        className={clsx(
                                            "py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                            formData.status === 'published' ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-lg shadow-emerald-500/5" : "bg-[var(--color-surface-2)] border-transparent text-gray-500"
                                        )}
                                    >
                                        Live
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 ml-1">Sort & Tags</label>
                                <input 
                                    type="number" 
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                    placeholder="Order"
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-xs mb-3"
                                />
                                <input 
                                    type="text" 
                                    value={formData.tags}
                                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    placeholder="Tags (comma separated)"
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .help-center-quill .ql-toolbar {
                    background: #111;
                    border: none !important;
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                    padding: 1.5rem !important;
                    border-radius: 1rem 1rem 0 0;
                }
                .help-center-quill .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: 1rem;
                    color: rgba(255,255,255,0.8);
                }
                .help-center-quill .ql-editor {
                    padding: 2rem !important;
                    min-height: 450px;
                }
                .help-center-quill .ql-editor.ql-blank::before {
                    color: rgba(255,255,255,0.1);
                    font-style: normal;
                }
                .help-center-quill .ql-stroke {
                    stroke: rgba(255,255,255,0.4) !important;
                }
                .help-center-quill .ql-fill {
                    fill: rgba(255,255,255,0.4) !important;
                }
                .help-center-quill .ql-picker {
                    color: rgba(255,255,255,0.4) !important;
                }
            `}</style>
        </div>
    );
}

export default function HelpCenterEditor() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-gray-600 animate-pulse">Loading Editor Container...</div>}>
            <HelpCenterEditorContent />
        </Suspense>
    );
}
