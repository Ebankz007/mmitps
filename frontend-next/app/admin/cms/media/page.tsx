"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
    Image as ImageIcon,
    Video as VideoIcon,
    FileText,
    Upload,
    Trash2,
    Search,
    Filter,
    X,
    Loader2,
    CheckCircle2,
    Eye
} from "lucide-react";

interface MediaAsset {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
    category: 'image' | 'video' | 'icon' | 'document';
    createdAt: string;
}

export default function MediaGallery() {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/admin/cms/media');
            setAssets(res.data.data);
        } catch (err) {
            console.error("Failed to fetch media", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/api/v1/admin/cms/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchMedia();
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Check file size and format.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            // Need to implement DELETE route in backend if not exists
            // For now, let's assume it's part of the CRUD
            await api.delete(`/api/v1/admin/cms/media/${id}`);
            setAssets(assets.filter(a => a._id !== id));
            if (selectedAsset?._id === id) setSelectedAsset(null);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.originalname.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Media Library</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">Manage all site assets, images, and videos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                        accept="image/*,video/*,.svg,.pdf"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? 'Uploading...' : 'Upload Asset'}
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-surface border border-[var(--color-border)]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'image', 'video', 'icon', 'document'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat
                                    ? "bg-[var(--color-surface-3)] text-[#10b981] border border-[#10b981]/30"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Assets Grid ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Scanning Repository...</p>
                </div>
            ) : filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset._id}
                            onClick={() => setSelectedAsset(asset)}
                            className="group relative aspect-square rounded-lg border border-[var(--color-border)] bg-white/[0.02] overflow-hidden cursor-pointer hover:border-[#10b981]/30 transition-all shadow-sm active:scale-95"
                        >
                            {asset.category === 'image' ? (
                                <img src={asset.url} alt={asset.originalname} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : asset.category === 'video' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                    <VideoIcon className="h-8 w-8 text-brand-400 opacity-50" />
                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] truncate px-2">{asset.originalname}</span>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                    <FileText className="h-8 w-8 text-amber-400 opacity-50" />
                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] truncate px-2">{asset.originalname}</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(asset._id); }} className="p-2 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all shadow-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button className="p-2 rounded-lg bg-[var(--color-surface-3)] text-[var(--color-text-primary)] hover:bg-[#10b981] hover:text-black transition-all shadow-lg">
                                    <Eye className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                                <span className="bg-black/40 backdrop-blur-md text-[8px] font-black uppercase px-2 py-0.5 rounded text-[var(--color-text-secondary)] tracking-tighter">
                                    {asset.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                    <ImageIcon className="h-16 w-16 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No assets found</p>
                </div>
            )}

            {/* ── Asset Detail Modal ── */}
            {selectedAsset && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAsset(null)} />
                    <div className="relative w-full max-w-4xl bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                            {/* Preview Area */}
                            <div className="flex-1 bg-black/20 p-8 flex items-center justify-center min-h-[300px]">
                                {selectedAsset.category === 'image' ? (
                                    <img src={selectedAsset.url} alt={selectedAsset.originalname} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                ) : selectedAsset.category === 'video' ? (
                                    <video src={selectedAsset.url} controls className="max-w-full max-h-full" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-[var(--color-text-muted)]">
                                        <FileText className="h-32 w-32" />
                                        <p className="font-black uppercase tracking-widest">Preview Not Available</p>
                                    </div>
                                )}
                            </div>

                            {/* Info Sidebar */}
                            <div className="w-full lg:w-80 p-8 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] space-y-6 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-[var(--color-text-primary)]">Asset Details</h3>
                                    <button onClick={() => setSelectedAsset(null)} className="p-2 rounded-full hover:bg-[var(--color-surface-2)] transition-colors">
                                        <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
                                    </button>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Filename</p>
                                        <p className="text-xs text-[var(--color-text-primary)] break-all font-mono">{selectedAsset.originalname}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Mime Type</p>
                                            <p className="text-xs text-[var(--color-text-primary)]">{selectedAsset.mimetype}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Size</p>
                                            <p className="text-xs text-[var(--color-text-primary)]">{formatSize(selectedAsset.size)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Public URL</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input readOnly value={selectedAsset.url} className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[10px] font-mono text-[#10b981]" />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedAsset.url);
                                                    alert("URL Copied!");
                                                }}
                                                className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] transition-colors"
                                            >
                                                <Upload className="h-4 w-4 rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--color-border)]">
                                    <button
                                        onClick={() => handleDelete(selectedAsset._id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
