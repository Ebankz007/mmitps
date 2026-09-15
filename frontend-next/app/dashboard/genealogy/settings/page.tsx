/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Lightbulb,
    CheckCircle2,
    Info,
    ChevronRight,
    Loader2,
    Save
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import api from "@/lib/api";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type PlacementStrategy = 'left' | 'right' | 'weaker_bv' | 'weaker_referrals' | 'holding_tank';

interface LegSettings {
    preferredPlacement: PlacementStrategy;
    stats: {
        leftLegVolume: number;
        rightLegVolume: number;
        leftMembers: number;
        rightMembers: number;
    };
}

export default function BinarySettingsPage() {
    const [settings, setSettings] = useState<LegSettings | null>(null);
    const [selectedPlacement, setSelectedPlacement] = useState<PlacementStrategy>('left');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await api.get("/api/v1/mlm/leg-settings");
            setSettings(res.data.data);
            setSelectedPlacement(res.data.data.preferredPlacement);
        } catch (err) {
            console.error("Failed to fetch leg settings", err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post("/api/v1/mlm/leg-settings", { preferredPlacement: selectedPlacement });
            toast.success("Binary placement settings updated successfully");
            fetchSettings();
        } catch (err) {
            console.error("Failed to update settings", err);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const nextPlacement = () => {
        if (!settings) return "Loading...";
        const { stats } = settings;

        switch (selectedPlacement) {
            case 'left': return "Left Leg (Manual)";
            case 'right': return "Right Leg (Manual)";
            case 'weaker_bv':
                return stats.leftLegVolume <= stats.rightLegVolume ? "Left Leg (weaker by BV)" : "Right Leg (weaker by BV)";
            case 'weaker_referrals':
                return stats.leftMembers <= stats.rightMembers ? "Left Leg (lesser referrals)" : "Right Leg (lesser referrals)";
            case 'holding_tank': return "Holding Tank (Manual placement required)";
            default: return "Left Leg";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Syncing Matrix Configurations...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#020617] min-h-screen p-8 text-[var(--color-text-primary)] font-sans max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10">
                <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#38BDF8] cursor-pointer hover:underline">Dashboard</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Binary Leg Settings</span>
                </nav>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] uppercase italic">
                    Binary <span className="text-[#10b981]">Leg Settings</span>
                </h1>
            </div>

            {/* Main Selection Card */}
            <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 blur-[100px] pointer-events-none"></div>

                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Settings className="h-3 w-3" /> Current Leg Strategy
                </h2>

                <div className="space-y-4 max-w-4xl">
                    <PlacementOption
                        id="weaker_bv"
                        label="Based on Points (BV)"
                        description="Referrals Will Be Placed In Your Weaker Leg Team"
                        current={selectedPlacement}
                        onSelect={setSelectedPlacement}
                    />
                    <PlacementOption
                        id="weaker_referrals"
                        label="Based On Referrals"
                        description="Referrals Will Be In Your Team With Lesser Number Of Your Referrals"
                        current={selectedPlacement}
                        onSelect={setSelectedPlacement}
                    />
                    <PlacementOption
                        id="left"
                        label="Left"
                        description="Referrals Will Be Placed In Your Left Team"
                        current={selectedPlacement}
                        onSelect={setSelectedPlacement}
                    />
                    <PlacementOption
                        id="right"
                        label="Right"
                        description="Referrals Will Be Placed In Your Right Team"
                        current={selectedPlacement}
                        onSelect={setSelectedPlacement}
                    />
                    <PlacementOption
                        id="holding_tank"
                        label="Holding Tank"
                        description="Referrals Will Go To Holding Tank For Manual Placement"
                        current={selectedPlacement}
                        onSelect={setSelectedPlacement}
                    />
                </div>

                <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#059669] hover:bg-brand-500 text-[var(--color-text-primary)] font-black text-xs uppercase tracking-widest px-10 py-4 rounded-lg transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-3"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Settings
                    </button>
                </div>
            </div>

            {/* Understanding Section */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] border border-brand-500/10 rounded-lg p-8 mb-8 relative group">
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>

                <div className="flex gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                        <Lightbulb className="h-6 w-6 text-brand-400" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight underline decoration-[#10b981] underline-offset-8 decoration-2">Understanding Binary Leg Settings</h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-4xl">
                            Your binary leg setting determines where new referrals are automatically placed in your network structure. Choose wisely based on your team building strategy:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                            <li className="flex items-start gap-3 text-[11px]">
                                <span className="text-[#10b981] font-black">•</span>
                                <span className="text-gray-400"><strong className="text-gray-200">Based on Points (BV)</strong> - Balances your legs by volume, maximizing commission potential</span>
                            </li>
                            <li className="flex items-start gap-3 text-[11px]">
                                <span className="text-[#10b981] font-black">•</span>
                                <span className="text-gray-400"><strong className="text-gray-200">Based on Referrals</strong> - Balances your legs by member count</span>
                            </li>
                            <li className="flex items-start gap-3 text-[11px]">
                                <span className="text-[#10b981] font-black">•</span>
                                <span className="text-gray-400"><strong className="text-gray-200">Left/Right</strong> - Direct placement to a specific leg for manual control</span>
                            </li>
                            <li className="flex items-start gap-3 text-[11px]">
                                <span className="text-[#10b981] font-black">•</span>
                                <span className="text-gray-400"><strong className="text-gray-200">Holding Tank</strong> - Queue referrals for later strategic placement</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Network Summary */}
            <div className="bg-[#0B1224] border border-[var(--color-border)] rounded-lg p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Current Network Summary</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Left Leg BV" value={settings?.stats.leftLegVolume || 0} suffix="BV" color="blue" />
                    <StatCard label="Right Leg BV" value={settings?.stats.rightLegVolume || 0} suffix="BV" color="purple" />
                    <StatCard label="Left Members" value={settings?.stats.leftMembers || 0} suffix="" color="emerald" />
                    <StatCard label="Right Members" value={settings?.stats.rightMembers || 0} suffix="" color="orange" />
                </div>

                {/* Status Indicator */}
                <div className="bg-[#020617]/50 border border-emerald-500/10 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        Based on current settings, next referral will be placed in your <span className="text-emerald-400 font-black">{nextPlacement()}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

function PlacementOption({ id, label, description, current, onSelect }: { id: PlacementStrategy, label: string, description: string, current: string, onSelect: (v: PlacementStrategy) => void }) {
    const isSelected = current === id;

    return (
        <div
            onClick={() => onSelect(id)}
            className={cn(
                "group flex items-center gap-6 p-5 rounded-lg border transition-all cursor-pointer relative overflow-hidden",
                isSelected ? "bg-brand-600/10 border-brand-500/30 ring-1 ring-brand-500/20" : "bg-[#020617]/40 border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
            )}
        >
            <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                isSelected ? "border-[#059669]" : "border-gray-700 group-hover:border-gray-500"
            )}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#059669] shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
            </div>

            <div className="flex flex-col gap-0.5">
                <span className={cn(
                    "text-[13px] font-black uppercase tracking-tight transition-colors",
                    isSelected ? "text-[var(--color-text-primary)]" : "text-gray-400 group-hover:text-gray-200"
                )}>
                    {label}
                </span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter italic">
                    {description}
                </span>
            </div>

            {isSelected && (
                <div className="absolute right-6 opacity-20">
                    <CheckCircle2 className="h-12 w-12 text-brand-500" />
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, suffix, color }: { label: string, value: number, suffix: string, color: 'blue' | 'purple' | 'emerald' | 'orange' }) {
    const colorMap = {
        blue: "text-brand-400",
        purple: "text-brand-400",
        emerald: "text-emerald-400",
        orange: "text-brand-400"
    };

    return (
        <div className="bg-[#020617] border border-[var(--color-border)] p-6 rounded-lg space-y-2 relative overflow-hidden group">
            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10 pointer-events-none transition-all group-hover:opacity-20", `bg-${color}-500`)}></div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black italic tracking-tighter", colorMap[color])}>
                    {value.toLocaleString()}
                </span>
                {suffix && <span className="text-[10px] font-bold text-gray-700 uppercase italic">{suffix}</span>}
            </div>
        </div>
    );
}
