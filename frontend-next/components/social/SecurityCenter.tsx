"use client";

import React from "react";
import { ShieldCheck, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SecurityCenterProps {
    status?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export function SecurityCenter({ status = 'unverified' }: SecurityCenterProps) {
    const isVerified = status === 'verified';

    return (
        <div className={cn(
            "rounded-lg p-10 space-y-6 relative overflow-hidden group shadow-2xl transition-all",
            isVerified ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-[#22c55e] text-black"
        )}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck size={120} />
            </div>

            <div className="relative z-10 space-y-4">
                <div className={cn(
                    "inline-flex p-3 rounded-lg",
                    isVerified ? "bg-emerald-500 text-[var(--color-text-primary)]" : "bg-black/10"
                )}>
                    {isVerified ? <ShieldCheck size={32} /> : <AlertCircle size={32} />}
                </div>

                <div className="space-y-1">
                    <h3 className={cn(
                        "text-3xl font-black uppercase tracking-tighter leading-none",
                        isVerified ? "text-emerald-500" : "text-black"
                    )}>
                        Security Center
                    </h3>
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isVerified ? "text-gray-400" : "text-black/60"
                    )}>
                        Institutional Trust Level: <span className={cn(isVerified ? "text-emerald-500" : "text-black")}>{status}</span>
                    </p>
                </div>

                <p className={cn(
                    "font-bold text-sm leading-relaxed",
                    isVerified ? "text-gray-500" : "text-black/70"
                )}>
                    {isVerified
                        ? "Your account is fully verified. You have unrestricted access to all global signal distribution channels and high-limit withdrawals."
                        : "KYC verification is required to link high-impact broadcast channels. Verify your identity to unlock global social distribution."
                    }
                </p>

                {!isVerified && (
                    <Link
                        href="/dashboard/kyc"
                        className="inline-flex items-center justify-center w-full py-4 bg-black text-[var(--color-text-primary)] font-black text-[10px] uppercase tracking-widest rounded-lg hover:opacity-90 transition-all gap-2 group/btn"
                    >
                        Complete KYC Now
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </div>
    );
}
