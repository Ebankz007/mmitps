import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
    // 1. Auto-prefix relative URLs with /api/v1 if missing
    if (config.url && !config.url.startsWith('/api/v1') && !config.url.startsWith('http')) {
        config.url = `/api/v1${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    // 2. Try to get token from NextAuth session
    const session = await getSession();
    let token = (session as { accessToken?: string })?.accessToken;

    // 3. Fallback to localStorage (synchronized by AuthContext)
    if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('token') || localStorage.getItem('jwt');
    }

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response Interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.warn("Session expired or unauthorized. Logging out...");
            // Clear NextAuth session and redirect
            await signOut({ callbackUrl: "/login?reason=session_expired" });
        }
        return Promise.reject(error);
    }
);

export default api;
