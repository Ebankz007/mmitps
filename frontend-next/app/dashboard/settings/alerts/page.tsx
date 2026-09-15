"use client";

import React from "react";
import { 
    Bell, 
    Volume2, 
    VolumeX, 
    Smartphone, 
    ShieldCheck, 
    Activity, 
    BarChart3, 
    Target,
    Settings,
    CheckCircle2
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export default function AlertSettingsPage() {
    const { settings, setSettings } = useNotifications();

    const toggleModule = (module: keyof typeof settings.modules) => {
        setSettings(prev => ({
            ...prev,
            modules: {
                ...prev.modules,
                [module]: !prev.modules[module]
            }
        }));
    };

    const requestPushPermission = async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications");
            return;
        }

        if (Notification.permission === "granted") {
            setSettings(prev => ({ ...prev, pushEnabled: !prev.pushEnabled }));
        } else {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setSettings(prev => ({ ...prev, pushEnabled: true }));
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 text-[var(--color-text-primary)]">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 rounded-full border border-brand-500/20">
                    <Settings className="h-4 w-4 text-brand-500" />
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Preferences</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight">
                    Alert <span className="text-brand-500">Settings</span>
                </h1>
                <p className="text-gray-400 font-medium max-w-xl">
                    Configure how you receive signals and system notifications. All signals have uniform visual weight to ensure you never miss institutional order flow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Channel Settings */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Notification Channels</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg transition-all",
                                    settings.soundEnabled ? "bg-brand-500/10 text-brand-500" : "bg-gray-500/10 text-gray-500"
                                )}>
                                    {settings.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight">Sound Alerts</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Play notification audio</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    settings.soundEnabled ? "bg-brand-500" : "bg-[var(--color-surface-3)]"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-surface rounded-full transition-all",
                                    settings.soundEnabled ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-3 rounded-lg transition-all",
                                    settings.pushEnabled ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                                )}>
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight">Browser Push</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Desktop notifications</p>
                                </div>
                            </div>
                            <button 
                                onClick={requestPushPermission}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    settings.pushEnabled ? "bg-green-500" : "bg-[var(--color-surface-3)]"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-surface rounded-full transition-all",
                                    settings.pushEnabled ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Module Settings */}
                <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Signal Sources</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'geometry', label: 'Geometry Intelligence', icon: Activity, color: 'text-brand-500' },
                            { id: 'vmid', label: 'VMID Pro Volumetric', icon: BarChart3, color: 'text-green-500' },
                            { id: 'ptd', label: 'PTD Predictive', icon: Target, color: 'text-brand-500' },
                            { id: 'system', label: 'System Announcements', icon: CheckCircle2, color: 'text-amber-500' },
                            { id: 'security', label: 'Account Security', icon: ShieldCheck, color: 'text-red-500' },
                        ].map(mod => (
                            <div 
                                key={mod.id}
                                onClick={() => toggleModule(mod.id as any)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                                    settings.modules[mod.id as keyof typeof settings.modules] 
                                        ? "bg-[var(--color-surface-2)] border-[var(--color-border)]" 
                                        : "bg-black/40 border-[var(--color-border)] opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <mod.icon size={18} className={mod.color} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{mod.label}</span>
                                </div>
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    settings.modules[mod.id as keyof typeof settings.modules] ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-700"
                                )} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-brand-500/10 to-transparent p-12 rounded-lg border border-brand-500/10 text-center space-y-4">
                <Bell className="w-12 h-12 text-brand-500 mx-auto opacity-50" />
                <h3 className="text-xl font-black uppercase tracking-tight">Notification Confidence</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                    Our notification engine uses low-latency WebSockets to ensure data delivery within 50ms of detection. Desktop push notifications require browser permission and an active dashboard session.
                </p>
            </div>
        </div>
    );
}
