/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Shield as ShieldIcon, Target, Search, Filter, ArrowUpRight, Activity, Copy, Clock, DollarSign, PieChart, Info, ChevronRight, Settings } from 'lucide-react';
import BrokerAccountModal from "@/components/modals/BrokerAccountModal";
import { toast } from 'sonner';
import SubscriptionModal from '@/components/trading/SubscriptionModal';
import MyCopiedTrades from '@/components/trading/MyCopiedTrades';
import MasterRegistrationModal from '@/components/modals/MasterRegistrationModal';
import ProviderFollowers from '@/components/trading/ProviderFollowers';
import { CopyTradingAPI } from '@/lib/api/copy-trading';

export default function CopyTradingDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'discover' | 'portfolio' | 'followers'>('discover');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<any>(null);
    const [mastersList, setMastersList] = useState<any[]>([]);
    const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

    // Mock Data for UI building (will be replaced with API calls)
    const MOCK_MASTERS = [
        { id: '1', name: 'Alpha Sentinel', strategy: 'Forex Momentum', winRate: 78.5, aum: 1250000, riskScore: 4, roi: 12.4, followers: 842 },
        { id: '2', name: 'Crypto Whale', strategy: 'BTC/ETH Scalping', winRate: 65.2, aum: 4500000, riskScore: 8, roi: 45.2, followers: 2310 },
        { id: '3', name: 'Macro Theta', strategy: 'Indices Flow', winRate: 82.1, aum: 890000, riskScore: 3, roi: 8.9, followers: 415 },
        { id: '4', name: 'Gold Standard', strategy: 'Precious Metals', winRate: 71.4, aum: 2100000, riskScore: 5, roi: 18.7, followers: 1102 },
    ];

    useEffect(() => {
        if (activeTab === 'discover') {
            loadLeaderboard();
        }
    }, [activeTab]);

    const loadLeaderboard = async () => {
        setIsLoading(true);
        try {
            const res = await CopyTradingAPI.getLeaderboard();
            if (res.success && res.data && res.data.length > 0) {
                setMastersList(res.data);
            } else {
                setMastersList(MOCK_MASTERS); // Fallback for empty dev db
            }
        } catch (error) {
            console.error('Failed to load leaderboard', error);
            setMastersList(MOCK_MASTERS); // Fallback
        } finally {
            setIsLoading(false);
        }
    };

    const MOCK_PORTFOLIO = {
        totalAllocated: 15400,
        unrealizedPnL: 845.20,
        activeCopied: 2,
    };

    return (
        <div className="flex flex-col h-screen bg-[#050506] overflow-y-auto">
            <BrokerAccountModal 
                isOpen={isBrokerModalOpen} 
                onClose={() => setIsBrokerModalOpen(false)} 
            />
            
            {/* Premium Header */}
            <div className="flex flex-col gap-6 p-10 pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-500/10 rounded-lg flex items-center justify-center border border-brand-500/20">
                            <Copy className="w-6 h-6 text-brand-500" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Copy Trading</h1>
                            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">Automated Intelligence Network</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsBrokerModalOpen(true)}
                            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-2"
                        >
                            <Settings size={14} /> Connect Broker
                        </button>
                        <button 
                            onClick={() => setIsProviderModalOpen(true)}
                            className="bg-brand-500 text-black px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
                        >
                            Become Provider
                        </button>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="w-16 h-16 text-brand-500" />
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Total Allocated</span>
                            <div className="text-3xl font-black italic text-[var(--color-text-primary)] tracking-tighter">${MOCK_PORTFOLIO.totalAllocated.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="bg-brand-500/5 border border-brand-500/20 rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-16 h-16 text-brand-500" />
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-xs font-bold text-brand-500/60 uppercase tracking-widest">Unrealized PnL</span>
                            <div className="text-3xl font-black italic text-brand-500 tracking-tighter">+${MOCK_PORTFOLIO.unrealizedPnL.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-16 h-16 text-[var(--color-text-primary)]" />
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Active Masters</span>
                            <div className="text-3xl font-black italic text-[var(--color-text-primary)] tracking-tighter">{MOCK_PORTFOLIO.activeCopied}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] mt-6">
                    {(['discover', 'portfolio', 'followers'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-6 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-brand-500' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            {tab === 'discover' ? 'Discover Traders' : tab === 'portfolio' ? 'My Portfolio' : 'Manage Followers'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-10 pt-6 flex flex-col gap-6">
                {activeTab === 'discover' ? (
                    <div className="flex flex-col gap-6">
                        {/* Filters */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH TRADERS..."
                                        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 pl-12 pr-6 text-xs font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 w-[300px] transition-all"
                                    />
                                </div>
                                <button className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-4 py-3 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors">
                                    <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Filters</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Sort by:</span>
                                <select className="bg-transparent border-none text-brand-500 text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer">
                                    <option>Highest ROI</option>
                                    <option>Highest Win Rate</option>
                                    <option>Most Followers</option>
                                    <option>Lowest Risk</option>
                                </select>
                            </div>
                        </div>

                        {/* Leaderboard Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {isLoading ? (
                                <div className="col-span-1 xl:col-span-2 flex flex-col items-center justify-center p-12 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                    <Activity className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Loading Leaderboard Data...</span>
                                </div>
                            ) : (
                                mastersList.map((master) => (
                                    <div key={master.id || master._id} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-6 flex flex-col gap-6 hover:border-brand-500/30 hover:bg-white/[0.07] transition-all group">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500/20 to-transparent border border-brand-500/30 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-brand-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">{master.name || master.traderName || 'Unknown Trader'}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Target className="w-3 h-3 text-brand-500" />
                                                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{master.strategy || 'Aggressive Flow'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedMaster({
                                                        id: master.id || master._id,
                                                        name: master.name || master.traderName,
                                                        strategy: master.strategy || 'Aggressive Flow',
                                                        riskScore: master.riskScore || 5
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 bg-brand-500 text-black px-6 py-2 rounded-full text-xs font-black italic uppercase tracking-widest hover:bg-surface transition-colors"
                                            >
                                                <span>Copy</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="w-full h-[1px] bg-[var(--color-surface-2)]" />

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> ROI (30d)
                                                </span>
                                                <span className={`text-lg font-black ${(master.roi || master.monthlyReturn || 0) >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                                                    {(master.roi || master.monthlyReturn || 0) >= 0 ? '+' : ''}{(master.roi || master.monthlyReturn || 0)}%
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                                    <PieChart className="w-3 h-3" /> Win Rate
                                                </span>
                                                <span className="text-lg font-black text-[var(--color-text-primary)]">{master.winRate || 0}%</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                                    <ShieldIcon className="w-3 h-3" /> Risk Score
                                                </span>
                                                <span className={`text-lg font-black ${(master.riskScore || 5) > 6 ? 'text-red-500' : (master.riskScore || 5) > 3 ? 'text-yellow-500' : 'text-brand-500'}`}>
                                                    {(master.riskScore || 5)}/10
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> Copiers
                                                </span>
                                                <span className="text-lg font-black text-[var(--color-text-primary)]">{master.followers || master.totalFollowers || 0}</span>
                                            </div>
                                        </div>

                                        {/* Footer / AUM */}
                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Total Assets Under Management:</span>
                                                <span className="text-xs font-black text-[var(--color-text-primary)]">${(master.aum || master.totalAUM || 0).toLocaleString()}</span>
                                            </div>
                                            <button className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase hover:text-brand-500 flex items-center gap-1 transition-colors">
                                                View Profile <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : activeTab === 'portfolio' ? (
                    <MyCopiedTrades />
                ) : (
                    <ProviderFollowers />
                )}
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                masterTrader={selectedMaster}
            />

            <MasterRegistrationModal 
                isOpen={isProviderModalOpen}
                onClose={() => setIsProviderModalOpen(false)}
            />
        </div>
    );
}
