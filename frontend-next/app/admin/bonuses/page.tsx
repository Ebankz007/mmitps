"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Plus, CheckCircle, XCircle, Gift, Info } from "lucide-react";

export default function AdminBonusPage() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'activities' | 'claims'>('activities');
    const [bonuses, setBonuses] = useState<any[]>([]);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Create Form State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        rewardAmount: "",
        rewardCurrency: "USD",
        criteria: "manual",
        maxClaims: "0"
    });

    useEffect(() => {
        if (token) fetchInitialData();
    }, [token]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [bRes, cRes] = await Promise.all([
                api.get('/admin/bonuses'),
                api.get('/admin/bonuses/claims')
            ]);
            setBonuses(bRes.data?.data || []);
            setClaims(cRes.data?.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load bonus data.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBonus = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        try {
            await api.post('/admin/bonuses', {
                ...formData,
                rewardAmount: Number(formData.rewardAmount),
                maxClaims: Number(formData.maxClaims)
            });
            setSuccessMsg("Bonus activity created successfully.");
            setShowCreateForm(false);
            setFormData({ title: "", description: "", rewardAmount: "", rewardCurrency: "USD", criteria: "manual", maxClaims: "0" });
            fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create bonus.");
        }
    };

    const handleProcessClaim = async (claimId: string, status: 'approved' | 'rejected') => {
        setError("");
        setSuccessMsg("");
        const reason = status === 'rejected' ? window.prompt('Provide a reason for rejection:') : '';
        if (status === 'rejected' && reason === null) return; // cancelled prompt

        try {
            await api.put(`/admin/bonuses/claims/${claimId}`, {
                status,
                rejectionReason: reason
            });
            setSuccessMsg(`Claim successfully ${status}.`);
            fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${status} claim.`);
        }
    };

    const toggleBonusStatus = async (bonusId: string, currentStatus: boolean) => {
        try {
            await api.put(`/admin/bonuses/${bonusId}`, { isActive: !currentStatus });
            fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to toggle status.");
        }
    };

    if (loading) return <div className="p-8 text-[var(--color-text-secondary)]">Loading Bonus Management...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Gift className="text-[var(--color-brand)]" />
                        Bonus Management
                    </h1>
                    <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                        Create activities to motivate users and process their reward claims.
                    </p>
                </div>
                {activeTab === 'activities' && (
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-[var(--color-brand)] text-[var(--color-text-primary)] px-4 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-brand-600 transition-colors"
                    >
                        <Plus size={16} />
                        New Activity
                    </button>
                )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded text-sm">{error}</div>}
            {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded text-sm">{successMsg}</div>}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[var(--color-border)] mb-6">
                <button
                    onClick={() => setActiveTab('activities')}
                    className={`pb-2 px-1 text-sm font-medium ${activeTab === 'activities' ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'} transition-colors`}
                >
                    Activities ({bonuses.length})
                </button>
                <button
                    onClick={() => setActiveTab('claims')}
                    className={`pb-2 px-1 text-sm font-medium flex items-center gap-2 ${activeTab === 'claims' ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'} transition-colors`}
                >
                    Pending Claims 
                    {claims.filter(c => c.status === 'pending').length > 0 && (
                        <span className="bg-brand-500 text-[var(--color-text-primary)] text-[10px] px-1.5 py-0.5 rounded-full">
                            {claims.filter(c => c.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {showCreateForm && activeTab === 'activities' && (
                <form onSubmit={handleCreateBonus} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-lg space-y-4 mb-6">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Create New Bonus Activity</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Activity Title</label>
                            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)]" placeholder="e.g. Identity Verification KYC" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Criteria</label>
                            <select value={formData.criteria} onChange={e => setFormData({...formData, criteria: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)]">
                                <option value="manual">Manual Verification</option>
                                <option value="kyc_approved">KYC Approved</option>
                                <option value="first_deposit">First Deposit</option>
                                <option value="trade_volume">Trading Volume Hit</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Reward Amount</label>
                            <input required type="number" step="0.01" value={formData.rewardAmount} onChange={e => setFormData({...formData, rewardAmount: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)]" placeholder="50.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Reward Currency</label>
                            <input required value={formData.rewardCurrency} onChange={e => setFormData({...formData, rewardCurrency: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] uppercase" placeholder="USD" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Description / Instructions</label>
                            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)] h-20" placeholder="Instructions for the user to complete this activity..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] text-[var(--color-text-secondary)]">Max Claims Globally (0 = Infinite)</label>
                            <input required type="number" value={formData.maxClaims} onChange={e => setFormData({...formData, maxClaims: e.target.value})} className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded px-3 py-2 text-sm text-[var(--color-text-primary)]" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <button type="submit" className="bg-[var(--color-brand)] text-[var(--color-text-primary)] px-4 py-2 rounded text-sm font-medium hover:bg-brand-600 transition-colors">Save Activity</button>
                        <button type="button" onClick={() => setShowCreateForm(false)} className="bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-4 py-2 rounded text-sm font-medium hover:text-[var(--color-text-primary)] transition-colors">Cancel</button>
                    </div>
                </form>
            )}

            {activeTab === 'activities' && !showCreateForm && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                                <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Activity</th>
                                <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Reward</th>
                                <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Claims</th>
                                <th className="p-4 text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {bonuses.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-sm text-[var(--color-text-secondary)]">No bonus activities found.</td></tr>
                            ) : bonuses.map(bonus => (
                                <tr key={bonus._id} className="hover:bg-[var(--color-background)]/50 transition-colors">
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{bonus.title}</p>
                                        <p className="text-[12px] text-[var(--color-text-muted)] line-clamp-1">{bonus.description}</p>
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-primary)] font-medium">
                                        {bonus.rewardAmount.toFixed(2)} {bonus.rewardCurrency}
                                    </td>
                                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">
                                        {bonus.currentClaims} {bonus.maxClaims > 0 ? `/ ${bonus.maxClaims}` : ' (∞)'}
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleBonusStatus(bonus._id, bonus.isActive)}
                                            className={`text-[11px] px-2 py-1 rounded font-medium ${bonus.isActive ? 'bg-green-500/10 text-green-500' : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                                        >
                                            {bonus.isActive ? 'Active' : 'Offline'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'claims' && (
                <div className="space-y-4">
                    {claims.length === 0 ? (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center rounded-lg text-sm text-[var(--color-text-secondary)]">
                            No claims submitted yet.
                        </div>
                    ) : claims.map(claim => (
                        <div key={claim._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-lg flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                        claim.status === 'pending' ? 'bg-brand-500/10 text-brand-500' :
                                        claim.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>{claim.status}</span>
                                    <span className="text-[12px] text-[var(--color-text-muted)]">
                                        {new Date(claim.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                                    {claim.user?.firstName} {claim.user?.lastName} <span className="text-[var(--color-text-muted)] font-normal text-[13px]">({claim.user?.email})</span>
                                </h3>
                                <p className="text-[13px] text-[var(--color-text-secondary)]">
                                    Claiming: <span className="font-semibold text-[var(--color-brand)]">{claim.bonusActivity?.title}</span> — Reward: {claim.bonusActivity?.rewardAmount} {claim.bonusActivity?.rewardCurrency}
                                </p>
                                {claim.claimProof && (
                                    <p className="text-[12px] text-[var(--color-text-muted)] bg-[var(--color-background)] p-2 rounded mt-2 inline-block border border-[var(--color-border)] italic">
                                        Proof: {claim.claimProof}
                                    </p>
                                )}
                                {claim.status === 'rejected' && claim.rejectionReason && (
                                    <p className="text-[12px] text-red-400 mt-1">Reason: {claim.rejectionReason}</p>
                                )}
                            </div>
                            
                            {claim.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleProcessClaim(claim._id, 'approved')}
                                        className="bg-green-500/10 hover:bg-green-500/20 text-green-500 p-2 rounded transition-colors"
                                        title="Approve & Credit Wallet"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleProcessClaim(claim._id, 'rejected')}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded transition-colors"
                                        title="Reject Claim"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
