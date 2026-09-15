import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// ─── Protected route config ───────────────────────────────────────────────────
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/api/auth", "/api/v1/plans", "/api/v1/tiers", "/api/v1/cms", "/privacy", "/terms", "/contact", "/performance", "/events"];

const ADMIN_PATHS = ["/admin"];

function isPublic(pathname: string): boolean {
    if (pathname === "/") return true;
    return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAdminPath(pathname: string): boolean {
    return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

// ─── Geo-Restriction Mappings ───────────────────────────────────────────────────
const MODULE_PATHS: Record<string, string[]> = {
    tokenization: ["/tokenization", "/dashboard/tokenization", "/pools"],
    copytrading: ["/copy-trading", "/dashboard/copy-trading"],
    crypto: ["/market", "/dashboard/market"],
    leverage: ["/trading", "/dashboard/trading"],
    mlm: ["/genealogy", "/dashboard/affiliate"],
    global: ["/dashboard"]
};

// ─── Middleware ──────────────────────────────────────────────────────────────
export default auth(async (req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;
    const kycCountry = (req.auth?.user as any)?.country;

    // 1. Redirect logged-in users away from auth pages (but allow landing page /)
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        const redirectUrl = new URL(
            ["admin", "super_admin"].includes(userRole) ? "/admin" : "/dashboard",
            req.nextUrl.origin
        );
        return NextResponse.redirect(redirectUrl);
    }

    // 3. Always allow public paths (excluding root if already handled above)
    if (isPublic(pathname)) return NextResponse.next();

    // 3. No session → redirect to login
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Role-based protection for /admin
    if (isAdminPath(pathname)) {
        const adminRoles = ["admin", "super_admin"];
        if (!userRole || !adminRoles.includes(userRole)) {
            const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // 5. Apply Geo-Restrictions (Skip for Admins)
    const isAdmin = ["admin", "super_admin"].includes(userRole);
    if (!isAdmin && pathname !== "/region-blocked" && !isPublic(pathname)) {
        try {
            // Fetch cached geo-config
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/system/geo-restrictions`, {
                next: { revalidate: 300 } // Cache for 5 minutes
            });
            if (res.ok) {
                const result = await res.json();
                const geoConfig = result.data?.value;

                if (geoConfig) {
                    const ipCountry = req.headers.get("x-vercel-ip-country") || "UNKNOWN";
                    const kycCountryCode = kycCountry ? kycCountry.toUpperCase() : "UNKNOWN";
                    const userCountries = [ipCountry, kycCountryCode];

                    for (const [modKey, paths] of Object.entries(MODULE_PATHS)) {
                        const config = geoConfig[modKey];
                        if (!config || !config.enabled) continue;

                        if (paths.some(p => pathname.startsWith(p))) {
                            const blocked = config.blockedCountries || [];
                            if (userCountries.some(c => blocked.includes(c))) {
                                return NextResponse.redirect(new URL("/region-blocked", req.nextUrl.origin));
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Geo-blocking fetch error in middleware:", e);
        }
    }

    // 6. Dashboard access for all authorized roles
    // No explicit block here, so any logged-in user can access /dashboard

    // 6. Forward role in header for Server Components
    const response = NextResponse.next();
    if (userRole) {
        response.headers.set("x-user-role", userRole);
    }
    return response;
});

// ─── Matcher — protect all routes except static assets ───────────────────────
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|icons|images|fonts).*)",
    ],
};
