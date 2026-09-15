"use client";

import React from "react";
import { clsx } from "clsx";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    hideText?: boolean;
    hideSubtext?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className,
    size = "md",
    hideText = false,
    hideSubtext = false,
}) => {
    const sizeMap = {
        sm: { scale: 0.6, text: "text-lg", subtext: "text-[8px]" },
        md: { scale: 1.0, text: "text-2xl", subtext: "text-[11px]" },
        lg: { scale: 1.5, text: "text-4xl", subtext: "text-[16px]" },
        xl: { scale: 2.0, text: "text-6xl", subtext: "text-[24px]" },
    };

    const currentSize = sizeMap[size];

    return (
        <div className={clsx("flex items-center gap-4 select-none", className)}>
            {/* ── Institutional Icon ────────────────────────────────────────── */}
            <div
                className="relative flex-shrink-0"
                style={{ width: 48 * currentSize.scale, height: 48 * currentSize.scale }}
            >
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                    {/* Trendline (Green) */}
                    <path
                        d="M5 85L30 80L45 88L95 65"
                        stroke="#10b981"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Candles (2 Red, 1 Green) */}
                    {/* Candle 1 (Red) */}
                    <rect x="18" y="35" width="10" height="40" fill="#f43f5e" rx="1" />
                    <line x1="23" y1="20" x2="23" y2="80" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

                    {/* Candle 2 (Red) - Taller/Lower */}
                    <rect x="38" y="45" width="10" height="35" fill="#f43f5e" rx="1" />
                    <line x1="43" y1="35" x2="43" y2="85" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

                    {/* Candle 3 (Green) - Major Institutional Move */}
                    <rect x="65" y="15" width="12" height="55" fill="#10b981" rx="1" />
                    <line x1="71" y1="5" x2="71" y2="75" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            {/* ── Brand Typography ─────────────────────────────────────────── */}
            {!hideText && (
                <div className="flex flex-col leading-none">
                    <span className={clsx(
                        "text-gray-900 dark:text-[var(--color-text-primary)] font-black tracking-tighter uppercase",
                        currentSize.text
                    )}>
                        MMITPS <span className="text-gray-500 dark:text-[var(--color-text-primary)]">INC.</span>
                    </span>
                    {!hideSubtext && (
                        <span className={clsx(
                            "text-negative font-bold tracking-[0.05em] mt-1 italic opacity-90",
                            currentSize.subtext
                        )}>
                            trading the institutional way...
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
