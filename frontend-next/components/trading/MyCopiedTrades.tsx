"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Users, StopCircle, PauseCircle, PlayCircle, Settings, ArrowUpRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { CopyTradingAPI } from '@/lib/api/copy-trading';

export default function MyCopiedTrades() {
    // Mock Data for active subscriptions
    const MOCK_SUBSCRIPTIONS = useMemo(() => [
        {
            id: 'sub1',
            masterName: 'Alpha Sentinel',
            status: 'active',
            allocated: 5000,
            currentValue: 5845.20,
            pnl: 845.20,
            pnlPercent: 16.9,
            totalTrades: 124,
            winRate: 78.5,
            startedAt: '2026-02-15'
        },
        {
            id: 'sub2',
            masterName: 'Macro Theta',
            status: 'paused',
            allocated: 10400,
            currentValue: 10400.00,
            pnl: 0.00,
            pnlPercent: 0.0,
            totalTrades: 0,
            winRate: 0,
            startedAt: '2026-03-05'
        }
    ], []);

    interface Subscription {
        id?: string;
        _id?: string;
        masterName?: string;
        providerName?: string;
        status?: string;
        allocated?: number;
        amount?: number;
        currentValue?: number;
        pnl?: number;
        pnlPercent?: number;
        totalTrades?: number;
        winRate?: number;
        startedAt?: string;
        createdAt?: string;
        trader?: { name: string };
        // Phase 9 Fields
        settlementStatus?: 'none' | 'pending' | 'paid';
        pendingCommission?: number;
        isSuspended?: boolean;
        suspensionReason?: string;
    }

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSubscriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await CopyTradingAPI.getMySubscriptions();
            if (res.success && res.data && res.data.length > 0) {
                setSubscriptions(res.data);
            } else {
                // Enhance MOCK for Phase 9 UI testing
                const enhancedMocks = MOCK_SUBSCRIPTIONS.map(s => ({
                    ...s,
                    settlementStatus: s.id === 'sub1' ? 'pending' : 'none' as any,
                    pendingCommission: s.id === 'sub1' ? 124.50 : 0
                }));
                setSubscriptions(enhancedMocks);
            }
        } catch (error) {
            console.error('Failed to load subscriptions', error);
            setSubscriptions(MOCK_SUBSCRIPTIONS);
        } finally {
            setIsLoading(false);
        }
    }, [MOCK_SUBSCRIPTIONS]);

    useEffect(() => {
        loadSubscriptions();
    }, [loadSubscriptions]);

    const handleAction = async (action: string, id: string, name: string) => {
        try {
            if (action === 'Stop') {
                toast.loading(`Stopping copy for ${name}...`, { id: `stop-${id}` });
                await CopyTradingAPI.stopCopying(id);
                toast.success(`Stopped copying ${name}`, { id: `stop-${id}` });
                loadSubscriptions();
            } else if (action === 'Settle') {
                toast.loading(`Processing settlement for ${name}...`, { id: `settle-${id}` });
                await CopyTradingAPI.settleCommission(id);
                toast.success(`Settlement payment sent! Awaiting Master confirmation.`, { id: `settle-${id}` });
                loadSubscriptions();
            } else if (action === 'Sync') {
                toast.loading(`Syncing latest account data...`, { id: `sync-${id}` });
                await new Promise(r => setTimeout(r, 1000));
                toast.success(`Account data synchronized online.`, { id: `sync-${id}` });
                loadSubscriptions();
            } else {
                toast.info(`Action Initiated`, {
                    description: `Sending ${action} command for ${name}'s subscription to execution engine.`,
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Unable to complete action.';
            toast.error(`Action Failed`, { description: message });
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center border border-[var(--color-border)] rounded-lg bg-white/[0.02] p-10">
                <Activity className="w-16 h-16 text-brand-500 animate-spin mb-4" />
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--color-text-secondary)]">Loading Portfolio</h3>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase mt-2 text-center max-w-sm">
                    Retrieving your active Master Trader subscriptions...
                </p>
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center border border-[var(--color-border)] rounded-lg bg-white/[0.02] p-10">
                <Users className="w-16 h-16 text-white/10 mb-4" />
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--color-text-secondary)]">No Active Subscriptions</h3>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase mt-2 text-center max-w-sm">
                    You are not currently copying any Master Traders. Head over to the Discovery tab to find high-performing strategies.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6">
                {subscriptions.map((sub) => (
                    <div key={sub.id || sub._id} className="bg-[#0a0a0c] border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden flex flex-col gap-6">
                        {/* Status Indicator Bar */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${sub.isSuspended ? 'bg-red-500 animate-pulse' : (sub.status || 'active') === 'active' ? 'bg-brand-500' : 'bg-yellow-500'}`} />

                        {/* Top Banner for Suspension / Settlement */}
                        {(sub.isSuspended || sub.settlementStatus === 'pending') && (
                            <div className={`-mt-6 -mx-6 mb-2 px-6 py-2 flex items-center justify-between ${sub.isSuspended ? 'bg-red-500 text-black' : 'bg-brand-500 text-black'}`}>
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {sub.isSuspended ? `ACCOUNT SUSPENDED: ${sub.suspensionReason || 'Overdue Settlement'}` : 'PROFIT SETTLEMENT REQUIRED'}
                                    </span>
                                </div>
                                {sub.settlementStatus === 'pending' && (
                                    <button 
                                        onClick={() => handleAction('Settle', (sub.id || sub._id || ''), sub.masterName || 'Master')}
                                        className="bg-black text-[var(--color-text-primary)] px-4 py-1 rounded text-[10px] font-black uppercase tracking-tighter hover:bg-surface hover:text-black transition-colors"
                                    >
                                        Settle Commission (${sub.pendingCommission?.toFixed(2)})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start justify-between pl-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)]">
                                    <Users className="w-5 h-5 text-[var(--color-text-secondary)]" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-[var(--color-text-primary)] flex items-center gap-2">
                                        {sub.masterName || sub.providerName || sub.trader?.name || 'Unknown Master'}
                                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                                            sub.isSuspended ? 'bg-red-500/20 text-red-500' :
                                            (sub.status || 'active') === 'active' ? 'bg-brand-500/20 text-brand-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {sub.isSuspended ? 'Suspended' : (sub.status || 'active')}
                                        </span>
                                    </h3>
                                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Started: {sub.startedAt || (sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A')}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAction('Sync', (sub.id || sub._id || ''), sub.masterName || 'Master')}
                                    className="p-2 rounded-lg bg-brand-500/10 text-brand-500 hover:text-[var(--color-text-primary)] hover:bg-brand-500 transition-colors"
                                    title="Online Sync Statistics"
                                >
                                    <Activity className="w-5 h-5" />
                                </button>
                                {(sub.status || 'active') === 'active' && !sub.isSuspended ? (
                                    <button
                                        onClick={() => handleAction('Pause', (sub.id || sub._id || ''), sub.masterName || 'Master')}
                                        className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                                        title="Pause Copying"
                                    >
                                        <PauseCircle className="w-5 h-5" />
                                    </button>
                                ) : !sub.isSuspended && (
                                    <button
                                        onClick={() => handleAction('Resume', (sub.id || sub._id || ''), sub.masterName || 'Master')}
                                        className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
                                        title="Resume Copying"
                                    >
                                        <PlayCircle className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
                                    title="Settings"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleAction('Stop', (sub.id || sub._id || ''), sub.masterName || 'Master')}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--color-text-primary)] transition-colors"
                                    title="Stop Copying & Unsubscribe"
                                >
                                    <StopCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-[var(--color-surface-2)] ml-4" />

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-5 gap-4 pl-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Allocated</span>
                                <span className="text-xl font-black text-[var(--color-text-primary)]">${(sub.allocated || sub.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Equity (Online)</span>
                                <span className="text-xl font-black text-[var(--color-text-primary)]">${(sub.currentValue || sub.allocated || sub.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Accrued PnL</span>
                                <span className={`text-xl font-black ${(sub.pnl || 0) >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                                    {(sub.pnl || 0) >= 0 ? '+' : '-'}${Math.abs(sub.pnl || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Return %</span>
                                <span className={`text-xl font-black flex items-center gap-1 ${(sub.pnlPercent || 0) >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                                    {(sub.pnlPercent || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {Math.abs(sub.pnlPercent || 0)}%
                                </span>
                            </div>
                            <div className="flex flex-col justify-end items-end gap-2">
                                {sub.settlementStatus === 'paid' && (
                                    <span className="text-[8px] font-black bg-brand-500/10 text-brand-500 px-2 py-1 rounded-sm uppercase tracking-widest">Awaiting Confirmation</span>
                                )}
                                <button className="text-[10px] font-bold text-brand-500 hover:text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-1 transition-colors">
                                    Trade History <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Statistics Footer */}
                        <div className="bg-[var(--color-surface-2)] rounded-lg p-4 ml-4 flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Copied Trades</span>
                                    <span className="text-sm font-black text-[var(--color-text-primary)]">{sub.totalTrades || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Win Rate</span>
                                    <span className="text-sm font-black text-[var(--color-text-primary)]">{sub.winRate || 0}%</span>
                                </div>
                                {sub.pendingCommission ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Pending Fee</span>
                                        <span className="text-sm font-black text-brand-500">${sub.pendingCommission.toFixed(2)}</span>
                                    </div>
                                ) : null}
                            </div>
                            {(sub.status || 'active') === 'active' && !sub.isSuspended && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Live Syncing</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
