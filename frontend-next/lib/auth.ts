import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                token: { label: "Token", type: "text" }, // For magic link login
            },
            async authorize(credentials) {
                try {
                    // Logic for token-based login (Magic Link)
                    if (credentials?.token) {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);

                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-magic-link`, {
                            method: "POST",
                            body: JSON.stringify({ token: credentials.token }),
                            headers: { "Content-Type": "application/json" },
                            signal: controller.signal,
                        });
                        
                        clearTimeout(timeoutId);
                        const result = await res.json();
                        if (res.ok && result.success) {
                            return {
                                id: result.data.user.id || result.data.user._id,
                                email: result.data.user.email,
                                role: result.data.user.role,
                                accessToken: result.data.token,
                                user: result.data.user,
                            };
                        }
                    }

                    // Standard Email/Password login
                    if (!credentials?.email || !credentials?.password) return null;

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
                        method: "POST",
                        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
                        headers: { "Content-Type": "application/json" },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);
                    const result = await res.json();
                    console.log(`[DEBUG AUTH] Login result for ${credentials.email}:`, result);

                    if (res.ok && result.success && result.data?.token) {
                        console.log(`[DEBUG AUTH] Login successful. User: ${result.data.user.email}`);
                        return {
                            id: result.data.user.id || result.data.user._id,
                            email: result.data.user.email,
                            role: result.data.user.role,
                            accessToken: result.data.token,
                            user: result.data.user,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    // Sync social user with backend
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/social-sync`, {
                        method: "POST",
                        body: JSON.stringify({
                            email: user.email,
                            firstName: (profile as { given_name?: string })?.given_name || (user.name?.split(" ")[0]) || "",
                            lastName: (profile as { family_name?: string })?.family_name || (user.name?.split(" ").slice(1).join(" ")) || "",
                            provider: account.provider,
                            providerId: account.providerAccountId,
                            avatar: user.image
                        }),
                        headers: { "Content-Type": "application/json" },
                        signal: controller.signal,
                    });
                    
                    clearTimeout(timeoutId);
                    const result = await res.json();
                    if (res.ok && result.success) {
                        // Attach backend token and data to the user object for the JWT callback
                        (user as { accessToken?: string }).accessToken = result.data.token;
                        (user as { userData?: unknown }).userData = result.data.user;
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Social sync error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger }) {
            // 1. Handle Initial Sign In
            if (user) {
                const castedUser = user as {
                    accessToken?: string;
                    role?: string;
                    userData?: {
                        role?: string;
                        membershipTier?: string;
                        activeServices?: string[];
                        subscription?: { plan?: { name?: string } }
                    }
                };
                const userData = castedUser.userData;
                token.accessToken = castedUser.accessToken;
                token.role = castedUser.role || userData?.role || "user";
                token.tier = userData?.membershipTier || userData?.subscription?.plan?.name || "Basic";
                token.activeServices = userData?.activeServices || [];
                token.country = userData?.profile?.country || null;
                token.userData = userData;
            }

            // 2. Handle Refresh token logic for "Extend Stay" update trigger
            if (trigger === "update" && token.accessToken) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-session`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token.accessToken}`,
                            "Content-Type": "application/json"
                        },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);
                    const result = await res.json();
                    if (res.ok && result.success) {
                        token.accessToken = result.data.token;
                        // Refresh user data if included in response
                        if (result.data.user) {
                            token.tier = result.data.user.membershipTier || "Basic";
                            token.activeServices = result.data.user.activeServices || [];
                        }
                    }
                } catch (error) {
                    console.error("Token refresh error during update:", error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                const s = session as { accessToken?: unknown; user: { id?: unknown; role?: unknown; tier?: unknown; activeServices?: string[]; data?: unknown } };
                s.accessToken = token.accessToken;
                s.user.id = token.sub;
                s.user.role = token.role;
                s.user.tier = token.tier;
                s.user.activeServices = (token.activeServices as string[]) || [];
                s.user.country = token.country;
                s.user.data = token.userData;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days (to support expanded durations)
    },
    secret: process.env.AUTH_SECRET,
});
