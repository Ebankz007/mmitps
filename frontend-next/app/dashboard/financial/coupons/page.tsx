/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { financialService } from "@/lib/api/financial";
import {
    Tag,
    Ticket,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Search,
    Gift,
    Clock,
    Calendar,
    Copy,
    ChevronRight,
    Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

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
    isActive: boolean;
    category: string;
}

export default function MyCouponsPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await financialService.getActiveCoupons();
            setActiveCoupons(data || []);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!code) return;
        setActionLoading(true);
        try {
            await financialService.redeemCoupon(code);
            toast.success("Coupon successfully redeemed!");
            setCode("");
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to redeem coupon");
        } finally {
            setActionLoading(false);
        }
    };

    const couponHistory = [
        { code: "NEWYEAR25", desc: "New Year Special", value: "25% OFF", usedOn: "Jan 01, 2026", status: "Used" },
        { code: "BLACKFRI50", desc: "Black Friday Deal", value: "50% OFF", usedOn: "Nov 29, 2025", status: "Used" },
        { code: "SUMMER10", desc: "Summer Promo", value: "10% OFF", usedOn: "—", status: "Expired" },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-[#10b981] animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse text-sm uppercase tracking-widest">Loading Rewards...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Nav Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                <Tag className="h-3 w-3 text-[#10b981]" />
                <span>Financial</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#10b981]">Coupons</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)] flex items-center gap-3">
                    <div className="p-2 bg-[#10b981]/10 rounded-lg">
                        <Ticket className="h-8 w-8 text-[#10b981]" />
                    </div>
                    My Coupons
                </h1>
                <p className="text-gray-500 text-xs mt-2 font-medium">View and redeem your discount codes and promotional offers</p>
            </div>

            {/* Redeem Section */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-4 bg-[#10b981] rounded-full"></div>
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Redeem a Coupon Code</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ENTER COUPON CODE"
                            className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-6 text-sm font-bold text-[var(--color-text-primary)] placeholder-gray-700 focus:outline-none focus:border-[#10b981]/50 transition-colors uppercase tracking-widest"
                        />
                    </div>
                    <button
                        disabled={!code || actionLoading}
                        onClick={handleRedeem}
                        className="bg-gradient-to-r from-brand-500 to-rose-500 hover:opacity-90 disabled:opacity-30 text-[var(--color-text-primary)] px-10 rounded-lg font-bold uppercase text-xs tracking-widest transition-all py-4 md:py-0 shadow-lg shadow-orange-500/20"
                    >
                        {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Apply"}
                    </button>
                </div>
            </div>

            {/* Active Coupons Section */}
            <div>
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <Gift className="h-4 w-4 text-[#10b981]" />
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Active Coupons</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCoupons.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-[#0B0E14] border border-dashed border-[var(--color-border)] rounded-lg">
                            <p className="text-gray-500 text-sm font-medium italic">No active coupons available right now</p>
                        </div>
                    ) : (
                        activeCoupons.map((c) => (
                            <div
                                key={c._id}
                                className={cn(
                                    "relative group border border-dashed rounded-lg p-6 overflow-hidden transition-all hover:-translate-y-1",
                                    c.discountType === 'percentage'
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-brand-500/5 border-brand-500/20"
                                )}
                            >
                                <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest bg-[var(--color-surface-3)] px-2 py-0.5 rounded text-[var(--color-text-primary)] active:scale-95 cursor-default">
                                    Active
                                </div>

                                <div className="mb-4">
                                    <div className={cn(
                                        "text-3xl font-black tracking-tighter mb-1",
                                        c.discountType === 'percentage' ? "text-emerald-500" : "text-brand-500"
                                    )}>
                                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                                    </div>
                                    <h3 className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight">{c.description || "Promotional Discount"}</h3>
                                    <p className="text-gray-500 text-[10px] mt-1">Valid for any {c.category === 'all' ? 'plan' : c.category} purchase</p>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-[var(--color-surface-2)] px-2 py-1 rounded text-[10px] font-black text-[var(--color-text-secondary)] tracking-widest uppercase">
                                            {c.code}
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(c.code);
                                                toast.success("Code copied!");
                                            }}
                                            className="p-1.5 hover:bg-[var(--color-surface-2)] rounded-md transition-colors"
                                        >
                                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        Expires: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                                    </div>
                                </div>

                                <div className={cn(
                                    "absolute bottom-0 left-0 w-full h-1",
                                    c.discountType === 'percentage' ? "bg-emerald-500/20" : "bg-brand-500/20"
                                )}></div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Coupon History Section */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-1.5 h-4 bg-gray-700 rounded-full"></div>
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Coupon History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Description</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Value</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Used On</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap pr-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {couponHistory.map((h, i) => (
                                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="py-5 text-xs font-bold text-gray-400 group-hover:text-[var(--color-text-primary)] transition-colors">{h.code}</td>
                                    <td className="py-5 text-xs text-gray-500 font-medium">{h.desc}</td>
                                    <td className="py-5 text-xs font-black text-emerald-500/80 text-center">{h.value}</td>
                                    <td className="py-5 text-xs text-gray-500 text-center">{h.usedOn}</td>
                                    <td className="py-5 text-right pr-4">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded",
                                            h.status === 'Used' ? "text-brand-500/60 bg-brand-500/5" : "text-rose-500/60 bg-rose-500/5"
                                        )}>
                                            {h.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Referral Footer Banner */}
            <div className="bg-gradient-to-br from-[#0B0E14] to-[#161B22] border border-[var(--color-border)] rounded-lg p-10 md:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="w-16 h-16 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-lg flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                    <Gift className="h-8 w-8 text-[var(--color-text-primary)]" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight uppercase">Earn More Coupons!</h3>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium">Refer friends and earn exclusive discounts. Get $50 credit for every friend who subscribes!</p>
                </div>

                <button className="bg-gradient-to-r from-brand-400 to-brand-600 hover:opacity-90 text-[var(--color-text-primary)] px-10 py-4 rounded-lg font-black uppercase text-xs tracking-[0.2em] transition-all relative z-10 shadow-xl shadow-cyan-500/10">
                    Start Referring <ArrowRight className="h-4 w-4 inline ml-1" />
                </button>
            </div>
        </div>
    );
}
