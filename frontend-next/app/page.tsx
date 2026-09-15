"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Logo } from "@/components/layout/Logo";
import GoogleTranslate from "@/components/layout/GoogleTranslate";
import { cn } from "@/lib/utils";
import { usePageContent, getSectionData } from "@/hooks/use-site-content";
import {
    Zap,
    Shield,
    BarChart3,
    Globe,
    ChevronDown,
    Check,
    Twitter,
    Linkedin as LinkedIn,
    Github,
    ArrowRight,
    UserCircle,
    Activity,
    Calculator,
    AlertCircle,
    CreditCard,
    Calendar,
    MapPin
} from "lucide-react";

interface Plan {
    _id: string;
    name: string;
    code: string;
    description?: string;
    price: number;
    currency: string;
    billingCycle?: string;
    interval?: string;
    features: Record<string, boolean> | string[];
    status?: string;
    isActive?: boolean;
    agentsAllowed?: number;
}

export default function LandingPage() {
    const { isAuthenticated, user, logout } = useAuth();
    const [faqOpen, setFaqOpen] = useState<number | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [newsletterMessage, setNewsletterMessage] = useState("");
    const [activeSlide, setActiveSlide] = useState(0);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);

    // Dynamic content from CMS
    const { data: sections } = usePageContent("landing");
    const hero = getSectionData(sections, "landing-hero");
    const pillarsSection = getSectionData(sections, "landing-pillars");
    const featuresSection = getSectionData(sections, "landing-features");
    const faqSection = getSectionData(sections, "landing-faq");
    const newsletterSection = getSectionData(sections, "landing-newsletter");
    const footerSection = getSectionData(sections, "landing-footer");
    const pricingSection = getSectionData(sections, "landing-pricing");
    const testimonialsSection = getSectionData(sections, "landing-testimonials");
    const methodologySection = getSectionData(sections, "landing-methodology");
    const transparencySection = getSectionData(sections, "landing-transparency");
    const academySection = getSectionData(sections, "landing-academy");
    const eventsSection = getSectionData(sections, "landing-events");

    React.useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Next.js rewrites /api/v1/* → backend server (see next.config.js)
                console.log("[LANDING] Fetching plans from /api/v1/plans...");
                const res = await fetch('/api/v1/plans');
                console.log("[LANDING] fetch response status:", res.status);

                if (!res.ok) {
                    console.warn("[LANDING] Plans endpoint unavailable, status:", res.status);
                    return;
                }

                const data = await res.json();
                console.log("[LANDING] Received data:", data);

                if (data.success) {
                    console.log(`[LANDING] Setting ${data.data?.length || 0} plans`);
                    setPlans(data.data || []);
                } else {
                    console.warn("[LANDING] API returned success:false", data);
                }
            } catch (err) {
                console.error("[LANDING] Failed to fetch plans:", err);
            } finally {
                setIsLoadingPlans(false);
            }
        };

        const fetchCMSData = async () => {
            try {
                const [evtRes, tstRes] = await Promise.all([
                    fetch('/api/v1/cms?type=event'),
                    fetch('/api/v1/cms?type=testimonial')
                ]);
                if (evtRes.ok) {
                    const evtData = await evtRes.json();
                    if (evtData.success) setEvents(evtData.data || []);
                }
                if (tstRes.ok) {
                    const tstData = await tstRes.json();
                    if (tstData.success) setTestimonials(tstData.data || []);
                }
            } catch (err) {
                console.error("[LANDING] Failed to fetch CMS events/testimonials", err);
            }
        };

        fetchPlans();
        fetchCMSData();
    }, []);

    const pillars = [
        {
            title: "Institutional Intelligence",
            subtitle: "The Edge of Data",
            description: "Harness the power of Commitment of Traders (COT) data aggregation and multi-indicator sentiment analysis used by hedge funds to stay ahead of retail movements.",
            icon: <Shield className="text-brand-500" />,
            color: "from-brand-500/20 to-transparent"
        },
        {
            title: "Strategic Execution",
            subtitle: "Precision Engineering",
            description: "Deploy proprietary AI algorithms and global macro technical confluence models to identify high-probability setups across 210+ currency pairs.",
            icon: <Zap className="text-brand-500" />,
            color: "from-brand-500/20 to-transparent"
        },
        {
            title: "Financial Mastery",
            subtitle: "Ecosystem Control",
            description: "Seamlessly manage your capital through a multi-currency unified wallet, tokenization pools, and institutional-grade risk management protocols.",
            icon: <BarChart3 className="text-brand-500" />,
            color: "from-green-500/20 to-transparent"
        },
        {
            title: "Education Academy",
            subtitle: "Knowledge as Power",
            description: "Access 168+ pages of professional-grade trading curriculum, from basic macro principles to advanced order flow and institutional psychology.",
            icon: <Globe className="text-brand-500" />,
            color: "from-brand-500/20 to-transparent"
        }
    ];

    const dashboardSlides = [
        {
            id: "command",
            name: "Command Center",
            title: "Institutional Control",
            description: "Monitor your entire network, commissions, and system health from a single glassmorphic interface.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-3 grid grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[180px] bg-white/[0.03] border border-[var(--color-border)] rounded-lg relative overflow-hidden group/card text-left p-4">
                                <div className="w-10 h-10 rounded-lg bg-brand-500/10 mb-3" />
                                <div className="h-4 w-2/3 bg-[var(--color-surface-3)] rounded mb-2" />
                                <div className="h-3 w-1/2 bg-[var(--color-surface-2)] rounded" />
                            </div>
                        ))}
                        <div className="col-span-3 h-[240px] bg-brand-500/[0.03] border border-brand-500/10 rounded-lg flex items-center justify-center relative">
                            <BarChart3 size={48} className="text-brand-500/20 animate-pulse" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-left">
                                <div className="h-6 w-1/4 bg-brand-500/20 rounded mb-2" />
                                <div className="h-4 w-1/3 bg-brand-500/10 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-1 bg-white/[0.02] border border-[var(--color-border)] rounded-lg" />
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "trade",
            name: "Trade Station",
            title: "Market Execution",
            description: "Execute trades with sub-10ms precision using COT confluence and macro-economic triggers.",
            preview: (
                <div className="flex-1 p-6 flex flex-col gap-6 text-left">
                    <div className="grid grid-cols-4 gap-4">
                        {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'].map(pair => (
                            <div key={pair} className="p-4 rounded-lg bg-white/[0.03] border border-[var(--color-border)] text-left">
                                <div className="text-[10px] text-[var(--color-text-secondary)] font-bold mb-1">{pair}</div>
                                <div className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    {Math.random() > 0.5 ? '+' : '-'}{(Math.random()).toFixed(2)}%
                                    <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-black/40 border border-[var(--color-border)] rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Zap size={120} className="text-brand-500" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-1/2 flex items-end gap-1">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div key={i} className="flex-1 bg-brand-500/20 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "academy",
            name: "Academy Hub",
            title: "Expert Learning",
            description: "Master institutional trading through our curriculum of 125+ video lessons and certification paths.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-3 gap-6 text-left">
                    {['Forex Mastery', 'Technical Analysis', 'Algo Trading'].map((course, i) => (
                        <div key={i} className="group/course relative aspect-video bg-black/40 border border-[var(--color-border)] rounded-lg overflow-hidden flex flex-col items-center justify-center p-6 hover:border-brand-500/40 transition-all">
                            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                                <Globe size={20} className="text-brand-500" />
                            </div>
                            <div className="text-sm font-bold text-[var(--color-text-primary)] text-center mb-2">{course}</div>
                            <div className="w-full h-1 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500" style={{ width: `${30 + i * 20}%` }} />
                            </div>
                        </div>
                    ))}
                    <div className="col-span-3 flex-1 bg-white/[0.02] border border-[var(--color-border)] rounded-lg p-6 text-left">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-bold text-[var(--color-text-primary)]">Platform Progress</div>
                            <div className="text-brand-500 font-bold">78% Complete</div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-3 w-full bg-[var(--color-surface-2)] rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "wallet",
            name: "Asset Wallet",
            title: "Unified Finance",
            description: "Manage fiat and crypto deposits, tokenization pools, and payouts with bank-grade security.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-2 gap-6 text-left">
                    <div className="bg-gradient-to-br from-brand-500/20 to-transparent border border-brand-500/20 rounded-lg p-8 text-left flex flex-col justify-between">
                        <div>
                            <div className="text-sm font-bold text-brand-500 uppercase tracking-widest mb-2">Total Balance</div>
                            <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">$124,560.00</div>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-[var(--color-surface-3)] rounded-lg text-xs font-bold text-[var(--color-text-primary)]">Deposit</div>
                            <div className="px-4 py-2 bg-[var(--color-surface-3)] rounded-lg text-xs font-bold text-[var(--color-text-primary)]">Transfer</div>
                        </div>
                    </div>
                    <div className="grid grid-rows-2 gap-6">
                        <div className="p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-500/20" />
                                <div className="text-sm font-bold text-[var(--color-text-primary)]">BTC Network</div>
                            </div>
                            <div className="text-[var(--color-text-primary)] font-bold">1.24 BTC</div>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20" />
                                <div className="text-sm font-bold text-[var(--color-text-primary)]">Yield Pool #4</div>
                            </div>
                            <div className="text-[var(--color-text-primary)] font-bold">+12.4%</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "geometry",
            name: "Geometry Intelligence Pro Max",
            title: "Formation Engine",
            description: "Institutional formation scanner identifying high-probability Harmonic patterns and dynamic structural shifts.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-1 bg-black/40 border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Detected Formations</div>
                        {[
                            { name: 'Bullish Bat', type: 'Harmonic', conf: 92 },
                            { name: 'BOS (CHoCH)', type: 'Structural', conf: 88 },
                            { name: 'Descending Wedge', type: 'Classic', conf: 75 }
                        ].map((p, i) => (
                            <div key={i} className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] font-black text-brand-500/70 lowercase tracking-widest leading-none">{p.type}</span>
                                    <span className="text-[8px] font-black text-green-500 leading-none">{p.conf}%</span>
                                </div>
                                <div className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{p.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="col-span-3 bg-black/40 border border-[var(--color-border)] rounded-lg p-6 relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-brand-500">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_#22C55E]" />
                                    XABCD OVERLAY
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-brand-500">
                                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_#10b981]" />
                                    PITCHFORK
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 500 250">
                                <polygon points="50,180 150,80 250,150 350,50 450,180" fill="rgba(34,197,94,0.05)" stroke="#22C55E" strokeWidth="2" strokeDasharray="6,3" />
                                {['X', 'A', 'B', 'C', 'D'].map((p, i) => (
                                    <g key={p}>
                                        <circle cx={50 + i * 100} cy={[180, 80, 150, 50, 180][i]} r="3" fill="#22C55E" />
                                        <text x={50 + i * 100} y={[180, 80, 150, 50, 180][i] - 10} fill="#22C55E" fontSize="10" fontWeight="900" textAnchor="middle">{p}</text>
                                    </g>
                                ))}
                                <line x1="20" y1="220" x2="480" y2="100" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />
                            </svg>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "seasonality",
            name: "Seasonal Intelligence Pro Max",
            title: "Predictive Cycles",
            description: "Identify high-probability institutional price cycles using machine learning pattern detection and dual-axis historical overlays.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-3 bg-black/40 border border-[var(--color-border)] rounded-lg p-8 relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Institutional Path</h4>
                                <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Historical Averaged Convergence</p>
                            </div>
                            <div className="px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">AI HEALTH: 94%</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end gap-1 px-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div className={`w-full bg-brand-500/${i % 3 === 0 ? '40' : '10'} rounded-t-lg transition-all hover:bg-brand-500/60`} style={{ height: `${20 + Math.sin(i * 0.8) * 40 + 40}%` }} />
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-[var(--color-text-muted)] uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        {[
                            { label: 'Consistency', value: '89%' },
                            { label: 'Momentum', value: '+12.4%' },
                            { label: 'Active Cycles', value: '04' }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-white/[0.03] border border-[var(--color-border)] rounded-lg">
                                <div className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-1 leading-none">{stat.label}</div>
                                <div className="text-xl font-black text-[var(--color-text-primary)] italic leading-none">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "ptd",
            name: "MMITPS-PTD",
            title: "Predictive Oracle",
            description: "Multi-Methodology Integrated Time Prediction System. Synthetic confluence for institutional timing.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-3 bg-black/40 border border-[var(--color-border)] rounded-lg p-8 relative overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Activity className="text-brand-500 animate-pulse" size={24} />
                                <div>
                                    <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tighter">Predictive Oracle</h4>
                                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Institutional Overlay</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">LIVE CONFLUENCE</span>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 500 200">
                                <path d="M0,150 Q50,100 100,120 T200,80 T300,100 T400,60 T500,80" fill="none" stroke="#22C55E" strokeWidth="3" />
                                <line x1="350" y1="0" x2="350" y2="200" stroke="#22C55E" strokeWidth="2" strokeDasharray="10,5" />
                            </svg>
                            <div className="absolute top-10 left-10 p-6 bg-black/60 backdrop-blur-3xl border border-brand-500/20 rounded-lg">
                                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-1">Convergence Event</p>
                                <h5 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic">Cycle + Fibonacci</h5>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase">Confidence: 94%</span>
                                    <div className="h-1.5 w-20 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500" style={{ width: '94%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <div className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-2">Probability Stream</div>
                        {[
                            { type: 'Fibonacci Time', conf: 88, dir: 'UP' },
                            { type: 'Cycle Peak', conf: 91, dir: 'DOWN' },
                            { type: 'Gann Square', conf: 72, dir: 'DOWN' }
                        ].map((sig, i) => (
                            <div key={i} className="p-4 bg-white/[0.03] border border-[var(--color-border)] rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">{sig.type}</div>
                                    <div className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tight">{sig.dir} SHIFT</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-brand-500">{sig.conf}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "strength",
            name: "Fundamental Strength Matrix",
            title: "Macro Relative",
            description: "Relative currency performance across global macro indicators, weighting GDP, Inflation, and Interest rates.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-2 bg-black/40 border border-[var(--color-border)] rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Strength Ranking</h4>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { sym: 'USD', score: 8.4, c: 'green' },
                                { sym: 'GBP', score: 6.2, c: 'green' },
                                { sym: 'EUR', score: -3.1, c: 'red' },
                                { sym: 'JPY', score: -7.8, c: 'red' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-black text-[var(--color-text-secondary)]">
                                        <span className="uppercase">{item.sym}</span>
                                        <span>{item.score > 0 ? '+' : ''}{item.score}</span>
                                    </div>
                                    <div className="h-2 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <div className={`h-full ${item.c === 'green' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} style={{ width: `${Math.abs(item.score) * 10}%`, marginLeft: item.score > 0 ? '0' : 'auto' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2 space-y-4">
                        <div className="bg-black/40 border border-[var(--color-border)] rounded-lg p-6 h-full flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="text-brand-500" size={20} />
                                <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Global Heatmap</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className={`aspect-square rounded-lg bg-white/${i % 2 === 0 ? '10' : '5'} border border-[var(--color-border)] flex items-center justify-center group/heat hover:border-brand-500/40 transition-all`}>
                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] group-hover/heat:text-brand-500 transition-colors uppercase">{['AUD', 'CAD', 'CHF', 'NZD', 'XAU', 'XTI', 'BTC', 'ETH', 'SOL'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "planner",
            name: "Contract Planner Pro",
            title: "Position Lifecycle",
            description: "Synthesize contract specifications with portfolio risk parameters. Calculate precise execution levels for futures and commodities.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-3 gap-6 text-left">
                    <div className="col-span-1 bg-black/40 border border-[var(--color-border)] rounded-lg p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator size={16} className="text-brand-500" />
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Entry Parameters</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Asset', val: 'Gold (GC)' },
                                { label: 'Balance', val: '$10,000' },
                                { label: 'Risk %', val: '1.0%' }
                            ].map((row, i) => (
                                <div key={i}>
                                    <label className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{row.label}</label>
                                    <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs font-black text-[var(--color-text-primary)]">{row.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2 space-y-6">
                        <div className="bg-brand-500/5 border border-brand-500/10 rounded-lg p-6 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Max Risk Amount</p>
                                <p className="text-3xl font-black text-[var(--color-text-primary)]">$100.00</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Ticks</p>
                                <p className="text-3xl font-black text-brand-500">10.0</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Conservative', rr: '1:3', target: '30 Ticks' },
                                { label: 'Aggressive', rr: '1:5', target: '50 Ticks' }
                            ].map((s, i) => (
                                <div key={i} className="p-4 bg-white/[0.03] border border-[var(--color-border)] rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase">{s.label}</span>
                                        <span className="text-[10px] font-black text-green-500">{s.rr}</span>
                                    </div>
                                    <div className="text-xl font-black text-[var(--color-text-primary)]">{s.target}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "calendar",
            name: "Contract Spec Pro",
            title: "Expiry Management",
            description: "Institutional rollover schedules and contract specification tracking. Direct alerts for liquidity shifts.",
            preview: (
                <div className="flex-1 p-6 flex flex-col gap-6 text-left">
                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center animate-pulse">
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">Critical Rollover Alert: WTI Crude (CL)</h4>
                            <p className="text-[11px] text-red-500/70 font-bold">Roll date is in 2 days. Concentrating liquidity in next month.</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-black/40 border border-[var(--color-border)] rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-surface-2)] text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-6 py-3">Symbol</th>
                                    <th className="px-6 py-3">Rollover</th>
                                    <th className="px-6 py-3">Tick Value</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[11px] font-black">
                                {[
                                    { s: 'EUR (6E)', r: 'Mar 12', t: '0.00005', st: 'Active', c: 'green' },
                                    { s: 'Gold (GC)', r: 'Apr 20', t: '0.10', st: 'Active', c: 'green' },
                                    { s: 'Crude (CL)', r: 'Mar 16', t: '0.01', st: 'Critical', c: 'red' }
                                ].map((c, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-[var(--color-text-primary)] uppercase">{c.s}</td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">{c.r}</td>
                                        <td className="px-6 py-4 text-brand-400">{c.t}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] border ${c.c === 'green' ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>{c.st}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            id: "seasonal-planner",
            name: "Institutional Seasonal Planner",
            title: "Execution Windows",
            description: "Plan trades based on high-probability historical execution windows. Align strategy with institutional structural timing.",
            preview: (
                <div className="flex-1 p-6 grid grid-cols-4 gap-6 text-left">
                    <div className="col-span-1 border-r border-[var(--color-border)] pr-6 space-y-6">
                        <div className="text-center p-6 bg-brand-500/5 border border-brand-500/10 rounded-lg">
                            <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Active Alerts</div>
                            <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">04</div>
                        </div>
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest px-2">Sector Focus</div>
                            {['Forex', 'Metals', 'Indices', 'Crypto'].map(s => (
                                <div key={s} className="px-4 py-2 bg-[var(--color-surface-2)] rounded-lg text-[10px] font-black text-[var(--color-text-secondary)]">{s}</div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-3 grid grid-cols-2 gap-4">
                        {[
                            { a: 'EURUSD', p: 'Apr 1 - Apr 20', b: 'BULLISH', cf: 82, st: 'Active' },
                            { a: 'XAUUSD', p: 'Apr 15 - May 5', b: 'BEARISH', cf: 68, st: 'Upcoming' },
                            { a: 'SPX500', p: 'May 1 - May 30', b: 'BULLISH', cf: 75, st: 'Upcoming' },
                            { a: 'GBPUSD', p: 'Jun 1 - Jun 15', b: 'BEARISH', cf: 54, st: 'Planned' }
                        ].map((w, i) => (
                            <div key={i} className="p-5 bg-white/[0.03] border border-[var(--color-border)] rounded-lg hover:border-brand-500/40 transition-all flex flex-col justify-between group/window">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-[var(--color-surface-3)] rounded-lg text-[9px] font-black text-[var(--color-text-primary)] uppercase group-hover/window:bg-brand-500/20 transition-colors">{w.a}</div>
                                    <div className="text-[9px] font-black text-brand-500 uppercase">{w.st}</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tighter leading-none mb-1">{w.p}</div>
                                    <div className="flex justify-between items-end mt-4">
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase leading-none mb-1">Bias</p>
                                            <p className={`text-xs font-black ${w.b === 'BULLISH' ? 'text-green-500' : 'text-red-500'}`}>{w.b}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-[var(--color-text-primary)] leading-none">{w.cf}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500" style={{ width: `${w.cf}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const toggleFaq = (index: number) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    const dashboardPath = user?.role === "admin" || user?.role === "super_admin" ? "/admin" : "/dashboard";

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail) return;

        setNewsletterStatus("loading");
        try {
            const res = await api.post("/api/v1/newsletter/subscribe", { email: newsletterEmail });
            setNewsletterStatus("success");
            setNewsletterMessage(res.data.message || "Thank you for subscribing!");
            setNewsletterEmail("");
        } catch (err: unknown) {
            setNewsletterStatus("error");
            const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setNewsletterMessage(errorMessage);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-surface overflow-x-hidden font-manrope selection:bg-brand-500/30 selection:text-[var(--color-text-primary)]">

            {/* ── Background Video Section ────────────────────────────────────────── */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-1/2 left-1/2 w-[120%] h-[120%] -translate-x-1/2 -translate-y-[40%] object-cover object-bottom opacity-60"
                >
                    <source
                        src="https://assets.mixkit.co/videos/47213/47213-720.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
            </div>

            {/* ── Navbar ──────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-[90px] px-6 md:px-[120px] flex items-center justify-between backdrop-blur-md border-b border-[var(--color-border)] bg-black/20">
                <div className="flex items-center gap-[60px]">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <Logo size="sm" className="scale-75 md:scale-100 origin-left" />
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {["Features", "Pricing", "Academy"].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href={dashboardPath}
                                className="px-5 py-2.5 bg-[var(--color-surface-2)] backdrop-blur-xl rounded-md text-[14px] font-bold text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all flex items-center gap-2"
                            >
                                <UserCircle size={18} className="text-brand-500" />
                                {user?.role?.toUpperCase() || "DASHBOARD"}
                            </Link>
                            <button
                                onClick={() => logout()}
                                className="text-[14px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="hidden sm:block text-[14px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] transition-all"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2.5 bg-brand-500 rounded-md text-[14px] font-bold text-[var(--color-text-primary)] hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                    <div className="hidden xl:block">
                        <GoogleTranslate />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-[140px]">

                {/* ── Hero Section ────────────────────────────────────────────────────── */}
                <section className="flex flex-col items-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-[1000px]"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                            <Zap size={14} className="text-brand-500" />
                            <span className="text-[12px] font-bold text-brand-500 uppercase tracking-widest">{hero?.badge || "v2.0 Beta Now Live"}</span>
                        </div>

                        <h1 className="text-5xl md:text-[76px] font-medium text-[var(--color-text-primary)] leading-[1.1] tracking-[-3px] mb-6">
                            {hero?.heading || <>
                                Market Makers & Institutional Traders<br />
                                <span className="font-instrument italic">
                                    <span className="text-accent-500">Patterns</span>{" "}
                                    <span className="text-[var(--color-text-primary)]">and</span>{" "}
                                    <span className="text-brand-500">Strategies</span>{" "}
                                    <span className="text-[var(--color-text-primary)]">INC.</span>
                                </span>
                            </>}
                        </h1>

                        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-[700px] mx-auto mb-10 leading-relaxed font-manrope">
                            {isAuthenticated ? (hero?.authenticatedSubheading || `Welcome back, ${user?.email}. Continue managing your institutional portfolio across all markets.`) : (hero?.subheading || "The next-generation AI trading platform that handles institutional analytics, COT data, and market execution while you scale your capital.")}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-5">
                            {isAuthenticated ? (
                                <Link
                                    href={dashboardPath}
                                    className="px-8 py-4 bg-brand-500 rounded-lg text-[16px] font-bold text-[var(--color-text-primary)] hover:scale-105 hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/40 flex items-center gap-2"
                                >
                                    Go to {user?.role === "admin" ? "Command Center" : "Dashboard"} <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <Link
                                    href={hero?.primaryCta?.href || "/register"}
                                    className="px-8 py-4 bg-brand-500 rounded-lg text-[16px] font-bold text-[var(--color-text-primary)] hover:scale-105 hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/40 flex items-center gap-2"
                                >
                                    {hero?.primaryCta?.label || "Start Trading Now"} <ArrowRight size={18} />
                                </Link>
                            )}
                            <button className="px-8 py-4 bg-[var(--color-surface-2)] backdrop-blur-xl rounded-lg text-[16px] font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all border border-[var(--color-border)]">
                                {hero?.secondaryCta?.label || "View Performance"}
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* ── Pillars Section ────────────────────────────────────────────────── */}
                    <section id="pillars" className="py-[120px] px-6 max-w-[1440px] mx-auto relative">
                        <div className="grid md:grid-cols-4 gap-6">
                            {pillars.map((pillar, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative p-8 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-b ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-lg bg-brand-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/30">
                                            {React.isValidElement(pillar.icon) && React.cloneElement(pillar.icon as React.ReactElement<{ className: string }>, { className: "text-[var(--color-text-primary)] w-6 h-6" })}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[3px] text-brand-500/60 mb-2">{pillar.subtitle}</div>
                                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">{pillar.title}</h3>
                                        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{pillar.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* ── Mission & Analytics ────────────────────────────────────────── */}
                    <section id="mission" className="py-[120px] px-6 max-w-[1440px] mx-auto relative border-t border-[var(--color-border)]">
                        <div className="grid lg:grid-cols-2 gap-[100px] items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Our Vision</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-8 italic font-instrument">
                                    Trading is a pursuit of knowledge.
                                </h2>
                                <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed mb-6 font-manrope">
                                    Built on a foundation of practical market experience, our platform organizes commonly referenced institutional data into a clear, intuitive structure. Our mission is to make key datasets easier to locate, compare, and comprehend.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] relative group"
                            >
                                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg" />
                                <h4 className="text-[var(--color-text-muted)] uppercase tracking-[4px] text-[12px] font-black mb-6 relative z-10">About MMITPS INC</h4>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed relative z-10 font-bold italic mb-6">
                                    &quot;MMITPS INC Analytics is a curated collection of institutional market overviews and research tools. We empower you to conduct faster, more efficient research and verify all critical information at its source.&quot;
                                </p>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-[1px] bg-brand-500/40" />
                                    <span className="text-brand-500/60 font-black text-[10px] uppercase tracking-widest">Institutional Efficiency</span>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* ── Dashboard Spotlight (Dynamic Slider) ─────────────────────────── */}
                    <section className="py-20 px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative w-full max-w-[1240px] mx-auto"
                        >
                            {/* Slider Navigation */}
                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                {dashboardSlides.map((slide, idx) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setActiveSlide(idx)}
                                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${activeSlide === idx
                                            ? "bg-brand-500 text-[var(--color-text-primary)] border-brand-500 shadow-lg shadow-brand-500/40"
                                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-brand-500/10 hover:text-[var(--color-text-primary)]"
                                            }`}
                                    >
                                        {slide.name}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="grid lg:grid-cols-5 gap-12 items-center">
                                <div className="lg:col-span-2 text-left">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeSlide}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Feature Spotlight</span>
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-6">
                                                {dashboardSlides[activeSlide].title}
                                            </h2>
                                            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
                                                {dashboardSlides[activeSlide].description}
                                            </p>
                                            <Link
                                                href="/register"
                                                className="inline-flex items-center gap-2 text-brand-500 font-bold hover:gap-4 transition-all"
                                            >
                                                Explore {dashboardSlides[activeSlide].name} <ArrowRight size={18} />
                                            </Link>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <div className="lg:col-span-3 relative">
                                    <div className="p-4 md:p-6 rounded-lg bg-white/[0.02] border border-[var(--color-border)] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                        <div className="aspect-[16/10] rounded-lg bg-neutral-900 border border-[var(--color-border)] overflow-hidden flex flex-col">
                                            <div className="h-12 border-b border-[var(--color-border)] flex items-center px-4 justify-between bg-black/40">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                                                    <div className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                    <div className="w-3 h-3 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(16, 185, 129,0.4)]" />
                                                </div>
                                                <div className="text-[10px] text-[var(--color-text-muted)] font-mono tracking-widest uppercase">
                                                    MMITPS Platform // {dashboardSlides[activeSlide].name}
                                                </div>
                                                <div className="w-8 h-4 rounded-md bg-[var(--color-surface-2)]" />
                                            </div>

                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeSlide}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.05 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="flex-1 flex"
                                                >
                                                    {dashboardSlides[activeSlide].preview}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Background Glows */}
                                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    {/* ── Academy Preview ─────────────────────────────────────────────── */}
                    <section id="academy" className="py-[160px] px-6 border-t border-[var(--color-border)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1 relative">
                                <div className="p-8 rounded-lg bg-white/[0.02] border border-[var(--color-border)] backdrop-blur-3xl shadow-2xl overflow-hidden group">
                                    <div className="aspect-square rounded-lg bg-neutral-900 border border-[var(--color-border)] overflow-hidden relative">
                                        <div className="absolute inset-0 bg-brand-500/5 opacity-50" />
                                        <div className="p-10 h-full flex flex-col justify-center">
                                            <div className="space-y-6">
                                                {[
                                                    "Section 1: Global Macro Framework",
                                                    "Section 2: COT Data Aggregation",
                                                    "Section 3: Institutional Order Flow",
                                                    "Section 4: Advanced Risk Management",
                                                    "Section 5: AI Bias and Signal Execution"
                                                ].map((module, i) => (
                                                    <div key={i} className="flex items-center gap-4 group/item">
                                                        <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-500 font-black text-xs">
                                                            0{i + 1}
                                                        </div>
                                                        <div className="text-[var(--color-text-secondary)] font-bold group-hover/item:text-[var(--color-text-primary)] transition-colors">
                                                            {module}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Academy Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <Link href="/register" className="px-8 py-4 bg-brand-500 rounded-lg text-[var(--color-text-primary)] font-black uppercase tracking-widest text-xs">
                                            Unlock Full Curriculum
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 space-y-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                                        <Globe size={14} className="text-brand-500" />
                                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Mastery Hub</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-medium tracking-tighter italic font-instrument leading-[0.9] mb-8">
                                        MMITPS <br />
                                        <span className="text-[var(--color-text-muted)]">Academy.</span>
                                    </h2>
                                    <p className="text-[var(--color-text-secondary)] text-xl leading-relaxed">
                                        Over 168+ pages of institutional research, recorded webinars, and deep-dive modules on how the Big Banks trade the markets.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[var(--color-border)]">
                                    <div>
                                        <div className="text-4xl font-bold tracking-tighter mb-2">168+</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Curriculum Pages</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-bold tracking-tighter mb-2">24/7</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Expert Mentorship</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                {/* ── Features Grid ────────────────────────────────────────────────── */}
                <section id="features" className="py-[160px] px-6 max-w-[1440px] mx-auto">
                    <div className="text-center mb-[100px]">
                        <h2 className="text-4xl md:text-6xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-6">
                            {featuresSection?.heading?.split(',')[0] || "Institutional tools,"}<br />
                            <span className="text-[var(--color-text-secondary)]">{featuresSection?.heading?.split(',').slice(1).join(',').trim() || "Simplified for you."}</span>
                        </h2>
                        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
                            {featuresSection?.subheading || "Everything you need to master the markets, from professional COT reports to autonomous AI analysis."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {[
                            {
                                icon: <BarChart3 className="text-brand-500" />,
                                title: "COT Intelligence",
                                description: "Real-time Commitment of Traders data analysis with institutional sentiment tracking.",
                                href: "#pillars"
                            },
                            {
                                icon: <Zap className="text-brand-500" />,
                                title: "AI Signals",
                                description: "Next-gen proprietary algorithms delivering sub-10ms trading precision.",
                                href: "#features"
                            },
                            {
                                icon: <Globe className="text-brand-500" />,
                                title: "Global Macro",
                                description: "Central bank policy tracking and major economic event sentiment mapping.",
                                href: "#pillars"
                            },
                            {
                                icon: <Shield className="text-brand-500" />,
                                title: "Risk Safeguard",
                                description: "Embedded institutional-grade risk management and position sizing calculators.",
                                href: "#features"
                            },
                            {
                                icon: <Activity className="text-brand-500" />,
                                title: "Academy Hub",
                                description: "168+ pages of institutional research, recorded webinars, and modules.",
                                href: "#academy",
                                isResource: true
                            },
                            {
                                icon: <CreditCard className="text-brand-500" />,
                                title: "Pricing Tiers",
                                description: "Flexible membership plans designed for institutional-scale trading.",
                                href: "#pricing",
                                isResource: true
                            },
                            {
                                icon: <Activity className="text-brand-500" />,
                                title: "Performance Audit",
                                description: "Transparent, third-party verified trading performance and live audits.",
                                href: "/performance",
                                isResource: true
                            },
                            {
                                icon: <UserCircle className="text-brand-500" />,
                                title: "Join Platform",
                                description: "Secure your institutional access and begin trading with the elite 1%.",
                                href: "/register",
                                isResource: true
                            },
                            {
                                icon: <Check className="text-brand-500" />,
                                title: "Backtesting Engine",
                                description: "Validate your edge with 10+ years of high-fidelity historical data.",
                                href: "#features"
                            },
                            {
                                icon: <Twitter className="text-brand-500" />,
                                title: "Sentiment Hub",
                                description: "Aggregated social sentiment analysis from X, Discord, and News outlets.",
                                href: "#features"
                            }
                        ].map((feature, idx) => (
                            <Link
                                href={feature.href}
                                key={idx}
                                className="block group"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={cn(
                                        "h-full p-8 rounded-lg border transition-all cursor-pointer",
                                        feature.isResource 
                                            ? "bg-brand-500/[0.03] border-brand-500/10 hover:border-brand-500/40 hover:bg-brand-500/[0.06]" 
                                            : "bg-white/[0.02] border-[var(--color-border)] hover:border-brand-500/20 hover:bg-white/[0.04]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-lg flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-lg",
                                        feature.isResource ? "bg-brand-500 shadow-brand-500/40" : "bg-neutral-800 shadow-black/40"
                                    )}>
                                        {React.isValidElement(feature.icon) && React.cloneElement(feature.icon as React.ReactElement<{ className: string }>, { 
                                            className: feature.isResource ? "text-black w-7 h-7" : "text-brand-500 w-7 h-7" 
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">{feature.title}</h3>
                                        {feature.isResource && (
                                            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[8px] font-black text-brand-500 uppercase tracking-widest">Resource</span>
                                        )}
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">{feature.description}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ── Institutional Methodology ────────────────────────────────────── */}
                <section id="methodology" className="py-[120px] px-6 max-w-[1440px] mx-auto border-t border-[var(--color-border)]">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-4 italic font-instrument">
                            Institutional Methodology
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-lg">Decoding the framework of professional market participants.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-lg bg-white/[0.01] border border-[var(--color-border)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[60px] group-hover:bg-brand-500/10 transition-colors" />
                            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight flex items-center gap-3">
                                <Shield size={24} className="text-brand-500/60" />
                                Institutional Market Concepts
                            </h3>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                MMITPS INC provides complimentary educational articles and tools designed to demystify how professional market participants analyze liquidity, positioning, risk, and the broader macroeconomic context. Our content serves as a foundational resource for general learning and background knowledge.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-lg bg-white/[0.01] border border-[var(--color-border)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[60px] group-hover:bg-brand-500/10 transition-colors" />
                            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight flex items-center gap-3">
                                <Activity size={24} className="text-brand-500/60" />
                                A Multi-Timeframe Approach
                            </h3>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                Market dynamics can be analyzed across various timeframes, each presenting unique trade-offs in terms of noise, transaction costs, and risk. We offer a suite of institutional, educational articles that empower readers to understand these critical distinctions from the short-term to the long-term.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Pricing Section ─────────────────────────────────────────────── */}
                <section id="pricing" className="py-[160px] bg-white/[0.02] border-y border-[var(--color-border)]">
                    <div className="max-w-[1440px] mx-auto px-6">
                        <div className="text-center mb-[80px]">
                            <h2 className="text-4xl md:text-6xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-4">Pricing for everyone.</h2>
                            <p className="text-[var(--color-text-secondary)] text-lg">Choose the membership that fits your institutional ambition.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            {isLoadingPlans ? (
                                Array.from({ length: 3 }).map((_, idx) => (
                                    <div key={idx} className="w-full md:w-[350px] h-[550px] rounded-lg bg-white/[0.02] border border-[var(--color-border)] animate-pulse" />
                                ))
                            ) : plans.length === 0 ? (
                                <div className="w-full text-center text-[var(--color-text-secondary)] py-20">
                                    <p className="text-lg">No active plans available at the moment.</p>
                                    <p className="text-sm mt-2">Please check back later or contact support.</p>
                                </div>
                            ) : (
                                plans.map((plan, idx) => {
                                    // Normalize features to a string array for rendering
                                    const featureList: string[] = Array.isArray(plan.features)
                                        ? plan.features as string[]
                                        : Object.entries(plan.features || {}).filter(([, v]) => v === true).map(([k]) => k.replace(/_/g, ' '));
                                    
                                    const isPopular = idx === Math.floor(plans.length / 2); // Middle plan is "popular"
                                    const billingLabel = plan.interval === 'month' ? '/mo' : plan.interval === 'year' ? '/yr' : plan.interval === 'lifetime' ? ' one-time' : plan.interval ? `/${plan.interval}` : '';

                                    return (
                                        <div
                                            key={plan._id}
                                            className={`relative w-full md:w-[350px] p-8 rounded-lg border ${
                                                isPopular ? 'bg-brand-500/5 border-brand-500/20' : 'bg-black/40 border-[var(--color-border)]'
                                            } flex flex-col transition-all hover:border-brand-500/30 group`}
                                        >
                                            {isPopular && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 rounded-full text-[10px] font-black uppercase tracking-[2px] text-black">
                                                    Most Popular
                                                </div>
                                            )}
                                            <h4 className="text-lg font-bold text-[var(--color-text-secondary)] mb-2">{plan.name}</h4>
                                            {plan.description && <p className="text-xs text-[var(--color-text-muted)] mb-4">{plan.description}</p>}
                                            <div className="text-4xl font-black text-[var(--color-text-primary)] mb-6 tracking-tighter">
                                                {plan.price === 0 ? "Free" : `$${plan.price.toLocaleString()}`}
                                                {plan.price > 0 && <span className="text-sm text-[var(--color-text-muted)] font-medium tracking-normal">{billingLabel}</span>}
                                            </div>
                                            <div className="space-y-3 mb-10 flex-1">
                                                {featureList.length > 0 ? (
                                                    featureList.map((f, i) => (
                                                        <div key={i} className="flex items-center gap-3 text-[13px] text-[var(--color-text-secondary)]">
                                                            <div className="w-4 h-4 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                                                <Check size={10} className="text-brand-500" />
                                                            </div>
                                                            <span className="line-clamp-2">{f}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-[var(--color-text-muted)]">Features will be configured by administrator.</p>
                                                )}
                                            </div>
                                            <Link
                                                href="/register"
                                                className={`w-full py-4 rounded-lg font-bold text-[14px] text-center transition-all ${
                                                    isPopular
                                                        ? 'bg-brand-500 text-[var(--color-text-primary)] hover:bg-brand-600 shadow-lg shadow-brand-500/30'
                                                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)]'
                                                }`}
                                            >
                                                {plan.price === 0 ? "Join Free" : "Get Started"}
                                            </Link>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Upcoming Events ─────────────────────────────────────────────── */}
                {events.length > 0 && (
                    <section className="py-[120px] px-6 max-w-[1440px] mx-auto border-t border-[var(--color-border)]">
                        <div className="flex bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-8 md:p-12 mb-20 overflow-hidden relative group/section shadow-[0_0_100px_rgba(34,197,94,0.05)]">
                            <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover/section:opacity-5 transition-opacity duration-1000">
                                <Globe size={400} />
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                                            Institutional <br /> <span className="text-[var(--color-text-muted)]">Roadmap</span>
                                        </h2>
                                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">Live Events & Summits</p>
                                    </div>
                                    <Link href="/events" className="group/link flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                                        Browse All Regions <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                                    </Link>
                                </div>

                                <div className={cn(
                                    "flex gap-8 pb-8 overflow-x-auto custom-scrollbar snap-x snap-mandatory",
                                    events.length > 1 ? "" : "justify-center"
                                )}>
                                    {events.map((evt: any, idx) => (
                                        <div 
                                            key={idx} 
                                            className={cn(
                                                "relative overflow-hidden rounded-lg border transition-all duration-500 group snap-center flex-shrink-0",
                                                evt.data?.isMajor 
                                                    ? "w-[85vw] md:w-[800px] p-10 md:p-16 bg-gradient-to-br from-brand-600/20 to-brand-600/10 border-brand-500/30" 
                                                    : "w-[85vw] md:w-[600px] p-8 md:p-12 bg-white/[0.02] border-[var(--color-border)] hover:border-[var(--color-border)]"
                                            )}
                                        >
                                            {evt.data?.banner && evt.data.isMajor && (
                                                <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={evt.data.banner} alt="" className="w-full h-full object-cover grayscale" />
                                                </div>
                                            )}

                                            <div className="relative z-10 flex flex-col justify-between h-full gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {evt.data?.category && (
                                                            <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-[9px] font-black text-brand-500 uppercase tracking-widest">
                                                                {evt.data.category}
                                                            </span>
                                                        )}
                                                        {evt.data?.region && (
                                                            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tight flex items-center gap-1.5">
                                                                <MapPin size={12} /> {evt.data.region} {evt.data.country && `• ${evt.data.country}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <h3 className={cn(
                                                        "font-black uppercase tracking-tight leading-tight",
                                                        evt.data?.isMajor ? "text-3xl md:text-5xl text-[var(--color-text-primary)]" : "text-2xl md:text-3xl text-[var(--color-text-primary)]"
                                                    )}>
                                                        {evt.title}
                                                    </h3>
                                                    
                                                    <p className="text-[var(--color-text-secondary)] text-sm md:text-base font-medium leading-relaxed line-clamp-3">
                                                        {evt.content}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                                    <div>
                                                        <div className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] italic tracking-tighter leading-none">
                                                            {evt.data?.startDate && new Date(evt.data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-[11px] font-black text-brand-500 uppercase tracking-[0.2em] mt-2">
                                                            {evt.data?.time}
                                                        </div>
                                                    </div>

                                                    <button className={cn(
                                                        "px-10 py-5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95",
                                                        evt.data?.isMajor 
                                                            ? "bg-brand-500 text-black shadow-brand-500/20 hover:bg-brand-400" 
                                                            : "bg-surface text-black hover:bg-white/90"
                                                    )}>
                                                        Reserve Your Seat
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Testimonials ────────────────────────────────────────────────── */}
                {testimonials.length > 0 && (
                    <section className="py-[120px] px-6 max-w-[1440px] mx-auto border-t border-[var(--color-border)] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-medium text-[var(--color-text-primary)] tracking-tighter mb-4">
                                {testimonialsSection?.heading || "Institutional Trust."}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-lg">{testimonialsSection?.subheading || "Hear from the traders utilizing our intelligence."}</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((tst, idx) => (
                                <div key={idx} className="p-8 rounded-lg bg-black/40 border border-[var(--color-border)] relative overflow-hidden group">
                                    <div className="text-brand-500/20 absolute top-6 right-6 font-instrument italic text-6xl leading-none">"</div>
                                    <div className="relative z-10 w-full mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-brand-500">
                                            <Check size={16}/> <span className="text-xs uppercase tracking-widest font-black">{testimonialsSection?.verifiedBadgeLabel || "Verified Trader"}</span>
                                        </div>
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] italic leading-relaxed mb-8 relative z-10 text-sm">
                                        "{tst.content}"
                                    </p>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 font-bold uppercase border border-brand-500/30">
                                            {tst.title.substring(0,2)}
                                        </div>
                                        <div>
                                            <div className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight">{tst.title}</div>
                                            {tst.data?.role && (
                                                <div className="text-brand-500/60 text-xs font-medium">{tst.data.role}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Risk & Transparency Hub ──────────────────────────────────────── */}
                <section id="transparency" className="py-[120px] px-6 max-w-[1440px] mx-auto border-t border-[var(--color-border)]">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-lg bg-white/[0.01] border border-[var(--color-border)]"
                        >
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight flex items-center gap-3">
                                <Globe size={20} className="text-brand-500/60" />
                                Market Data Sources
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                MMITPS INC is an informational platform dedicated to the synthesis of publicly available market data. We curate and organize key references into a clear, structured format to accelerate your research.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-10 rounded-lg bg-white/[0.01] border border-[var(--color-border)]"
                        >
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight flex items-center gap-3">
                                <BarChart3 size={20} className="text-brand-500/60" />
                                Risk & Statistics Explained
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                Win rate, drawdown, and expectancy are fundamental statistical concepts. We clarify these relationships through simplified articles and interactive calculators for illustrative and educational purposes only.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-10 rounded-lg bg-brand-500/5 border border-brand-500/10"
                        >
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight flex items-center gap-3">
                                <Calculator size={20} className="text-brand-500/60" />
                                A Long-Term Perspective
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-manrope italic">
                                Navigating financial markets involves inherent uncertainty. We champion a philosophy of long-term learning, focusing on enduring principles such as risk management and disciplined decision-making.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── FAQ Section ─────────────────────────────────────────────────── */}
                <section className="py-[160px] px-6 max-w-[1000px] mx-auto">
                    <h2 className="text-4xl font-medium text-[var(--color-text-primary)] mb-16 tracking-tight text-center">{faqSection?.heading || "Frequently Asked Questions"}</h2>
                    <div className="space-y-4">
                        {(faqSection?.items || [
                            { question: "Is MMITPS a broker?", answer: "No, MMITPS is a technology platform. We provide institutional data and AI analysis. You connect your own brokerage account via our secure API bridging." },
                            { question: "What data sources does COT follow?", answer: "We aggregate data directly from the CFTC and apply proprietary smoothing algorithms to reveal true institutional positioning." },
                            { question: "Can I cancel my subscription any time?", answer: "Yes, you can cancel at any time from your dashboard. Your access will remain active until the end of your billing cycle." },
                            { question: "Do you offer education for beginners?", answer: "Absolutely. Our MMITPS Academy covers everything from basic macro principles to advanced institutional order-flow analysis." }
                        ]).map((faq, idx) => (
                            <div key={idx} className="border border-[var(--color-border)] rounded-lg bg-white/[0.01] overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
                                >
                                    <span className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">{faq.question || faq.q}</span>
                                    <ChevronDown className={`text-[var(--color-text-muted)] transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {faqOpen === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-8 pb-8 text-[var(--color-text-secondary)] leading-relaxed overflow-hidden"
                                        >
                                            {faq.answer || faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Newsletter CTA ──────────────────────────────────────────────── */}
                <section className="px-6 py-[120px]">
                    <div className="max-w-[1240px] mx-auto p-[60px] md:p-[100px] rounded-lg bg-brand-500 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h2 className="text-4xl md:text-7xl font-black text-black tracking-tighter mb-8 max-w-4xl">
                                {newsletterSection?.heading || "Join the 1% of institutional traders."}
                            </h2>
                            <p className="text-black/60 text-xl font-bold mb-12 max-w-xl underline underline-offset-4 decoration-black/20">
                                {newsletterSection?.subheading || "Get our weekly alpha report delivered to your inbox every Sunday."}
                            </p>
                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col w-full max-w-lg gap-4">
                                <div className="flex w-full gap-3">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder={newsletterSection?.inputPlaceholder || "Enter your email"}
                                        disabled={newsletterStatus === "loading"}
                                        className="flex-1 px-6 py-4 rounded-lg bg-black/5 border-2 border-black/10 text-black placeholder:text-black/40 font-bold focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={newsletterStatus === "loading"}
                                        className="px-8 py-4 bg-surface rounded-lg text-[16px] font-black text-brand-600 hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-2"
                                    >
                                        {newsletterStatus === "loading" ? "Processing..." : (newsletterSection?.buttonLabel || "Secure Access")}
                                    </button>
                                </div>
                                {newsletterStatus !== "idle" && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-sm font-bold ${newsletterStatus === "success" ? "text-green-800" : "text-red-800"}`}
                                    >
                                        {newsletterMessage}
                                    </motion.p>
                                )}
                            </form>
                        </div>
                        {/* Abstract background shapes */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 font-black text-[300px] flex items-center justify-center whitespace-nowrap overflow-hidden select-none translate-y-10 group-hover:translate-y-0 transition-transform duration-1000">
                            MMITPS ALPHA MMITPS ALPHA
                        </div>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────────────────── */}
                <footer className="py-[120px] px-6 border-t border-[var(--color-border)] bg-black/40">
                    <div className="max-w-[1440px] mx-auto grid md:grid-cols-4 gap-[80px]">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-8">
                                <Logo size="md" />
                            </div>
                            <p className="text-[var(--color-text-muted)] max-w-md leading-relaxed text-sm">
                                {footerSection?.tagline || "High-performance trading signals, COT data aggregation, and institutional market intelligence. Built for the modern trader who demands precision and speed."}
                            </p>
                            <div className="flex gap-5 mt-10">
                                {(footerSection?.socialLinks || []).map((link, i) => (
                                    <Link key={i} href={link.url} className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-brand-500 transition-all">
                                        {link.platform === "Twitter" && <Twitter size={18} />}
                                        {link.platform === "LinkedIn" && <LinkedIn size={18} />}
                                        {link.platform === "Discord" && <Github size={18} />}
                                    </Link>
                                ))}
                                {!(footerSection?.socialLinks?.length) && (
                                    <>
                                        <Link href="#" className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-brand-500 transition-all"><Twitter size={18} /></Link>
                                        <Link href="#" className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-brand-500 transition-all"><LinkedIn size={18} /></Link>
                                        <Link href="#" className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-brand-500 transition-all"><Github size={18} /></Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {(footerSection?.columns || [
                            { heading: "Resources", links: [{ label: "Pricing Tiers", href: "#pricing" }, { label: "Academy Hub", href: "#academy" }, { label: "Performance Audit", href: "/performance" }, { label: "Join Platform", href: "/register" }] },
                            { heading: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Contact Us", href: "/contact" }] }
                        ]).map((col, i) => (
                            <div key={i}>
                                <h5 className="text-[10px] font-black uppercase tracking-[3px] text-[var(--color-text-muted)] mb-10">{col.heading}</h5>
                                <ul className="space-y-4 text-sm font-bold text-[var(--color-text-secondary)]">
                                    {col.links.map((link, j) => (
                                        <li key={j}><Link href={link.href} className="hover:text-brand-500">{link.label}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-[var(--color-border)]">
                            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] font-manrope italic">
                                <span className="text-brand-500/40 font-black uppercase tracking-widest mr-2">Disclaimer:</span>
                                {footerSection?.disclaimer || "The information on MMITPS INC is provided for general informational purposes only and does not constitute legal, financial, or professional advice. MMITPS INC accepts no liability for any loss or damage arising from reliance on the information contained within this site. Users are strongly advised to seek independent professional guidance and conduct their own due diligence before making any financial decisions."}
                            </p>
                        </div>
                    </div>

                    <div className="max-w-[1440px] mx-auto mt-[120px] pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[12px] font-bold text-[var(--color-text-muted)]">{footerSection?.copyright || "© 2026 MMITPS Institutional Trading Platform. All rights reserved."}</p>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{footerSection?.statusLabel || "Systems Functional"}</span>
                        </div>
                    </div>
                </footer>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@500&display=swap');
                .font-instrument { font-family: 'Instrument Serif', serif; }
                .font-manrope { font-family: 'Manrope', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>
        </div>
    );
}
