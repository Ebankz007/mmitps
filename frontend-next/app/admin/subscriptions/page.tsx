"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Subscription {
    _id: string;
    user: {
        _id: string;
        email: string;
        username?: string;
    };
    plan: {
        _id: string;
        name: string;
        price: number;
    };
    status: "active" | "canceled" | "past_due" | "trialing";
    startDate: string;
    endDate: string;
    nextBillingDate?: string;
}

interface Meta { total: number; page: number; pages: number; }

interface SubStats {
    total: number;
    active: number;
    canceled: number;
    revenue: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, { bg: string; color: string }> = {
        active: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
        canceled: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
        past_due: { bg: "rgba(16, 185, 129,0.15)", color: "#10b981" },
        trialing: { bg: "rgba(16, 185, 129,0.15)", color: "#10b981" },
    };
    const style = colorMap[status] ?? { bg: "rgba(255,255,255,0.06)", color: "#a0a0a0" };
    return (
        <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", ...style }}>
            {status.replace("_", " ")}
        </span>
    );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
    return (
        <div className="card" style={accent ? { borderColor: "var(--color-border-brand)" } : undefined}>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                {label}
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: accent ? "var(--color-brand)" : "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
                {value}
            </p>
            {sub && <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{sub}</p>}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [stats, setStats] = useState<SubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1 });

    const fetchSubs = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 20 };
            if (search) params.search = search;
            if (statusFilter !== "all") params.status = statusFilter;

            const [subsRes, statsRes] = await Promise.all([
                api.get("/api/v1/admin/subscriptions", { params }),
                api.get("/api/v1/admin/subscriptions/stats")
            ]);

            const subsData = subsRes.data.data ?? subsRes.data;
            setSubs(Array.isArray(subsData) ? subsData : subsData.subscriptions ?? []);
            if (subsRes.data.pagination) setMeta(subsRes.data.pagination);

            setStats(statsRes.data.data ?? statsRes.data);
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchSubs(); }, [fetchSubs]);

    const formatDate = (s: string) => {
        if (!s) return "—";
        return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const fmtMoney = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Subscriptions</h1>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Monitor and manage user billing
                </p>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {!stats ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="card" style={{ height: "100px", background: "rgba(255,255,255,0.02)" }} />)
                ) : (
                    <>
                        <StatCard label="Total Subscriptions" value={stats.total} />
                        <StatCard label="Active" value={stats.active} accent />
                        <StatCard label="Canceled" value={stats.canceled} />
                        <StatCard label="Monthly Revenue" value={fmtMoney(stats.revenue)} />
                    </>
                )}
            </div>

            {/* ── Filters ── */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ flex: "1 1 240px", padding: "8px 12px", fontSize: "13px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-primary)", outline: "none" }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    style={{ padding: "8px 12px", fontSize: "13px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-primary)", outline: "none" }}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="canceled">Canceled</option>
                    <option value="past_due">Past Due</option>
                    <option value="trialing">Trialing</option>
                </select>
                <button onClick={fetchSubs} style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 600, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                    Refresh
                </button>
            </div>

            {/* ── Table ── */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
                                {["User", "Plan", "Status", "Started", "Next Billing / Ends", "Actions"].map((h) => (
                                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} style={{ padding: "12px 14px" }}>
                                                <div style={{ height: "12px", width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : subs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>No subscriptions found</td>
                                </tr>
                            ) : (
                                subs.map((sub) => (
                                    <tr key={sub._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        <td style={{ padding: "12px 14px" }}>
                                            <p style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{sub.user?.email}</p>
                                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{sub.user?._id}</p>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <p style={{ color: "var(--color-text-primary)" }}>{sub.plan?.name}</p>
                                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{fmtMoney(sub.plan?.price)}/mo</p>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                            {formatDate(sub.startDate)}
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                            {formatDate(sub.nextBillingDate || sub.endDate)}
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <button style={{ padding: "4px 8px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {meta.pages > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--color-border)", fontSize: "12px", color: "var(--color-text-muted)" }}>
                        <span>Page {meta.page} of {meta.pages}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "4px 12px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}>Prev</button>
                            <button disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)} style={{ padding: "4px 12px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: page >= meta.pages ? "not-allowed" : "pointer", opacity: page >= meta.pages ? 0.4 : 1 }}>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
