"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import {
    Bell,
    Moon,
    Sun,
    ChevronDown,
    LogOut,
    User,
    Timer,
    Briefcase,
    RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";
import GoogleTranslate from "./GoogleTranslate";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";


export function DashboardHeader() {
    const { user, logout, extendSession } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, languages, t } = useLanguage();

    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        clearAll, 
        settings, 
        setSettings 
    } = useNotifications();

    const [timeLeft, setTimeLeft] = useState(3600);
    const [selectedDuration, setSelectedDuration] = useState(60);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Sync initial user preference
    useEffect(() => {
        const prefDuration = (user?.data?.preferences as any)?.sessionDuration;
        if (prefDuration) {
            setSelectedDuration(prefDuration);
            setTimeLeft(prefDuration * 60);
        }
    }, [user]);


    // Session Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-surface dark:bg-surface border-b border-gray-100 dark:border-[#1A1A1A] sticky top-0 z-40 transition-colors duration-300">
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                {/* Mobile toggle would go here */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-surface-2 rounded-full text-xs font-mono border border-gray-200 dark:border-[var(--color-border)]" title={t('timeout')}>
                        <Timer className="h-3 w-3 text-[#22c55e]" />
                        <span className="text-gray-700 dark:text-gray-200 mr-2">{formatTime(timeLeft)}</span>
                        <div className="h-4 w-px bg-gray-300 dark:bg-[var(--color-surface-3)]"></div>
                        <select
                            className="bg-transparent border-none text-[10px] text-gray-500 dark:text-gray-400 outline-none cursor-pointer appearance-none px-1"
                            title="Set your personal active session duration"
                            value={selectedDuration}
                            onChange={async (e) => {
                                const newDuration = parseInt(e.target.value);
                                setSelectedDuration(newDuration);
                                setTimeLeft(newDuration * 60);
                                try {
                                    const { userService } = await import('@/lib/api/user');
                                    await userService.updatePreferences({ sessionDuration: newDuration });
                                    toast.success(`Session duration updated to ${newDuration} minutes`);
                                    await extendSession();
                                } catch (error) {
                                    console.error("Failed to update session duration", error);
                                    toast.error("Failed to update session duration");
                                }
                            }}
                        >
                            <option value={15}>15m</option>
                            <option value={30}>30m</option>
                            <option value={60}>1h</option>
                            <option value={120}>2h</option>
                            <option value={240}>4h</option>
                            <option value={720}>12h</option>
                            <option value={1440}>24h</option>
                        </select>
                    </div>

                    {/* Quick Time Extension Button */}
                    {["admin", "super_admin"].includes(user?.role || "") && (
                        <button
                            onClick={async () => {
                                setTimeLeft(selectedDuration * 60);
                                await extendSession();
                            }}
                            className="p-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded-full border border-[#22c55e]/20 transition-all group"
                            title={t('time_extension')}
                            aria-label={t('time_extension')}
                        >
                            <RefreshCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative">
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[var(--color-surface-2)] rounded-lg transition-colors text-sm text-gray-600 dark:text-gray-300"
                        aria-label={`Language: ${language.label}`}
                        aria-expanded={isLangOpen}
                    >
                        <span>{language.flag}</span>
                        <span className="hidden sm:inline">{language.label}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>
                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-40 bg-surface dark:bg-[#121212] border border-gray-100 dark:border-[#1A1A1A] rounded-lg shadow-2xl py-2 overflow-hidden z-50"
                            >
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsLangOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                                            language.code === lang.code ? "text-gray-900 dark:text-[var(--color-text-primary)] bg-gray-100 dark:bg-[var(--color-surface-3)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--color-surface-2)]"
                                        )}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Google Translate */}
                <div className="hidden sm:block">
                    <GoogleTranslate />
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "p-2 rounded-lg transition-colors relative",
                            isNotificationsOpen ? "bg-gray-100 dark:bg-[var(--color-surface-2)] text-gray-900 dark:text-[var(--color-text-primary)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface-2)]"
                        )}
                        aria-label={`Notifications (${unreadCount} unread)`}
                        aria-expanded={isNotificationsOpen}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-[#0D0D0D]"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-80 bg-surface dark:bg-[#121212] border border-gray-100 dark:border-[#1A1A1A] rounded-lg shadow-2xl overflow-hidden z-50 text-gray-900 dark:text-[var(--color-text-primary)]"
                            >
                                <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1A1A1A] flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--color-text-primary)] uppercase tracking-wider">{t('alerts')}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <button 
                                                onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                                className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", settings.soundEnabled ? "text-brand-500" : "text-gray-500")}
                                            >
                                                {settings.soundEnabled ? "Sound On" : "Sound Muted"}
                                            </button>
                                            <button 
                                                onClick={() => clearAll()}
                                                className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--color-text-primary)]"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">
                                        {unreadCount} {t('new')}
                                    </span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-5 py-12 text-center">
                                            <Bell className="h-8 w-8 text-gray-700 mx-auto mb-3 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No active alerts</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => markAsRead(n.id)}
                                                className={cn(
                                                    "w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] border-b border-gray-100 dark:border-[#1A1A1A] transition-colors group relative",
                                                    n.unread && "bg-brand-50/30 dark:bg-[#22c55e]/[0.02]"
                                                )}
                                            >
                                                {n.unread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-full" />}
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        n.type === 'security' ? "text-red-500" : (n.type === 'vmid' || n.type === 'geometry' || n.type === 'ptd' || n.type === 'trading') ? "text-[#22c55e]" : "text-brand-500"
                                                    )}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase">{n.time}</span>
                                                </div>
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-[var(--color-text-primary)] transition-colors capitalize">{n.title}</div>
                                                <div className="text-[11px] text-gray-500 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed">{n.message}</div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <Link
                                    href="/dashboard/notifications"
                                    className="block py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
                                    onClick={() => setIsNotificationsOpen(false)}
                                >
                                    {t('archive')}
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile */}
                <div className="relative ml-2">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-gray-100 dark:bg-surface-2 hover:bg-gray-200 dark:hover:bg-[#222222] rounded-full border border-gray-200 dark:border-[var(--color-border)] transition-all duration-200"
                        aria-label="User menu"
                        aria-expanded={isProfileOpen}
                    >
                        <div className="w-7 h-7 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--color-text-primary)] shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-[var(--color-border)]">
                            {user?.email?.substring(0, 2).toUpperCase() || "JD"}
                        </div>
                        <div className="hidden md:block text-left mr-1">
                            <div className="text-[11px] font-bold text-gray-900 dark:text-[var(--color-text-primary)] leading-none mb-0.5">{user?.email?.split('@')[0]}</div>
                            <div className="text-[9px] uppercase tracking-tighter text-[#22c55e] font-bold leading-none">{user?.role}</div>
                        </div>
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-surface dark:bg-[#121212] border border-gray-100 dark:border-[#1A1A1A] rounded-lg shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 z-50">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1A1A1A] md:hidden">
                                <div className="text-sm font-bold text-gray-900 dark:text-[var(--color-text-primary)]">{user?.email?.split('@')[0]}</div>
                                <div className="text-[10px] uppercase text-[#22c55e] font-black tracking-widest bg-[#22c55e]/10 px-2 py-0.5 rounded-full">{user?.role}</div>
                            </div>
                            <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--color-surface-2)] transition-colors">
                                <User className="h-4 w-4" />
                                <span>{t('profile')}</span>
                            </Link>
                            <Link href="/dashboard/portfolio" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--color-surface-2)] transition-colors">
                                <Briefcase className="h-4 w-4" />
                                <span>{t('portfolio')}</span>
                            </Link>

                            {/* Time Extension for quick access (Admin/Super Admin only) */}
                            {["admin", "super_admin"].includes(user?.role || "") && (
                                <button
                                    onClick={async () => {
                                        setTimeLeft(1800);
                                        await extendSession();
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#22c55e] hover:bg-[#22c55e]/5 transition-colors text-left group"
                                >
                                    <Timer className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                    <span className="font-bold">{t('time_extension')}</span>
                                </button>
                            )}

                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors border-t border-gray-100 dark:border-[#1A1A1A] mt-1 text-left font-medium">
                                <LogOut className="h-4 w-4" />
                                <span>{t('signout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

