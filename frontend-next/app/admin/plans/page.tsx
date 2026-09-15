/* eslint-disable */
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
    _id: string;
    name: string;
    code: string;
    type: "membership" | "service";
    price: number;
    billingCycle: "monthly" | "quarterly" | "yearly" | "lifetime";
    status: "active" | "inactive";
    features: string[];
    allowedMenus?: string[];
    agentsAllowed?: number;
    description?: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
    const isActive = status === "active";
    const label = status || "Unknown";
    return (
        <span className={isActive ? "badge-positive" : "badge-negative"}>
            {label.toUpperCase()}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Plan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: "",
        code: "",
        type: "membership",
        price: 0,
        billingCycle: "lifetime",
        status: "active",
        features: [],
        allowedMenus: [],
        agentsAllowed: 1
    });

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/admin/plans");
            const data = res.data.data ?? res.data;
            const plansData = Array.isArray(data) ? data : data.plans ?? [];

            // Map backend isActive to frontend status
            const mappedPlans = plansData.map((p: any) => ({
                ...p,
                status: p.status || (p.isActive ? "active" : "inactive"),
                billingCycle: p.billingCycle || (
                    p.interval === 'quarter' ? 'quarterly' :
                    p.interval === 'year' ? 'yearly' :
                    p.interval === 'lifetime' ? 'lifetime' : 'monthly'
                )
            }));

            setPlans(mappedPlans);
        } catch (err) {
            console.error("Failed to fetch plans", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    async function handleToggleStatus(plan: Plan) {
        setActionLoading(true);
        try {
            const newIsActive = plan.status !== "active";
            const newStatus = newIsActive ? "active" : "inactive";
            await api.put(`/api/v1/admin/plans/${plan._id}`, { isActive: newIsActive });
            setPlans(prev => prev.map(p => p._id === plan._id ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error("Failed to toggle plan status", err);
        } finally {
            setActionLoading(false);
        }
    }

    const openModal = (plan?: Plan) => {
        if (plan) {
            setSelected(plan);
            setFormData({
                ...plan,
                billingCycle: (plan.billingCycle ||
                    ((plan as any).interval === 'quarter' ? 'quarterly' :
                    (plan as any).interval === 'year' ? 'yearly' :
                    (plan as any).interval === 'lifetime' ? 'lifetime' : 'monthly'))
            });
        } else {
            setSelected(null);
            setFormData({
                name: "",
                code: "",
                type: "membership",
                price: 0,
                billingCycle: "lifetime",
                status: "active",
                features: [],
                allowedMenus: [],
                agentsAllowed: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            // Map frontend billingCycle → backend interval
            const intervalMap: Record<string, string> = {
                monthly: 'month',
                quarterly: 'quarter',
                yearly: 'year',
                lifetime: 'lifetime',
            };
            // Memberships are always lifetime; services use the selected interval
            const resolvedCycle = formData.type === 'membership' ? 'lifetime' : (formData.billingCycle ?? 'monthly');
            const payload = {
                ...formData,
                name: formData.name,
                isActive: formData.status === "active",
                interval: intervalMap[resolvedCycle] ?? 'month',
            };

            if (selected) {
                await api.put(`/api/v1/admin/plans/${selected._id}`, payload);
            } else {
                await api.post("/api/v1/admin/plans", payload);
            }
            fetchPlans();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save plan", err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Subscription Plans</h1>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Configure pricing tiers and features
                    </p>
                </div>
                <button onClick={() => openModal()} style={{ padding: "8px 16px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 600, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "13px" }}>
                    + Create Plan
                </button>
            </div>

            {/* ── Table ── */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
                            {["Name", "Code", "Price", "Billing", "Status", "Actions"].map(h => (
                                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} style={{ padding: "16px 14px" }}>
                                            <div style={{ height: "12px", width: "50%", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            plans.map(plan => (
                                <tr key={plan._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-primary)", fontWeight: 600 }}>{plan.name}</td>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-muted)", fontFamily: "monospace" }}>{plan.code}</td>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-primary)" }}>${plan.price}</td>
                                    <td style={{ padding: "12px 14px", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{plan.billingCycle}</td>
                                    <td style={{ padding: "12px 14px" }}><StatusBadge status={plan.status} /></td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button onClick={() => openModal(plan)} style={{ padding: "4px 8px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-text-secondary)", cursor: "pointer" }}>Edit</button>
                                            <button onClick={() => handleToggleStatus(plan)} disabled={actionLoading} style={{ padding: "4px 8px", fontSize: "11px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "2px", color: plan.status === "active" ? "#ef4444" : "#22c55e", cursor: "pointer" }}>
                                                {plan.status === "active" ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Modal ── */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem", animation: "fade-in 0.2s ease-out" }}>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>{selected ? "Edit Plan" : "Create Plan"}</h2>
                        <form onSubmit={handleSave} style={{ display: "grid", gap: "1rem" }}>
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>NAME</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", outline: "none", color: "#fff" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>CODE</label>
                                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", outline: "none", color: "#fff" }} />
                                </div>
                            </div>
                            {/* Plan Type + Billing Row */}
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>PLAN TYPE</label>
                                    <select
                                        value={formData.type ?? "membership"}
                                        onChange={e => {
                                            const t = e.target.value as "membership" | "service";
                                            setFormData({
                                                ...formData,
                                                type: t,
                                                // Auto-lock billing cycle based on type
                                                billingCycle: t === "membership" ? "lifetime" : "monthly"
                                            });
                                        }}
                                        style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", outline: "none", color: "#fff" }}
                                    >
                                        <option value="membership">Membership (Registration)</option>
                                        <option value="service">Service / Tool</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>BILLING</label>
                                    {formData.type === "membership" ? (
                                        <div style={{ padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "var(--color-brand)", fontSize: "13px", fontWeight: 600 }}>
                                            Lifetime (One-Time) 🔒
                                        </div>
                                    ) : (
                                        <select
                                            value={formData.billingCycle}
                                            onChange={e => setFormData({ ...formData, billingCycle: e.target.value as "monthly" | "quarterly" | "yearly" })}
                                            style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", outline: "none", color: "#fff" }}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>PRICE ($)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", outline: "none", color: "#fff" }} />
                                </div>
                            </div>
                            <div style={{ marginTop: "1rem" }}>
                                <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "8px" }}>MENU ACCESS (Allowed Sections)</label>
                                <div style={{ maxHeight: "200px", overflowY: "auto", background: "var(--color-surface-2)", padding: "12px", border: "1px solid var(--color-border)", borderRadius: "2px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    {[
                                        "Dashboard", "Social Handles", "Financial", "My Wallet", "Deposit Wallet", "Fund Transfer", "Request Payout", "Purchase", "My Coupons",
                                        "Genealogy", "Binary", "Sponsor", "Tree", "List", "Rank Dashboard", "Leg Settings",
                                        "Markets", "Forex", "Commodities", "Indices", "Crypto", "Stocks", "Bonds", "Synthetics", "Real Estate",
                                        "News Calendar", "Forex Calendar", "Metals Calendar", "Energy Calendar", "Crypto Calendar", "Coin Market Caps",
                                        "Education", "Education Hub", "Courses", "Learning Tracks", "Speed Run", "Video Library", "PDF Library",
                                        "Resources", "Global Macro", "COT Data", "Seasonality", "Contract Specs", "Quantitative Methodology", "Geometry Intelligence", "MMITPS-VMID PRO", "MMITPS-PTD PRO", "Sentimental Methodology",
                                        "AI Agent Analyst", "Trade Journal", "TradeControl Panel", "Copy Trading", "Live Stream", "Tokenization Pool", "VPS Station",
                                        "Blogs", "Events", "Help Hub", "Portfolio", "KYC Verification", "Profile"
                                    ].map(item => (
                                        <label key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer" }}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.allowedMenus?.includes(item)} 
                                                onChange={e => {
                                                    const current = formData.allowedMenus || [];
                                                    if (e.target.checked) {
                                                        setFormData({ ...formData, allowedMenus: [...current, item] });
                                                    } else {
                                                        setFormData({ ...formData, allowedMenus: current.filter(i => i !== item) });
                                                    }
                                                }}
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "2px", cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={actionLoading} style={{ padding: "8px 16px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 600, border: "none", borderRadius: "2px", cursor: "pointer" }}>
                                    {actionLoading ? "Saving..." : "Save Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
