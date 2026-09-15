/* eslint-disable */
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SystemSetting {
    key: string;
    value: unknown;
    description: string;
    group: string;
}

interface FeatureFlag {
    name: string;
    enabled: boolean;
    description?: string;
}

interface HealthStatus {
    status: string;
    stateCode: number;
    latency: string;
    database: string;
    host: string;
    port: number;
    lastError: string | null;
    timestamp: string;
}

interface GeoRestriction {
    countryCode: string;
    countryName: string;
    restricted: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<"system" | "geo" | "features" | "integrity">("system");
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [features, setFeatures] = useState<FeatureFlag[]>([]);
    const [geo, setGeo] = useState<GeoRestriction[]>([]);
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [repairing, setRepairing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [settingsRes, featuresRes, geoRes] = await Promise.all([
                api.get("/api/v1/admin/settings"),
                api.get("/api/v1/admin/features"),
                api.get("/api/v1/admin/settings/geo-restrictions")
            ]);
            setSettings(settingsRes.data.data ?? []);

            // Backend returns an object for features, transform to array
            const featuresData = featuresRes.data.data;
            if (featuresData && typeof featuresData === 'object' && !Array.isArray(featuresData)) {
                const featuresArray = Object.entries(featuresData).map(([name, val]: [string, any]) => ({
                    name,
                    ...val
                }));
                setFeatures(featuresArray);
            } else {
                setFeatures(Array.isArray(featuresData) ? featuresData : []);
            }

            // Backend returns a SystemConfig object for geo-restrictions, not an array
            const geoData = geoRes.data.data;
            if (geoData && geoData.value && typeof geoData.value === 'object') {
                // Transform feature-based blocks into a unique list of blocked countries for the UI
                const blockedSet = new Set<string>();
                Object.values(geoData.value).forEach((val: any) => {
                    if (val.blockedCountries) val.blockedCountries.forEach((c: string) => blockedSet.add(c));
                });

                const mappedGeo = Array.from(blockedSet).map(code => ({
                    countryCode: code,
                    countryName: code === 'US' ? 'United States' : code === 'CN' ? 'China' : code === 'KP' ? 'North Korea' : code === 'IR' ? 'Iran' : code,
                    restricted: true
                }));
                setGeo(mappedGeo);
            } else {
                setGeo(Array.isArray(geoData) ? geoData : []);
            }

            // Fetch health separately if needed or all at once
            const healthRes = await api.get("/api/v1/admin/system/health");
            setHealth(healthRes.data.data);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    async function updateSetting(key: string, value: unknown) {
        setSaving(key);
        try {
            await api.put(`/api/v1/admin/settings/${key}`, { value });
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
        } catch (err) {
            console.error("Failed to update setting", err);
        } finally {
            setSaving(null);
        }
    }

    async function toggleFeature(name: string, enabled: boolean) {
        setSaving(name);
        try {
            await api.put(`/api/v1/admin/features/${name}`, { enabled });
            setFeatures(prev => prev.map(f => f.name === name ? { ...f, enabled } : f));
        } catch (err) {
            console.error("Failed to toggle feature", err);
        } finally {
            setSaving(null);
        }
    }

    async function repairDatabase() {
        if (!confirm("Are you sure you want to force a database reconnection? This may briefly interrupt active sessions.")) return;

        setRepairing(true);
        try {
            const res = await api.post("/api/v1/admin/system/db-repair");
            alert(res.data.status === "success" || res.data.success ? "Repair completed successfully." : "Repair attempt finished.");
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Repair failed. Check server logs.");
        } finally {
            setRepairing(false);
        }
    }

    return (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>System Settings</h1>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Configure platform behavior and environment defaults
                </p>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem" }}>
                {[
                    { id: "system", label: "General Settings" },
                    { id: "geo", label: "Geo Restrictions" },
                    { id: "features", label: "Feature Flags" },
                    { id: "integrity", label: "System Integrity" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as "system" | "geo" | "features" | "integrity")}
                        style={{
                            padding: "12px 0",
                            fontSize: "13px",
                            fontWeight: 600,
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab.id ? "2px solid var(--color-brand)" : "2px solid transparent",
                            color: activeTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>Loading configurations...</div>
            ) : (
                <div style={{ maxWidth: "800px" }}>
                    {activeTab === "system" && (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {settings.map(s => (
                                <div key={s.key} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "1.5rem", alignItems: "center" }}>
                                    <div>
                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{s.key.replace(/_/g, " ")}</p>
                                        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{s.description}</p>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {typeof s.value === "boolean" ? (
                                            <button
                                                onClick={() => updateSetting(s.key, !s.value)}
                                                disabled={saving === s.key}
                                                style={{ width: "100%", padding: "8px", background: s.value ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${s.value ? "#22c55e" : "#ef4444"}`, color: s.value ? "#22c55e" : "#ef4444", borderRadius: "2px", fontSize: "12px", cursor: "pointer" }}
                                            >
                                                {saving === s.key ? "..." : s.value ? "ENABLED" : "DISABLED"}
                                            </button>
                                        ) : (
                                            <input
                                                type="text"
                                                defaultValue={s.value as string | number}
                                                onBlur={(e) => updateSetting(s.key, e.target.value)}
                                                style={{ width: "100%", padding: "8px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "2px", color: "#fff", outline: "none", fontSize: "13px" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "geo" && (
                        <div className="card" style={{ padding: 0 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
                                        <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Country</th>
                                        <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Restriction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(geo || []).map(g => (
                                        <tr key={g.countryCode} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "12px 14px" }}>
                                                <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{g.countryName}</span>
                                                <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "8px" }}>{g.countryCode}</span>
                                            </td>
                                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                                                <button
                                                    onClick={() => console.log("Toggle restriction", g.countryCode)}
                                                    style={{ padding: "4px 10px", fontSize: "11px", background: g.restricted ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${g.restricted ? "#ef4444" : "#22c55e"}`, color: g.restricted ? "#ef4444" : "#22c55e", borderRadius: "20px", cursor: "pointer" }}
                                                >
                                                    {g.restricted ? "RESTRICTED" : "ALLOWED"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "features" && (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {features.map(f => (
                                <div key={f.name} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "14px" }}>{f.name.replace(/-/g, " ").toUpperCase()}</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{f.description || "Toggle platform feature availability."}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFeature(f.name, !f.enabled)}
                                        disabled={saving === f.name}
                                        style={{ padding: "6px 16px", background: f.enabled ? "var(--color-brand)" : "rgba(255,255,255,0.05)", color: f.enabled ? "#0d0d0d" : "var(--color-text-muted)", fontWeight: 700, border: "none", borderRadius: "2px", cursor: "pointer", fontSize: "12px" }}
                                    >
                                        {saving === f.name ? "..." : f.enabled ? "ACTIVE" : "DISABLED"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === "integrity" && health && (
                        <div style={{ display: "grid", gap: "2rem" }}>
                            {/* DB Health Module */}
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Database Infrastructure</h3>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Health status of the primary MongoDB instance.</p>
                                    </div>
                                    <div style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        background: health.stateCode === 1 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                        color: health.stateCode === 1 ? "#22c55e" : "#ef4444",
                                        border: `1px solid ${health.stateCode === 1 ? "#22c55e" : "#ef4444"}`
                                    }}>
                                        {health.status.toUpperCase()}
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                                    <div style={{ background: "var(--color-surface-2)", padding: "12px", borderRadius: "4px" }}>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Latency (Ping)</p>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: health.latency.includes('ms') ? "#fff" : "#ef4444" }}>{health.latency}</p>
                                    </div>
                                    <div style={{ background: "var(--color-surface-2)", padding: "12px", borderRadius: "4px" }}>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Connected To</p>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{health.database}</p>
                                    </div>
                                    <div style={{ background: "var(--color-surface-2)", padding: "12px", borderRadius: "4px" }}>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Host Address</p>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{health.host}:{health.port}</p>
                                    </div>
                                    <div style={{ background: "var(--color-surface-2)", padding: "12px", borderRadius: "4px" }}>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Last Check</p>
                                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{new Date(health.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                {health.lastError && (
                                    <div style={{ background: "rgba(239,68,68,0.05)", padding: "12px", borderRadius: "4px", borderLeft: "4px solid #ef4444", marginBottom: "2rem" }}>
                                        <p style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700, marginBottom: "4px" }}>DETECTED ANOMALY</p>
                                        <p style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{health.lastError}</p>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={repairDatabase}
                                        disabled={repairing}
                                        style={{
                                            flex: 1,
                                            padding: "10px",
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid var(--color-border)",
                                            color: "#fff",
                                            borderRadius: "2px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                    >
                                        {repairing ? "ATTEMPTING REPAIR..." : "FORCE RECONNECT DB"}
                                    </button>
                                    <button
                                        onClick={fetchData}
                                        style={{
                                            padding: "10px 20px",
                                            background: "var(--color-brand)",
                                            border: "none",
                                            color: "#0d0d0d",
                                            borderRadius: "2px",
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            cursor: "pointer"
                                        }}
                                    >
                                        REFRESH STATUS
                                    </button>
                                </div>
                            </div>

                            <div className="card" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderStyle: "dashed" }}>
                                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "8px" }}>Watchdog Recommendations</h4>
                                <ul style={{ fontSize: "12px", color: "var(--color-text-secondary)", paddingLeft: "20px" }}>
                                    <li style={{ marginBottom: "6px" }}>If latency exceeds 500ms, consider scaling your database cluster or checking network congestion.</li>
                                    <li style={{ marginBottom: "6px" }}>Buffer timeouts are usually caused by an unreachable MongoDB instance (Check if service is running).</li>
                                    <li>Automated repair will attempt to restart the connection pool and clear buffered commands.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
