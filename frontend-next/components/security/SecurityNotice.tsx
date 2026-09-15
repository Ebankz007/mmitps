"use client";

import { Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function SecurityNotice() {
    const { user } = useAuth();
    const nodeId = user?._id || "SECURE-NODE-ID";

    return (
        <div className="p-8 bg-brand-500/5 border border-brand-500/10 rounded-lg flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="p-4 bg-brand-500/10 rounded-lg h-fit shrink-0">
                <Shield className="h-6 w-6 text-brand-500" />
            </div>
            <div className="space-y-1">
                <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Platform Security Protocol</h4>
                <p className="text-[11px] text-gray-500 font-bold uppercase leading-relaxed tracking-tight">
                    All proprietary resources and dashboards are watermarked with your unique identifier <span className="text-brand-500 font-black">({nodeId})</span> to prevent unauthorized distribution. Redistribution of MMITPS materials is a violation of network protocols and will result in rank demotion, node suspension, and potential legal action.
                </p>
            </div>
        </div>
    );
}
