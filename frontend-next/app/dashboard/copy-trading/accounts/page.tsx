"use client";

import { useEffect, useState, useCallback } from "react";
import { TradingAccountAPI } from "@/lib/api/trading-accounts";
import {
    Plus,
    Monitor,
    Link as LinkIcon,
    Unlink,
    Shield,
    AlertCircle,
    CheckCircle2,
    Activity,
    Server,
    Key,
    User as UserIcon,
    RefreshCw,
    Info,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TradingAccount {
    _id: string;
    platform: string;
    accountName: string;
    accountNumber: string;
    server: string;
    broker: string;
    status: string;
    balance: number;
    equity: number;
    currency: string;
    createdAt: string;
}

const PLATFORMS = [
    { id: 'mt4', name: 'MetaTrader 4', icon: 'M4' },
    { id: 'mt5', name: 'MetaTrader 5', icon: 'M5' },
    { id: 'matchtrader', name: 'MatchTrader', icon: 'MT' },
    { id: 'ctrader', name: 'cTrader', icon: 'CT' },
    { id: 'ninjatrader', name: 'NinjaTrader', icon: 'NT' },
    { id: 'tradovate', name: 'Tradovate', icon: 'TV' },
    { id: 'ameritrade', name: 'TD Ameritrade', icon: 'AM' },
    { id: 'interactivebrokers', name: 'Interactive Brokers', icon: 'IB' },
    { id: 'tradingdesk', name: 'TradingDesk', icon: 'TD' },
];

export default function TradingAccountsPage() {
    const [accounts, setAccounts] = useState<TradingAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        platform: '',
        accountNumber: '',
        password: '',
        apiKey: '',
        apiSecret: '',
        server: '',
        broker: '',
        accountName: ''
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await TradingAccountAPI.getMyAccounts();
            setAccounts(res.data);
        } catch (err) {
            console.error("Failed to fetch accounts", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setError(null);
        try {
            await TradingAccountAPI.connectAccount(formData);
            await fetchAccounts();
            setIsAdding(false);
            setStep(1);
            setFormData({
                platform: '',
                accountNumber: '',
                password: '',
                apiKey: '',
                apiSecret: '',
                server: '',
                broker: '',
                accountName: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to connect account. Please check your credentials.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnect = async (id: string) => {
        if (!confirm("Are you sure you want to disconnect this account?")) return;
        setActionLoading(true);
        try {
            await TradingAccountAPI.disconnectAccount(id);
            setAccounts(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error("Failed to disconnect", err);
        } finally {
            setActionLoading(false);
        }
    };

    const selectedPlatform = PLATFORMS.find(p => p.id === formData.platform);

    return (
        <div className="space-y-8 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-500">
                        <Activity size={12} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Infrastructure</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                        Trading <span className="text-brand-500">Accounts</span>
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Connect your external broker house accounts to the command center.</p>
                </div>

                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 group bg-brand-600 hover:bg-brand-500 text-[var(--color-text-primary)] px-6 py-3 rounded-lg transition-all shadow-xl shadow-brand-500/20 active:scale-95 border border-[var(--color-border)]"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Add Broker Account</span>
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 md:p-12 shadow-2xl relative overflow-hidden animate-fade-in">
                    {/* Add Account Workflow */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Server size={120} />
                    </div>

                    <div className="max-w-2xl mx-auto space-y-8 relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs font-black text-brand-500">
                                    {step}
                                </div>
                                <h2 className="text-lg font-black uppercase italic tracking-tighter">
                                    {step === 1 ? "Select Platform" : "Configure Credentials"}
                                </h2>
                            </div>
                            <button
                                onClick={() => { setIsAdding(false); setStep(1); }}
                                className="text-gray-500 hover:text-[var(--color-text-primary)] text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                                Cancel Process
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-3 text-red-500 mb-6">
                                <AlertCircle size={18} />
                                <p className="text-xs font-bold">{error}</p>
                            </div>
                        )}

                        {step === 1 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setFormData({ ...formData, platform: p.id }); setStep(2); }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-[var(--color-border)] transition-all group hover:bg-white/[0.02] active:scale-95",
                                            formData.platform === p.id ? "bg-brand-600/10 border-blue-600/50" : "bg-black/50"
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                            {p.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[var(--color-text-primary)]">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleConnect} className="space-y-6">
                                <div className="bg-brand-600/5 border border-blue-600/20 p-4 rounded-lg flex items-start gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-black text-sm text-[var(--color-text-primary)]">
                                        {selectedPlatform?.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-400">{selectedPlatform?.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed mt-1">Provide your credentials below. Your connection is secured with military-grade AES-256 encryption.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Account Name (Local)</label>
                                        <div className="relative">
                                            <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. My Pro Scalper"
                                                value={formData.accountName}
                                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                                className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Account Number / ID</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="67890123"
                                                value={formData.accountNumber}
                                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                                className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {['mt4', 'mt5', 'ctrader', 'tradovate'].includes(formData.platform) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Broker Server</label>
                                            <div className="relative">
                                                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="ICMarkets-Live15"
                                                    value={formData.server}
                                                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Master Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                                <input
                                                    type="password"
                                                    required
                                                    autoComplete="off"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">API Key</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.apiKey}
                                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">API Secret</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.apiSecret}
                                                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                                                    className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 hover:text-[var(--color-text-primary)] text-xs font-black uppercase tracking-widest transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-12 py-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#22c55e]/10 active:scale-95 flex items-center gap-3"
                                    >
                                        {actionLoading && <RefreshCw size={16} className="animate-spin" />}
                                        Initialize Connection
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bg-[var(--color-surface-2)] h-48 rounded-lg animate-pulse"></div>
                        ))
                    ) : accounts.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 px-6 bg-surface border border-[var(--color-border)] rounded-lg text-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-6">
                                <Monitor size={32} className="text-gray-600" />
                            </div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">No Active Connections</h3>
                            <p className="max-w-xs text-gray-500 font-bold text-xs uppercase tracking-widest leading-loose mb-8">Link your broker accounts to start institutional grade performance tracking and copy trading.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-surface hover:bg-gray-200 text-black px-10 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        accounts.map((account) => (
                            <div
                                key={account._id}
                                className="group bg-surface border border-[var(--color-border)] p-8 rounded-lg shadow-2xl relative overflow-hidden hover:border-brand-500/30 transition-all"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-brand-600/5 rounded-full blur-3xl"></div>

                                <div className="flex items-start justify-between relative mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center font-black text-xl border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                                            {PLATFORMS.find(p => p.id === account.platform)?.icon || 'TR'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black italic tracking-tighter uppercase truncate max-w-[150px]">{account.accountName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    account.status === "connected" ? "bg-[#22c55e]" : "bg-red-500"
                                                )} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{account.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 border border-[var(--color-border)] px-3 py-2 rounded-lg text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Account ID</p>
                                        <p className="text-xs font-black text-[var(--color-text-primary)] italic tracking-tighter">#{account.accountNumber}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-black/30 border border-[var(--color-border)] p-4 rounded-lg">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Balance</p>
                                        <p className="text-xl font-black text-[#22c55e] italic tracking-tighter">${account.balance.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-black/30 border border-[var(--color-border)] p-4 rounded-lg">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Equity</p>
                                        <p className="text-xl font-black text-brand-500 italic tracking-tighter">${account.equity.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Server size={14} className="text-brand-500" />
                                            <span>{account.server || 'Direct'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDisconnect(account._id)}
                                        className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Disconnect Account"
                                    >
                                        <Unlink size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Pro Tip Callout */}
                    {!isAdding && accounts.length > 0 && (
                        <div className="col-span-1 md:col-span-2 bg-brand-600/5 border border-blue-600/10 p-6 rounded-lg flex items-center gap-6">
                            <div className="w-12 h-12 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                                <Shield className="text-[var(--color-text-primary)]" size={24} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-1">Mirror Status: Private</h4>
                                <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">Your broker credentials are encrypted using AES-256 standard. Only signal data is extracted for follower synchronization.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
