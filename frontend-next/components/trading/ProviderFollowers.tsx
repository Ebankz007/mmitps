"use client";

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CopyTradingAPI } from '@/lib/api/copy-trading';

export default function ProviderFollowers() {
    const [followers, setFollowers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFollowers = async () => {
        setIsLoading(true);
        try {
            const res = await CopyTradingAPI.getProviderFollowers();
            if (res.success && res.data) {
                setFollowers(res.data);
            } else {
                // Mock followers for development
                setFollowers([
                    {
                        _id: 'f1',
                        followerName: 'John Doe',
                        status: 'paused',
                        isSuspended: true,
                        settlementStatus: 'paid',
                        pendingCommission: 124.50,
                        accruedPnL: 845.20,
                        allocated: 5000,
                        lastSettlementAt: '2026-03-01'
                    },
                    {
                        _id: 'f2',
                        followerName: 'Jane Smith',
                        status: 'active',
                        isSuspended: false,
                        settlementStatus: 'none',
                        pendingCommission: 0,
                        accruedPnL: 210.00,
                        allocated: 2000,
                        lastSettlementAt: '2026-03-10'
                    }
                ]);
            }
        } catch (error) {
            console.error('Failed to load followers', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFollowers();
    }, []);

    const handleConfirm = async (subId: string, name: string) => {
        try {
            toast.loading(`Confirming receipt from ${name}...`, { id: `conf-${subId}` });
            await CopyTradingAPI.confirmSettlementReceipt(subId);
            toast.success(`Settlement confirmed! Follower ${name} reactivated.`, { id: `conf-${subId}` });
            loadFollowers();
        } catch (error: any) {
            toast.error(`Confirmation Failed`, { description: error.message });
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center"><Activity className="animate-spin inline mr-2" /> Loading Followers...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Your Copiers</h2>
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--color-surface-2)] px-4 py-2 rounded-lg border border-[var(--color-border)]">
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest block">Total Copiers</span>
                        <span className="text-lg font-black text-[var(--color-text-primary)]">{followers.length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0c] border border-[var(--color-border)] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Follower</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Allocation</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Accrued PnL</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Settlement</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {followers.map((f) => (
                            <tr key={f._id} className="border-b border-[var(--color-border)] hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 font-black text-xs">
                                            {f.followerName?.charAt(0) || 'F'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-[var(--color-text-primary)]">{f.followerName || 'Anonymous'}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${f.isSuspended ? 'text-red-500' : 'text-brand-500'}`}>
                                                {f.isSuspended ? 'Suspended' : f.status}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-[var(--color-text-primary)]">${f.allocated?.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-bold ${f.accruedPnL >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                                        ${f.accruedPnL?.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {f.settlementStatus === 'pending' ? (
                                        <div className="flex items-center gap-2 text-yellow-500">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Payment</span>
                                        </div>
                                    ) : f.settlementStatus === 'paid' ? (
                                        <div className="flex items-center gap-2 text-brand-500">
                                            <DollarSign size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Paid — Confirm Receipt</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">In Sync</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {f.settlementStatus === 'paid' && (
                                        <button
                                            onClick={() => handleConfirm(f._id, f.followerName)}
                                            className="bg-brand-500 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all shadow-lg shadow-brand-500/10"
                                        >
                                            Confirm Receive
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {followers.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Users size={48} className="text-white/5" />
                        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">You don't have any followers yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
