"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

export default function AdminEmailPage() {
    const [activeTab, setActiveTab] = useState<"driver" | "adminPrefs" | "userDefaults" | "templates">("driver");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Data states
    const [config, setConfig] = useState<any>({});
    const [adminPrefs, setAdminPrefs] = useState<any>({});
    const [userDefaults, setUserDefaults] = useState<any>({});
    const [templates, setTemplates] = useState<any[]>([]);
    
    // Editor State
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [testEmail, setTestEmail] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [configRes, prefsRes, defaultsRes, templatesRes] = await Promise.all([
                api.get("/api/v1/admin/email/config").catch(() => ({ data: { data: {} } })),
                api.get("/api/v1/admin/email/preferences").catch(() => ({ data: { data: { adminNotifications: {} } } })),
                api.get("/api/v1/admin/email/user-defaults").catch(() => ({ data: { data: {} } })),
                api.get("/api/v1/admin/email/templates").catch(() => ({ data: { data: [] } }))
            ]);

            setConfig(configRes.data?.data || {});
            setAdminPrefs(prefsRes.data?.data?.adminNotifications || {});
            setUserDefaults(defaultsRes.data?.data || {});
            setTemplates(templatesRes.data?.data || []);
        } catch (err) {
            console.error("Failed to fetch email settings", err);
            showToast("Failed to load email configurations", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ─── Driver Config Handlers ─────────────────────────────────────────────

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setConfig({ ...config, [name]: val });
    };

    const saveConfig = async () => {
        setSaving('config');
        try {
            await api.put("/api/v1/admin/email/config", config);
            showToast("Driver configuration saved successfully");
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to save configuration", "error");
        } finally {
            setSaving(null);
        }
    };

    const sendTestEmail = async () => {
        if (!testEmail) {
            showToast("Please enter a test email address", "error");
            return;
        }
        setSaving('test');
        try {
            await api.post("/api/v1/admin/email/test", { to: testEmail, templateKey: 'auth.welcome' });
            showToast("Test email sent. Check browser console or inbox.");
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to send test email", "error");
        } finally {
            setSaving(null);
        }
    };

    // ─── Preferences Handlers ───────────────────────────────────────────────

    const toggleAdminPref = async (key: string) => {
        const newPrefs = { ...adminPrefs, [key]: !adminPrefs[key] };
        setAdminPrefs(newPrefs);
        
        try {
            await api.put("/api/v1/admin/email/preferences", { adminNotifications: newPrefs });
        } catch (err: any) {
            setAdminPrefs(adminPrefs); // Revert on failure
            showToast("Failed to save admin preference", "error");
        }
    };

    const toggleUserDefault = async (key: string) => {
        const newDefaults = { ...userDefaults, [key]: !userDefaults[key] };
        setUserDefaults(newDefaults);
        
        try {
            await api.put("/api/v1/admin/email/user-defaults", newDefaults);
        } catch (err: any) {
            setUserDefaults(userDefaults); // Revert
            showToast("Failed to save user default", "error");
        }
    };

    // ─── Template Handlers ──────────────────────────────────────────────────

    const openTemplateEditor = async (key: string) => {
        try {
            const res = await api.get(`/api/v1/admin/email/templates/${key}`);
            setEditingTemplate(res.data.data);
        } catch (err) {
            showToast("Failed to load template", "error");
        }
    };

    const saveTemplate = async () => {
        if (!editingTemplate) return;
        setSaving('template');
        try {
            await api.put(`/api/v1/admin/email/templates/${editingTemplate.key}`, {
                subject: editingTemplate.subject,
                htmlBody: editingTemplate.htmlBody,
                isActive: editingTemplate.isActive
            });
            showToast("Template saved successfully");
            
            // Update local list
            setTemplates(templates.map(t => 
                t.key === editingTemplate.key 
                ? { ...t, subject: editingTemplate.subject, isActive: editingTemplate.isActive } 
                : t
            ));
            
            setEditingTemplate(null);
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to save template", "error");
        } finally {
            setSaving(null);
        }
    };

    const resetTemplate = async () => {
        if (!editingTemplate) return;
        if (!confirm("Are you sure you want to revert to the factory default template? Customizations will be lost.")) return;
        
        setSaving('template');
        try {
            const res = await api.post(`/api/v1/admin/email/templates/${editingTemplate.key}/reset`);
            showToast("Template reset to default");
            setEditingTemplate(res.data.data);
            
            // Update local list
            setTemplates(templates.map(t => 
                t.key === editingTemplate.key 
                ? { ...t, subject: res.data.data.subject, isActive: true } 
                : t
            ));
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to reset template", "error");
        } finally {
            setSaving(null);
        }
    };

    // ─── UI Components ──────────────────────────────────────────────────────

    const inputStyle = { width: "100%", padding: "10px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "4px", color: "#fff", outline: "none", fontSize: "13px", marginTop: "6px" };
    const labelStyle = { fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" } as React.CSSProperties;
    const btnStyle = { padding: "10px 20px", background: "var(--color-brand)", border: "none", color: "#0d0d0d", borderRadius: "4px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "0.2s" };

    return (
        <div style={{ animation: "fade-in 0.3s ease-out", paddingBottom: "4rem" }}>
            {toast && (
                <div style={{ position: "fixed", bottom: "20px", right: "20px", padding: "12px 24px", background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', borderRadius: "4px", zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", fontSize: "14px", fontWeight: 600 }}>
                    {toast.message}
                </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Email Management</h1>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Configure drivers, notification preferences, and system templates.
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--color-border)", marginBottom: "2rem" }}>
                {[
                    { id: "driver", label: "Driver Setup" },
                    { id: "adminPrefs", label: "Admin Alerts" },
                    { id: "userDefaults", label: "User Defaults" },
                    { id: "templates", label: "Templates" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setEditingTemplate(null); }}
                        style={{
                            padding: "12px 0", fontSize: "13px", fontWeight: 600, background: "none", border: "none", cursor: "pointer", transition: "all 0.2s",
                            borderBottom: activeTab === tab.id ? "2px solid var(--color-brand)" : "2px solid transparent",
                            color: activeTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-muted)",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>Loading email core...</div>
            ) : (
                <div style={{ maxWidth: "1000px" }}>
                    
                    {/* ─── Tab: Driver Setup ───────────────────────────────────── */}
                    {activeTab === "driver" && (
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                            <div className="card" style={{ padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: "#fff" }}>Primary Driver Configuration</h3>
                                
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={labelStyle}>Active Driver</label>
                                    <select name="driver" value={config.driver || "smtp"} onChange={handleConfigChange} style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none", MozAppearance: "none", appearance: "none" }}>
                                        <option value="smtp">Nodemailer (SMTP)</option>
                                        <option value="sendgrid">SendGrid</option>
                                        <option value="mailgun">Mailgun</option>
                                    </select>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                    <div>
                                        <label style={labelStyle}>From Name</label>
                                        <input type="text" name="fromName" value={config.fromName || "MMITPS"} onChange={handleConfigChange} style={inputStyle} placeholder="e.g. MMITPS Support" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>From Address</label>
                                        <input type="text" name="fromAddress" value={config.fromAddress || "noreply@mmitps.com"} onChange={handleConfigChange} style={inputStyle} placeholder="noreply@domain.com" />
                                    </div>
                                </div>

                                {config.driver === "sendgrid" && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={labelStyle}>SendGrid API Key</label>
                                        <input type="password" name="sendgridApiKey" value={config.sendgridApiKey || ""} onChange={handleConfigChange} style={inputStyle} placeholder="SG.xxxxxxx..." />
                                    </div>
                                )}

                                {config.driver === "mailgun" && (
                                    <>
                                        <div style={{ marginBottom: "20px" }}>
                                            <label style={labelStyle}>Mailgun Host (defaults to smtp.mailgun.org)</label>
                                            <input type="text" name="mailgunHost" value={config.mailgunHost || ""} onChange={handleConfigChange} style={inputStyle} />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                            <div>
                                                <label style={labelStyle}>SMTP Username</label>
                                                <input type="text" name="mailgunUser" value={config.mailgunUser || ""} onChange={handleConfigChange} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>SMTP Password</label>
                                                <input type="password" name="mailgunApiKey" value={config.mailgunApiKey || ""} onChange={handleConfigChange} style={inputStyle} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(!config.driver || config.driver === "smtp") && (
                                    <>
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                            <div>
                                                <label style={labelStyle}>SMTP Host</label>
                                                <input type="text" name="host" value={config.host || ""} onChange={handleConfigChange} style={inputStyle} placeholder="smtp.gmail.com" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Port</label>
                                                <input type="number" name="port" value={config.port || "587"} onChange={handleConfigChange} style={inputStyle} />
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                            <div>
                                                <label style={labelStyle}>Username</label>
                                                <input type="text" name="user" value={config.user || ""} onChange={handleConfigChange} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Password</label>
                                                <input type="password" name="pass" value={config.pass || ""} onChange={handleConfigChange} style={inputStyle} />
                                            </div>
                                        </div>
                                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                                            <input type="checkbox" name="secure" checked={!!config.secure || config.secure === 'true'} onChange={handleConfigChange} style={{ cursor: "pointer" }} />
                                            Use SSL/TLS Security
                                        </label>
                                    </>
                                )}

                                <div style={{ borderTop: "1px solid var(--color-border)", margin: "24px 0", paddingTop: "24px" }}>
                                    <button onClick={saveConfig} disabled={saving === 'config'} style={{ ...btnStyle, width: "100%" }}>
                                        {saving === 'config' ? "SAVING..." : "SAVE CONFIGURATION"}
                                    </button>
                                </div>
                            </div>

                            <div className="card" style={{ padding: "24px", height: "max-content", background: "rgba(255,255,255,0.02)", borderStyle: "dashed" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>Send Test Email</h3>
                                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>Verify your SMTP or API connection by sending a test 'Welcome' email.</p>
                                
                                <label style={labelStyle}>Recipient Address</label>
                                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} placeholder="admin@domain.com" />
                                
                                <button onClick={sendTestEmail} disabled={saving === 'test'} style={{ ...btnStyle, background: "rgba(255,255,255,0.1)", color: "#fff", width: "100%" }}>
                                    {saving === 'test' ? "SENDING..." : "SEND DIAGNOSTIC TEST"}
                                </button>
                                
                                {(!config.user && !config.sendgridApiKey && !config.mailgunApiKey) && (
                                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(16, 185, 129,0.1)", borderRadius: "4px", borderLeft: "3px solid #10b981" }}>
                                        <p style={{ fontSize: "11px", color: "#10b981", margin: 0 }}><strong>MOCK MODE ACTIVE</strong><br/>No credentials provided. Emails will only be logged to the server console.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── Tab: Admin Prefs ────────────────────────────────────── */}
                    {activeTab === "adminPrefs" && (
                        <div className="card" style={{ padding: 0 }}>
                            <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Admin Alert Triggers</h3>
                                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>Select which system events trigger email notifications to the admin team.</p>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <tbody>
                                    {Object.entries(adminPrefs || {}).map(([key, enabled]: [string, any]) => (
                                        <tr key={key} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 20px" }}>
                                                <span style={{ fontWeight: 600, color: "var(--color-text-primary)", display: "block" }}>{key.replace(/\./g, " → ").replace(/_/g, " ").toUpperCase()}</span>
                                                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Template Key: {key}</span>
                                            </td>
                                            <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                                <button
                                                    onClick={() => toggleAdminPref(key)}
                                                    style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, background: enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${enabled ? "#22c55e" : "#ef4444"}`, color: enabled ? "#22c55e" : "#ef4444", borderRadius: "20px", cursor: "pointer" }}
                                                >
                                                    {enabled ? "ALERT ON" : "MUTED"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ─── Tab: User Defaults ──────────────────────────────────── */}
                    {activeTab === "userDefaults" && (
                        <div className="card" style={{ padding: 0 }}>
                            <div style={{ padding: "20px", borderBottom: "1px solid var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Default User Preferences</h3>
                                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>Set the platform-wide default email toggles for new users. Users can override these in their profile.</p>
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <tbody>
                                    {Object.entries(userDefaults || {}).map(([key, enabled]: [string, any]) => (
                                        <tr key={key} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 20px", textTransform: "capitalize", fontWeight: 600, color: "var(--color-text-primary)" }}>
                                                {key} Notifications
                                            </td>
                                            <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                                <button
                                                    onClick={() => toggleUserDefault(key)}
                                                    style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, background: enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${enabled ? "#22c55e" : "#ef4444"}`, color: enabled ? "#22c55e" : "#ef4444", borderRadius: "20px", cursor: "pointer" }}
                                                >
                                                    {enabled ? "ON BY DEFAULT" : "OFF BY DEFAULT"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ─── Tab: Templates ──────────────────────────────────────── */}
                    {activeTab === "templates" && (
                        <div>
                            {editingTemplate ? (
                                <div style={{ animation: "fade-in 0.2s" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <button onClick={() => setEditingTemplate(null)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                                            ← Back to List
                                        </button>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <button onClick={resetTemplate} disabled={saving === 'template'} style={{ ...btnStyle, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>FACTORY RESET</button>
                                            <button onClick={saveTemplate} disabled={saving === 'template'} style={btnStyle}>{saving === 'template' ? "SAVING..." : "SAVE TEMPLATE"}</button>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
                                        {/* Editor */}
                                        <div className="card" style={{ padding: "24px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                                                <div>
                                                    <h2 style={{ fontSize: "18px", color: "#fff", margin: "0 0 4px" }}>{editingTemplate.name}</h2>
                                                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{editingTemplate.key} • {editingTemplate.category}</p>
                                                </div>
                                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-text-primary)", cursor: "pointer" }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={editingTemplate.isActive} 
                                                        onChange={(e) => setEditingTemplate({...editingTemplate, isActive: e.target.checked})} 
                                                    />
                                                    Active Segment
                                                </label>
                                            </div>

                                            <div style={{ marginBottom: "20px" }}>
                                                <label style={labelStyle}>Subject Line</label>
                                                <input 
                                                    type="text" 
                                                    value={editingTemplate.subject} 
                                                    onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})} 
                                                    style={{ ...inputStyle, fontSize: "15px", padding: "12px" }} 
                                                />
                                            </div>

                                            <div>
                                                <label style={labelStyle}>HTML Body</label>
                                                <textarea 
                                                    value={editingTemplate.htmlBody} 
                                                    onChange={(e) => setEditingTemplate({...editingTemplate, htmlBody: e.target.value})} 
                                                    style={{ ...inputStyle, height: "500px", fontFamily: "monospace", resize: "vertical", whiteSpace: "pre-wrap", background: "#0a0a0f" }} 
                                                />
                                            </div>
                                        </div>

                                        {/* Variables Reference */}
                                        <div className="card" style={{ padding: "24px", height: "max-content", position: "sticky", top: "20px" }}>
                                            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Available Variables</h3>
                                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>Use <code style={{ color: "var(--color-brand)" }}>{"{{variable.name}}"}</code> to inject data into the subject or body.</p>
                                            
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {editingTemplate.variables?.map((v: any) => (
                                                    <div key={v.name} style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "4px", border: "1px solid var(--color-border)" }}>
                                                        <code style={{ fontSize: "12px", color: "var(--color-brand)", display: "block", marginBottom: "4px", fontWeight: 700 }}>{v.name}</code>
                                                        <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{v.description}</span>
                                                    </div>
                                                ))}
                                                {(!editingTemplate.variables || editingTemplate.variables.length === 0) && (
                                                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>No dynamic variables for this event.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card" style={{ padding: 0 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                        <thead>
                                            <tr style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
                                                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Template Event</th>
                                                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Category</th>
                                                <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status</th>
                                                <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {templates.map(t => (
                                                <tr key={t.key} style={{ borderBottom: "1px solid var(--color-border)", transition: "0.2s" }} className="hover-row">
                                                    <td style={{ padding: "16px 20px" }}>
                                                        <span style={{ fontWeight: 600, color: "var(--color-text-primary)", display: "block" }}>{t.name}</span>
                                                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{t.description}</span>
                                                    </td>
                                                    <td style={{ padding: "16px 20px", color: "var(--color-brand)", textTransform: "uppercase", fontSize: "11px", fontWeight: 700 }}>
                                                        {t.category}
                                                    </td>
                                                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                                        <span style={{ padding: "4px 10px", fontSize: "10px", fontWeight: 700, background: t.isActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: t.isActive ? "#22c55e" : "#ef4444", borderRadius: "12px" }}>
                                                            {t.isActive ? "ACTIVE" : "INACTIVE"}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                                        <button 
                                                            onClick={() => openTemplateEditor(t.key)}
                                                            style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "4px", cursor: "pointer" }}
                                                        >
                                                            EDIT
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <style jsx global>{`
                .hover-row:hover { background: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
}
