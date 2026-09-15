/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
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
    ChevronRight,
    TrendingDown,
    DollarSign,
    Coins,
    Gem,
    LayoutDashboard,
    Banknote,
    ArrowUpRight,
    Zap,
    Repeat,
    ArrowDownRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants/payment-methods";
import { useWallet, useTransactions } from "@/hooks/use-financial";
import { Transaction } from "@/lib/api/financial";
import { clsx } from "clsx";

export default function FinancialHubPage() {
    const { t } = useLanguage();
    const { data: balance, isLoading: balanceLoading } = useWallet();
    const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();

    const transactions = transactionsData?.data?.slice(0, 5) || [];
    const loading = balanceLoading || transactionsLoading;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed": return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
            case "pending": return <Clock className="h-3 w-3 text-amber-500" />;
            case "failed": return <XCircle className="h-3 w-3 text-rose-500" />;
            default: return <Clock className="h-3 w-3 text-gray-500" />;
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
                <div className="h-12 w-64 bg-[var(--color-surface-2)] rounded-lg"></div>
                <div className="h-48 bg-[var(--color-surface-2)] rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[var(--color-surface-2)] rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-64 bg-[var(--color-surface-2)] rounded-lg" />
                    <div className="h-64 bg-[var(--color-surface-2)] rounded-lg" />
                </div>
            </div>
        );
    }

    const fiatBalances = [
        { name: "US Dollar", symbol: "USD", icon: "US", amount: (balance?.totalUSD ?? 12450.00).toLocaleString(), available: "Available", color: "emerald" },
        { name: "Euro", symbol: "EUR", icon: "EU", amount: "2,340.50", available: "Available", color: "blue" },
        { name: "Nigerian Naira", symbol: "NGN", icon: "NG", amount: "1,245,000", available: "Available", color: "emerald" },
    ];

    const cryptoBalances = [
        { name: "Bitcoin", symbol: "BTC", icon: "₿", amount: "0.4521 BTC", usd: "≈ $18,234.50", color: "amber" },
        { name: "Ethereum", symbol: "ETH", icon: "Ξ", amount: "2.8450 ETH", usd: "≈ $5,912.80", color: "indigo" },
        { name: "USDT", symbol: "Tether", icon: "₮", amount: "5,420.00", usd: "≈ $5,420.00", color: "emerald" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard • Financial Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
                        Financial <span className="text-emerald-500 italic">Hub</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium max-w-md mt-1 italic">
                        Manage your funds, track transactions, and grow your wealth.
                    </p>
                </div>
                <Link
                    href="/dashboard/news/forex"
                    className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all group"
                >
                    <Banknote className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Economic Calendar</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Total Portfolio Card */}
            <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Total Portfolio Value</div>
                        <div className="text-6xl font-black text-[var(--color-text-primary)] tracking-tighter">
                            ${(balance?.totalUSD ?? 24587.42).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                            <TrendingUp className="h-3 w-3" />
                            +$1,245.30 <span className="text-emerald-500/60 ml-1">this month</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/financial/deposit" className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-lg text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            <ArrowUpCircle className="h-4 w-4" />
                            Deposit
                        </Link>
                        <Link href="/dashboard/financial/payout" className="flex items-center gap-3 px-8 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-black border border-[var(--color-border)] rounded-lg text-xs uppercase tracking-widest transition-all">
                            <ArrowDownCircle className="h-4 w-4" />
                            Withdraw
                        </Link>
                        <Link href="/dashboard/financial/transfer" className="flex items-center gap-3 px-8 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-black border border-[var(--color-border)] rounded-lg text-xs uppercase tracking-widest transition-all">
                            <Repeat className="h-4 w-4" />
                            Transfer
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "My Wallet", desc: "View all balances", icon: Wallet, color: "rose", href: "/dashboard/financial/wallet" },
                    { label: "Deposit", desc: "Add funds to wallet", icon: Banknote, color: "amber", href: "/dashboard/financial/deposit" },
                    { label: "Transfer", desc: "Send to other users", icon: Repeat, color: "blue", href: "/dashboard/financial/transfer" },
                    { label: "Withdraw", desc: "Request payout", icon: ArrowDownCircle, color: "orange", href: "/dashboard/financial/payout" },
                ].map((action, i) => (
                    <Link key={i} href={action.href} className="p-6 bg-[#0B1224] border border-[var(--color-border)] rounded-lg group hover:border-emerald-500/30 transition-all duration-500 hover:scale-[1.02] shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                                action.color === 'rose' ? "bg-rose-500/20 text-rose-500 shadow-rose-500/10" :
                                    action.color === 'amber' ? "bg-amber-500/20 text-amber-500 shadow-brand-500/10" :
                                        action.color === 'blue' ? "bg-brand-500/20 text-brand-500 shadow-brand-500/10" :
                                            "bg-brand-500/20 text-brand-500 shadow-orange-500/10"
                            )}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">{action.label}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{action.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Balances Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fiat Balances */}
                <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Fiat Balances</h3>
                        </div>
                        <Link href="/dashboard/financial/wallet" className="text-[10px] font-black text-gray-500 hover:text-emerald-500 uppercase tracking-widest transition-colors">View All →</Link>
                    </div>

                    <div className="space-y-4">
                        {fiatBalances.map((item, i) => (
                            <div key={i} className="p-5 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex items-center justify-between group hover:border-[var(--color-border)] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-xs font-black text-[var(--color-text-primary)] border border-[var(--color-border)] group-hover:border-emerald-500/50 transition-colors">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wide">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 font-bold">{item.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">${item.amount}</div>
                                    <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{item.available}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crypto Balances */}
                <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Coins className="h-5 w-5 text-amber-500" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Crypto Balances</h3>
                        </div>
                        <Link href="/dashboard/financial/wallet" className="text-[10px] font-black text-gray-500 hover:text-amber-500 uppercase tracking-widest transition-colors">View All →</Link>
                    </div>

                    <div className="space-y-4">
                        {cryptoBalances.map((item, i) => (
                            <div key={i} className="p-5 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex items-center justify-between group hover:border-[var(--color-border)] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border border-[var(--color-border)] group-hover:border-opacity-100 transition-colors",
                                        item.color === 'amber' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:border-amber-500" :
                                            item.color === 'indigo' ? "bg-brand-500/10 text-brand-500 border-brand-500/20 group-hover:border-brand-500" :
                                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:border-emerald-500"
                                    )}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wide">{item.name}</div>
                                        <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{item.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">{item.amount}</div>
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{item.usd}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Earnings Summary */}
                <div className="xl:col-span-7 bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Earnings Summary</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Trading Profits", amount: "$4,567", color: "emerald" },
                            { label: "MLM Commissions", amount: "$2,340", color: "blue" },
                            { label: "Copy Trading", amount: "$890", color: "rose" },
                            { label: "Token Yields", amount: "$456", color: "amber" },
                        ].map((stat, i) => (
                            <div key={i} className="p-8 bg-white/[0.02] border border-[var(--color-border)] rounded-lg group hover:border-emerald-500/20 transition-all text-center">
                                <div className={cn("text-3xl font-black mb-1",
                                    stat.color === 'emerald' ? "text-emerald-500" :
                                        stat.color === 'blue' ? "text-brand-500" :
                                            stat.color === 'rose' ? "text-rose-500" :
                                                "text-amber-500"
                                )}>
                                    {stat.amount}
                                </div>
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="xl:col-span-5 bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 overflow-hidden relative font-black">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-gray-500" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Recent Transactions</h3>
                        </div>
                        <Link href="/dashboard/financial/wallet" className="text-[10px] font-black text-gray-500 hover:text-[var(--color-text-primary)] uppercase tracking-widest transition-colors">View All →</Link>
                    </div>

                    <div className="space-y-2">
                        {transactions.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-600 text-[10px] uppercase font-bold">No recent history</p>
                            </div>
                        ) : (
                            transactions.map((tx: Transaction) => (
                                <div key={tx._id} className="p-4 bg-white/[0.02] rounded-lg flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-emerald-500">
                                            {tx.type === 'deposit' ? <ArrowDownRight className="h-5 w-5 rotate-180" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--color-text-primary)] uppercase tracking-wide">{tx.type}</div>
                                            <div className="text-[9px] text-gray-500 italic mt-0.5">{new Date(tx.createdAt).toLocaleDateString()} • {tx.status}</div>
                                        </div>
                                    </div>
                                    <div className={cn("text-sm tracking-tighter", tx.type === 'deposit' ? "text-emerald-500" : "text-[var(--color-text-primary)]")}>
                                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Mock items to match image if ledger empty */}
                        {transactions.length < 4 && (
                            <>
                                <div className="p-4 bg-white/[0.02] rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-emerald-500">
                                            <ArrowDownRight className="h-5 w-5 rotate-180" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--color-text-primary)] uppercase tracking-wide">Deposit</div>
                                            <div className="text-[9px] text-gray-500 italic mt-0.5">PayStack • 2h ago</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-emerald-500">+$500.00</div>
                                </div>
                                <div className="p-4 bg-white/[0.02] rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-brand-500">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--color-text-primary)] uppercase tracking-wide">Commission</div>
                                            <div className="text-[9px] text-gray-500 italic mt-0.5">Binary Match • 5h ago</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-emerald-500">+$127.50</div>
                                </div>
                                <div className="p-4 bg-white/[0.02] rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-amber-500">
                                            <ArrowUpRight className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--color-text-primary)] uppercase tracking-wide">Withdrawal</div>
                                            <div className="text-[9px] text-gray-500 italic mt-0.5">Bank Transfer • 1d ago</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-[var(--color-text-primary)]">-$1,000.00</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Supported Payment Methods - Footer Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Gem className="h-3 w-3" />
                        Supported Payment Gateways
                    </h3>
                    <div className="h-px flex-1 bg-[var(--color-surface-2)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {PAYMENT_METHODS.map((provider: PaymentMethod, i: number) => (
                        <div key={i} className="p-6 bg-[#0B1224] border border-[var(--color-border)] rounded-lg group hover:border-[var(--color-border-hover)] transition-all shadow-lg text-left relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 shadow-lg", provider.iconBg, provider.iconColor)}>
                                    {React.cloneElement(provider.icon as any, { className: "w-5 h-5" })}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">{provider.name}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{provider.desc}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {provider.badges.map((b: { text: string; color: string }, j: number) => (
                                    <span key={j} className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest", b.color)}>
                                        {b.text}
                                    </span>
                                ))}
                            </div>

                            <div className="text-[10px] text-gray-600 font-medium pt-4 border-t border-[var(--color-border)] flex items-center justify-between group-hover:text-gray-400 transition-colors">
                                {provider.footer}
                                <Link 
                                    href={`/dashboard/financial/deposit?method=${provider.id}`}
                                    className="p-1 px-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[9px] font-black uppercase tracking-tighter"
                                >
                                    Deposit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
