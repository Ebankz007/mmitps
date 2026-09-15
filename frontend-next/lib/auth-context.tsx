"use client";

import {
    createContext,
    useContext,
    useEffect,
    type ReactNode,
} from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "super_admin" | "manager" | "trader" | "analyst" | "support" | "guest";

export interface AuthUser {
    id: string;
    _id?: string;
    email: string;
    username?: string;
    role: UserRole;
    tier?: string;
    activeServices?: string[];
    data?: Record<string, unknown>; // Additional user data from session
    preferences?: Record<string, unknown>;
    kycStatus?: string;
    rank?: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    extendSession: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Internal Provider ───────────────────────────────────────────────────────

function AuthInnerProvider({ children }: { children: ReactNode }) {
    const { data: session, status, update } = useSession();

    useEffect(() => {
        const token = (session as { accessToken?: string })?.accessToken;
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("jwt", token);
        } else if (status === "unauthenticated") {
            localStorage.removeItem("token");
            localStorage.removeItem("jwt");
        }
    }, [session, status]);

    const isLoading = status === "loading";
    const isAuthenticated = status === "authenticated";

    interface SessionUser {
        id?: string;
        sub?: string;
        role?: UserRole;
        tier?: string;
        activeServices?: string[];
        data?: Record<string, unknown>;
    }

    const sessionUser = session?.user as SessionUser;

    const user = session?.user ? {
        id: sessionUser.id || sessionUser.sub,
        email: session.user.email,
        role: sessionUser.role || "user",
        tier: sessionUser.tier || "Basic",
        activeServices: sessionUser.activeServices || [],
        data: sessionUser.data
    } as AuthUser : null;

    const isAdmin = isAuthenticated && ["admin", "super_admin"].includes(user?.role || "");

    const login = async (email: string, password: string) => {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
        }
    };

    const logout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const extendSession = async () => {
        await update();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token: (session as { accessToken?: string })?.accessToken || null,
                isLoading,
                isAuthenticated,
                isAdmin,
                login,
                logout,
                extendSession
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Exported Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthInnerProvider>{children}</AuthInnerProvider>
        </SessionProvider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

