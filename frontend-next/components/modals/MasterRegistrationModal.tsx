"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Target, Shield, DollarSign, Info, CheckCircle2, ChevronRight, BarChart3, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CopyTradingAPI } from '@/lib/api/copy-trading';

interface MasterRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MasterRegistrationModal({ isOpen, onClose }: MasterRegistrationModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [formData, setFormData] = useState({
        strategyName: '',
        description: '',
        minDeposit: '500',
        performanceFee: '20',
        managementFee: '0',
        riskLevel: 'Medium'
    });

    // Fetch accounts when modal opens
    React.useEffect(() => {
        if (isOpen) {
            const fetchAccounts = async () => {
                try {
                    const response = await fetch('/api/v1/trading/accounts');
                    if (!response.ok) {
                        console.warn("Trading accounts endpoint unavailable, status:", response.status);
                        return;
                    }
                    const data = await response.json();
                    if (data.success) {
                        setAccounts(data.data || []);
                        if (data.data?.length > 0) {
                            setSelectedAccountId(data.data[0]._id);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch accounts", err);
                }
            };
            fetchAccounts();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedAccountId) {
            toast.error("Please select a trading account");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/v1/social/register-as-provider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: selectedAccountId,
                    displayName: formData.strategyName,
                    bio: formData.description,
                    tradingStyle: 'mixed', // could be mapped from riskLevel
                    riskLevel: formData.riskLevel.toLowerCase(),
                    performanceFee: parseInt(formData.performanceFee),
                    managementFee: parseInt(formData.managementFee)
                })
            });

            if (!response.ok) {
                toast.error("Registration Failed", {
                    description: "Server error. Please try again later."
                });
                return;
            }

            const result = await response.json();

            if (result.success) {
                toast.success("Provider Registration Successful", {
                    description: "Your master account is now active on the public leaderboard.",
                    icon: <CheckCircle2 className="w-4 h-4 text-brand-500" />
                });
                onClose();
                // Optionally trigger a refresh of the dashboard state here
                window.location.reload();
            } else {
                toast.error("Registration Failed", {
                    description: result.message || "An error occurred during registration."
                });
            }
        } catch (error) {
            toast.error("Network Error", {
                description: "Failed to connect to the server."
            });
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Become a Provider"
                    className="relative w-full max-w-2xl bg-[#08080A] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                                <Award className="w-6 h-6 text-brand-500" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Become a Provider</h2>
                                <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mt-1">Register your Master Execution Account</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all border border-[var(--color-border)]" aria-label="Close dialog">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex px-8 py-4 gap-2 bg-white/[0.02] border-b border-[var(--color-border)]">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-brand-500' : 'bg-[var(--color-surface-2)]'}`} />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-10 min-h-[400px]">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Select Trading Account</label>
                                    <select
                                        value={selectedAccountId}
                                        onChange={(e) => setSelectedAccountId(e.target.value)}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-5 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {accounts.length === 0 ? (
                                            <option disabled>No accounts connected</option>
                                        ) : (
                                            accounts.map((acc) => (
                                                <option key={acc._id} value={acc._id} className="bg-[#08080A]">
                                                    {acc.accountName} ({acc.accountNumber}) - {acc.platform.toUpperCase()}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {accounts.length === 0 && (
                                        <p className="text-[10px] font-bold text-red-500 uppercase mt-1 ml-1">
                                            Please connect a trading account first to become a provider.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Strategy Name</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Alpha Sentinel Pro"
                                        value={formData.strategyName}
                                        onChange={(e) => setFormData({...formData, strategyName: e.target.value})}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-5 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Description & Bio</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe your trading edge and logic..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-5 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-all resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Min. Deposit (USD)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                                            <input
                                                type="number"
                                                value={formData.minDeposit}
                                                onChange={(e) => setFormData({...formData, minDeposit: e.target.value})}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-10 pr-4 text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Performance Fee (%)</label>
                                        <div className="relative">
                                            <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                                            <input
                                                type="number"
                                                value={formData.performanceFee}
                                                onChange={(e) => setFormData({...formData, performanceFee: e.target.value})}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-10 pr-4 text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-brand-500 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-1">Strategy Risk Profile</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Low', 'Medium', 'High'].map((risk) => (
                                            <button
                                                key={risk}
                                                onClick={() => setFormData({...formData, riskLevel: risk})}
                                                className={`py-4 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${formData.riskLevel === risk ? 'bg-brand-500 text-black border-brand-500 shadow-lg shadow-brand-500/20' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]'}`}
                                            >
                                                {risk}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                                <div className="p-6 bg-brand-500/5 border border-brand-500/10 rounded-lg flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-black" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-black uppercase text-[var(--color-text-primary)]">Execution Rules</h4>
                                            <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Global Provider Standards</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-[var(--color-text-secondary)] leading-relaxed italic">
                                        By registering as a provider, you agree to real-time signal extraction from your master account. MMITPS ensures that your followers' lot sizes are scaled according to their personal risk settings (Fixed, Multiplier, or Min. Lot Filters).
                                    </p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                            <CheckCircle2 size={12} className="text-brand-500" /> Auto-Scaling Enabled
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                            <CheckCircle2 size={12} className="text-brand-500" /> High-Frequency Ready
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">
                                            <CheckCircle2 size={12} className="text-brand-500" /> Interactive Performance Data
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-lg bg-white/[0.02]">
                                    <Info size={16} className="text-[var(--color-text-secondary)] shrink-0" />
                                    <p className="text-[9px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider leading-relaxed">
                                        Registration requires an active connected broker account with a history of at least 10 verified trades.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-[var(--color-border)] bg-black/50 flex items-center justify-between">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                            className="px-8 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            disabled={isSubmitting}
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        
                        <button
                            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                            disabled={isSubmitting || (step === 1 && accounts.length === 0)}
                            className="bg-brand-500 text-black px-12 py-4 rounded-lg text-xs font-black italic uppercase tracking-widest hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/10 min-w-[180px]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>{step === 3 ? 'Finalize Registration' : 'Continue'}</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
