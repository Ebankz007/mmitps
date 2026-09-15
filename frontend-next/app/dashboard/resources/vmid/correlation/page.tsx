"use client";

import React, { useState } from 'react';
import { useVMIDCorrelation } from '@/hooks/use-vmid';
import CorrelationHeatmap from '@/components/vmid/CorrelationHeatmap';
import {
    ChevronLeft,
    RefreshCw,
    Activity,
    Maximize2,
    LayoutDashboard,
    Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function VMIDCorrelationPage() {
    const [timeframe, setTimeframe] = useState('24h');
    const { data: matrixData, isLoading, refetch } = useVMIDCorrelation();

    const timeframes = [
        { label: '1H', value: '1h' },
        { label: '4H', value: '4h' },
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' },
        { label: '30D', value: '30d' },
    ];

    return (
        <div className="min-h-screen bg-[#060A16] text-[var(--color-text-primary)] p-6 lg:p-8">
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/resources/vmid/pro"
                        className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-3)] transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Institutional Engine</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)] uppercase">Advanced Correlation Matrix</h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Timeframe Selector */}
                    <div className="flex p-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${timeframe === tf.value
                                    ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(16, 185, 129,0.3)]'
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => refetch()}
                        className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-3)] transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-[var(--color-text-secondary)] ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    {/* Stats Cards */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="w-full aspect-[16/9] bg-[var(--color-surface-2)] rounded-lg animate-pulse flex items-center justify-center border border-[var(--color-border)]">
                                <div className="flex flex-col items-center gap-4">
                                    <Activity className="w-12 h-12 text-amber-500/20 animate-pulse" />
                                    <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Calculating Relationships...</span>
                                </div>
                            </div>
                        ) : (
                            <CorrelationHeatmap data={matrixData?.matrix || []} />
                        )}
                    </div>

                    {/* Sidebar Insights */}
                    <div className="space-y-6">
                        <div className="bg-[#0A0F1D] border border-[var(--color-border)] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Maximize2 className="w-4 h-4 text-amber-500" />
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Market Insights</h3>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6">
                                Analyzing the current matrix allows institutional players to detect hidden volatility clusters and divergence patterns before they manifest in price.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Strongest Correlation</div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-[var(--color-text-primary)] uppercase">US30 / GER40</span>
                                        <span className="font-black text-emerald-400 text-lg">+0.94</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Inverse Leader</div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-[var(--color-text-primary)] uppercase">DXY / EURUSD</span>
                                        <span className="font-black text-rose-400 text-lg">-0.98</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0A0F1D] border border-[var(--color-border)] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-secondary)]">
                                <Calendar className="w-4 h-4" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Report Cycle</h3>
                            </div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                                The matrix is updated every 15 minutes based on rolling window calculations. Institutional users should monitor shifts in the US30/GC relationship during NY Open.
                            </div>
                        </div>

                        <Link
                            href="/dashboard/resources/vmid/pro"
                            className="flex items-center justify-center gap-2 w-full p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all font-bold text-xs group"
                        >
                            <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            BACK TO VMID PRO
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
