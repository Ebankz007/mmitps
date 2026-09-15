/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import {
    ShoppingBag,
    Check,
    X,
    ArrowRight,
    Search,
    HelpCircle,
    ChevronDown,
    Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Plan {
    _id: string;
    name: string;
    code: string;
    price: number;
    currency: string;
    type: 'membership' | 'service';
    interval: 'month' | 'quarter' | 'year' | 'lifetime';
    allowedServices?: string[];
    description?: string;
}

export default function PurchasePage() {
    const { user, extendSession } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get("/api/v1/subscriptions/plans");
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch plans", err);
            toast.error("Failed to load available plans");
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (plan: Plan) => {
        setPurchasing(plan._id);
        try {
            const res = await api.post("/api/v1/subscriptions/subscribe", {
                planCode: plan.code,
                billingCycle
            });

            if (res.data.success) {
                toast.success(`Successfully subscribed to ${plan.name}`);
                await extendSession(); // Refresh session to update user tier
            }
        } catch (err: any) {
            console.error("Purchase failed", err);
            toast.error(err.response?.data?.message || "Purchase failed. Please check your eligibility.");
        } finally {
            setPurchasing(null);
        }
    };

    const tiers = [
        {
            name: "STARTER",
            price: 0,
            desc: "Forever free",
            features: [
                { text: "5 Basic Calculators", included: true },
                { text: "3 Trading Strategies", included: true },
                { text: "Basic Market Data", included: true },
                { text: "Copy Trading", included: false },
                { text: "AI Analysis", included: false },
                { text: "Priority Support", included: false },
            ],
            buttonText: "Current Plan",
            isCurrent: user?.tier?.toLowerCase() === 'free' || !user?.tier,
            style: "border-[var(--color-border)] bg-[#0B0E14]",
            textColor: "text-[var(--color-text-primary)]"
        },
        {
            name: "BASIC",
            price: 19,
            desc: "Billed monthly",
            features: [
                { text: "All 30+ Calculators", included: true },
                { text: "15 Trading Strategies", included: true },
                { text: "Real-time Market Data", included: true },
                { text: "Basic Copy Trading", included: true },
                { text: "AI Analysis", included: false },
                { text: "Priority Support", included: false },
            ],
            buttonText: "Subscribe",
            isCurrent: user?.tier?.toLowerCase() === 'basic',
            style: "border-[var(--color-border)] bg-[#0B0E14]",
            buttonStyle: "bg-gradient-to-r from-blue-600 to-brand-600",
            textColor: "text-brand-500"
        },
        {
            name: "PROFESSIONAL",
            price: 49,
            desc: "Billed monthly",
            popular: true,
            features: [
                { text: "Everything in Basic", included: true },
                { text: "All 31 Strategies", included: true },
                { text: "AI Market Analysis", included: true },
                { text: "Full Copy Trading", included: true },
                { text: "Trade Journal Pro", included: true },
                { text: "Priority Support", included: true },
            ],
            buttonText: "Subscribe Now",
            isCurrent: user?.tier?.toLowerCase() === 'professional',
            style: "border-[#10b981]/50 bg-[#0B0E14] shadow-[0_0_30px_rgba(99,102,241,0.1)]",
            buttonStyle: "bg-gradient-to-r from-brand-500 to-brand-400",
            textColor: "text-[#10b981]"
        },
        {
            name: "ENTERPRISE",
            price: 149,
            desc: "Billed monthly",
            features: [
                { text: "Everything in Pro", included: true },
                { text: "White-label Options", included: true },
                { text: "API Access", included: true },
                { text: "Dedicated VPS", included: true },
                { text: "Personal Account Manager", included: true },
                { text: "24/7 Phone Support", included: true },
            ],
            buttonText: "Contact Sales",
            isCurrent: user?.tier?.toLowerCase() === 'enterprise',
            style: "border-[var(--color-border)] bg-[#0B0E14]",
            buttonStyle: "bg-gradient-to-r from-brand-500 to-rose-500",
            textColor: "text-brand-500"
        }
    ];

    const faqs = [
        {
            q: "Can I cancel anytime?",
            a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
        },
        {
            q: "Do you offer refunds?",
            a: "We offer a 7-day money-back guarantee for all paid plans. Contact support within 7 days of purchase for a full refund."
        },
        {
            q: "Can I switch plans?",
            a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated on your next billing cycle."
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse text-sm uppercase tracking-widest">Loading Strategic Plans...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Nav Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                <ShoppingBag className="h-3 w-3 text-emerald-500" />
                <span>Financial</span>
                <span className="text-gray-700 mx-1">&gt;</span>
                <span className="text-emerald-400">Purchase</span>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black tracking-tighter text-emerald-400 flex items-center justify-center gap-3">
                    Choose Your Plan
                </h1>
                <p className="text-gray-400 text-sm font-medium">Select the perfect plan for your trading journey</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 py-4">
                <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-full p-1.5 flex items-center shadow-inner">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-xs font-bold transition-all",
                            billingCycle === 'monthly' ? "bg-emerald-500 text-[var(--color-text-primary)] shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                            billingCycle === 'yearly' ? "bg-emerald-500 text-[var(--color-text-primary)] shadow-lg shadow-emerald-500/20" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        Yearly
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {tiers.map((t) => (
                    <div
                        key={t.name}
                        className={cn(
                            "relative flex flex-col border rounded-lg p-8 transition-all duration-300 hover:-translate-y-2",
                            t.style
                        )}
                    >
                        {t.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-600 text-[var(--color-text-primary)] text-[9px] font-black uppercase tracking-widest shadow-xl">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="text-center mb-10">
                            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4 block", t.textColor)}>{t.name}</span>
                            <div className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter mb-1">
                                {t.price === 0 ? "Free" : `$${billingCycle === 'yearly' ? Math.floor(t.price * 0.8) : t.price}`}
                                {t.price > 0 && <span className="text-xs text-gray-500 font-bold ml-1">/mo</span>}
                            </div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t.desc}</p>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {t.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {f.included ? (
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <X className="h-4 w-4 text-gray-800 shrink-0" />
                                    )}
                                    <span className={cn("text-xs font-medium", f.included ? "text-gray-300" : "text-gray-700")}>{f.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={t.isCurrent || (t.name === "ENTERPRISE" && !purchasing)}
                            onClick={() => {
                                if (t.name === "ENTERPRISE") {
                                    window.open("mailto:support@mmitps.com?subject=Enterprise Plan Inquiry");
                                } else {
                                    // Map tier to plan from API
                                    const matchingPlan = plans.find(p => p.name.toUpperCase() === t.name);
                                    if (matchingPlan) handlePurchase(matchingPlan);
                                    else toast.error("Plan configuration not found on server");
                                }
                            }}
                            className={cn(
                                "w-full py-4 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all",
                                t.isCurrent
                                    ? "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-gray-500 cursor-default"
                                    : (t.buttonStyle || "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-surface hover:text-black")
                            )}
                        >
                            {purchasing && plans.find(p => p.name.toUpperCase() === t.name)?._id === purchasing ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (t.isCurrent ? "Current Plan" : t.buttonText)}
                        </button>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-8 md:p-12 shadow-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-brand-400" />
                    <h2 className="text-[var(--color-text-primary)] font-black tracking-tight text-xl uppercase italic">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-6">
                    {faqs.map((f, i) => (
                        <div key={i} className="space-y-2 border-b border-[var(--color-border)] pb-6 last:border-0 last:pb-0">
                            <h3 className="text-[var(--color-text-primary)] font-black text-sm">{f.q}</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">{f.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Trust Banner */}
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale pt-10">
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Instant Activation</span>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">24/7 Monitoring</span>
                </div>
            </div>
        </div>
    );
}
