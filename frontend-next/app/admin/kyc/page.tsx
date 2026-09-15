/* eslint-disable */
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface KYCDocument {
    _id: string;
    user: {
        _id: string;
        email: string;
        username?: string;
    };
    documentType: string;
    documentNumber: string;
    documentUrl: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
    createdAt: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, { bg: string; color: string }> = {
        pending: { bg: "rgba(16, 185, 129,0.15)", color: "#10b981" },
        approved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
        rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    };
    const style = colorMap[status] ?? { bg: "rgba(255,255,255,0.06)", color: "#a0a0a0" };
    return (
        <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", ...style }}>
            {status}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminKYCPage() {
    const [docs, setDocs] = useState<KYCDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<KYCDocument | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/kyc/admin/pending");
            const data = res.data.data ?? res.data;
            setDocs(Array.isArray(data) ? data : data.documents ?? []);
        } catch (err) {
            console.error("Failed to fetch pending KYC", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    async function handleReview(id: string, status: "approved" | "rejected") {
        setActionLoading(true);
        try {
            await api.put(`/api/v1/kyc/admin/documents/${id}`, {
                status,
                rejectionReason: status === "rejected" ? rejectionReason : undefined
            });
            setDocs(prev => prev.filter(d => d._id !== id));
            setSelected(null);
            setRejectionReason("");
        } catch (err) {
            console.error("Failed to review KYC", err);
        } finally {
            setActionLoading(false);
        }
    }

    const formatDate = (s: string) =>
        new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>KYC Review Queue</h1>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Verify user identities and documents
                </p>
            </div>

            {/* ── Table ── */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
                            {["User", "Document Type", "Submitted", "Status", "Actions"].map(h => (
                                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} style={{ padding: "16px 14px" }}>
                                            <div style={{ height: "12px", width: "50%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : docs.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                    No pending KYC documents found
                                </td>
                            </tr>
                        ) : (
                            docs.map(doc => (
                                <tr key={doc._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <td style={{ padding: "12px 14px" }}>
                                        <p style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{doc.user?.email}</p>
                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{doc.user?.username || "No username"}</p>
                                    </td>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-primary)" }}>
                                        {doc.documentType.split("_").join(" ").toUpperCase()}
                                    </td>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)" }}>
                                        {formatDate(doc.createdAt)}
                                    </td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <StatusBadge status={doc.status} />
                                    </td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <button onClick={() => setSelected(doc)} style={{ padding: "4px 12px", fontSize: "11px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 600, border: "none", borderRadius: "2px", cursor: "pointer" }}>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Review Modal ── */}
            {selected && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "800px", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto", animation: "fade-in 0.2s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Review Document</h2>
                            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "20px", cursor: "pointer" }}>×</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div>
                                <h3 style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Document Preview</h3>
                                <div style={{ border: "1px solid var(--color-border)", borderRadius: "2px", background: "#000", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                    {selected.documentUrl ? (
                                        <img src={selected.documentUrl} alt="KYC Document" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                    ) : (
                                        <p style={{ color: "var(--color-text-muted)" }}>No image available</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Verification Details</h3>
                                <div className="card" style={{ background: "var(--color-surface-2)", fontSize: "13px" }}>
                                    {[
                                        { label: "User Email", value: selected.user?.email },
                                        { label: "Document Type", value: selected.documentType },
                                        { label: "Document ID", value: selected.documentNumber },
                                        { label: "Submitted At", value: formatDate(selected.createdAt) }
                                    ].map(row => (
                                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                                            <span style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
                                            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: "1rem" }}>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.5rem" }}>REJECTION REASON (IF REJECTED)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        style={{ width: "100%", height: "80px", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", resize: "none" }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setSelected(null)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "2px", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleReview(selected._id, "rejected")} disabled={actionLoading} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "2px", cursor: "pointer" }}>
                                Reject
                            </button>
                            <button onClick={() => handleReview(selected._id, "approved")} disabled={actionLoading} style={{ padding: "8px 16px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 600, border: "none", borderRadius: "2px", cursor: "pointer" }}>
                                {actionLoading ? "Processing..." : "Approve & Verify"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
