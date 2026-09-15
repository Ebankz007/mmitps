"use client";

import { useState } from "react";
import {
    Search,
    PlayCircle,
    FileText,
    ChevronRight,
    MessageSquare,
    Zap,
    Download,
    ArrowRight
} from "lucide-react";
import { clsx } from "clsx";

const FAQ_SECTIONS = [
    {
        title: "Getting Started",
        icon: Zap,
        questions: [
            { q: "How do I verify my institutional account?", a: "Navigate to the KYC Verification section in your sidebar and upload your Passport or National ID. Review takes 2-4 hours." },
            { q: "What is the minimum deposit for Tokenization Pools?", a: "Institutional pools require a minimum of $500 USD equivalent in supported cryptocurrencies." },
            { q: "How do I connect my VPS to MetaTrader?", a: "Your VPS credentials are found in the VPS Station. Copy the IP address and use Remote Desktop Connection to log in." }
        ]
    },
    {
        title: "Financial & Withdrawals",
        icon: FileText,
        questions: [
            { q: "What are the withdrawal fees?", a: "MMITPS charges 0% fees on withdrawals. Network gas fees apply depending on the blockchain selected." },
            { q: "How long do payouts take to process?", a: "Payout requests are audited manually and typically processed within 24 business hours." },
            { q: "Can I transfer funds to other members?", a: "Yes, use the Internal Transfer feature in the Financial module for instant peer-to-peer relocation." }
        ]
    },
    {
        title: "Trading & Algorithms",
        icon: PlayCircle,
        questions: [
            { q: "Do your bots support HFT?", a: "Select MMITPS bots are optimized for high-frequency execution on NY4 and LD5 co-located servers." },
            { q: "Where can I find the weekly COT reports?", a: "COT analysis is updated every Saturday in the Resources > COT Data section." }
        ]
    }
];

const VIDEO_TUTORIALS = [
    { title: "Platform Overview", duration: "12:45", id: "v1" },
    { title: "MLM Binary Strategy", duration: "08:20", id: "v2" },
    { title: "Risk Management 101", duration: "15:30", id: "v3" },
    { title: "Using the Trigger Sheet", duration: "10:15", id: "v4" }
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState(0);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative h-[340px] rounded-lg overflow-hidden bg-surface border border-[var(--color-border)] flex flex-col items-center justify-center text-center px-6">
                <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#10b981]/5 blur-[120px] rounded-full -mt-40"></div>

                <div className="relative z-10 space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)]">
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Institutional Support</span>
                    </div>
                    <h1 className="text-5xl font-black text-[var(--color-text-primary)] tracking-tight leading-tight">
                        How can we <span className="text-[#10b981]">empower</span> your trading today?
                    </h1>
                    <div className="relative group max-w-xl mx-auto w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search help articles, tutorials, and documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-5 pl-16 pr-6 text-sm font-medium text-[var(--color-text-primary)] placeholder:text-gray-700 focus:outline-none focus:border-[#10b981]/50 transition-all shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Navigation & FAQ */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="flex flex-wrap gap-4">
                        {FAQ_SECTIONS.map((section, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSection(idx)}
                                className={clsx(
                                    "flex items-center gap-3 px-6 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                                    activeSection === idx
                                        ? "bg-[#10b981] text-black border-[#10b981] shadow-[0_10px_30px_rgba(16, 185, 129,0.2)] scale-105"
                                        : "bg-surface text-gray-500 border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                                )}
                            >
                                <section.icon className="h-4 w-4" />
                                {section.title}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight uppercase">{FAQ_SECTIONS[activeSection].title}</h2>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{FAQ_SECTIONS[activeSection].questions.length} Articles</div>
                        </div>
                        <div className="grid gap-4">
                            {FAQ_SECTIONS[activeSection].questions.map((item, idx) => (
                                <details key={idx} className="group bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden transition-all hover:bg-white/[0.02]">
                                    <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-tight leading-relaxed group-open:text-[#10b981] transition-colors pr-8">
                                            {item.q}
                                        </h3>
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center group-open:rotate-180 transition-transform">
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                        </div>
                                    </summary>
                                    <div className="px-8 pb-8">
                                        <div className="h-px w-full bg-[var(--color-surface-2)] mb-6"></div>
                                        <p className="text-gray-400 text-sm font-medium leading-[1.8] max-w-2xl">
                                            {item.a}
                                        </p>
                                        <div className="mt-6 flex items-center gap-4">
                                            <button className="text-[10px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-2 hover:underline">
                                                Read Full Guide <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Resources & Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Video Tutorials */}
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Masterclass</h3>
                            <PlayCircle className="h-4 w-4 text-[#10b981]" />
                        </div>
                        <div className="space-y-4">
                            {VIDEO_TUTORIALS.map((video) => (
                                <div key={video.id} className="group relative rounded-lg border border-[var(--color-border)] bg-white/[0.02] p-4 flex items-center gap-4 cursor-pointer hover:border-[#10b981]/30 hover:bg-[#10b981]/5 transition-all">
                                    <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                                        <PlayCircle className="h-5 w-5 text-gray-600 group-hover:text-[#10b981]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase truncate">{video.title}</h4>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase">{video.duration} MIN</span>
                                    </div>
                                    <ArrowRight className="h-3 w-3 text-gray-800 group-hover:text-[#10b981] transition-colors" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                            View Academy →
                        </button>
                    </div>

                    {/* Quick Resources */}
                    <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-8 rounded-lg space-y-6">
                        <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Documentation</h3>
                        <div className="space-y-2">
                            {[
                                { name: "User Manual v2.4", size: "4.2 MB" },
                                { name: "Institutional Risk Policy", size: "1.8 MB" },
                                { name: "API Documentation", size: "12.5 MB" }
                            ].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <Download className="h-4 w-4 text-[#10b981]" />
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-[var(--color-text-primary)] transition-colors">{doc.name}</span>
                                    </div>
                                    <span className="text-[9px] text-gray-700 font-black uppercase">{doc.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Contact */}
                    <div className="bg-surface border border-[#10b981]/20 p-8 rounded-lg text-center space-y-4">
                        <div className="w-16 h-16 rounded-lg bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20 mx-auto">
                            <MessageSquare className="h-8 w-8 text-[#10b981]" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Need More help?</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Our institutional agents are standing by to assist with your trading desk needs.</p>
                        </div>
                        <button className="w-full py-5 bg-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-[#10b981]/10">
                            Open Support Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
