"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyMagicLinkContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying your secure link...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing verification token.");
            return;
        }

        async function verify() {
            try {
                // We use NextAuth's signIn with the custom "token" credential we added
                const result = await signIn("credentials", {
                    token,
                    redirect: false,
                    callbackUrl: "/dashboard",
                });

                if (result?.error) {
                    throw new Error(result.error);
                }

                setStatus("success");
                setMessage("Success! Redirecting you to the dashboard...");

                // Small delay before redirect
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } catch (err: unknown) {
                console.error("Verification error:", err);
                setStatus("error");
                setMessage(err instanceof Error ? err.message : "Failed to verify magic link. It may have expired.");
            }
        }

        verify();
    }, [token]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-surface px-4">
            <div className="w-full max-w-md bg-surface-2 border border-[var(--color-border)] p-10 rounded-lg shadow-2xl text-center">
                <div className="mb-8">
                    {status === "verifying" && (
                        <div className="w-16 h-16 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="text-amber-500 animate-spin" size={32} />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto">
                            <CheckCircle2 className="text-green-500" size={32} />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-16 h-16 bg-red-500/10 rounded-lg flex items-center justify-center mx-auto">
                            <XCircle className="text-red-500" size={32} />
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                    {status === "verifying" && "Security Verification"}
                    {status === "success" && "Identity Verified"}
                    {status === "error" && "Verification Failed"}
                </h1>

                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {message}
                </p>

                {status === "error" && (
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="mt-8 w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] font-bold rounded-lg transition-all border border-[var(--color-border)]"
                    >
                        Return to Sign In
                    </button>
                )}
            </div>
        </main>
    );
}

export default function VerifyMagicLinkPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-surface px-4">
                <div className="w-16 h-16 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="text-amber-500 animate-spin" size={32} />
                </div>
            </main>
        }>
            <VerifyMagicLinkContent />
        </Suspense>
    );
}
