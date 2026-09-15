"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { ChevronDown, ChevronRight, Save, Trash2, Tag, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuConfig {
    label: string;
    price: number;
    currency: string;
    description: string;
    isActive: boolean;
}

const INITIAL_NAV_LABELS = [
    "Dashboard", "Social Handles", "Financial", "My Wallet", "Deposit Wallet", "Fund Transfer", "Request Payout", "Purchase", "My Coupons",
    "Genealogy", "Binary", "Sponsor", "Tree", "List", "Rank Dashboard", "Leg Settings",
    "Markets", "Forex", "Commodities", "Indices", "Crypto", "Stocks", "Bonds", "Synthetics", "Real Estate",
    "News Calendar", "Forex Calendar", "Metals Calendar", "Energy Calendar", "Crypto Calendar", "Coin Market Caps",
    "Education", "Education Hub", "Courses", "Learning Tracks", "Speed Run", "Video Library", "PDF Library",
    "Resources", "Global Macro", "Fundamental Strength", "News Trading", "Currency Outlook", "Trigger Sheet",
    "COT Data", "EDUCATIONAL GUIDE", "COT Intelligence Pro Max", "COT Global Data", "COT Simplified",
    "Seasonality", "Seasonal Heat Map", "ProView Seasonality", "Seasonal Planner", "Seasonality Pro Max",
    "Contract Specs", "Contract Specs EduHub", "Contract Calendar", "Contract Heat Map", "Contract Planner",
    "Quantitative Methodology", "Quant eduguide", "Calculators", "Tools", "Strategies",
    "Geometry Intelligence", "Formation Scanner", "Geometry Pro Max",
    "MMITPS-VMID PRO", "VOLUMETRIC DASHBOARD", "CORRELATION MATRIX",
    "MMITPS-PTD PRO", "PREDICTIVE DASHBOARD",
    "Sentimental Methodology", "Retail Sentiment", "Institutions Sentiment",
    "AI Agent Analyst", "Trade Journal", "TradeControl Panel", "Active Positions", "Order Control", "Algo & Scanner", "Emergency Controls", "Analytics & AI", "Copy Trading", "Live Stream", "Tokenization Pool", "All Pools", "My Portfolio", "Analytics", "Insurance", "VPS Station",
    "Blogs", "Events", "Help Hub", "Help Center", "Support Tickets", "Portfolio", "KYC Verification", "Profile", "My Profile", "Admin Setting"
];

export default function MenuManagementPage() {
    const [configs, setConfigs] = useState<Record<string, MenuConfig>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/admin/menu-config");
            const data = res.data.data || [];
            const configMap: Record<string, MenuConfig> = {};
            data.forEach((c: any) => {
                configMap[c.label] = c;
            });
            setConfigs(configMap);
        } catch (err) {
            console.error("Failed to fetch menu configs", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

    const handleUpdate = async (label: string) => {
        setSaving(label);
        try {
            const config = configs[label] || { label, price: 0, currency: "USD", description: "", isActive: true };
            await api.put(`/api/v1/admin/menu-config/${encodeURIComponent(label)}`, config);
            // Show success (could add an alert here)
        } catch (err) {
            console.error("Failed to save menu config", err);
        } finally {
            setSaving(null);
        }
    };

    const handleChange = (label: string, field: keyof MenuConfig, value: any) => {
        setConfigs(prev => ({
            ...prev,
            [label]: {
                ...(prev[label] || { label, price: 0, currency: "USD", description: "", isActive: true }),
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Menu & Feature Pricing</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Set individual prices and descriptions for every system feature.
                </p>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-[var(--color-surface-2)] border-b border-gray-200 dark:border-[var(--color-border)] text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4 text-left">Feature Label</th>
                            <th className="px-6 py-4 text-left">Price (USD)</th>
                            <th className="px-6 py-4 text-left">Description</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-[var(--color-border)]">
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-[var(--color-surface-2)] rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-200 dark:bg-[var(--color-surface-2)] rounded" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 dark:bg-[var(--color-surface-2)] rounded" /></td>
                                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 dark:bg-[var(--color-surface-2)] rounded ml-auto" /></td>
                                </tr>
                            ))
                        ) : (
                            INITIAL_NAV_LABELS.map(label => {
                                const config = configs[label] || { label, price: 0, currency: "USD", description: "", isActive: true };
                                return (
                                    <tr key={label} className="hover:bg-gray-50 dark:hover:bg-[var(--color-surface-2)] transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {label}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">$</span>
                                                <input 
                                                    type="number" 
                                                    value={config.price} 
                                                    onChange={e => handleChange(label, "price", Number(e.target.value))}
                                                    className="w-24 px-2 py-1 bg-surface dark:bg-black/20 border border-gray-200 dark:border-[var(--color-border)] rounded focus:ring-1 focus:ring-brand-500 outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                placeholder="Short description..."
                                                value={config.description} 
                                                onChange={e => handleChange(label, "description", e.target.value)}
                                                className="w-full px-2 py-1 bg-surface dark:bg-black/20 border border-gray-200 dark:border-[var(--color-border)] rounded focus:ring-1 focus:ring-brand-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleUpdate(label)}
                                                disabled={saving === label}
                                                className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded font-semibold text-xs transition-all",
                                                    saving === label 
                                                        ? "bg-gray-400 cursor-not-allowed" 
                                                        : "bg-brand-500 text-black hover:bg-brand-600 shadow-lg shadow-brand-500/20"
                                                )}
                                            >
                                                {saving === label ? "Saving..." : <><Save className="h-3.5 w-3.5" /> Save</>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
