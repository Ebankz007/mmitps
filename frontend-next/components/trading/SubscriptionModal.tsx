"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield as ShieldIcon, DollarSign, AlertTriangle, Target, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CopyTradingAPI } from '@/lib/api/copy-trading';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    masterTrader: {
        id: string;
        name: string;
        strategy: string;
        riskScore: number;
    } | null;
}

export default function SubscriptionModal({ isOpen, onClose, masterTrader }: SubscriptionModalProps) {
    const [allocationType, setAllocationType] = useState<'fixed' | 'percentage'>('fixed');
    const [amount, setAmount] = useState<string>('');
    const [lotSizeStrategy, setLotSizeStrategy] = useState<'SIGNAL' | 'FIXED' | 'MULTIPLIER'>('SIGNAL');
    const [lotSizeValue, setLotSizeValue] = useState<string>('0.01');
    const [minLotSize, setMinLotSize] = useState<string>('0.00');
    const [stopLoss, setStopLoss] = useState<string>('');
    const [takeProfit, setTakeProfit] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !masterTrader) return null;

    const handleSubscribe = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Invalid Allocation', { description: 'Please enter a valid amount to allocate.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await CopyTradingAPI.copyTrader(masterTrader.id, {
                allocationType,
                allocation: Number(amount),
                lotSizeStrategy,
                lotSizeValue: Number(lotSizeValue),
                minLotSize: Number(minLotSize),
                stopLoss: stopLoss ? Number(stopLoss) : undefined,
                takeProfit: takeProfit ? Number(takeProfit) : undefined,
            });

            toast.success('Subscription Active', {
                description: `You are now successfully copying ${masterTrader.name}. Allocation: ${allocationType === 'fixed' ? '$' : ''}${amount}${allocationType === 'percentage' ? '%' : ''}.`,
                icon: <CheckCircle2 className="w-4 h-4 text-brand-500" />
            });
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to connect to the execution engine.';
            toast.error('Subscription Failed', { description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0a0c] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Copy Configuration</h2>
                            <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Target: {masterTrader.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col gap-8">
                        {/* Allocation Section */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-brand-500" /> Capital Allocation
                            </h3>

                            <div className="flex items-center gap-2 p-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                <button
                                    onClick={() => setAllocationType('fixed')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-colors ${allocationType === 'fixed' ? 'bg-brand-500 text-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    Fixed Amount (USD)
                                </button>
                                <button
                                    onClick={() => setAllocationType('percentage')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-colors ${allocationType === 'percentage' ? 'bg-brand-500 text-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                >
                                    Wallet Percentage
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-bold">
                                    {allocationType === 'fixed' ? '$' : '%'}
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={allocationType === 'fixed' ? "0.00" : "0"}
                                    min="0"
                                    max={allocationType === 'percentage' ? "100" : undefined}
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg py-4 pl-8 pr-4 text-xl font-black text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Lot Sizing Strategy Section */}
                        <div className="flex flex-col gap-4 pt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-4 h-4 text-brand-500" /> Lot Sizing Configuration
                            </h3>

                            <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                {(['SIGNAL', 'FIXED', 'MULTIPLIER'] as const).map((strategy) => (
                                    <button
                                        key={strategy}
                                        onClick={() => setLotSizeStrategy(strategy)}
                                        className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${lotSizeStrategy === strategy ? 'bg-brand-500 text-black' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                    >
                                        {strategy}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">
                                        {lotSizeStrategy === 'SIGNAL' ? 'Multiplier (1.0 = Exact)' : lotSizeStrategy === 'FIXED' ? 'Fixed Lot Size' : 'Lot Multiplier'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={lotSizeValue}
                                        onChange={(e) => setLotSizeValue(e.target.value)}
                                        disabled={lotSizeStrategy === 'SIGNAL'}
                                        className="w-full bg-black border border-[var(--color-border)] rounded-lg py-3 px-4 text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-30"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-1">
                                        Min Lot Filter <Info className="w-3 h-3" />
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={minLotSize}
                                        onChange={(e) => setMinLotSize(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black border border-[#10b981]/30 rounded-lg py-3 px-4 text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981] transition-colors"
                                    />
                                </div>
                            </div>
                            <p className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider leading-relaxed">
                                {Number(minLotSize) > 0 ? `Trades below ${minLotSize} lots on the master account will be ignored.` : "All trades from the master account will be copied (Scale rules apply)."}
                            </p>
                        </div>

                        {/* Risk Management Section */}
                        <div className="flex flex-col gap-4 pt-6 border-t border-[var(--color-border)]">
                            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <ShieldIcon className="w-4 h-4 text-yellow-500" /> Risk Management
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Global Stop Loss (USD)</label>
                                    <div className="relative">
                                        <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/50" />
                                        <input
                                            type="number"
                                            value={stopLoss}
                                            onChange={(e) => setStopLoss(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black border border-[var(--color-border)] rounded-lg py-3 pl-10 pr-4 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-red-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Take Profit Target (USD)</label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                                        <input
                                            type="number"
                                            value={takeProfit}
                                            onChange={(e) => setTakeProfit(e.target.value)}
                                            placeholder="Optional"
                                            className="w-full bg-black border border-[var(--color-border)] rounded-lg py-3 pl-10 pr-4 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-green-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-brand-500/5 border border-brand-500/20 rounded-lg mt-2">
                                <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-brand-500/80 leading-relaxed uppercase tracking-widest">
                                    By subscribing, you agree to mirror the trades of this Master account. Capital at risk corresponds to your configured allocation and stop loss parameters.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-[var(--color-border)] bg-black/50 flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubscribe}
                            disabled={isSubmitting}
                            className={`flex-1 py-4 text-xs font-black italic uppercase tracking-widest text-black bg-brand-500 rounded-lg hover:bg-surface transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Connecting Engine...' : 'Confirm Subscription'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
