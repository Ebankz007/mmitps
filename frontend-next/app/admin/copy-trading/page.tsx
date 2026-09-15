"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTradingAPI } from "@/lib/api/admin-trading";
import {
    Users,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle,
    Activity,
    Search,
    RefreshCw,
    Shield,
    ShieldAlert,
    Loader2,
    ChevronRight,
    Search as SearchIcon,
    Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
        role: string;
        isActive: boolean;
    };
    displayName: string;
    followers: number;
    copiers: number;
    winRate: number;
    netProfit: number;
    isProvider: boolean;
    verified: boolean;
    status: 'active' | 'inactive' | 'suspended';
    memberSince: string;
}

interface Subscription {
    _id: string;
    follower: {
        _id: string;
        username: string;
        email: string;
    };
    provider: {
        _id: string;
        username: string;
        email: string;
    };
    allocation: number;
    allocationType: string;
    status: string;
    createdAt: string;
    isCBook?: boolean;
}

export default function AdminCopyTradingPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'providers' | 'subscriptions' | 'cbook'>('providers');
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [newAccountData, setNewAccountData] = useState({
        name: "",
        login: "",
        password: "",
        server: "",
        platform: "MT4"
    });
    const [selectedProviderId, setSelectedProviderId] = useState("");
    const [selectedAdminAccountId, setSelectedAdminAccountId] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [providersData, subsData, accountsData] = await Promise.all([
                AdminTradingAPI.getAllProviders(),
                AdminTradingAPI.getAllSubscriptions(),
                AdminTradingAPI.getAdminAccounts()
            ]);
            setProviders(providersData.data || []);
            setSubscriptions(subsData.data || []);
            if (accountsData.success) {
                setAdminAccounts(accountsData.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch copy trading data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCBookFollow = async () => {
        if (!selectedProviderId || !selectedAdminAccountId) {
            alert("Please select both a provider and an admin account");
            return;
        }

        setActionLoading("cbook-start");
        try {
            await AdminTradingAPI.createCBookSubscription(selectedProviderId, selectedAdminAccountId);
            alert("Stealth C-Book subscription started successfully!");
            setIsFollowModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("C-Book follow failed", err);
            alert("Failed to start stealth copy");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleVerify = async (provider: Provider) => {
        setActionLoading(provider._id);
        try {
            await AdminTradingAPI.toggleVerification(provider._id, !provider.verified);
            setProviders(prev => prev.map(p =>
                p._id === provider._id ? { ...p, verified: !p.verified } : p
            ));
        } catch (err) {
            console.error("Failed to toggle verification", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateStatus = async (provider: Provider, status: 'active' | 'inactive' | 'suspended') => {
        setActionLoading(provider._id);
        try {
            await AdminTradingAPI.updateProviderStatus(provider._id, status);
            setProviders(prev => prev.map(p =>
                p._id === provider._id ? { ...p, status } : p
            ));
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddAccount = async () => {
        if (!newAccountData.login || !newAccountData.password || !newAccountData.server) {
            alert("Please fill in all required fields (Login, Password, Server)");
            return;
        }
        
        setActionLoading("add-account");
        try {
            const res = await AdminTradingAPI.addTradingAccount(newAccountData);
            if (res.success) {
                alert("Account linked successfully!");
                setIsAddAccountModalOpen(false);
                setNewAccountData({
                    name: "",
                    login: "",
                    password: "",
                    server: "",
                    platform: "MT4"
                });
                fetchData();
            } else {
                alert("Failed to add account: " + (res.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Add account failed", err);
            alert("Failed to link account");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredProviders = providers.filter(p =>
        p.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        p.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSubscriptions = subscriptions.filter(s =>
        s.follower?.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.provider?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20 group/admin">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-[#22c55e] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Trading Oversight</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                        Copy <span className="text-[#22c55e]">Trading</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Manage master traders and copy relationships across the platform.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-colors"
                    >
                        <RefreshCw size={18} className={cn(loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Providers", value: providers.length, icon: Shield, color: "text-brand-500" },
                    { label: "Active Copiers", value: subscriptions.length, icon: Users, color: "text-brand-500" },
                    { label: "Verified Traders", value: providers.filter(p => p.verified).length, icon: CheckCircle2, color: "text-[#22c55e]" },
                    { label: "Suspended", value: providers.filter(p => p.status === 'suspended').length, icon: ShieldAlert, color: "text-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface border border-[var(--color-border)] p-6 rounded-lg shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon size={48} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Navigation & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface border border-[var(--color-border)] p-4 rounded-lg">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-[var(--color-border)]">
                    <button
                        onClick={() => setTab('providers')}
                        className={cn(
                            "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'providers' ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        Master Traders
                    </button>
                    <button
                        onClick={() => setTab('subscriptions')}
                        className={cn(
                            "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'subscriptions' ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        Copy Subscriptions
                    </button>
                    <button
                        onClick={() => setTab('cbook')}
                        className={cn(
                            "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            tab === 'cbook' ? "bg-amber-500 text-black shadow-lg shadow-brand-500/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        C-Book (Stealth)
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {tab === 'cbook' && (
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setIsAddAccountModalOpen(true)}
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--color-surface-3)] transition-all border-dashed"
                            >
                                <Upload size={14} />
                                Link Execution Account
                            </button>
                            <button
                                onClick={() => setIsFollowModalOpen(true)}
                                className="bg-amber-500 text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-surface transition-all shadow-lg shadow-brand-500/10"
                            >
                                <Shield size={14} />
                                Start Stealth Copy
                            </button>
                        </div>
                    )}
                    <div className="relative w-full md:w-80 group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#22c55e] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${tab === 'providers' ? 'Master Traders' : tab === 'subscriptions' ? 'Subscriptions' : 'C-Book Profiles'}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-white/[0.02]">
                                {tab === 'providers' ? (
                                    <>
                                        {["Master Trader", "Followers", "Copiers", "Win Rate", "Profit", "Verification", "Status", "Actions"].map(h => (
                                            <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                        ))}
                                    </>
                                ) : tab === 'subscriptions' ? (
                                    <>
                                        {["Follower", "Master Trader", "Allocation", "Type", "Status", "Date"].map(h => (
                                            <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {["Stealth Account", "Target Master", "Status", "Execution", "Profit", "Started"].map(h => (
                                            <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">{h}</th>
                                        ))}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-6 py-8">
                                            <div className="h-4 bg-[var(--color-surface-2)] rounded-full animate-pulse w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : tab === 'providers' ? (
                                filteredProviders.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-20 text-center text-gray-600 uppercase font-black tracking-widest">No master traders found</td></tr>
                                ) : (
                                    filteredProviders.map(p => (
                                        <tr key={p._id} className="hover:bg-white/[0.01] transition-colors group/row">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center font-black text-[#22c55e]">
                                                        {p.displayName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[var(--color-text-primary)]">{p.displayName || "Unknown Trader"}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{p.userId?.email || "No Email"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-black text-brand-400 italic">{p.followers}</td>
                                            <td className="px-6 py-5 text-sm font-black text-brand-400 italic">{p.copiers}</td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-black text-[#22c55e] italic">{p.winRate?.toFixed(1)}%</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn("text-xs font-black italic", (p.netProfit || 0) >= 0 ? "text-[#22c55e]" : "text-red-500")}>
                                                    ${(p.netProfit || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    p.verified ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" : "bg-red-500/10 border-red-500/30 text-red-500"
                                                )}>
                                                    <Shield size={10} />
                                                    {p.verified ? "Verified" : "Unverified"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <select
                                                    value={p.status}
                                                    onChange={(e) => handleUpdateStatus(p, e.target.value as any)}
                                                    disabled={actionLoading === p._id}
                                                    className="bg-black/50 border border-[var(--color-border)] rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all outline-none focus:border-[#22c55e]"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleToggleVerify(p)}
                                                    disabled={actionLoading === p._id}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border transition-all",
                                                        p.verified ? "border-red-500/30 text-red-500 hover:bg-red-500/10" : "border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10"
                                                    )}
                                                >
                                                    {p.verified ? "Revoke Verification" : "Verify Trader"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : tab === 'subscriptions' ? (
                                filteredSubscriptions.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-600 uppercase font-black tracking-widest">No active copy relationships</td></tr>
                                ) : (
                                    filteredSubscriptions.filter(s => !s.isCBook).map(s => (
                                        <tr key={s._id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-[var(--color-text-primary)]">{s.follower?.username || 'Deleted User'}</p>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{s.follower?.email || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-[#22c55e] italic">{s.provider?.username || 'Deleted Trader'}</p>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{s.provider?.email || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-5 font-black text-[var(--color-text-primary)] italic">{s.allocation}</td>
                                            <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">{s.allocationType}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-brand-500">
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-[11px] font-medium text-gray-500">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                subscriptions.filter(s => s.isCBook).length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-600 uppercase font-black tracking-widest">No C-Book stealth relationships active</td></tr>
                                ) : (
                                    subscriptions.filter(s => s.isCBook).map(s => (
                                        <tr key={s._id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={12} className="text-amber-500" />
                                                    <p className="text-sm font-black text-[var(--color-text-primary)]">Admin Account</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-[#22c55e] italic">{s.provider?.username || 'Deleted Trader'}</p>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{s.provider?.email || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-500">
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500">Stealth (C-Book)</td>
                                            <td className="px-6 py-5 text-sm font-black text-[#22c55e] italic">$0.00</td>
                                            <td className="px-6 py-5 text-[11px] font-medium text-gray-500">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Account Modal */}
            {isAddAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddAccountModalOpen(false)} />
                    <div className="bg-surface border border-[var(--color-border)] w-full max-w-lg p-8 rounded-lg relative shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Link <span className="text-[#22c55e]">Execution Account</span></h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-4">Add accounts for C-Book activities</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Account Name (Internal)</label>
                                <input 
                                    type="text"
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg p-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                                    placeholder="e.g. C-Book Master 1"
                                    value={newAccountData.name}
                                    onChange={(e) => setNewAccountData({...newAccountData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Login / Account ID</label>
                                <input 
                                    type="text"
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg p-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                                    placeholder="123456"
                                    value={newAccountData.login}
                                    onChange={(e) => setNewAccountData({...newAccountData, login: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Password</label>
                                <input 
                                    type="password"
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg p-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                                    placeholder="••••••••"
                                    value={newAccountData.password}
                                    onChange={(e) => setNewAccountData({...newAccountData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Server</label>
                                <input 
                                    type="text"
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg p-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                                    placeholder="MetaQuotes-Demo"
                                    value={newAccountData.server}
                                    onChange={(e) => setNewAccountData({...newAccountData, server: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Platform</label>
                                <select 
                                    className="w-full bg-black border border-[var(--color-border)] rounded-lg p-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-[#22c55e]/50 transition-all"
                                    value={newAccountData.platform}
                                    onChange={(e) => setNewAccountData({...newAccountData, platform: e.target.value})}
                                >
                                    <option value="mt4">MT4</option>
                                    <option value="mt5">MT5</option>
                                    <option value="ctrader">cTrader</option>
                                    <option value="dxtrade">DXTrade</option>
                                    <option value="matchtrader">Match Trader</option>
                                    <option value="tradelocker">TradeLocker</option>
                                    <option value="tradovate">Tradovate</option>
                                    <option value="ninjatrader">NinjaTrader</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleAddAccount}
                            disabled={actionLoading === "add-account"}
                            className="w-full bg-[#22c55e] text-black py-4 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all shadow-xl shadow-[#22c55e]/10 flex items-center justify-center gap-2"
                        >
                            {actionLoading === "add-account" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link Trading Account"}
                        </button>
                    </div>
                </div>
            )}

            {/* Stealth Follow Modal */}
            {isFollowModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsFollowModalOpen(false)} />
                    <div className="bg-surface border border-[var(--color-border)] w-full max-w-md p-8 rounded-lg relative shadow-2xl">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Initiate <span className="text-amber-500">Stealth Copy</span></h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-4">C-Book Operations</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Target Master Trader</label>
                                <select 
                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg p-4 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-amber-500/50 transition-all"
                                    value={selectedProviderId}
                                    onChange={(e) => setSelectedProviderId(e.target.value)}
                                >
                                    <option value="">Select a Trader...</option>
                                    {providers.map(p => (
                                        <option key={p._id} value={p._id}>{p.displayName} ({p.userId?.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Admin Execution Account</label>
                                <select 
                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg p-4 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:border-amber-500/50 transition-all"
                                    value={selectedAdminAccountId}
                                    onChange={(e) => setSelectedAdminAccountId(e.target.value)}
                                >
                                    <option value="">Select your account...</option>
                                    {adminAccounts.map(acc => (
                                        <option key={acc._id} value={acc._id}>{acc.name} - {acc.login}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                    <Shield size={12} />
                                    Security Note
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium mt-1">C-Book relationships are invisible to the master trader. No profit sharing or management fees will be applied.</p>
                            </div>

                            <button
                                onClick={handleCBookFollow}
                                disabled={actionLoading === "cbook-start"}
                                className="w-full bg-amber-500 text-black py-4 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-surface transition-all shadow-xl shadow-brand-500/10 flex items-center justify-center gap-2"
                            >
                                {actionLoading === "cbook-start" ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Starting...</span>
                                    </>
                                ) : "Begin Stealth Copy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
