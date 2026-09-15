"use client";

import React, { useState } from "react";
import { Activity, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { socialService, BroadcastGuardPreferences } from "@/lib/api/social";

interface BroadcastGuardProps {
    initialPreferences?: BroadcastGuardPreferences;
}

export function BroadcastGuard({ initialPreferences }: BroadcastGuardProps) {
    const [prefs, setPrefs] = useState<BroadcastGuardPreferences>(initialPreferences || {
        autoPostPTDSignals: true,
        autoPostLogicAlerts: false,
        milestoneAlerts: true,
        enforceForensicMarking: true
    });
    const [saving, setSaving] = useState(false);

    const toggle = async (key: keyof BroadcastGuardPreferences) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);

        try {
            setSaving(true);
            await socialService.updatePreferences(newPrefs);
        } catch (error) {
            console.error("Failed to update broadcast guard preferences:", error);
            // Revert on error
            setPrefs(prefs);
        } finally {
            setSaving(false);
        }
    };

    const items = [
        { key: 'autoPostPTDSignals' as const, label: "Auto-Post PTD Signals", status: prefs.autoPostPTDSignals },
        { key: 'autoPostLogicAlerts' as const, label: "Auto-Post Logic Alerts", status: prefs.autoPostLogicAlerts },
        { key: 'milestoneAlerts' as const, label: "Community Milestone Alerts", status: prefs.milestoneAlerts },
        { key: 'enforceForensicMarking' as const, label: "Enforce Forensic Marking", status: prefs.enforceForensicMarking }
    ];

    return (
        <div className="bg-surface border border-[var(--color-border)] rounded-lg p-10 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Activity className="text-[#22c55e]" size={24} />
                    <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-[var(--color-text-primary)]">Broadcast Guard</h3>
                </div>
                {saving && <RefreshCcw className="h-4 w-4 text-gray-600 animate-spin" />}
            </div>

            <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Control which signals are automatically pushed to your public channels.
            </p>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center justify-between p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border)] transition-all cursor-pointer"
                        onClick={() => toggle(item.key)}
                    >
                        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{item.label}</span>
                        <div className={cn(
                            "w-10 h-5 rounded-full relative transition-all duration-300",
                            item.status ? "bg-[#22c55e]" : "bg-[var(--color-surface-3)]"
                        )}>
                            <div className={cn(
                                "absolute top-1 w-3 h-3 bg-surface rounded-full transition-all duration-300 shadow-sm",
                                item.status ? "left-6" : "left-1"
                            )} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
