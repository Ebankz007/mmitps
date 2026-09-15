"use client";

import React, { useEffect, useState } from "react";
import { Save, Radio, Globe, Activity } from "lucide-react";
import { socialService, SocialHandle, GlobalBroadcastSettings } from "@/lib/api/social";
import { cn } from "@/lib/utils";

const AVAILABLE_SIGNALS = ["Forex Signals", "Crypto Signals", "Stocks Signals", "Commodities Signals"];
const AVAILABLE_CONTENT = ["Market Analysis", "Daily Overviews", "Weekly Recaps", "Trade Setups", "Platform Updates"];
const AVAILABLE_LANGUAGES = ["English", "Spanish", "French", "Arabic", "Chinese", "Japanese", "Russian"];

export default function AdminBroadcastGuardPage() {
    const [handles, setHandles] = useState<SocialHandle[]>([]);
    const [settings, setSettings] = useState<GlobalBroadcastSettings>({
        selectedSignals: [],
        selectedContent: [],
        destinations: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [handlesData, settingsData] = await Promise.all([
                socialService.getAllHandles(),
                socialService.getGlobalBroadcastSettings()
            ]);
            setHandles(handlesData.filter(h => h.isActive));
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to fetch broadcast data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await socialService.updateGlobalBroadcastSettings(settings);
            alert("Broadcast Guard settings updated successfully!");
        } catch (error) {
            console.error("Failed to save broadcast settings:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSignal = (signal: string) => {
        setSettings(prev => ({
            ...prev,
            selectedSignals: prev.selectedSignals.includes(signal)
                ? prev.selectedSignals.filter(s => s !== signal)
                : [...prev.selectedSignals, signal]
        }));
    };

    const toggleContent = (content: string) => {
        setSettings(prev => ({
            ...prev,
            selectedContent: prev.selectedContent.includes(content)
                ? prev.selectedContent.filter(c => c !== content)
                : [...prev.selectedContent, content]
        }));
    };

    const handleDestinationChange = (handleId: string, platform: string, isChecked: boolean) => {
        setSettings(prev => {
            if (isChecked) {
                // Add with default language English
                return {
                    ...prev,
                    destinations: [...prev.destinations, { socialHandleId: handleId, platform, language: "English" }]
                };
            } else {
                // Remove
                return {
                    ...prev,
                    destinations: prev.destinations.filter(d => d.socialHandleId !== handleId)
                };
            }
        });
    };

    const handleDestinationLanguage = (handleId: string, language: string) => {
        setSettings(prev => ({
            ...prev,
            destinations: prev.destinations.map(d =>
                d.socialHandleId === handleId ? { ...d, language } : d
            )
        }));
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)] max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Radio size={16} className="text-[#22c55e]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e]">Global Routing</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Broadcast <span className="text-[#22c55e]">Guard</span></h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Configure automated signal and content distribution rules.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-[#22c55e] text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#1eb054] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <Save size={14} strokeWidth={3} />
                        {saving ? "Deploying..." : "Deploy Routing Rules"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Triggers */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Signals Component */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-lg">
                                <Activity size={18} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Active Signals</h2>
                        </div>
                        <div className="space-y-3">
                            {AVAILABLE_SIGNALS.map(signal => {
                                const isActive = settings.selectedSignals.includes(signal);
                                return (
                                    <div
                                        key={signal}
                                        onClick={() => toggleSignal(signal)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all duration-300",
                                            isActive
                                                ? "bg-[#22c55e]/5 border-[#22c55e]/30"
                                                : "bg-white/[0.02] border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-widest",
                                            isActive ? "text-[#22c55e]" : "text-gray-400"
                                        )}>
                                            {signal}
                                        </span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all duration-300",
                                            isActive ? "bg-[#22c55e]" : "bg-[var(--color-surface-3)]"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-surface rounded-full transition-all duration-300",
                                                isActive ? "left-6" : "left-1"
                                            )} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Component */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                                <Globe size={18} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Content Types</h2>
                        </div>
                        <div className="space-y-3">
                            {AVAILABLE_CONTENT.map(content => {
                                const isActive = settings.selectedContent.includes(content);
                                return (
                                    <div
                                        key={content}
                                        onClick={() => toggleContent(content)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all duration-300",
                                            isActive
                                                ? "bg-brand-500/5 border-brand-500/30"
                                                : "bg-white/[0.02] border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-widest",
                                            isActive ? "text-brand-500" : "text-gray-400"
                                        )}>
                                            {content}
                                        </span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all duration-300",
                                            isActive ? "bg-brand-500" : "bg-[var(--color-surface-3)]"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-surface rounded-full transition-all duration-300",
                                                isActive ? "left-6" : "left-1"
                                            )} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Destinations */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6 shadow-2xl">
                        <div className="mb-6 pb-6 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest">Target Destinations</h2>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                        Select where the active signals and content should be broadcasted, and in what language.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {handles.length === 0 ? (
                                <p className="text-xs text-gray-500 py-8 text-center uppercase tracking-widest font-bold">
                                    No active social channels found. Please register them in the Social Resources tab.
                                </p>
                            ) : (
                                handles.map(handle => {
                                    const destConfig = settings.destinations.find(d => d.socialHandleId === handle._id);
                                    const isSelected = !!destConfig;

                                    return (
                                        <div
                                            key={handle._id}
                                            className={cn(
                                                "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all duration-300 gap-4",
                                                isSelected
                                                    ? "bg-[var(--color-surface-2)] border-[var(--color-border-hover)]"
                                                    : "bg-white/[0.01] border-[var(--color-border)] hover:bg-white/[0.03]"
                                            )}
                                        >
                                            {/* Channel Info */}
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--color-text-primary)] cursor-pointer"
                                                    style={{ backgroundColor: handle.color }}
                                                    onClick={() => handleDestinationChange(handle._id, handle.platform, !isSelected)}
                                                >
                                                    <Radio size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-[var(--color-text-primary)]">{handle.platform}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{handle.category}</span>
                                                        <span className="text-[10px] text-gray-700">•</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">{handle.handle}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center gap-4">
                                                {isSelected && (
                                                    <select
                                                        className="bg-surface-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] outline-none focus:border-brand-500/50"
                                                        value={destConfig.language}
                                                        onChange={(e) => handleDestinationLanguage(handle._id, e.target.value)}
                                                    >
                                                        {AVAILABLE_LANGUAGES.map(lang => (
                                                            <option key={lang} value={lang}>{lang}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <div
                                                    className="flex items-center gap-2 cursor-pointer"
                                                    onClick={() => handleDestinationChange(handle._id, handle.platform, !isSelected)}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-5 rounded-full relative transition-all duration-300",
                                                        isSelected ? "bg-brand-500" : "bg-[var(--color-surface-3)]"
                                                    )}>
                                                        <div className={cn(
                                                            "absolute top-1 w-3 h-3 bg-surface rounded-full transition-all duration-300",
                                                            isSelected ? "left-6" : "left-1"
                                                        )} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
