"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Search, Settings, Shield, Zap, Globe, Cpu, Coins, TrendingUp } from 'lucide-react';
import MarketGeometryScanner from '@/components/trading/MarketGeometryScanner';

const ASSETS = [
    { id: 'BTC-USD', symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', icon: Coins },
    { id: 'ETH-USD', symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', icon: Zap },
    { id: 'EUR-USD', symbol: 'EURUSD=X', name: 'Euro / Dollar', type: 'forex', icon: Globe },
    { id: 'GBP-USD', symbol: 'GBPUSD=X', name: 'Pound / Dollar', type: 'forex', icon: Shield },
    { id: 'GC-F', symbol: 'GC=F', name: 'Gold', type: 'commodity', icon: TrendingUp },
    { id: 'NQ-F', symbol: 'NQ=F', name: 'Nasdaq 100', type: 'index', icon: Cpu },
];

const TIMEFRAMES = ['15m', '1h', '4h', '1d'];

export default function GeometryScannerPage() {
    const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
    const [selectedTF, setSelectedTF] = useState('1h');


    return (
        <div className="flex flex-col h-screen bg-[#050506]">
            {/* Premium Header */}
            <header className="h-[72px] border-b border-[var(--color-border)] flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center border border-brand-500/20">
                            <Layers className="w-5 h-5 text-brand-500" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black italic uppercase tracking-[0.2em] text-[var(--color-text-primary)]">Market Geometry Pro Max</h1>
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Structural Multi-Asset Intelligence Engine</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Timeframe Selector */}
                    <div className="flex items-center bg-[var(--color-surface-2)] rounded-full p-1 border border-[var(--color-border)]">
                        {TIMEFRAMES.map(tf => (
                            <button
                                key={tf}
                                onClick={() => setSelectedTF(tf)}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${selectedTF === tf ? 'bg-brand-500 text-black shadow-lg shadow-brand-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-[1px] bg-[var(--color-surface-3)]" />

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all">
                            <Settings className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </button>
                        <button className="px-6 h-10 bg-surface rounded-full text-[10px] font-black italic uppercase tracking-widest text-black hover:bg-brand-500 transition-colors">
                            Save Workspace
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Asset Sidebar */}
                <aside className="w-[320px] border-r border-[var(--color-border)] flex flex-col p-6 gap-8 overflow-y-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="FIND INSTRUMENT..."
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] placeholder:text-white/10 focus:outline-none focus:border-brand-500/50 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-[var(--color-text-muted)] px-2">Watchlist Geometry</h3>
                        <div className="flex flex-col gap-2">
                            {ASSETS.map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`w-full group rounded-lg p-4 flex items-center justify-between border transition-all ${selectedAsset.id === asset.id
                                        ? 'bg-brand-500/5 border-brand-500/20'
                                        : 'bg-transparent border-transparent hover:bg-[var(--color-surface-2)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${selectedAsset.id === asset.id ? 'bg-brand-500 border-brand-500' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] group-hover:bg-[var(--color-surface-3)]'
                                            }`}>
                                            <asset.icon className={`w-5 h-5 ${selectedAsset.id === asset.id ? 'text-black' : 'text-[var(--color-text-secondary)]'}`} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[11px] font-black italic uppercase text-[var(--color-text-primary)] tracking-widest">{asset.name}</span>
                                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">{asset.type}</span>
                                        </div>
                                    </div>
                                    {selectedAsset.id === asset.id && (
                                        <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto bg-brand-500/5 border border-brand-500/10 rounded-lg p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-brand-500" />
                            <span className="text-[10px] font-black italic uppercase text-[var(--color-text-primary)] tracking-widest">Neural Scanner</span>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--color-text-secondary)] leading-relaxed uppercase">
                            Currently scanning 42 instruments. Confluence probability engine is active.
                        </p>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-hidden">
                    <MarketGeometryScanner
                        symbol={selectedAsset.symbol}
                        timeframe={selectedTF}
                    />
                </main>
            </div>
        </div>
    );
}
