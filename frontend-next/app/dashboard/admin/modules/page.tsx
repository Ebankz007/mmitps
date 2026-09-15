"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, PackageOpen, LayoutGrid, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function AdminModulesPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({
        code: "",
        name: "",
        description: "",
        billingInterval: "month",
        basePrice: 50,
        isActive: true,
        tierOverrides: {}
    });

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/modules');
            setModules(res.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch modules');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (formData._id) {
                await api.put(`/admin/modules/${formData._id}`, formData);
            } else {
                await api.post('/admin/modules', formData);
            }
            setIsEditing(false);
            fetchModules();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving module');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this module? Users subscribed to this feature may lose access.')) return;
        try {
            await api.delete(`/admin/modules/${id}`);
            fetchModules();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting module');
        }
    };

    const openCreate = () => {
        setFormData({
            code: "",
            name: "",
            description: "",
            billingInterval: "month",
            basePrice: 50,
            isActive: true,
            tierOverrides: {}
        });
        setIsEditing(true);
    };

    const openEdit = (mod: any) => {
        setFormData({ ...mod });
        setIsEditing(true);
    };

    if (loading) return <div className="p-8 text-[var(--color-text-primary)]">Loading Modules...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[#30f2ff]">
                        <PackageOpen size={28} />
                        <h2 className="text-2xl font-black tracking-tight uppercase">Module Architect</h2>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10">
                        Design recurring subscription products required on top of base tiers.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={openCreate}
                        className="bg-[#059669] text-[var(--color-text-primary)] px-6 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-colors"
                    >
                        <Plus size={14} /> Create Module
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-500">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {isEditing ? (
                <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-amber-500"></div>

                    <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                        {formData._id ? 'Edit Module Logic' : 'Create New Subscription Module'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">System Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\\s+/g, '_') })}
                                placeholder="e.g. trading_signals"
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Signals Pro"
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Billing Interval</label>
                            <select
                                value={formData.billingInterval}
                                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-orange-500 focus:outline-none"
                            >
                                <option value="month">Monthly</option>
                                <option value="quarter">Quarterly</option>
                                <option value="year">Annually</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Base Recurring Price ($)</label>
                            <input
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short marketing description of what this module provides..."
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Note on tier overrides */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 p-4 border border-dashed border-[#ce8dfb] rounded-lg bg-[#ce8dfb]/5">
                            <h4 className="text-[10px] font-black text-[#ce8dfb] uppercase tracking-widest mb-2">Notice: Tier Overrides</h4>
                            <p className="text-xs text-gray-400 font-bold leading-relaxed">
                                Module pricing is dynamic. If a specific registration Tier (e.g. Pro) grants this module completely free, or at a discounted rate, you will wire that logic into the Tier Overrides in the JSON architecture via the raw database. By default, it uses the Base Recurring Price.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-border)]">
                        <button
                            onClick={handleSave}
                            className="bg-brand-600 hover:bg-brand-500 text-[var(--color-text-primary)] px-8 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2"
                        >
                            <Save size={14} /> Deploy Module
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-[#111A30] hover:bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-8 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2"
                        >
                            <X size={14} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((mod) => (
                        <div key={mod._id} className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-border)] transition-all flex flex-col justify-between group relative overflow-hidden">

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="bg-brand-500/10 p-3 rounded-lg text-brand-500 mb-2">
                                        <LayoutGrid size={24} />
                                    </div>
                                    <div className="bg-[#111A30] px-3 py-1.5 rounded-lg border border-orange-500/30 text-brand-400 font-black tracking-tight">
                                        ${mod.basePrice} / <span className="text-[9px] uppercase tracking-widest text-gray-400">{mod.billingInterval}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{mod.name}</h3>
                                <p className="text-xs text-gray-500 font-bold line-clamp-2">{mod.description || 'No description provided.'}</p>

                                <div className="text-[10px] text-gray-600 font-mono mt-4">Syscode: {mod.code}</div>
                            </div>

                            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-[var(--color-border)] relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(mod)}
                                    className="flex-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(mod._id)}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
