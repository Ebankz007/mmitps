"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Server, Percent, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function AdminTiersPage() {
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({
        code: "",
        name: "",
        level: 0,
        price: 0,
        commissions: {
            directReferralPercent: 5,
            binaryMatchPercent: 5
        },
        accessibleModules: [],
        isActive: true
    });

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/tiers');
            setTiers(res.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch tiers');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (formData._id) {
                await api.put(`/admin/tiers/${formData._id}`, formData);
            } else {
                await api.post('/admin/tiers', formData);
            }
            setIsEditing(false);
            fetchTiers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving tier');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tier? This could break user accounts.')) return;
        try {
            await api.delete(`/admin/tiers/${id}`);
            fetchTiers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting tier');
        }
    };

    const openCreate = () => {
        setFormData({
            code: "",
            name: "",
            level: 0,
            price: 0,
            commissions: {
                directReferralPercent: 5,
                binaryMatchPercent: 5
            },
            accessibleModules: [],
            isActive: true
        });
        setIsEditing(true);
    };

    const openEdit = (tier: any) => {
        setFormData({ ...tier });
        setIsEditing(true);
    };

    if (loading) return <div className="p-8 text-[var(--color-text-primary)]">Loading Tiers...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[#30f2ff]">
                        <Server size={28} />
                        <h2 className="text-2xl font-black tracking-tight uppercase">Tier Architecture Manager</h2>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10">
                        Define registration tiers, module access, and MLM commission logic.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={openCreate}
                        className="bg-[#059669] text-[var(--color-text-primary)] px-6 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-colors"
                    >
                        <Plus size={14} /> Create New Tier
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
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-brand-500"></div>

                    <h3 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                        {formData._id ? 'Edit Tier Configuration' : 'Create New Registration Tier'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Core Settings */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3 pb-4 border-b border-[var(--color-border)]">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#30f2ff]">Core Identity</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">System Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                        placeholder="e.g. advance"
                                        className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Hierarchy Level (0=Low, 3=High)</label>
                                    <input
                                        type="number"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">One-Time Price ($)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-brand-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MLM Logic */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3 pb-4 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-2">
                                <Percent size={14} className="text-[#ce8dfb]" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ce8dfb]">MLM Commission Structure for this Tier</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Direct Referral Earned (%)</label>
                                    <input
                                        type="number"
                                        value={formData.commissions?.directReferralPercent || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            commissions: { ...formData.commissions, directReferralPercent: parseFloat(e.target.value) }
                                        })}
                                        className="w-full bg-[#111A30] border border-[#ce8dfb]/30 rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-[#ce8dfb] focus:outline-none"
                                    />
                                    <p className="text-[9px] text-gray-500">What {formData.name || 'this tier'} earns when referring someone else.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Binary Match Earned (%)</label>
                                    <input
                                        type="number"
                                        value={formData.commissions?.binaryMatchPercent || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            commissions: { ...formData.commissions, binaryMatchPercent: parseFloat(e.target.value) }
                                        })}
                                        className="w-full bg-[#111A30] border border-[#ce8dfb]/30 rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-[#ce8dfb] focus:outline-none"
                                    />
                                    <p className="text-[9px] text-gray-500">Percentage earned from weaker leg volume.</p>
                                </div>
                            </div>
                        </div>

                        {/* Modules */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Accessible Modules (Comma separated codes)</h4>
                            <input
                                type="text"
                                value={formData.accessibleModules?.join(', ') || ''}
                                onChange={(e) => setFormData({ ...formData, accessibleModules: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                placeholder="e.g. signals, copy_trading, algo_bots"
                                className="w-full bg-[#111A30] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] text-sm focus:border-brand-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-border)]">
                        <button
                            onClick={handleSave}
                            className="bg-brand-600 hover:bg-brand-500 text-[var(--color-text-primary)] px-8 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2"
                        >
                            <Save size={14} /> Save Configuration
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tiers.map((tier) => (
                        <div key={tier._id} className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-border)] transition-all flex flex-col justify-between group">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Level {tier.level}</div>
                                        <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{tier.name}</h3>
                                        <div className="text-xs text-gray-400 font-mono">{tier.code}</div>
                                    </div>
                                    <div className="bg-[#111A30] px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-emerald-400 font-black tracking-tight">
                                        ${tier.price}
                                    </div>
                                </div>

                                <div className="space-y-2 py-4 border-y border-[var(--color-border)]">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 uppercase font-bold tracking-widest text-[9px]">Direct %</span>
                                        <span className="text-[var(--color-text-primary)] font-black">{tier.commissions?.directReferralPercent || 0}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 uppercase font-bold tracking-widest text-[9px]">Binary %</span>
                                        <span className="text-[var(--color-text-primary)] font-black">{tier.commissions?.binaryMatchPercent || 0}%</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Unlocked Modules</div>
                                    <div className="flex flex-wrap gap-2">
                                        {tier.accessibleModules?.length > 0 ? (
                                            tier.accessibleModules.map((mod: string) => (
                                                <span key={mod} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-[9px] px-2 py-1 rounded-md uppercase font-bold tracking-wider">
                                                    {mod}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-600 font-bold italic">Base Platform Only</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(tier)}
                                    className="flex-1 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(tier._id)}
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
