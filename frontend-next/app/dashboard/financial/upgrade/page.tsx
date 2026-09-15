"use client";

import { useEffect, useState } from "react";
import { ArrowUpCircle, Lock, Unlock, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UpgradeCenterPage() {
    const [upgradeInfo, setUpgradeInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUpgradeInfo();
    }, []);

    const fetchUpgradeInfo = async () => {
        try {
            const res = await api.get('/financial/upgrade/info');
            setUpgradeInfo(res.data.data);
        } catch (err: any) {
            console.error('Failed to fetch upgrade info', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradeViaLockedBalance = async (tierId: string) => {
        if (!confirm('Are you sure you want to consume your locked commissions to pay for this upgrade?')) return;
        setProcessing(true);
        try {
            await api.post('/financial/upgrade/locked-balance', { targetTierId: tierId });
            alert('Tier upgraded successfully! Exploring new features allows earning higher commissions.');
            fetchUpgradeInfo(); // Refresh stats
            router.refresh();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Upgrade failed');
            setProcessing(false);
        }
    };

    const handleStandardUpgrade = async (tierId: string) => {
        // In reality, this redirects to a Stripe checkout session
        setProcessing(true);
        try {
            await api.post('/financial/upgrade/checkout', { targetTierId: tierId, method: 'crypto' });
            alert('Payment mock successful. Upgraded!');
            fetchUpgradeInfo();
            router.refresh();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Checkout failed');
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-[var(--color-text-primary)]">Loading Upgrade Paths...</div>;
    if (!upgradeInfo) return <div className="p-8 text-red-500">Failed to load platform data.</div>;

    const { currentTier, lockedBalance, upgradePaths } = upgradeInfo;

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[#30f2ff]">
                        <ArrowUpCircle size={28} />
                        <h2 className="text-3xl font-black tracking-tight uppercase">Advancement Center</h2>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-10 max-w-xl">
                        Elevate your operational tier. Unlock higher MLM commissions and access advanced algorithmic and fundamental data modules.
                    </p>
                </div>

                <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl shrink-0 flex items-center gap-6">
                    <div className="space-y-1">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Current Tier</div>
                        <div className="text-2xl font-black text-[var(--color-text-primary)] tracking-widest uppercase">{currentTier}</div>
                    </div>
                </div>
            </div>

            {/* Pending Locked Commissions Banner */}
            {lockedBalance > 0 && (
                <div className="bg-gradient-to-r from-emerald-900/40 to-[#0A1224] border border-emerald-500/20 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                    <div className="flex items-center gap-6 z-10">
                        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400">
                            <Lock size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Locked Commissions Detected</h3>
                            <p className="text-xs text-gray-400 font-bold max-w-xl leading-relaxed">
                                You’ve referred users who purchased higher tiers. Because their tier exceeds yours, your commission is locked.
                                <strong className="text-emerald-400"> Instead of withdrawing, you can instantly use this balance to pay for your own upgrade.</strong>
                            </p>
                        </div>
                    </div>
                    <div className="z-10 shrink-0 text-right">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Locked Wallet Power</div>
                        <div className="text-4xl font-black text-emerald-400 tracking-tighter">${lockedBalance.toFixed(2)}</div>
                    </div>
                </div>
            )}

            {/* Upgrade Options */}
            <div className="space-y-6">
                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Available Upgrade Paths ({upgradePaths.length})</h3>

                {upgradePaths.length === 0 && (
                    <div className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-12 text-center text-gray-500">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-[#30f2ff]/30" />
                        <h4 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-2">Maximum Architecture Achieved</h4>
                        <p className="text-xs font-bold">You are currently at the highest tier available.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upgradePaths.map((path: any) => (
                        <div key={path.tierId} className="bg-[#0A1224] border border-[var(--color-border)] hover:border-brand-500/50 rounded-lg p-8 transition-all flex flex-col relative overflow-hidden group">

                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Target Level {path.level}</div>
                                    <h4 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">{path.name}</h4>
                                </div>

                                <div className="py-6 border-y border-[var(--color-border)]">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Prorated Upgrade Cost</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-[var(--color-text-primary)]">${path.proratedCost.toFixed(2)}</span>
                                        <span className="text-xs text-gray-500 font-black">ONE TIME</span>
                                    </div>
                                    <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase leading-relaxed">
                                        You only pay the mathematical difference between your current tier and this target.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3 relative z-10">
                                {path.canAffordWithLockedBalance ? (
                                    <button
                                        disabled={processing}
                                        onClick={() => handleUpgradeViaLockedBalance(path.tierId)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-[var(--color-text-primary)] py-4 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all flex justify-center items-center gap-2 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                    >
                                        <Unlock size={14} /> Upgrade Free via Locked Balance
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        {lockedBalance > 0 && (
                                            <div className="text-center text-[9px] font-black text-emerald-500/50 uppercase tracking-widest bg-emerald-500/5 rounded-lg py-2">
                                                Locked Balance (${lockedBalance}) insufficient.
                                            </div>
                                        )}
                                        <button
                                            disabled={processing}
                                            onClick={() => handleStandardUpgrade(path.tierId)}
                                            className="w-full bg-brand-600 hover:bg-brand-500 text-[var(--color-text-primary)] py-4 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
                                        >
                                            <Zap size={14} fill="currentColor" /> Pay via Crypto/Card <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
