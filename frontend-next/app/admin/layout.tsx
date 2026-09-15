import type { Metadata } from "next";
import AdminSidebar from "@/components/layout/AdminSidebar";

export const metadata: Metadata = {
    title: { default: "Admin Console", template: "%s | MMITPS Admin" },
};

// ─── Admin Shell Layout ────────────────────────────────────────────────────────
// Note: Client-side auth guard is handled by middleware.ts (cookie check).
// This layout only handles the visual shell.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
            <AdminSidebar />

            {/* Main content offset by sidebar width */}
            <div
                style={{
                    marginLeft: "var(--sidebar-width, 240px)",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                {/* Top bar */}
                <header
                    style={{
                        height: "var(--topbar-height, 60px)",
                        borderBottom: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 1.5rem",
                        position: "sticky",
                        top: 0,
                        zIndex: 40,
                        gap: "1.5rem"
                    }}
                >
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "monospace", flexShrink: 0 }}>
                        ADMIN CONSOLE
                    </p>

                    <a
                        href="/dashboard"
                        className="exit-admin-link"
                        style={{
                            fontSize: "11px",
                            color: "var(--color-brand)",
                            textDecoration: "none",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            background: "rgba(16, 185, 129,0.05)",
                            borderRadius: "4px",
                            border: "1px solid rgba(16, 185, 129,0.1)",
                            transition: "all 0.2s ease"
                        }}
                    >
                        ← Exit Admin Console
                    </a>

                    <style>{`
                        .exit-admin-link:hover {
                            background: rgba(16, 185, 129,0.1) !important;
                        }
                    `}</style>

                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                        <span
                            style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                background: "rgba(16, 185, 129,0.1)",
                                color: "var(--color-brand)",
                                borderRadius: "2px",
                                letterSpacing: "0.08em",
                            }}
                        >
                            ADMIN
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: "1.5rem", maxWidth: "var(--content-max-width, 1400px)" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
