/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Globe, ShieldAlert, Check, X, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { clsx } from "clsx";

import api from "@/lib/api";

interface GeoRestrictionModule {
    enabled: boolean;
    blockedCountries?: string[];
    limitedCountries?: Record<string, number>;
}

interface GeoConfigValue {
    tokenization: GeoRestrictionModule;
    copytrading: GeoRestrictionModule;
    crypto: GeoRestrictionModule;
    leverage: GeoRestrictionModule;
    mlm: GeoRestrictionModule;
    global: GeoRestrictionModule;
    [key: string]: GeoRestrictionModule;
}

export default function AdminGeoSettingsPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [config, setConfig] = useState<GeoConfigValue | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newCountry, setNewCountry] = useState("");
    const [selectedModule, setSelectedModule] = useState<string>("global");

    useEffect(() => {
        fetchGeoConfig();
    }, []);

    const fetchGeoConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/admin/settings/geo-restrictions");
            
            if (res.data.success && res.data.data) {
                // The value is stored in data.value (from SystemConfig model)
                let val = res.data.data.value;
                
                // --- ULTRA-DEFENSIVE CHECK ---
                // If val is null, not an object, an array, or the string "[object Object]", it's corrupted
                const isCorrupted = !val || 
                                    typeof val !== 'object' || 
                                    Array.isArray(val) || 
                                    (typeof val === 'string' && val.includes('[object Object]'));

                if (isCorrupted) {
                    console.warn("Detected corrupted or missing geo-config. Resetting to defaults.");
                    val = {
                        tokenization: { enabled: true, blockedCountries: [] },
                        copytrading: { enabled: true, blockedCountries: [] },
                        crypto: { enabled: true, blockedCountries: [] },
                        leverage: { enabled: true, limitedCountries: {} },
                        mlm: { enabled: true, blockedCountries: [] },
                        global: { enabled: true, blockedCountries: [] }
                    };
                }

                // --- ENSURE ALL MODULES EXIST ---
                // Even if val is an object, some keys might be missing if they weren't in the original seed or update
                const modules = ['tokenization', 'copytrading', 'crypto', 'leverage', 'mlm', 'global'];
                modules.forEach(m => {
                    if (!val[m] || typeof val[m] !== 'object') {
                        val[m] = { enabled: true, blockedCountries: [] };
                    }
                    if (!val[m].blockedCountries) {
                        val[m].blockedCountries = [];
                    }
                });

                setConfig(val);
            }
        } catch (error: any) {
            console.error("Failed to fetch geo config:", error);
            const errorMsg = error.response?.data?.error || error.message;
            if (errorMsg) {
                console.error("Error details:", errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        try {
            setIsSaving(true);
            const res = await api.put("/api/v1/admin/settings/geo-restrictions", {
                value: config
            });

            if (res.data.success) {
                alert("Geo-Restrictions saved successfully.");
            } else {
                alert("Failed to save: " + res.data.error);
            }
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.message;
            alert("Error saving configuration: " + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCountry = () => {
        if (!newCountry || newCountry.length !== 2) {
            alert("Please enter a valid 2-letter ISO country code (e.g., US, IR).");
            return;
        }

        const upperCode = newCountry.toUpperCase();
        setConfig(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            const mod = updated[selectedModule];
            if (!mod.blockedCountries) mod.blockedCountries = [];
            
            if (!mod.blockedCountries.includes(upperCode)) {
                mod.blockedCountries = [...mod.blockedCountries, upperCode];
            }
            return updated;
        });
        setNewCountry("");
    };

    const handleRemoveCountry = (moduleName: string, code: string) => {
        setConfig(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            const mod = updated[moduleName];
            if (mod.blockedCountries) {
                mod.blockedCountries = mod.blockedCountries.filter(c => c !== code);
            }
            return updated;
        });
    };

    const toggleModuleStatus = (moduleName: string) => {
        setConfig(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated[moduleName].enabled = !updated[moduleName].enabled;
            return updated;
        });
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-400 animate-pulse">Loading Geo-Restrictions...</div>;
    }

    if (!config) return <div className="text-center py-12 text-red-500">Failed to load configuration.</div>;

    const modules = Object.keys(config);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">Geo-<span className="text-rose-500">Restrictions</span></h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage region-based blocking</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-[var(--color-text-primary)] font-black rounded-lg transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save Configuration"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Modules */}
                <div className="lg:col-span-1 space-y-4">
                    {modules.map((modKey) => {
                        const isSelected = selectedModule === modKey;
                        const modVal = config[modKey];
                        return (
                            <div 
                                key={modKey}
                                onClick={() => setSelectedModule(modKey)}
                                className={clsx(
                                    "p-5 rounded-lg border cursor-pointer transition-all",
                                    isSelected ? "bg-[var(--color-surface-3)] border-rose-500/50" : "bg-black hover:bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-[var(--color-text-primary)] capitalize flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-400" />
                                        {modKey} Restrictions
                                    </h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleModuleStatus(modKey); }}
                                        className={clsx(
                                            "w-10 h-6 rounded-full relative transition-colors",
                                            modVal.enabled ? "bg-emerald-500" : "bg-gray-700"
                                        )}
                                    >
                                        <span className={clsx(
                                            "absolute top-1 w-4 h-4 rounded-full bg-surface transition-all shadow-sm",
                                            modVal.enabled ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {modVal.blockedCountries?.length || 0} Blocked Countries
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column - Blocked List Management */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl h-full">
                        <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.02]">
                            <h2 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2 capitalize">
                                <ShieldAlert className="h-5 w-5 text-rose-500" />
                                {selectedModule} Region Blocking
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Any user connecting from these IP ranges or with matching KYC countries will be blocked from accessing this module. 
                                <br/><span className="text-emerald-500 font-bold">Note: Admirals and Super Admins bypass this block automatically.</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Add Country */}
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newCountry}
                                    onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                                    placeholder="Enter 2-Letter ISO Code (e.g. US, IR)"
                                    className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-rose-500 transition-colors uppercase font-mono"
                                    maxLength={2}
                                />
                                <button
                                    onClick={handleAddCountry}
                                    className="px-6 bg-rose-500 hover:bg-rose-600 text-[var(--color-text-primary)] font-black rounded-lg transition-all flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Add
                                </button>
                            </div>

                            {/* Blocked List */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Currently Blocked</h4>
                                {(!config[selectedModule]?.blockedCountries || config[selectedModule]?.blockedCountries?.length === 0) ? (
                                    <div className="text-center p-8 bg-[var(--color-surface-2)] rounded-lg border border-dashed border-[var(--color-border)] text-gray-500 text-sm">
                                        No countries are currently restricted for this module.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {config[selectedModule].blockedCountries?.map(code => (
                                            <div key={code} className="flex items-center justify-between px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg font-mono font-bold">
                                                <span>{code}</span>
                                                <button 
                                                    onClick={() => handleRemoveCountry(selectedModule, code)}
                                                    className="hover:bg-rose-500/20 p-1 rounded transition-colors text-rose-400 hover:text-[var(--color-text-primary)]"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
