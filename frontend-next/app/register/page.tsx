"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, ArrowRight, Eye, EyeOff, LayoutTemplate, Layers, MoveRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function RegisterPage() {
    // Step Management
    const [step, setStep] = useState<1 | 2>(1);

    // Tiers Data
    const [tiers, setTiers] = useState<any[]>([]);
    const [loadingTiers, setLoadingTiers] = useState(true);

    // Form State
    const [selectedTier, setSelectedTier] = useState<string>("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            // Next.js rewrites /api/v1/* → backend server (see next.config.js)
            const res = await fetch('/api/v1/plans');
            if (!res.ok) {
                console.warn("Plans endpoint unavailable, status:", res.status);
                return;
            }
            const json = await res.json();
            if (json.success) {
                // PG plans return `id` (UUID); the page uses `_id` (Mongo convention) — normalize once here
                const normalized = (json.data || []).map((p: any) => ({ ...p, _id: p._id || p.id }));
                setTiers(normalized);
                // Pre-select the free (Basic) plan or the first one
                if (normalized.length > 0) {
                    const freePlan = normalized.find((p: any) => p.price === 0);
                    setSelectedTier(freePlan?._id || normalized[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to load plans", err);
        } finally {
            setLoadingTiers(false);
        }
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phone,
                    tierId: selectedTier
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Registration failed");
            }

            // Simple mock of payment bypass/routing
            const chosen = tiers.find(t => t._id === selectedTier);
            if (chosen && chosen.price > 0) {
                // Conceptually redirect to Checkout / Payment holding page
                window.location.href = `/login?registered=true&checkout=${chosen._id}`;
            } else {
                window.location.href = "/login?registered=true";
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
            <div className={clsx("w-full bg-surface-2 border border-[var(--color-border)] rounded-lg shadow-2xl transition-all duration-500", step === 1 ? "max-w-4xl p-8 md:p-12" : "max-w-md p-8")}>

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 bg-brand-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Layers className="text-brand-500" size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight uppercase">Select Your Access Tier</h1>
                            <p className="mt-2 text-[var(--color-text-secondary)] text-sm font-bold">Choose your foundational tier. Higher tiers unlock deeper commissions and advanced features.</p>
                        </div>

                        {loadingTiers ? (
                            <div className="text-center py-12 text-brand-500 animate-pulse font-bold tracking-widest uppercase text-xs">Loading Plans...</div>
                        ) : tiers.length === 0 ? (
                            <div className="col-span-4 text-center py-12 text-[var(--color-text-secondary)]">
                                <p className="font-bold text-sm">No plans available. Please contact support.</p>
                            </div>
                        ) : (
                        <div className="flex flex-wrap justify-center gap-6">
                                {tiers.map((plan: any) => {
                                    // Normalize features for display
                                    const featureCount = Array.isArray(plan.features)
                                        ? plan.features.length
                                        : Object.values(plan.features || {}).filter(Boolean).length;
                                    const menuCount = plan.allowedMenus?.length || 0;

                                    return (
                                        <div
                                            key={plan._id}
                                            onClick={() => setSelectedTier(plan._id)}
                                            className={clsx(
                                                "relative cursor-pointer rounded-lg p-6 border transition-all duration-300 flex flex-col w-full md:w-[280px]",
                                                selectedTier === plan._id
                                                    ? "bg-brand-600/10 border-brand-500 shadow-[0_0_30px_rgba(16, 185, 129,0.2)]"
                                                    : "bg-white/[0.02] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                                            )}
                                        >
                                            {selectedTier === plan._id && (
                                                <div className="absolute top-4 right-4 text-brand-500">
                                                    <CheckCircle2 size={24} fill="currentColor" className="text-[#141414]" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4">
                                                <div className="text-[10px] font-black uppercase tracking-[2px] text-gray-500">
                                                    {plan.type === 'membership' ? 'Registration' : 'Service'}
                                                </div>
                                                <h3 className="text-xl font-black text-[var(--color-text-primary)] uppercase">{plan.name}</h3>
                                                <div className="text-3xl font-black text-brand-400">
                                                    {plan.price === 0 ? 'Free' : `$${plan.price.toLocaleString()}`}
                                                    <span className="text-[10px] text-gray-500 tracking-widest uppercase block mt-1">
                                                        {plan.interval === 'lifetime' ? 'One Time' : plan.interval || 'One Time'}
                                                    </span>
                                                </div>
                                                {plan.description && (
                                                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">{plan.description}</p>
                                                )}
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest">
                                                    <span className="text-gray-500 uppercase">Features</span>
                                                    <span className="text-[var(--color-text-primary)]">{featureCount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest">
                                                    <span className="text-gray-500 uppercase">Sections</span>
                                                    <span className="text-[var(--color-text-primary)]">{menuCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedTier}
                                className="px-12 py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
                            >
                                Continue to Profile <MoveRight size={18} />
                            </button>
                        </div>
                        <div className="mt-8 text-center">
                            <Link href="/login" className="text-[10px] font-bold text-gray-500 hover:text-[var(--color-text-primary)] uppercase tracking-widest transition-colors">
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[var(--color-text-primary)] transition-colors"
                        >
                            <ChevronLeft size={14} /> Back to Tier Selection
                        </button>

                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Profile Details</h2>
                            <p className="mt-2 text-[var(--color-text-secondary)] text-xs font-bold">You selected {tiers.find(t => t._id === selectedTier)?.name}.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 transition-colors"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 transition-colors"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 transition-colors"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-brand-500/50 transition-colors pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedTier}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-black uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center gap-2 mt-6 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
                            >
                                {loading ? "Processing..." : <>Complete Registration <ArrowRight size={14} /></>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
