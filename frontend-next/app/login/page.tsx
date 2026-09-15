"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { signIn } from "next-auth/react";
import { Github, LogIn, Chrome, Send, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"credentials" | "magic-link">("credentials");
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            window.location.href = "/dashboard";
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    async function handleMagicLinkRequest(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/magic-link`, {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to send magic link");
            setMagicLinkSent(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to send magic link");
        } finally {
            setLoading(false);
        }
    }

    const handleSocialLogin = (provider: "google" | "github") => {
        signIn(provider, { callbackUrl: "/dashboard" });
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-surface px-4">
            <div className="w-full max-w-md bg-surface-2 border border-[var(--color-border)] p-8 rounded-lg shadow-2xl">
                {/* Brand mark */}
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                        <LogIn className="text-amber-500" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                        {metaTitle(view, magicLinkSent)}
                    </h1>
                    <p className="mt-2 text-[var(--color-text-secondary)]">
                        {metaSubtitle(view, magicLinkSent)}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {magicLinkSent ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="text-green-500" size={32} />
                        </div>
                        <p className="text-[var(--color-text-secondary)] mb-8">We&apos;ve sent a secure login link to <strong className="text-[var(--color-text-primary)]">{email}</strong>. Please check your inbox.</p>
                        <button
                            onClick={() => setMagicLinkSent(false)}
                            className="text-amber-500 hover:text-amber-400 font-bold flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={16} /> Use another method
                        </button>
                    </div>
                ) : (
                    <>
                        {view === "credentials" ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-amber-500/50 transition-colors"
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)]">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setView("magic-link")}
                                            className="text-[10px] font-black uppercase tracking-[2px] text-amber-500 hover:text-[var(--color-text-primary)] transition-colors"
                                        >
                                            Forgot or Passwordless?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-amber-500/50 transition-colors pr-12"
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
                                    disabled={loading}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? "Signing in…" : <>Sign In <ArrowLeft className="rotate-180" size={18} /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleMagicLinkRequest} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[2px] text-[var(--color-text-muted)] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-amber-500/50 transition-colors"
                                        placeholder="name@company.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-[var(--color-border)]"
                                >
                                    {loading ? "Sending link…" : <>Send Magic Link <Send size={18} /></>}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView("credentials")}
                                    className="w-full text-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors pt-2"
                                >
                                    Sign in with password
                                </button>
                            </form>
                        )}

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--color-border)]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[2px]">
                                <span className="bg-surface-2 px-4 text-[var(--color-text-muted)]">or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSocialLogin("google")}
                                className="flex items-center justify-center gap-3 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] font-medium"
                            >
                                <Chrome size={20} className="text-red-400" /> Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin("github")}
                                className="flex items-center justify-center gap-3 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-3)] transition-all text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] font-medium"
                            >
                                <Github size={20} /> GitHub
                            </button>
                        </div>
                    </>
                )}

                <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="text-amber-500 hover:text-amber-400 font-bold underline underline-offset-4">
                        Register
                    </a>
                </p>
            </div>
        </main>
    );
}

function metaTitle(view: string, magicLinkSent: boolean) {
    if (magicLinkSent) return "Check your email";
    return view === "credentials" ? "Welcome back" : "Passwordless Sign In";
}

function metaSubtitle(view: string, magicLinkSent: boolean) {
    if (magicLinkSent) return "We sent you a secure link";
    return view === "credentials" ? "Sign in to MMITPS Institutional" : "Enter your email to receive a login link";
}
