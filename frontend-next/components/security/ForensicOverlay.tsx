"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";

export function ForensicOverlay() {
    const { user } = useAuth();

    if (!user) return null;

    const watermarkText = `${user.username || "SECURE-NODE"} • ${user._id}`;
    
    // Create an array of repeating text for the overlay
    const rows = Array.from({ length: 20 });
    const cols = Array.from({ length: 10 });

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden opacity-[0.03] flex flex-col justify-around">
            {rows.map((_, i) => (
                <div 
                    key={i} 
                    className="flex justify-around whitespace-nowrap"
                    style={{ 
                        transform: `translateX(${i % 2 === 0 ? '0' : '50px'}) rotate(-15deg)`,
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.2em'
                    }}
                >
                    {cols.map((_, j) => (
                        <span key={j} className="uppercase tracking-widest px-12">
                            {watermarkText}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}
