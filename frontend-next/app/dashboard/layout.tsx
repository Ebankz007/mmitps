/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SecurityNotice } from "@/components/security/SecurityNotice";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?reason=session_expired");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-surface dark:bg-surface transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse uppercase tracking-widest">Initialising Dashboard...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-surface dark:bg-surface overflow-hidden transition-colors duration-300">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#030508] transition-colors duration-300">
                    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-10">
                        {children}
                        <SecurityNotice />
                    </div>
                </main>
            </div>
        </div>
    );
}

