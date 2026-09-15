"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Globe, Cpu, ChevronRight, CheckCircle2, Search } from "lucide-react";
import { PLATFORMS } from "@/lib/constants/platforms";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConnect?: (data: any) => void;
};

export default function BrokerAccountModal({ isOpen, onClose, onConnect }: Props) {
    const [step, setStep] = useState(1);
    const [platform, setPlatform] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const filteredPlatforms = PLATFORMS.filter(p => 
        p.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConnect = () => {
        setIsConnecting(true);
        // Simulate connection
        setTimeout(() => {
            setIsConnecting(false);
            setStep(3);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Connect Broker Account"
                    className="relative w-full max-w-lg bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text-primary)]">Connect Broker</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cross-Platform Bridge Integration</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-full transition-colors text-gray-500" aria-label="Close dialog">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        placeholder="SEARCH PLATFORMS..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-4 text-xs font-bold text-[var(--color-text-primary)] placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredPlatforms.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPlatform(p.id)}
                                            className={`p-4 rounded-lg border transition-all flex items-center gap-3 text-left ${
                                                platform === p.id 
                                                ? "bg-amber-500/10 border-amber-500 text-[var(--color-text-primary)]" 
                                                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-gray-400 hover:border-[var(--color-border-hover)]"
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${platform === p.id ? "bg-amber-500/20" : "bg-[var(--color-surface-2)]"}`}>
                                                <Cpu className={`w-4 h-4 ${platform === p.id ? "text-amber-500" : "text-gray-500"}`} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tight truncate">{p.label}</span>
                                        </button>
                                    ))}
                                    {filteredPlatforms.length === 0 && (
                                        <div className="col-span-2 py-10 text-center text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                                            No platforms found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                                <button
                                    disabled={!platform}
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/20 text-xs"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 rounded-lg">
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <Cpu className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Selected Platform</div>
                                            <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">
                                                {PLATFORMS.find(p => p.id === platform)?.label}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Account Name</label>
                                        <input type="text" placeholder="e.g. IC Markets - Main" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 text-[var(--color-text-primary)]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Server Name</label>
                                        <input type="text" placeholder="ICMarkets-Demo03" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 text-[var(--color-text-primary)]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Login ID</label>
                                            <input type="text" placeholder="12345678" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 text-[var(--color-text-primary)]" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Password</label>
                                            <input type="password" placeholder="********" className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 text-[var(--color-text-primary)]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center gap-4">
                                    <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[10px] text-gray-500 font-medium leading-normal italic">
                                        Your credentials are encrypted and stored securely using institutional-grade AES-256 protocols.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-[var(--color-surface-2)] text-gray-400 font-black uppercase tracking-widest rounded-lg hover:bg-[var(--color-surface-3)] transition-all border border-[var(--color-border)] text-[10px]">Back</button>
                                    <button 
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="flex-[2] py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/20 text-[10px]"
                                    >
                                        {isConnecting ? "Connecting..." : "Connect Account"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="py-10 flex flex-col items-center text-center space-y-6">
                                <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 animate-bounce">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight italic">Connection Established</h4>
                                    <p className="text-sm text-gray-500 font-medium">Your {PLATFORMS.find(p => p.id === platform)?.label} account has been successfully bridged to the MMITPS network.</p>
                                </div>
                                <button onClick={onClose} className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-black uppercase tracking-widest rounded-lg border border-[var(--color-border)] transition-all text-xs">Go to Dashboard</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
