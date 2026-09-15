"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Menu as MenuIcon,
    Plus,
    Save,
    Trash2,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Eye,
    EyeOff,
    MoreVertical,
    GripVertical,
    ArrowUp,
    ArrowDown
} from "lucide-react";

interface MenuItem {
    label: string;
    href: string;
    icon?: string;
    order: number;
    visibility: 'all' | 'guest' | 'authenticated' | 'admin';
    serviceKey?: string;
    subItems?: MenuItem[];
    isOpen?: boolean; // UI state
}

interface Menu {
    _id: string;
    name: string;
    location: string;
    items: MenuItem[];
    isActive: boolean;
}

export default function MenuManager() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/admin/cms/menus');
            setMenus(res.data.data);
            if (res.data.data.length > 0 && !selectedMenu) {
                setSelectedMenu(res.data.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch menus", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedMenu) return;
        setSaving(true);
        try {
            await api.post('/api/v1/admin/cms/menus', selectedMenu);
            alert("Menu saved successfully!");
            fetchMenus();
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save menu.");
        } finally {
            setSaving(false);
        }
    };

    const addItem = (parentItems?: MenuItem[]) => {
        const newItem: MenuItem = {
            label: "New Item",
            href: "/",
            order: (parentItems?.length || 0) + 1,
            visibility: 'all',
            subItems: []
        };

        if (parentItems) {
            parentItems.push(newItem);
        } else if (selectedMenu) {
            const newItems = [...selectedMenu.items, newItem];
            setSelectedMenu({ ...selectedMenu, items: newItems });
        }
    };

    const removeItem = (items: MenuItem[], index: number) => {
        items.splice(index, 1);
        setSelectedMenu({ ...selectedMenu! });
    };

    const moveItem = (items: MenuItem[], index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        setSelectedMenu({ ...selectedMenu! });
    };

    const updateItem = (item: MenuItem, field: keyof MenuItem, value: any) => {
        (item as any)[field] = value;
        setSelectedMenu({ ...selectedMenu! });
    };

    const renderMenuItems = (items: MenuItem[], depth = 0) => {
        return (
            <div className={`space-y-3 ${depth > 0 ? 'ml-8 pl-4 border-l border-[var(--color-border)] mt-3' : ''}`}>
                {items.map((item, idx) => (
                    <div key={idx} className="group flex flex-col gap-2 p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-[#10b981]/20 transition-all">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveItem(items, idx, 'up')} className="p-1 rounded bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                        <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => moveItem(items, idx, 'down')} className="p-1 rounded bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                        <ArrowDown className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateItem(item, 'label', e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[var(--color-text-primary)] w-full"
                                        placeholder="Item Label"
                                    />
                                    <input
                                        type="text"
                                        value={item.href}
                                        onChange={(e) => updateItem(item, 'href', e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 p-0 text-[10px] text-[var(--color-text-secondary)] w-full font-mono"
                                        placeholder="/path"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={item.visibility}
                                    onChange={(e) => updateItem(item, 'visibility', e.target.value)}
                                    className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--color-text-secondary)] outline-none"
                                >
                                    <option value="all">All</option>
                                    <option value="authenticated">Auth</option>
                                    <option value="guest">Guest</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    onClick={() => updateItem(item, 'isOpen', !item.isOpen)}
                                    className={`p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] transition-colors ${item.subItems && item.subItems.length > 0 ? 'text-[#10b981]' : ''}`}
                                >
                                    {item.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                                <button onClick={() => removeItem(items, idx)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[var(--color-text-primary)] transition-all">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {item.isOpen && (
                            <div className="animate-in slide-in-from-top-2 duration-200">
                                {renderMenuItems(item.subItems || [], depth + 1)}
                                <button
                                    onClick={() => {
                                        if (!item.subItems) item.subItems = [];
                                        addItem(item.subItems);
                                        setSelectedMenu({ ...selectedMenu! });
                                    }}
                                    className="ml-8 mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981]/60 hover:text-[#10b981] transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Sub-Item
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {/* ── Menu List Sidebar ── */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Locations</h3>
                    <button className="p-1.5 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-2">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-12 w-full bg-[var(--color-surface-2)] rounded-lg animate-pulse" />)
                    ) : menus.map((menu) => (
                        <button
                            key={menu._id}
                            onClick={() => setSelectedMenu(menu)}
                            className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${selectedMenu?._id === menu._id
                                    ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                                    : "bg-white/[0.02] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MenuIcon className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{menu.name}</span>
                            </div>
                            <span className="text-[10px] opacity-40 capitalize">{menu.location}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Editor Area ── */}
            <div className="lg:col-span-3 space-y-6">
                {selectedMenu ? (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-lg bg-surface border border-[var(--color-border)]">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{selectedMenu.name}</h2>
                                    <span className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                        {selectedMenu.location}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)]">Hierarchical navigation structure for {selectedMenu.location} location.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#10b981] text-black text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-muted)]">Menu Structure</h3>
                                <button
                                    onClick={() => addItem()}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:scale-105 transition-transform"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Top-Level Item
                                </button>
                            </div>

                            {renderMenuItems(selectedMenu.items)}

                            {selectedMenu.items.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] rounded-lg border border-dashed border-[var(--color-border)] opacity-20">
                                    <Plus className="h-10 w-10 mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">Add your first menu item</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center opacity-20 grayscale">
                        <MenuIcon className="h-16 w-16 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">Select a menu to start editing</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
