"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Copy, Twitter, MessageCircle, BarChart3, TrendingUp, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SharePerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalPnL: number;
        winRate: number;
        profitFactor: string;
        avgReturn: string;
    };
}

export default function SharePerformanceModal({ isOpen, onClose, stats }: SharePerformanceModalProps) {
    if (!isOpen) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied", { description: "Your performance link is ready to share." });
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
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Share Performance"
                    className="relative w-full max-w-2xl bg-[#08080A] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-[#10b981]/10 to-transparent blur-3xl" />

                    {/* Content */}
                    <div className="relative z-10 p-10 flex flex-col gap-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)]">
                                    <Share2 className="w-5 h-5 text-[#10b981]" />
                                </div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Share Performance</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all border border-[var(--color-border)]"
                                aria-label="Close dialog"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Social Card Preview */}
                        <div className="relative group p-1 bg-gradient-to-br from-[#10b981]/20 via-white/5 to-transparent rounded-lg">
                            <div className="bg-[#0D0D11] border border-[var(--color-border)] rounded-lg p-8 flex flex-col gap-8 overflow-hidden relative">
                                {/* Watermark */}
                                <div className="absolute top-8 right-8 flex items-center gap-2 opacity-40">
                                    <div className="w-6 h-6 bg-[#10b981] rounded flex items-center justify-center">
                                        <Zap className="w-3.5 h-3.5 text-black animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black italic uppercase tracking-[0.2em] text-[var(--color-text-primary)]">MMITPS PRO</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em]">Performance Summary</span>
                                    <h3 className="text-4xl font-black text-[var(--color-text-primary)] italic tracking-tighter uppercase">Verified Excellence</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <TrendingUp className="w-3 h-3 text-green-500" /> Cumulative PnL
                                        </span>
                                        <div className={`text-3xl font-black tracking-tighter ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stats.totalPnL >= 0 ? '+' : '-'}${Math.abs(stats.totalPnL).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <Award className="w-3 h-3 text-[#10b981]" /> Win Rate
                                        </span>
                                        <div className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">{stats.winRate.toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <BarChart3 className="w-3 h-3 text-brand-400" /> Profit Factor
                                        </span>
                                        <div className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">{stats.profitFactor}</div>
                                    </div>
                                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                                            <TrendingUp className="w-3 h-3 text-brand-500" /> Avg Return
                                        </span>
                                        <div className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">{stats.avgReturn}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Verified by Execution Engine v4.0</span>
                                    </div>
                                    <span className="text-[9px] font-black text-[#10b981] italic uppercase">mmitps.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] py-5 rounded-lg text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)] transition-all shadow-xl group"
                            >
                                <Copy className="w-4 h-4 text-[#10b981] group-hover:scale-110 transition-transform" />
                                Copy Share Link
                            </button>
                            <button
                                onClick={() => toast.info("Image Generation", { description: "Generating high-res performance card..." })}
                                className="flex items-center justify-center gap-3 bg-[#10b981] hover:bg-surface border border-[#10b981] py-5 rounded-lg text-xs font-black uppercase tracking-widest text-black transition-all shadow-xl group"
                            >
                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                Save as Image
                            </button>
                        </div>

                        {/* Quick Channels */}
                        <div className="flex items-center justify-center gap-6 pt-4 border-t border-[var(--color-border)]">
                            {[
                                { icon: Twitter, label: "X / Twitter", color: "hover:text-brand-400" },
                                { icon: MessageCircle, label: "Telegram", color: "hover:text-brand-500" },
                                { icon: MessageCircle, label: "WhatsApp", color: "hover:text-green-500" },
                            ].map((channel, idx) => (
                                <button key={idx} className={`flex items-center gap-2 text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest transition-colors ${channel.color}`}>
                                    <channel.icon size={14} />
                                    {channel.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
