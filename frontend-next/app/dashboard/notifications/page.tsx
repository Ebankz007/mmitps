/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { Bell, Shield, TrendingUp, Info, ChevronRight, Search, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    date: string;
    unread: boolean;
    type: 'system' | 'trading' | 'security';
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'system' | 'trading' | 'security'>('all');

    const [notifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Security Alert',
            message: 'New login detected from a new device in London, UK. If this wasn\'t you, please secure your account immediately.',
            time: '2m ago',
            date: 'Feb 24, 2026',
            unread: true,
            type: 'security'
        },
        {
            id: '2',
            title: 'Market Opportunity',
            message: 'EURUSD has reached a major institutional supply zone on the 4H timeframe. Watch for potential reversal patterns.',
            time: '15m ago',
            date: 'Feb 24, 2026',
            unread: true,
            type: 'trading'
        },
        {
            id: '3',
            title: 'System Update',
            message: 'Core-PTD Engine v2.4 has been successfully deployed. This update improves processing speed for high-frequency data by 15%.',
            time: '1h ago',
            date: 'Feb 24, 2026',
            unread: false,
            type: 'system'
        },
        {
            id: '4',
            title: 'Withdrawal Processed',
            message: 'Your withdrawal request of 500.00 USDT has been processed and sent to your wallet.',
            time: '5h ago',
            date: 'Feb 24, 2026',
            unread: false,
            type: 'system'
        },
        {
            id: '5',
            title: 'Margin Level Warning',
            message: 'Your account margin level has dropped below 200%. Please review your open positions.',
            time: '1d ago',
            date: 'Feb 23, 2026',
            unread: false,
            type: 'trading'
        }
    ]);

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'security': return <Shield className="h-5 w-5 text-red-500" />;
            case 'trading': return <TrendingUp className="h-5 w-5 text-[#22c55e]" />;
            default: return <Info className="h-5 w-5 text-brand-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-[var(--color-text-primary)] tracking-tight uppercase">
                        {t('notifications')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium italic">
                        {t('allAlerts')} — Institutional Feed
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            className="pl-10 pr-4 py-2 bg-surface dark:bg-[#121212] border border-gray-200 dark:border-[#1A1A1A] rounded-lg text-sm focus:outline-none focus:border-brand-500/50 transition-all w-full md:w-64 text-gray-900 dark:text-[var(--color-text-primary)]"
                        />
                    </div>
                    <button className="p-2 bg-surface dark:bg-[#121212] border border-gray-200 dark:border-[#1A1A1A] rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--color-surface-2)] transition-all">
                        <Filter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['all', 'system', 'trading', 'security'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                            filter === f
                                ? "bg-brand-500 text-[var(--color-text-primary)] border-brand-500 shadow-lg shadow-brand-500/20"
                                : "bg-surface dark:bg-[#121212] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#1A1A1A] hover:border-gray-300 dark:hover:border-gray-700"
                        )}
                    >
                        {f === 'all' ? 'All Alerts' : t(f)}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((n, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={n.id}
                            className={cn(
                                "group p-5 bg-surface dark:bg-[#121212] border border-gray-100 dark:border-[#1A1A1A] rounded-lg hover:border-brand-500/30 dark:hover:border-brand-500/20 transition-all relative overflow-hidden",
                                n.unread && "bg-brand-50/20 dark:bg-brand-500/[0.02]"
                            )}
                        >
                            {n.unread && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                            )}

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.05]">
                                        {getTypeIcon(n.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--color-text-primary)] uppercase tracking-tight">
                                                {n.title}
                                            </h3>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                                n.type === 'security' ? "text-red-500 bg-red-500/10 border-red-500/20" :
                                                    n.type === 'trading' ? "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20" :
                                                        "text-brand-500 bg-brand-500/10 border-brand-500/20"
                                            )}>
                                                {t(n.type)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono italic">{n.time}</span>
                                    </div>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                                        {n.message}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase">{n.date}</span>
                                        <button className="flex items-center gap-1 text-[10px] font-black uppercase text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Mark as read <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-surface dark:bg-[#121212] border border-dashed border-gray-200 dark:border-subtle rounded-lg">
                        <div className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-full mb-4">
                            <Bell className="h-10 w-10 text-gray-300 dark:text-gray-700" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--color-text-primary)] uppercase">{t('noNotifications')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic px-8">
                            Your institutional alert feed is currently clear. Relevant market movements and security updates will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
