/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
    Plus, 
    Trash2, 
    Edit3, 
    Save, 
    X, 
    LayoutGrid, 
    Search,
    ChevronRight,
    HelpCircle
} from "lucide-react";
import { clsx } from "clsx";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    order: number;
}

export default function HelpCenterCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "HelpCircle",
        order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/help-center/categories");
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await api.put(`/api/v1/help-center/admin/categories/${isEditing}`, formData);
            } else {
                await api.post("/api/v1/help-center/admin/categories", formData);
            }
            setIsEditing(null);
            setFormData({ name: "", slug: "", description: "", icon: "HelpCircle", order: 0 });
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Error saving category.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will fail if articles are linked.")) return;
        try {
            await api.delete(`/api/v1/help-center/admin/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Error deleting category. Ensure no articles are assigned to it.");
        }
    };

    const startEdit = (cat: Category) => {
        setIsEditing(cat._id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            icon: cat.icon || "HelpCircle",
            order: cat.order || 0
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">
                    Help Center <span className="text-amber-500">Categories</span>
                </h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Manage global knowledge base structure</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Side */}
                <div className="lg:col-span-1">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 sticky top-8">
                        <h2 className="text-lg font-black text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                            {isEditing ? <Edit3 className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5 text-emerald-500" />}
                            {isEditing ? "Edit Category" : "Add New Category"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Slug</label>
                                <input 
                                    type="text" 
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Icon Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.icon}
                                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1.5 ml-1">Sort Order</label>
                                    <input 
                                        type="number" 
                                        value={formData.order}
                                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={handleSave}
                                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-lg transition-all shadow-lg shadow-brand-500/20 text-xs uppercase tracking-widest"
                                >
                                    {isEditing ? "Update Category" : "Save Category"}
                                </button>
                                {isEditing && (
                                    <button 
                                        onClick={() => { setIsEditing(null); setFormData({ name: "", slug: "", description: "", icon: "HelpCircle", order: 0 }); }}
                                        className="p-3.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg transition-all border border-[var(--color-border)]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-600 animate-pulse">Loading categories...</div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-[var(--color-border)] rounded-lg opacity-20">
                            <LayoutGrid className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No categories found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((cat) => (
                                <div key={cat._id} className="group flex items-center justify-between p-5 bg-surface border border-[var(--color-border)] hover:border-[var(--color-border)] rounded-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                            <HelpCircle className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--color-text-primary)] text-sm">{cat.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">/{cat.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="mr-4 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Order: {cat.order}</span>
                                        <button 
                                            onClick={() => startEdit(cat)}
                                            className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-amber-500 text-[var(--color-text-secondary)] hover:text-black transition-all"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat._id)}
                                            className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all shadow-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
