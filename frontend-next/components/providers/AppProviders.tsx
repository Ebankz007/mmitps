"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { ForensicOverlay } from "@/components/security/ForensicOverlay";

export function AppProviders({ children }: { children: ReactNode }) {
    // Use useState to ensure QueryClient is stable across re-renders
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 2,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <ForensicOverlay />
                        <SocketProvider>
                            <Toaster richColors position="top-right" />
                            {children}
                        </SocketProvider>
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
