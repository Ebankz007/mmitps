"use client";

import React from "react";
import { SocialHandleCard } from "./SocialHandleCard";
import { SocialHandle } from "@/lib/api/social";
import { Globe2 } from "lucide-react";

interface RegionalSectionProps {
    title: string;
    handles: SocialHandle[];
}

export function RegionalSection({ title, handles }: RegionalSectionProps) {
    if (!handles || handles.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center gap-2 px-4 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full">
                    <Globe2 className="h-3 w-3 text-[#22c55e]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title} Platforms</span>
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {handles.map((handle) => (
                    <SocialHandleCard key={handle._id} handle={handle} />
                ))}
            </div>
        </div>
    );
}
