"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { AdminTradingAPI } from "@/lib/api/admin-trading";
import { Shield, ShieldAlert, CheckCircle2, Monitor, Server } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
    _id: string;
    email: string;
    username?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    kycStatus?: string;
    subscription?: { plan?: string; status?: string };
}

interface Meta { total: number; page: number; pages: number; }

// ─── Role badge helper ────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
    const colorMap: Record<string, { bg: string; color: string }> = {
        super_admin: { bg: "rgba(16, 185, 129,0.15)", color: "#10b981" },
        admin: { bg: "rgba(16, 185, 129,0.15)", color: "#10b981" },
        user: { bg: "rgba(255,255,255,0.06)", color: "#a0a0a0" },
    };
    const style = colorMap[role] ?? colorMap.user;
    return (
        <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", ...style }}>
            {role.toUpperCase().replace("_", " ")}
        </span>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
    return (
        <span className={active ? "badge-positive" : "badge-negative"}>
            {active ? "Active" : "Inactive"}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [providerProfile, setProviderProfile] = useState<any>(null);
    const [tradingAccounts, setTradingAccounts] = useState<any[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Mock/Fetch current user role for UI locking
    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await api.get("/api/v1/auth/me");
                setIsSuperAdmin(res.data.data.role === "super_admin");
            } catch (err) { console.error("Identity check failed", err); }
        };
        checkRole();
    }, []);

    useEffect(() => {
        if (selected) {
            setLoadingProfile(true);
            Promise.all([
                AdminTradingAPI.getProviderByUserId(selected._id),
                AdminTradingAPI.getAccountsByUserId(selected._id)
            ]).then(([pRes, aRes]) => {
                setProviderProfile(pRes.data);
                setTradingAccounts(aRes.data);
            }).catch(err => console.error("Failed to fetch trading context", err))
                .finally(() => setLoadingProfile(false));
        } else {
            setProviderProfile(null);
            setTradingAccounts([]);
        }
    }, [selected]);

    const handleMasterTraderToggle = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            const currentStatus = providerProfile?.isProvider || false;
            const res = await AdminTradingAPI.toggleProviderStatus(selected._id, !currentStatus);
            setProviderProfile(res.data);
        } catch (err) {
            console.error("Failed to toggle provider status", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyToggle = async () => {
        if (!providerProfile) return;
        setActionLoading(true);
        try {
            const res = await AdminTradingAPI.toggleVerification(providerProfile._id, !providerProfile.verified);
            setProviderProfile(res.data);
        } catch (err) {
            console.error("Failed to toggle verification", err);
        } finally {
            setActionLoading(false);
        }
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 20 };
            if (search) params.search = search;
            if (roleFilter !== "all") params.role = roleFilter;

            const res = await api.get("/api/v1/admin/users", { params });
            const data = res.data.data ?? res.data;
            setUsers(Array.isArray(data) ? data : data.users ?? []);
            if (res.data.pagination) setMeta(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    async function toggleStatus(user: User) {
        setActionLoading(true);
        try {
            await api.put(`/api/v1/admin/users/${user._id}`, { isActive: !user.isActive });
            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
            );
            if (selected?._id === user._id) setSelected((prev) => prev ? { ...prev, isActive: !prev.isActive } : null);
        } catch (err) {
            console.error("Failed to toggle status", err);
        } finally {
            setActionLoading(false);
        }
    }

    const formatDate = (s: string) =>
        new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    async function updateRole(userId: string, newRole: string) {
        setActionLoading(true);
        try {
            await api.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
            if (selected?._id === userId) setSelected((prev) => prev ? { ...prev, role: newRole } : null);
        } catch (err) {
            console.error("Failed to update role", err);
            alert("Failed to update role. Ensure you have Super Admin privileges.");
        } finally {
            setActionLoading(false);
        }
    }

    const ALL_ROLES = ['user', 'admin', 'super_admin', 'manager', 'trader', 'analyst', 'support', 'guest', 'provider', 'instructor'];

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Users</h1>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        {meta.total.toLocaleString()} total users
                    </p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: "10px 20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: "var(--color-brand)",
                            color: "#000",
                            border: "none",
                            borderRadius: "2px",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}
                    >
                        + Add Staff
                    </button>
                )}
            </div>

            {/* ── Filters ── */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search by email or username…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{
                        flex: "1 1 240px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "2px",
                        color: "var(--color-text-primary)",
                        outline: "none",
                    }}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    style={{
                        padding: "8px 12px",
                        fontSize: "13px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "2px",
                        color: "var(--color-text-primary)",
                        outline: "none",
                    }}
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                <button
                    onClick={fetchUsers}
                    style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "2px",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* ── Table ── */}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
                                {["Email", "Username", "Role", "Status", "KYC", "Plan", "Joined", "Actions"].map((h) => (
                                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} style={{ padding: "12px 14px" }}>
                                                <div style={{ height: "12px", width: `${40 + (j * 15) % 40}%`, background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.1s" }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                                    >
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-primary)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                            {user.username ?? "—"}
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <StatusBadge active={user.isActive} />
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                            <span className={
                                                user.kycStatus === "verified" ? "badge-positive"
                                                    : user.kycStatus === "rejected" ? "badge-negative"
                                                        : user.kycStatus === "pending" ? "badge-warning"
                                                            : "badge-neutral"
                                            }>
                                                {user.kycStatus ?? "None"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                            {user.subscription?.plan ?? "Free"}
                                        </td>
                                        <td style={{ padding: "12px 14px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    onClick={() => setSelected(user)}
                                                    style={{ padding: "4px 10px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: "pointer" }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/admin/users/${user._id}/wallet`}
                                                    style={{ padding: "4px 10px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-brand)", cursor: "pointer" }}
                                                >
                                                    Wallet
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(user)}
                                                    disabled={actionLoading}
                                                    style={{ padding: "4px 10px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: user.isActive ? "#ef4444" : "#22c55e", cursor: "pointer" }}
                                                >
                                                    {user.isActive ? "Disable" : "Enable"}
                                                </button>
                                            </div>
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
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: "4px 12px", fontSize: "12px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}>
                                ← Prev
                            </button>
                            <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)} style={{ padding: "4px 12px", fontSize: "12px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: page >= meta.pages ? "not-allowed" : "pointer", opacity: page >= meta.pages ? 0.4 : 1 }}>
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── User Detail Modal ── */}
            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "2px", width: "100%", maxWidth: "520px", animation: "fade-in 0.2s ease-out" }}
                    >
                        {/* Modal header */}
                        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>User Profile</p>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>{selected.email}</p>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: "1.5rem", display: "grid", gap: "12px" }}>
                            {[
                                { label: "User ID", value: selected._id },
                                { label: "Username", value: selected.username ?? "—" },
                                { label: "Role", value: isSuperAdmin ? (
                                    <select
                                        value={selected.role}
                                        onChange={(e) => updateRole(selected._id, e.target.value)}
                                        disabled={actionLoading}
                                        style={{
                                            padding: "4px 8px",
                                            fontSize: "11px",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "2px",
                                            color: "var(--color-text-primary)",
                                            outline: "none"
                                        }}
                                    >
                                        {ALL_ROLES.map(r => <option key={r} value={r}>{r.toUpperCase().replace('_', ' ')}</option>)}
                                    </select>
                                ) : <RoleBadge role={selected.role} /> },
                                { label: "Status", value: <StatusBadge active={selected.isActive} /> },
                                { label: "KYC", value: <span className={selected.kycStatus === "verified" ? "badge-positive" : selected.kycStatus === "rejected" ? "badge-negative" : "badge-neutral"}>{selected.kycStatus ?? "None"}</span> },
                                { label: "Plan", value: selected.subscription?.plan ?? "Free" },
                                { label: "Sub Status", value: selected.subscription?.status ?? "—" },
                                { label: "Joined", value: formatDate(selected.createdAt) },
                            ].map((row) => (
                                <div key={row.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                                    <span style={{ fontSize: row.label === "User ID" ? "11px" : "13px", color: "var(--color-text-primary)", fontFamily: row.label === "User ID" ? "monospace" : undefined }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}

                            {/* Social Trading Section */}
                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--color-border)" }}>
                                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                                    Social Trading Control
                                </p>

                                <div style={{ display: "grid", gap: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Shield size={14} className={providerProfile?.isProvider ? "text-[#22c55e]" : "text-gray-500"} />
                                            <span style={{ fontSize: "12px", fontWeight: 600 }}>Master Trader Status</span>
                                        </div>
                                        <button
                                            onClick={handleMasterTraderToggle}
                                            disabled={actionLoading || loadingProfile}
                                            style={{
                                                padding: "4px 12px",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                borderRadius: "4px",
                                                background: providerProfile?.isProvider ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                                                color: providerProfile?.isProvider ? "#22c55e" : "#888",
                                                border: providerProfile?.isProvider ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.1)",
                                                cursor: "pointer",
                                                textTransform: "uppercase"
                                            }}
                                        >
                                            {providerProfile?.isProvider ? "Enabled" : "Disabled"}
                                        </button>
                                    </div>

                                    {providerProfile && (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <CheckCircle2 size={14} className={providerProfile.verified ? "text-brand-500" : "text-gray-500"} />
                                                <span style={{ fontSize: "12px", fontWeight: 600 }}>Verified Badge</span>
                                            </div>
                                            <button
                                                onClick={handleVerifyToggle}
                                                disabled={actionLoading || loadingProfile}
                                                style={{
                                                    padding: "4px 12px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    borderRadius: "4px",
                                                    background: providerProfile.verified ? "rgba(16, 185, 129,0.15)" : "rgba(255,255,255,0.06)",
                                                    color: providerProfile.verified ? "#10b981" : "#888",
                                                    border: providerProfile.verified ? "1px solid rgba(16, 185, 129,0.3)" : "1px solid rgba(255,255,255,0.1)",
                                                    cursor: "pointer",
                                                    textTransform: "uppercase"
                                                }}
                                            >
                                                {providerProfile.verified ? "Verified" : "Unverified"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Broker Accounts Section */}
                            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--color-border)" }}>
                                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                                    Broker Connections ({tradingAccounts.length})
                                </p>

                                <div style={{ display: "grid", gap: "8px" }}>
                                    {tradingAccounts.length === 0 ? (
                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", italic: "true" }}>No broker accounts connected</p>
                                    ) : (
                                        tradingAccounts.map(account => (
                                            <div key={account._id} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div style={{ width: "24px", height: "24px", background: "rgba(16, 185, 129,0.1)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "black", color: "#10b981" }}>
                                                        {account.platform.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: "11px", fontWeight: 600 }}>{account.accountName}</p>
                                                        <p style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>{account.platform.toUpperCase()} · {account.accountNumber}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e" }}>${account.balance.toLocaleString()}</p>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                                                        <div style={{ width: "4px", height: "4px", borderRadius: "full", background: account.status === 'connected' ? "#22c55e" : "#ef4444" }}></div>
                                                        <span style={{ fontSize: "8px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{account.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => toggleStatus(selected)}
                                disabled={actionLoading}
                                style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 600, background: "transparent", border: `1px solid ${selected.isActive ? "#ef4444" : "#22c55e"}`, borderRadius: "2px", color: selected.isActive ? "#ef4444" : "#22c55e", cursor: "pointer" }}
                            >
                                {selected.isActive ? "Disable Account" : "Enable Account"}
                            </button>
                            <button
                                onClick={() => setSelected(null)}
                                style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 600, background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: "pointer" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Add Staff Modal ── */}
            {showAddModal && <AddStaffModal onClose={() => { setShowAddModal(false); fetchUsers(); }} />}
        </div>
    );
}

// ─── Add Staff Modal Component ───────────────────────────────────────────────
function AddStaffModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "admin",
        firstName: "",
        lastName: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const ROLES = ['admin', 'super_admin', 'manager', 'trader', 'analyst', 'support', 'provider', 'instructor'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/api/v1/admin/users", formData);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create staff account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
            <form
                onSubmit={handleSubmit}
                style={{ background: "#000", border: "1px solid var(--color-border)", borderRadius: "2px", width: "100%", maxWidth: "400px", padding: "2rem", display: "grid", gap: "1.5rem" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Add New Staff</h2>
                    <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: "20px", cursor: "pointer" }}>×</button>
                </div>

                {error && <p style={{ fontSize: "11px", color: "#f87171", padding: "8px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>{error}</p>}

                <div style={{ display: "grid", gap: "12px" }}>
                    {[
                        { label: "Email Address", name: "email", type: "email", required: true },
                        { label: "Temporary Password", name: "password", type: "password", required: true },
                        { label: "First Name", name: "firstName", type: "text" },
                        { label: "Last Name", name: "lastName", type: "text" },
                    ].map(field => (
                        <div key={field.name} style={{ display: "grid", gap: "6px" }}>
                            <label style={{ fontSize: "10px", fontWeight: 700, color: "#666", textTransform: "uppercase" }}>{field.label}</label>
                            <input
                                {...field}
                                value={(formData as any)[field.name]}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", fontSize: "13px", outline: "none" }}
                            />
                        </div>
                    ))}

                    <div style={{ display: "grid", gap: "6px" }}>
                        <label style={{ fontSize: "10px", fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Assigned Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", fontSize: "13px", outline: "none" }}
                        >
                            {ROLES.map(r => <option key={r} value={r} style={{ background: "#000" }}>{r.toUpperCase().replace('_', ' ')}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px",
                        background: "var(--color-brand)",
                        color: "#000",
                        border: "none",
                        borderRadius: "2px",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>
        </div>
    );
}
