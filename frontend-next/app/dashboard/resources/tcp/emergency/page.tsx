"use client";

import { useTrading } from "@/hooks/use-trading";
import {
    ShieldAlert,
    XOctagon,
    Lock,
    Zap,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function TCPEmergencyPage() {
    const { emergencyCloseAll, positions } = useTrading();
    const [isConfirming, setIsConfirming] = useState(false);

    return (
        <div className="p-8 bg-black min-h-screen text-[var(--color-text-primary)] overflow-hidden relative">
            {/* Background Red Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 blur-[120px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-900/10 blur-[120px]" />

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-20 h-20 bg-red-500/20 rounded-lg flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl shadow-red-500/10">
                        <ShieldAlert className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4">PANIC ROOM</h1>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-lg leading-relaxed">
                        Instant global execution protocols. Use these controls only in high-volatility
                        events or emergency security scenarios to liquidate all exposure immediately.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Close All Card */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-10 flex flex-col items-center text-center hover:border-red-500/20 transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <XOctagon className="h-12 w-12 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Liquidate All</h3>
                        <p className="text-[var(--color-text-secondary)] text-xs mb-8">
                            Closes all {positions?.length || 0} active positions across all linked accounts
                            at current market prices immediately.
                        </p>

                        {!isConfirming ? (
                            <button
                                onClick={() => setIsConfirming(true)}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20"
                            >
                                Trigger Liquidation
                            </button>
                        ) : (
                            <div className="w-full flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        emergencyCloseAll.mutate();
                                        setIsConfirming(false);
                                    }}
                                    disabled={emergencyCloseAll.isPending}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all animate-pulse"
                                >
                                    {emergencyCloseAll.isPending ? "Executing..." : "YES, CLOSE EVERYTHING"}
                                </button>
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hedge All Card */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-10 flex flex-col items-center text-center hover:border-brand-500/20 transition-all group overflow-hidden relative opacity-50 cursor-not-allowed">
                        <Lock className="h-12 w-12 text-[var(--color-text-muted)] mb-6" />
                        <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Hedge Portfolio</h3>
                        <p className="text-[var(--color-text-secondary)] text-xs mb-8">
                            Opens opposite positions for all current exposure to lock in net P&L
                            without closing existing trades.
                        </p>
                        <button disabled className="w-full py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Available in v2.1
                        </button>
                    </div>
                </div>

                {/* Status List */}
                <div className="mt-16 bg-surface border border-[var(--color-border)] rounded-lg p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap className="h-5 w-5 text-brand-500" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Execution Logs</h4>
                    </div>

                    <div className="space-y-4">
                        {emergencyCloseAll.isSuccess ? (
                            <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-500/80 font-bold">Protocol successful. {positions?.length || 0} trades terminated.</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-[var(--color-text-muted)]" />
                                <span className="text-xs text-[var(--color-text-secondary)] font-bold">Awaiting emergency protocol triggers...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
