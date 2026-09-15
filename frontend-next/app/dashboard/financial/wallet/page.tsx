"use client";

import { useWallet, useTransactions } from "@/hooks/use-financial";
import { Transaction } from "@/lib/api/financial";
import { useLanguage } from "@/lib/language-context";
import { clsx } from "clsx";
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCcw,
    CreditCard,
    History,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowRightLeft,
    Lock
} from "lucide-react";

export default function MyWalletPage() {
    const { t } = useLanguage();
    const { data: balance, isLoading: balanceLoading } = useWallet();
    const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();
    const transactions = transactionsData?.data || [];
    const loading = balanceLoading || transactionsLoading;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "locked": return <Lock className="h-4 w-4 text-emerald-500" />;
            case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "pending": return <Clock className="h-4 w-4 text-amber-500" />;
            case "failed": return <XCircle className="h-4 w-4 text-rose-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "deposit": return <ArrowUpCircle className="h-4 w-4 text-emerald-500" />;
            case "withdrawal": return <ArrowDownCircle className="h-4 w-4 text-rose-500" />;
            case "transfer": return <ArrowRightLeft className="h-4 w-4 text-brand-500" />;
            case "subscription": return <CreditCard className="h-4 w-4 text-brand-500" />;
            default: return <RefreshCcw className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-12 w-64 bg-[var(--color-surface-2)] rounded-lg mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]"></div>
                    ))}
                </div>
                <div className="h-96 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]"></div>
            </div>
        );
    }

    // Safely extract crypto balances or use an empty array if undefined
    const displayBalances = balance?.cryptoBalances || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)] transition-all">My <span className="text-[#10b981]">Wallet</span></h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage your funds and view transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-bold rounded-lg text-sm transition-all border border-[var(--color-border)]">
                        <ArrowUpCircle className="h-4 w-4 text-[#10b981]" />
                        Deposit Funds
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-black rounded-lg text-sm transition-all shadow-[0_0_20px_rgba(16, 185, 129,0.3)]">
                        <ArrowDownCircle className="h-4 w-4" />
                        Withdraw
                    </button>
                </div>
            </div>

            {/* Top Summary Banner */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border border-[var(--color-border)] p-8 rounded-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Wallet className="h-48 w-48 text-[var(--color-text-primary)]" />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                    <div className="pt-4 md:pt-0">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
                            Total Net Worth
                        </div>
                        <div className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">
                            ${(balance?.totalUSD ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="pt-4 md:pt-0 md:pl-8">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Available to Trade
                        </div>
                        <div className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                            ${(balance?.availableUSD ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="pt-4 md:pt-0 md:pl-8">
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-widest mb-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            Locked Commissions
                        </div>
                        <div className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                            ${((balance?.lockedUSD ?? balance?.lockedWalletBalance ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {((balance?.lockedUSD ?? balance?.lockedWalletBalance ?? 0)) > 0 && (
                            <div className="mt-3">
                                <a href="/dashboard/financial/upgrade" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors">
                                    Upgrade to Unlock <ArrowUpCircle className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Left Column (Balances & Earnings) / Right Column (Transactions) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Wallet Balances - 2 Column Grid on Mobile */}
                    <div>
                        <h2 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight mb-4 flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-[#10b981]" />
                            Currency Wallets
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Static Fiat Wallets explicitly mapped first per design */}
                            <div className="bg-surface border border-[var(--color-border)] p-5 rounded-lg hover:border-[var(--color-border-hover)] transition-all">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">USD Wallet</div>
                                <div className="text-xl font-black text-[var(--color-text-primary)] mb-1">${(balance?.totalUSD ?? 0).toLocaleString()}</div>
                                <div className="text-[10px] text-emerald-500 font-medium">+0.00% Today</div>
                            </div>
                            <div className="bg-surface border border-[var(--color-border)] p-5 rounded-lg hover:border-[var(--color-border-hover)] transition-all">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">EUR Wallet</div>
                                <div className="text-xl font-black text-[var(--color-text-primary)] mb-1">€0.00</div>
                                <div className="text-[10px] text-gray-500 font-medium">Inactive</div>
                            </div>

                            {/* Dynamic Crypto Wallets generated from backend */}
                            {displayBalances.map((crypto, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[var(--color-border)] p-5 rounded-lg hover:border-[#10b981]/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] text-gray-400 group-hover:text-[#10b981] font-bold uppercase tracking-widest transition-colors">{crypto.symbol} Wallet</div>
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[8px] font-black text-[var(--color-text-primary)]">{crypto.symbol.substring(0, 3)}</div>
                                    </div>
                                    <div className="text-xl font-black text-[var(--color-text-primary)] mb-1">{crypto.amount} <span className="text-xs font-bold text-gray-500">{crypto.symbol}</span></div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-[10px] text-gray-500 font-bold">≈ ${(crypto.usdValue ?? 0).toLocaleString()}</div>
                                        {crypto.frozen ? (
                                            <div className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">{crypto.frozen} Locked</div>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Earnings Breakdown (Mocked as requested) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6 flex items-center justify-between">
                                Earnings Breakdown
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                                    <div className="text-xs text-gray-400 font-bold">Trading Profits</div>
                                    <div className="text-sm font-black text-emerald-500">+$12,450.00</div>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                                    <div className="text-xs text-gray-400 font-bold">Copy Trading Comms.</div>
                                    <div className="text-sm font-black text-emerald-500">+$840.50</div>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                                    <div className="text-xs text-gray-400 font-bold">Referral Revenue</div>
                                    <div className="text-sm font-black text-emerald-500">+$210.00</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-400 font-bold">Pool Dividends</div>
                                    <div className="text-sm font-black text-emerald-500">+$45.20</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 p-6 rounded-lg relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <TrendingUp className="h-40 w-40 text-[#10b981]" />
                            </div>
                            <h3 className="text-sm font-black text-[#10b981] uppercase tracking-widest mb-2">
                                Monthly Summary
                            </h3>
                            <div className="text-xs text-gray-400 font-medium mb-6">Your aggregate performance this month.</div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Inflow</div>
                                    <div className="text-2xl font-black text-[var(--color-text-primary)]">+$13,545.70</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Outflow</div>
                                    <div className="text-2xl font-black text-[var(--color-text-primary)]">-$4,200.00</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Net Change</div>
                                    <div className="text-xl font-black text-emerald-500">+$9,345.70</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Transactions) */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col h-[800px]">
                    <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#10b981]/10 rounded-lg">
                                <History className="h-4 w-4 text-[#10b981]" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-[var(--color-text-primary)] tracking-widest uppercase">Ledger</h2>
                            </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#10b981] transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        {transactions.length === 0 ? (
                            <div className="py-12 text-center h-full flex flex-col justify-center">
                                <div className="w-12 h-12 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History className="h-5 w-5 text-gray-700" />
                                </div>
                                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Empty Ledger</h3>
                                <p className="text-gray-600 text-[10px]">No recent transactions found.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 py-4">
                                {transactions.map((tx: Transaction) => (
                                    <div key={tx._id} className="p-3 rounded-lg hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)] transition-all flex items-center gap-4 cursor-pointer">
                                        <div className="relative">
                                            <div className="p-2.5 rounded-full bg-[var(--color-surface-2)]">
                                                {getTypeIcon(tx.type)}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-surface rounded-full p-0.5">
                                                {getStatusIcon(tx.status)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider truncate">{t(`wallet_type_${tx.type}`)}</div>
                                                <div className={clsx(
                                                    "text-sm font-black tracking-tight",
                                                    tx.type === "deposit" || tx.type === "earning" ? "text-emerald-500" : "text-[var(--color-text-primary)]"
                                                )}>
                                                    {tx.type === "deposit" || tx.type === "earning" ? "+" : "-"}
                                                    {(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                                                <div className="truncate pr-4">{tx.description}</div>
                                                <div className="whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
