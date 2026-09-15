/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProviderConfig {
    enabled: boolean;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    mode?: "sandbox" | "live";
    clientId?: string;
    clientSecret?: string;
}

interface PaymentConfig {
    stripe?: ProviderConfig;
    paypal?: ProviderConfig;
}

const PROVIDER_FIELDS: Record<string, { label: string; key: keyof ProviderConfig; type: string; placeholder: string }[]> = {
    stripe: [
        { label: "PUBLISHABLE KEY", key: "publicKey", type: "text", placeholder: "pk_test_..." },
        { label: "SECRET KEY", key: "secretKey", type: "password", placeholder: "sk_test_..." },
        { label: "WEBHOOK SECRET", key: "webhookSecret", type: "password", placeholder: "whsec_..." }
    ],
    paypal: [
        { label: "CLIENT ID", key: "clientId", type: "text", placeholder: "PayPal Client ID" },
        { label: "CLIENT SECRET", key: "clientSecret", type: "password", placeholder: "PayPal Secret" },
    ],
    korapay: [
        { label: "PUBLIC KEY", key: "publicKey", type: "text", placeholder: "pk_test_..." },
        { label: "SECRET KEY", key: "secretKey", type: "password", placeholder: "sk_test_..." },
        { label: "ENCRYPTION KEY", key: "encryptionKey" as any, type: "password", placeholder: "Key" }
    ],
    paystack: [
        { label: "PUBLIC KEY", key: "publicKey", type: "text", placeholder: "pk_test_..." },
        { label: "SECRET KEY", key: "secretKey", type: "password", placeholder: "sk_test_..." }
    ],
    flutterwave: [
        { label: "PUBLIC KEY", key: "publicKey", type: "text", placeholder: "FLWPUBK-..." },
        { label: "SECRET KEY", key: "secretKey", type: "password", placeholder: "FLWSECK-..." },
        { label: "WEBHOOK HASH", key: "webhookSecret", type: "password", placeholder: "Secret Hash" }
    ],
    cellulant: [
        { label: "CLIENT ID", key: "clientId", type: "text", placeholder: "Client ID" },
        { label: "CLIENT SECRET", key: "clientSecret", type: "password", placeholder: "Secret" },
        { label: "SERVICE CODE", key: "serviceCode" as any, type: "text", placeholder: "Code" },
        { label: "ACCESS KEY", key: "accessKey" as any, type: "password", placeholder: "Access Key" }
    ],
    coinpayments: [
        { label: "MERCHANT ID", key: "merchantId" as any, type: "text", placeholder: "ID" },
        { label: "IPN SECRET", key: "ipnSecret" as any, type: "password", placeholder: "Secret" }
    ],
    crypto: [
        { label: "BTC ADDRESS", key: "btcAddress" as any, type: "text", placeholder: "1..." },
        { label: "ETH ADDRESS", key: "ethAddress" as any, type: "text", placeholder: "0x..." },
        { label: "USDT (TRC20) ADDRESS", key: "usdtAddress" as any, type: "text", placeholder: "T..." }
    ]
};

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({
    title,
    name,
    config,
    onSave,
    loading
}: {
    title: string;
    name: string;
    config: ProviderConfig;
    onSave: (c: ProviderConfig) => void;
    loading: boolean;
}) {
    const [local, setLocal] = useState<ProviderConfig>(config);
    useEffect(() => { setLocal(config); }, [config]);

    const fields = PROVIDER_FIELDS[name.toLowerCase()] || [];

    return (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="w-8 h-8 rounded bg-[var(--color-surface-2)] flex items-center justify-center font-black text-[10px] text-[var(--color-text-secondary)] uppercase">
                        {name.substring(0, 2)}
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</h3>
                </div>
                <div
                    style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: local.enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: local.enabled ? "#22c55e" : "#ef4444"
                    }}
                >
                    {local.enabled ? "ACTIVE" : "INACTIVE"}
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--color-surface-2)", borderRadius: "2px" }}>
                <input
                    type="checkbox"
                    id={`${name}-toggle`}
                    checked={local.enabled ?? false}
                    onChange={e => setLocal({ ...local, enabled: e.target.checked })}
                    style={{ cursor: "pointer" }}
                />
                <label htmlFor={`${name}-toggle`} style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Enable Provider</label>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {fields.map(f => (
                    <div key={f.key}>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>{f.label}</label>
                        <input
                            type={f.type}
                            value={(local as any)[f.key] || ""}
                            onChange={e => setLocal({ ...local, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            style={{ width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                        />
                    </div>
                ))}
                
                {name.toLowerCase() === 'paypal' && (
                    <div>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>MODE</label>
                        <select
                            value={local.mode}
                            onChange={e => setLocal({ ...local, mode: e.target.value as "sandbox" | "live" })}
                            style={{ width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                        >
                            <option value="sandbox">Sandbox (Testing)</option>
                            <option value="live">Live (Production)</option>
                        </select>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button
                    onClick={() => onSave(local)}
                    disabled={loading}
                    style={{ flex: 1, padding: "10px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 700, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "13px" }}
                >
                    {loading ? "Saving..." : "Save Config"}
                </button>
                <button
                    style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", borderRadius: "2px", cursor: "pointer", fontSize: "13px" }}
                >
                    Test
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState<string | null>(null);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/v1/admin/payment");
            setConfig(res.data.data ?? res.data);
        } catch (err) {
            console.error("Failed to fetch payment config", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConfig(); }, []);

    async function handleSave(provider: string, updated: ProviderConfig) {
        setSaveLoading(provider);
        try {
            await api.put("/api/v1/admin/payment", { [provider]: updated });
            setConfig((prev: any) => prev ? { ...prev, [provider]: updated } : null);
        } catch (err) {
            console.error("Failed to save payment config", err);
        } finally {
            setSaveLoading(null);
        }
    }

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', displayName: '', currency: 'USD' });
    const [addError, setAddError] = useState<string | null>(null);

    async function handleAddProvider() {
        if (!newProvider.name) return;
        setAddError(null);
        try {
            await api.post("/api/v1/admin/payment-config", {
                providerName: newProvider.name,
                displayName: newProvider.displayName || newProvider.name,
                currency: newProvider.currency
            });
            setIsAddModalOpen(false);
            setNewProvider({ name: '', displayName: '', currency: 'USD' });
            fetchConfig();
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || "Error adding provider.";
            setAddError(msg);
        }
    }

    const webhookBase = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* Modal for adding provider */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px", margin: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Add Payment Provider</h2>
                        {addError && (
                            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "4px", color: "#f87171", fontSize: "13px" }}>
                                ⚠ {addError}
                            </div>
                        )}
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>PROVIDER ID (LOWERCASE)</label>
                                <input
                                    type="text"
                                    value={newProvider.name}
                                    onChange={e => setNewProvider({ ...newProvider, name: e.target.value.toLowerCase() })}
                                    placeholder="e.g. coingate"
                                    style={{ width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>DISPLAY NAME</label>
                                <input
                                    type="text"
                                    value={newProvider.displayName}
                                    onChange={e => setNewProvider({ ...newProvider, displayName: e.target.value })}
                                    placeholder="e.g. CoinGate"
                                    style={{ width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "4px" }}>DEFAULT CURRENCY</label>
                                <input
                                    type="text"
                                    value={newProvider.currency}
                                    onChange={e => setNewProvider({ ...newProvider, currency: e.target.value.toUpperCase() })}
                                    placeholder="USD"
                                    style={{ width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setAddError(null); }}
                                style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", borderRadius: "2px", cursor: "pointer", fontSize: "13px" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProvider}
                                style={{ flex: 1, padding: "10px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 700, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "13px" }}
                            >
                                Add Gate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Payment Gateways</h1>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Configure providers and webhook endpoints
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ padding: "8px 16px", background: "var(--color-brand)", color: "#0d0d0d", fontWeight: 700, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}
                >
                    + Add Provider
                </button>
            </div>

            {/* ── Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.5rem" }}>
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="card" style={{ height: "450px", background: "rgba(255,255,255,0.02)" }} />)
                ) : (
                    <>
                        {Object.entries(config || {}).map(([name, provider]: [string, any]) => (
                            <ProviderCard
                                key={name}
                                name={name}
                                title={(provider as any).displayName || name}
                                config={{
                                    ...((provider as any).config || {}),
                                    enabled: (provider as any).isActive ?? false
                                }}
                                onSave={(c) => handleSave(name, c)}
                                loading={saveLoading === name}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* ── Webhooks ── */}
            <div className="card" style={{ marginTop: "2rem", border: "1px solid rgba(16, 185, 129,0.2)", background: "rgba(16, 185, 129,0.02)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📡 Webhook Endpoints</h3>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                    Add these URLs to your provider's developer dashboard to receive real-time payment events.
                </p>
                <div style={{ display: "grid", gap: "1rem" }}>
                    {[
                        { label: "Stripe", path: "/api/v1/payment/stripe/webhook" },
                        { label: "PayPal", path: "/api/v1/payment/paypal/webhook" },
                        { label: "Korapay", path: "/api/v1/payment/korapay/webhook" },
                        { label: "Paystack", path: "/api/v1/payment/paystack/webhook" },
                        { label: "Flutterwave", path: "/api/v1/payment/flutterwave/webhook" },
                        { label: "CoinPayments", path: "/api/v1/payment/coinpayments/webhook" },
                        { label: "Cellulant", path: "/api/v1/payment/cellulant/webhook" }
                    ].map(item => (
                        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--color-surface-2)", borderRadius: "2px", border: "1px solid var(--color-border)" }}>
                            <div>
                                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, marginRight: "12px" }}>{item.label.toUpperCase()}</span>
                                <code style={{ fontSize: "12px", color: "var(--color-brand)", fontFamily: "monospace" }}>{webhookBase}{item.path}</code>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(`${webhookBase}${item.path}`)}
                                style={{ padding: "4px 10px", fontSize: "11px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "2px", cursor: "pointer" }}
                            >
                                Copy URL
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
