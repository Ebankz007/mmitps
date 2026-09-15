"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { 
    Calendar, 
    Save, 
    X, 
    ChevronLeft, 
    Link as LinkIcon, 
    Type, 
    FileText, 
    Globe, 
    MapPin, 
    Layout,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EventEditorPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = !!params.id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        type: "event",
        isActive: true,
        data: {
            startDate: "",
            time: "",
            link: "",
            region: "",
            country: "",
            category: "Seminar", // Default
            isMajor: false,
            banner: ""
        },
        tags: []
    });

    useEffect(() => {
        if (isEdit) {
            fetchEvent();
        }
    }, [isEdit]);

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/api/v1/admin/cms/blocks/${params.id}`);
            const event = res.data.data;
            setFormData({
                ...event,
                data: {
                    ...formData.data,
                    ...(event.data || {})
                }
            });
        } catch (err) {
            console.error("Failed to fetch event", err);
            toast.error("Failed to load event data");
            router.push("/admin/cms/events");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/api/v1/admin/cms/blocks/${params.id}`, formData);
                toast.success("Event updated successfully");
            } else {
                await api.post("/api/v1/admin/cms/blocks", formData);
                toast.success("Event created successfully");
            }
            router.push("/admin/cms/events");
        } catch (err: any) {
            console.error("Failed to save event", err);
            toast.error(err.response?.data?.message || "Failed to save event");
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes("data.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                data: { ...prev.data, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        if (name.includes("data.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                data: { ...prev.data, [field]: checked }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#10b981]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/cms/events" 
                        className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase">
                            {isEdit ? "Edit" : "New"} <span className="text-[var(--color-text-secondary)]">Event</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/cms/events"
                        className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-surface-2)] transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-[#10b981] text-black text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50"
                    >
                        <Save size={14} />
                        {saving ? "Saving..." : "Save Event"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Event Title</label>
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                                <input 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter event title..."
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Unique Slug</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                                <input 
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="event-name-2026"
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-[13px] text-[var(--color-text-secondary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono italic"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Short Description</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-5 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                                <textarea 
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Brief overview of the event..."
                                    rows={4}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-medium leading-relaxed"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#10b981]">Event Logistics</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2 text-rose-500/60">Start Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] group-focus-within:text-[#10b981] transition-colors" />
                                    <input 
                                        name="data.startDate"
                                        type="datetime-local"
                                        value={formData.data.startDate?.split('.')[0] || ""}
                                        onChange={handleInputChange}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Display Time</label>
                                <input 
                                    name="data.time"
                                    value={formData.data.time}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 14:00 GMT"
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">External / Details Link</label>
                            <input 
                                name="data.link"
                                value={formData.data.link}
                                onChange={handleInputChange}
                                placeholder="https://zoom.us/... or /events/my-event"
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isActive}
                                    onChange={(e) => handleCheckboxChange("isActive", e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-[var(--color-surface-2)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--color-border-hover)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-surface-3)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500/20"></div>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{formData.isActive ? 'Active' : 'Draft'}</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Event Type</label>
                                <select 
                                    name="data.category"
                                    value={formData.data.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 text-[11px] font-black uppercase tracking-wider text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Seminar">Seminar</option>
                                    <option value="Webinar">Webinar</option>
                                    <option value="Summit">Summit</option>
                                    <option value="Workshop">Workshop</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-brand-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Major Event?</span>
                                </div>
                                <input 
                                    type="checkbox"
                                    checked={formData.data.isMajor}
                                    onChange={(e) => handleCheckboxChange("data.isMajor", e.target.checked)}
                                    className="accent-[#10b981]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                            <MapPin size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Regional Settings</h3>
                        </div>
                        
                        <div className="space-y-3">
                            <input 
                                name="data.region"
                                value={formData.data.region}
                                onChange={handleInputChange}
                                placeholder="Region (e.g. Europe)"
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 text-xs text-[var(--color-text-primary)] focus:outline-none"
                            />
                            <input 
                                name="data.country"
                                value={formData.data.country}
                                onChange={handleInputChange}
                                placeholder="Country (e.g. Portugal)"
                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 text-xs text-[var(--color-text-primary)] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                            <ImageIcon size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Visual Asset</h3>
                        </div>
                        <input 
                            name="data.banner"
                            value={formData.data.banner}
                            onChange={handleInputChange}
                            placeholder="Image URL (Unsplash/CDN)"
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 text-[10px] text-[var(--color-text-secondary)] focus:outline-none"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
