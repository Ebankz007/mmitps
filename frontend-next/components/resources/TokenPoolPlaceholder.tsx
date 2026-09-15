"use client";

import React from "react";
import {
    Coins,
    ShieldCheck,
    PieChart,
    ArrowUpRight
} from "lucide-react";

export function TokenPoolPlaceholder({ module }: { module: string }) {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-12 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16, 185, 129,0.05),transparent_60%)]" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
                        <Coins className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tokenization Pool</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
                        Pool <span className="text-amber-500 italic">{module}</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
                        Fractionalized asset management and {module.toLowerCase()} for the MMITPS ecosystem. Fully transparent, fully auditable.
                    </p>
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div className="p-8 bg-black/40 border border-[var(--color-border)] rounded-lg text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pools Active</p>
                        <p className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">14</p>
                    </div>
                    <div className="p-8 bg-black/40 border border-[var(--color-border)] rounded-lg text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total TVL</p>
                        <p className="text-3xl font-black text-amber-500 uppercase tracking-tighter">$2.4M</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { label: "Asset Distribution", icon: PieChart, value: "Optimal" },
                    { label: "Security Audit", icon: ShieldCheck, value: "Verified" },
                ].map((s) => (
                    <div key={s.label} className="p-10 bg-surface border border-[var(--color-border)] rounded-[3.1rem] hover:border-amber-500/20 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-8">
                            <div className="p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group-hover:bg-amber-500 group-hover:text-black transition-all">
                                <s.icon size={28} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">{s.label}</h4>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.value}</span>
                            </div>
                        </div>
                        <button className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all">
                            <ArrowUpRight size={20} className="text-gray-300" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
