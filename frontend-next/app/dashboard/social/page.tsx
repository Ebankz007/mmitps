"use client";

import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { RegionalSection } from "@/components/social/RegionalSection";
import { BroadcastGuard } from "@/components/social/BroadcastGuard";
import { SecurityCenter } from "@/components/social/SecurityCenter";
import { socialService, SocialHandle } from "@/lib/api/social";
import { useAuth } from "@/lib/auth-context";

export default function SocialPage() {
    const { user } = useAuth();
    const [groupedHandles, setGroupedHandles] = useState<Record<string, SocialHandle[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSocialData = async () => {
            try {
                const data = await socialService.getHandles();
                setGroupedHandles(data);
            } catch (error) {
                console.error("Failed to fetch social handles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSocialData();
    }, []);

    const categories = ["Global", "Asian", "European", "Middle East", "African"];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-2 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Synchronizing Social Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto space-y-12 pb-20 px-4 sm:px-6 lg:px-8 text-[var(--color-text-primary)]">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full">
                    <Share2 className="h-3.5 w-3.5 text-[#22c55e]" />
                    <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest">Global Presence</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Our Social <span className="text-[#22c55e]">Handles</span></h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Stay connected with MMITPS across all platforms.</p>
            </div>

            {/* Regional Sections */}
            <div className="space-y-16">
                {categories.map((cat) => (
                    <RegionalSection key={cat} title={cat} handles={groupedHandles[cat] || []} />
                ))}
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <BroadcastGuard initialPreferences={user?.preferences?.broadcastGuard as any} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <SecurityCenter status={(user?.kycStatus as any) || 'unverified'} />
            </div>

            {/* Statistics Banner */}
            <div className="bg-surface border border-[var(--color-border)] rounded-lg p-10 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#22c55e]/20 to-transparent" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
                    {[
                        { label: "Facebook Followers", value: "50K+", color: "#1877F2" },
                        { label: "YouTube Subscribers", value: "35K+", color: "#FF0000" },
                        { label: "Instagram Followers", value: "28K+", color: "#E4405F" },
                        { label: "Discord Members", value: "15K+", color: "#5865F2" },
                        { label: "Telegram Members", value: "22K+", color: "#26A5E4" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <h4 className="text-3xl font-black text-[var(--color-text-primary)] group-hover:scale-110 transition-transform" style={{ color: stat.color }}>{stat.value}</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-tighter">Join Our Growing Community</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Connect with modern investment and stay updated with the latest market insights.</p>
                </div>
            </div>
        </div>
    );
}
