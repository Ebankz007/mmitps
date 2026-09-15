/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { financialService } from "@/lib/api/financial";
import {
    Ticket,
    Plus,
    Search,
    Filter,
    Calendar,
    Settings,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Tag,
    ChevronDown,
    Save
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
    expiryDate?: string;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    category: string;
    createdAt: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        usageLimit: 1,
        expiryDate: "",
        category: "all",
        description: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await financialService.adminGetCoupons();
            setCoupons(data || []);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financialService.adminCreateCoupon(newCoupon);
            toast.success("Coupon created successfully!");
            setIsCreating(false);
            setNewCoupon({
                code: "",
                discountType: "percentage",
                discountValue: 10,
                usageLimit: 1,
                expiryDate: "",
                category: "all",
                description: ""
            });
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create coupon");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading Management Console...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        <Link href="/dashboard" className="hover:text-[var(--color-text-primary)] transition-colors">Admin Dashboard</Link>
                        <span>/</span>
                        <span className="text-emerald-500">Coupon Management</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)] uppercase italic">Financial <span className="text-emerald-500">Assets</span></h1>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 transition-all"
                >
                    <Plus className="h-4 w-4" /> Create Coupon
                </button>
            </div>

            {/* Create Coupon Modal/Form Overlay */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0B0E14] border border-[var(--color-border)] w-full max-w-xl rounded-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-xl font-black text-[var(--color-text-primary)] italic uppercase">Generate New Code</h2>
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-[var(--color-text-primary)]"><XCircle className="h-6 w-6" /></button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Coupon Code</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="SUMMER2026"
                                        value={newCoupon.code}
                                        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</label>
                                    <select
                                        value={newCoupon.discountType}
                                        onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Value</label>
                                    <input
                                        required
                                        type="number"
                                        value={newCoupon.discountValue}
                                        onChange={e => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={newCoupon.usageLimit}
                                        onChange={e => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={newCoupon.expiryDate}
                                        onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                                    <select
                                        value={newCoupon.category}
                                        onChange={e => setNewCoupon({ ...newCoupon, category: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    >
                                        <option value="all">All Services</option>
                                        <option value="subscription">Subscriptions Only</option>
                                        <option value="shop">Shop Purchases Only</option>
                                    </select>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Public Description</label>
                                    <input
                                        placeholder="Flash sale for valid for 24 hours"
                                        value={newCoupon.description}
                                        onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] font-bold text-sm focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-lg font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                                Activate Global Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons Table List */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-[var(--color-text-primary)] font-black text-xs uppercase tracking-[0.2em]">Active Ledger</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search codes..."
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-2 pl-9 pr-4 text-xs font-medium text-[var(--color-text-primary)] focus:outline-none"
                            />
                        </div>
                        <button className="p-2 border border-[var(--color-border)] rounded-lg text-gray-500 hover:text-[var(--color-text-primary)] transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="py-4 px-8 font-black text-[9px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Asset Code</th>
                                <th className="py-4 px-8 font-black text-[9px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Impact</th>
                                <th className="py-4 px-8 font-black text-[9px] text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Saturation</th>
                                <th className="py-4 px-8 font-black text-[9px] text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Expiry</th>
                                <th className="py-4 px-8 font-black text-[9px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap pr-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {coupons.map((c) => (
                                <tr key={c._id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500/10 p-2 rounded-lg">
                                                <Ticket className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-[var(--color-text-primary)] tracking-widest">{c.code}</div>
                                                <div className="text-[10px] text-gray-500 font-medium">{c.description || "System Promotional Asset"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className="text-xs font-black text-emerald-400">
                                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue}`}
                                        </span>
                                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{c.category} category</div>
                                    </td>
                                    <td className="py-5 px-8 text-center text-xs font-bold text-[var(--color-text-primary)]">
                                        {c.usageCount} / {c.usageLimit || "∞"}
                                    </td>
                                    <td className="py-5 px-8 text-center text-[10px] text-gray-500 font-medium">
                                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'LIFETIME'}
                                    </td>
                                    <td className="py-5 px-8 text-right pr-8">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                            c.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                        )}>
                                            {c.isActive ? "Operational" : "Offline"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {coupons.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="p-4 bg-[var(--color-surface-2)] rounded-full w-fit mx-auto">
                            <Search className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="text-gray-500 font-medium">No financial assets found in the current ledger.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
