import Link from "next/link";
import { ShieldAlert, Globe, ArrowLeft, Mail } from "lucide-react";

export default function RegionBlockedPage() {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon Grid */}
                <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-black border border-[var(--color-border)] rounded-lg w-full h-full flex flex-col items-center justify-center shadow-2xl">
                        <Globe className="h-10 w-10 text-rose-500 mb-2" />
                        <ShieldAlert className="h-6 w-6 text-[var(--color-text-primary)] absolute bottom-4 right-4 bg-black rounded-full" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">
                        Region <span className="text-rose-500">Restricted</span>
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        We apologize, but this specific feature or service is not currently available in your region due to local regulatory requirements or platform restrictions.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-8 space-y-4">
                    <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface hover:bg-gray-100 text-black font-black rounded-lg transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Return to Dashboard
                    </Link>
                    
                    <a
                        href="mailto:support@mmitps.com"
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface-2 hover:bg-[#222222] border border-[var(--color-border)] text-[var(--color-text-primary)] font-bold rounded-lg transition-all"
                    >
                        <Mail className="h-4 w-4 text-gray-400" />
                        Contact Support
                    </a>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                    Error Code: ERR_GEO_BLOCKED • MMITPS Security
                </p>
            </div>
        </div>
    );
}
