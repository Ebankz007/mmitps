"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteContentService, SiteSection } from "@/lib/api/site-content";
import { toast } from "sonner";
import {
    FileText,
    Plus,
    Trash2,
    Save,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Loader2,
    RefreshCw,
    Layout,
    Type,
    Grid3X3,
    MessageSquare,
    Settings,
    Sliders,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_OPTIONS = [
    { value: "landing", label: "Landing Page" },
    { value: "contact", label: "Contact Page" },
    { value: "privacy", label: "Privacy Policy" },
    { value: "terms", label: "Terms of Service" },
    { value: "performance", label: "Performance" },
    { value: "events", label: "Events" }
];

const TYPE_ICONS: Record<string, any> = {
    hero: Layout,
    text: Type,
    cards: Grid3X3,
    features: Grid3X3,
    faq: MessageSquare,
    cta: Layout,
    footer: Settings,
    settings: Settings,
    grid: Grid3X3,
    testimonials: MessageSquare,
    stats: BarChart3,
    slides: Sliders
};

export default function SiteContentPage() {
    const queryClient = useQueryClient();
    const [selectedPage, setSelectedPage] = useState("landing");
    const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
    const [editData, setEditData] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);

    const { data: sections = [], isLoading, refetch } = useQuery({
        queryKey: ["admin-site-content", selectedPage],
        queryFn: () => siteContentService.getAllContent(selectedPage),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SiteSection> }) =>
            siteContentService.updateSection(id, data),
        onSuccess: () => {
            toast.success("Section updated");
            queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
            queryClient.invalidateQueries({ queryKey: ["site-content"] });
        },
        onError: (err: any) => toast.error(err.message || "Update failed")
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            siteContentService.updateSection(id, { isActive }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
            queryClient.invalidateQueries({ queryKey: ["site-content"] });
        },
        onError: (err: any) => toast.error(err.message || "Toggle failed")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => siteContentService.deleteSection(id),
        onSuccess: () => {
            toast.success("Section deleted");
            queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
            queryClient.invalidateQueries({ queryKey: ["site-content"] });
        },
        onError: (err: any) => toast.error(err.message || "Delete failed")
    });

    const handleEdit = (section: SiteSection) => {
        setExpandedSlug(section.slug);
        setEditData(JSON.stringify(section.data, null, 2));
        setIsEditing(true);
    };

    const handleSave = (section: SiteSection) => {
        try {
            const parsed = JSON.parse(editData);
            updateMutation.mutate({ id: section._id, data: { data: parsed } });
            setIsEditing(false);
        } catch {
            toast.error("Invalid JSON");
        }
    };

    return (
        <div className="min-h-screen p-8 bg-[var(--color-bg)]">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">
                            Site Content Manager
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Manage dynamic content for all public-facing pages
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            aria-label="Refresh content"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Page Selector */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {PAGE_OPTIONS.map((page) => (
                        <button
                            key={page.value}
                            onClick={() => {
                                setSelectedPage(page.value);
                                setExpandedSlug(null);
                                setIsEditing(false);
                            }}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all border",
                                selectedPage === page.value
                                    ? "bg-brand-500/10 border-brand-500/30 text-brand-500"
                                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            {page.label}
                        </button>
                    ))}
                </div>

                {/* Sections List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand-500" size={24} />
                    </div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                        <FileText className="mx-auto mb-4 text-[var(--color-text-muted)]" size={48} />
                        <p className="text-[var(--color-text-secondary)]">No content sections found for this page.</p>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Run the seed script to populate initial content.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sections.map((section) => {
                            const Icon = TYPE_ICONS[section.type] || FileText;
                            const isExpanded = expandedSlug === section.slug;

                            return (
                                <div
                                    key={section._id}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <div className="flex items-center gap-4 p-4">
                                        <button
                                            onClick={() => {
                                                if (isExpanded) {
                                                    setExpandedSlug(null);
                                                    setIsEditing(false);
                                                } else {
                                                    setExpandedSlug(section.slug);
                                                    setEditData(JSON.stringify(section.data, null, 2));
                                                }
                                            }}
                                            className="flex items-center gap-3 flex-1 text-left"
                                            aria-expanded={isExpanded}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
                                            ) : (
                                                <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
                                            )}
                                            <Icon size={16} className="text-brand-500" />
                                            <div>
                                                <span className="text-sm font-bold text-[var(--color-text-primary)]">
                                                    {section.section}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                                    {section.slug}
                                                </span>
                                            </div>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] px-2 py-1 bg-[var(--color-surface-2)] rounded">
                                                {section.type}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    toggleActiveMutation.mutate({
                                                        id: section._id,
                                                        isActive: !section.isActive
                                                    })
                                                }
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    section.isActive
                                                        ? "text-brand-500 hover:bg-brand-500/10"
                                                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
                                                )}
                                                title={section.isActive ? "Active" : "Inactive"}
                                                aria-label={section.isActive ? "Deactivate section" : "Activate section"}
                                            >
                                                {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(section)}
                                                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
                                                aria-label="Edit section"
                                            >
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Delete this section?")) {
                                                        deleteMutation.mutate(section._id);
                                                    }
                                                }}
                                                className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                aria-label="Delete section"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Editor */}
                                    {isExpanded && (
                                        <div className="border-t border-[var(--color-border)] p-4">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                                                JSON Data
                                            </label>
                                            <textarea
                                                value={editData}
                                                onChange={(e) => setEditData(e.target.value)}
                                                className="w-full h-[400px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-4 text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500/50 resize-y"
                                                spellCheck={false}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => setEditData(JSON.stringify(section.data, null, 2))}
                                                    className="px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() => handleSave(section)}
                                                    disabled={updateMutation.isPending}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 rounded-lg text-sm font-bold text-[var(--color-text-primary)] hover:bg-brand-600 transition-colors disabled:opacity-50"
                                                >
                                                    {updateMutation.isPending ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Save size={14} />
                                                    )}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
