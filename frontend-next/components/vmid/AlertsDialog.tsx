"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trash2, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useVolumetricAlerts } from '@/hooks/use-alerts';
import { clsx } from 'clsx';

interface AlertsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AlertsDialog({ isOpen, onClose }: AlertsDialogProps) {
    const { data, createAlert, toggleAlert, deleteAlert, isCreating } = useVolumetricAlerts();

    const [instrument, setInstrument] = useState('Gold');
    const [metric, setMetric] = useState<'zScore' | 'volumeROC'>('zScore');
    const [threshold, setThreshold] = useState(2.0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createAlert({
            instrument,
            metric,
            operator: '>',
            threshold,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0D1529] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <Bell className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Volumetric Alerts</h2>
                                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mt-1">Configure threshold breach detection</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"> aria-label="Close dialog" <X className="w-6 h-6 text-[var(--color-text-secondary)]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Create Form */}
                            <div className="p-8 border-r border-[var(--color-border)]">
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                                    New Alert Engine
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">Asset</label>
                                        <select
                                            value={instrument}
                                            onChange={(e) => setInstrument(e.target.value)}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-amber-500/50"
                                        >
                                            <option value="Gold">Gold (GC)</option>
                                            <option value="EUR/USD">EUR/USD</option>
                                            <option value="BTC/USD">Bitcoin (BTC)</option>
                                            <option value="S&P 500">S&P 500</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">Metric</label>
                                        <select
                                            value={metric}
                                            onChange={(e) => setMetric(e.target.value as 'zScore' | 'volumeROC')}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-amber-500/50"
                                        >
                                            <option value="zScore">Volume Z-Score</option>
                                            <option value="volumeROC">Volume ROC (%)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest ml-1">Threshold (&gt;)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={threshold}
                                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-3 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-amber-500/50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                                    >
                                        {isCreating ? "Initializing..." : "Activate Engine"}
                                    </button>
                                </form>
                            </div>

                            {/* Active List */}
                            <div className="p-8 bg-black/20 overflow-y-auto max-h-[500px]">
                                <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6">Active Watchers</h3>

                                <div className="space-y-3">
                                    {!data?.alerts || data.alerts.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-lg">
                                            <AlertTriangle className="w-8 h-8 text-white/10 mx-auto mb-3" />
                                            <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">No Alerts Configured</p>
                                        </div>
                                    ) : (
                                        data.alerts.map((alert) => (
                                            <div key={alert.id} className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">{alert.instrument}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleAlert(alert.id)}
                                                            className={clsx(
                                                                "p-1.5 rounded-lg transition-colors",
                                                                alert.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
                                                            )}
                                                        >
                                                            <Power className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteAlert(alert.id)}
                                                            className="p-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{alert.metric}</span>
                                                    <span className="text-[10px] font-bold text-amber-500">&gt; {alert.threshold}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Integration Message */}
                        <div className="p-6 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] text-center">
                            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-widest leading-none">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Connected to real-time volumetric processing engine
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
