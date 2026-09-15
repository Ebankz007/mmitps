"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Gift, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function UserBonusesPage() {
    const { token } = useAuth();
    const [activeBonuses, setActiveBonuses] = useState<any[]>([]);
    const [myClaims, setMyClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Claim modal state
    const [claimingBonus, setClaimingBonus] = useState<any | null>(null);
    const [claimProof, setClaimProof] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (token) fetchInitialData();
    }, [token]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [bRes, cRes] = await Promise.all([
                api.get('/bonuses/active'),
                api.get('/bonuses/my-claims')
            ]);
            setActiveBonuses(bRes.data?.data || []);
            setMyClaims(cRes.data?.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load bonuses.");
        } finally {
            setLoading(false);
        }
    };

    const submitClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        if (!claimingBonus) return;

        setIsSubmitting(true);
        try {
            await api.post(`/bonuses/${claimingBonus._id}/claim`, { claimProof });
            setSuccessMsg("Claim submitted successfully. It is now pending admin review.");
            setClaimingBonus(null);
            setClaimProof("");
            fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit claim.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-[var(--color-text-secondary)]">Loading Bonuses...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
                
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded-lg">
                        <Gift size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Bonuses & Rewards</h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">Complete activities to earn real funds directly into your wallet.</p>
                    </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded text-sm">{error}</div>}
                {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded text-sm">{successMsg}</div>}

                {/* Available Bonuses */}
                <div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Available Activities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeBonuses.length === 0 ? (
                            <div className="col-span-full bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center rounded-lg text-sm text-[var(--color-text-secondary)]">
                                No bonuses are currently available. Check back later!
                            </div>
                        ) : activeBonuses.map(bonus => (
                            <div key={bonus._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col hover:border-[var(--color-brand)]/50 transition-colors shadow-sm shadow-black/5">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-base text-[var(--color-text-primary)]">{bonus.title}</h3>
                                    <div className="bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-2.5 py-1 rounded font-bold text-sm whitespace-nowrap">
                                        + {bonus.rewardAmount} {bonus.rewardCurrency}
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-6 flex-1">{bonus.description}</p>
                                
                                <div className="pt-4 border-t border-[var(--color-border)] mt-auto flex items-center justify-between">
                                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Status</span>
                                    {bonus.claimStatus === 'pending' ? (
                                        <div className="flex items-center gap-1.5 text-brand-400 text-sm font-medium">
                                            <Clock size={16} /> Pending Review
                                        </div>
                                    ) : bonus.claimStatus === 'approved' ? (
                                        <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                                            <CheckCircle size={16} /> Claimed
                                        </div>
                                    ) : bonus.claimStatus === 'rejected' ? (
                                        <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                                            <AlertCircle size={16} /> Rejected
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setClaimingBonus(bonus)}
                                            className="bg-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)]/90 text-[var(--color-background)] px-4 py-1.5 rounded text-sm font-medium transition-colors"
                                        >
                                            Claim Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Claims History */}
                {myClaims.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">My Claim History</h2>
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                                        <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Activity</th>
                                        <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Reward</th>
                                        <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)]">
                                    {myClaims.map(claim => (
                                        <tr key={claim._id} className="hover:bg-[var(--color-background)]/50 transition-colors">
                                            <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                                                {new Date(claim.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-[var(--color-text-primary)]">
                                                {claim.bonusActivity?.title || 'Unknown Activity'}
                                            </td>
                                            <td className="p-4 text-sm text-[var(--color-text-primary)]">
                                                {claim.bonusActivity?.rewardAmount} {claim.bonusActivity?.rewardCurrency}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[11px] px-2 py-1 rounded font-medium ${
                                                    claim.status === 'pending' ? 'bg-brand-500/10 text-brand-500' :
                                                    claim.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {claim.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Claim Modal */}
                {claimingBonus && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg w-full max-w-md shadow-2xl p-6 relative">
                            <button 
                                onClick={() => setClaimingBonus(null)} 
                                className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            >
                                <AlertCircle size={20} className="rotate-45" /> 
                            </button>

                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Claim Bonus</h3>
                            <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
                                You are about to claim <span className="font-semibold text-[var(--color-text-primary)]">"{claimingBonus.title}"</span>. 
                                By submitting, you confirm you have completed the requirements.
                            </p>

                            <form onSubmit={submitClaim} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                        Provide Proof of Completion (Optional / URL)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand)]"
                                        placeholder="e.g. Transaction Hash, Email receipt, or short description..."
                                        value={claimProof}
                                        onChange={(e) => setClaimProof(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setClaimingBonus(null)}
                                        className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-[var(--color-brand)] text-[var(--color-text-primary)] px-5 py-2 rounded text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Claim"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
    );
}
