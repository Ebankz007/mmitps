"use client";

import React from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { SocialHandle } from "@/lib/api/social";

interface SocialHandleCardProps {
    handle: SocialHandle;
}

export function SocialHandleCard({ handle }: SocialHandleCardProps) {
    const IconComponent = (LucideIcons[handle.icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon) || LucideIcons.ExternalLink;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl transition-all hover:border-[var(--color-border)]"
        >
            {/* Top Branding Bar */}
            <div
                className="h-20 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: handle.color }}
            >
                {/* Decorative Pattern / Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <IconComponent className="h-10 w-10 text-[var(--color-text-primary)] relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <div className="p-6 text-center space-y-3">
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">{handle.platform}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{handle.handle}</p>
                </div>

                <a
                    href={handle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-[10px] font-black uppercase tracking-widest text-[#22c55e] transition-all group-hover:bg-[#22c55e] group-hover:text-black group-hover:border-[#22c55e]"
                >
                    {handle.platform.toLowerCase().includes('youtube') ? 'Subscribe' : handle.platform.toLowerCase().includes('telegram') || handle.platform.toLowerCase().includes('discord') ? 'Join' : 'Follow'}
                </a>
            </div>
        </motion.div>
    );
}
