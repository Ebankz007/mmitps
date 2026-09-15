"use client";

import React from "react";
import TradingViewWidget from "@/components/charts/TradingViewWidget";
import { ArrowUpRight, ArrowDownRight, Activity, LucideIcon } from "lucide-react";

import { useLanguage } from "@/lib/language-context";

interface MarketPair {
    symbol: string;
    name: string;
    price: string;
    change: string;
}

interface MarketPageLayoutProps {
    title: string;
    description: string;
    icon: LucideIcon;
    mainSymbol: string;
    popularPairs: MarketPair[];
    statsLabel: string;
    statsValue: string;
    statsColor: string;
    statsDescription: string;
    actionLabel: string;
    sideContent: React.ReactNode;
}

export function MarketPageLayout({
    title,
    description,
    icon: Icon,
    mainSymbol,
    popularPairs,
    statsLabel,
    statsValue,
    statsColor,
    statsDescription,
    actionLabel,
    sideContent
}: MarketPageLayoutProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                        <Icon className="h-6 w-6 text-[#10b981]" />
                        {title}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">{description}</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#10b981] text-black text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(16, 185, 129,0.3)] transition-all">
                        {actionLabel}
                    </button>
                    <button className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-gray-300 text-xs font-bold rounded-lg hover:bg-[var(--color-surface-3)] transition-all">
                        {t('market_algoanalysis')}
                    </button>
                </div>
            </div>

            {/* Quick Stats Ticker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularPairs.map((pair, i) => (
                    <div key={i} className="p-4 bg-surface border border-[#1A1A1A] rounded-lg hover:border-[#10b981]/20 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{pair.name}</span>
                            {pair.change.startsWith('+') ? (
                                <ArrowUpRight className="h-3 w-3 text-green-400" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-[var(--color-text-primary)] group-hover:text-[#10b981] transition-colors">{pair.price}</span>
                            <span className={`text-[10px] font-bold ${pair.change.startsWith('+') ? 'text-green-400' : 'text-red-500'}`}>
                                {pair.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    <TradingViewWidget symbol={mainSymbol} interval="D" />

                    <div className="p-6 bg-surface border border-[#1A1A1A] rounded-lg">
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#10b981]" />
                            {statsLabel}
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            <div className="text-center md:text-left">
                                <div className={`text-4xl font-black ${statsColor}`}>{statsValue}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">{t('market_platformindex')}</div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                                    {statsDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {sideContent}
                </div>
            </div>
        </div>
    );
}
