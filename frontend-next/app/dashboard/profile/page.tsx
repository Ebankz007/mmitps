/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { userService, UserProfile } from "@/lib/api/user";
import { kycService, KYCStatus } from "@/lib/api/kyc";
import {
    User,
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    Camera,
    Bell,
    Globe,
    Zap,
    Save,
    AlertCircle,
    CheckCircle2,
    Clock,
    UserCheck,
    Key,
    Smartphone,
    Eye,
    EyeOff
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

export default function ProfilePage() {
    const { user, extendSession } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"info" | "security" | "notifications">("info");
    const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({});

    // Form states
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        sessionDuration: 60
    });
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [prof, kyc, prefs] = await Promise.all([
                    userService.getProfile(),
                    kycService.getStatus(),
                    userService.getEmailPreferences().catch(() => ({}))
                ]);
                setProfile(prof);
                setKycStatus(kyc);
                setEmailPrefs(prefs || {});
                setFormData({
                    firstName: prof.firstName,
                    lastName: prof.lastName,
                    phone: prof.phone || "",
                    sessionDuration: prof.preferences?.sessionDuration || 60
                });
            } catch (err: unknown) {
                console.error("Failed to load profile data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            // Include preferences update if sessionDuration changed
            const updated = await userService.updateProfile(formData);
            if (formData.sessionDuration !== profile?.preferences?.sessionDuration) {
                await userService.updatePreferences({ sessionDuration: formData.sessionDuration });
            }
            setProfile(updated);
            setEditMode(false);
            setMessage({ text: "Profile updated successfully.", type: "success" });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ text: error.response?.data?.message || "Update failed.", type: "error" });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwordData.new !== passwordData.confirm) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }
        try {
            await userService.changePassword(passwordData.current, passwordData.new);
            setPasswordData({ current: "", new: "", confirm: "" });
            setMessage({ text: "Password changed successfully.", type: "success" });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ text: error.response?.data?.message || "Password change failed.", type: "error" });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const form = new FormData();
        form.append("avatar", e.target.files[0]);
        try {
            const avatarUrl = await userService.uploadAvatar(form);
            if (profile) setProfile({ ...profile, avatar: avatarUrl });
            setMessage({ text: "Avatar updated.", type: "success" });
        } catch {
            setMessage({ text: "Avatar upload failed.", type: "error" });
        }
    };

    const handleToggleEmailPref = async (category: string) => {
        const newValue = !emailPrefs[category];
        const newPrefs = { ...emailPrefs, [category]: newValue };
        setEmailPrefs(newPrefs);
        try {
            await userService.updateEmailPreferences(newPrefs);
        } catch {
            setEmailPrefs(emailPrefs); // revert on error
            setMessage({ text: "Failed to update preference.", type: "error" });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Profile Header */}
            <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-lg bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] overflow-hidden flex items-center justify-center relative">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-12 w-12 text-gray-700" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="h-6 w-6 text-[var(--color-text-primary)]" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center border-4 border-[#0D0D0D]">
                            <Zap className="h-4 w-4 text-black fill-black" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                                {profile?.firstName} {profile?.lastName}
                            </h1>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)]">
                                <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">{profile?.role}</span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile?.email}</span>
                            {profile?.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {profile.phone}</span>}
                            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Verified Member</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">KYC Status</div>
                        <div className={clsx(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            kycStatus?.status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                kycStatus?.status === "pending" ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            {kycStatus?.status || "None"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-[var(--color-border)] w-fit">
                {[
                    { id: "info", label: "Account Info", icon: User },
                    { id: "security", label: "Security", icon: Lock },
                    { id: "notifications", label: "Preferences", icon: Bell },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as "info" | "security" | "notifications")}
                        className={clsx(
                            "flex items-center gap-3 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id ? "bg-[var(--color-surface-3)] text-[#10b981] shadow-inner" : "text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab 1: Personal Info */}
                    {activeTab === "info" && (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Personal Details</h3>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:underline"
                                >
                                    {editMode ? "Cancel" : "Edit Profile"}
                                </button>
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name</label>
                                            <input
                                                type="text"
                                                disabled={!editMode}
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 disabled:opacity-50 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name</label>
                                            <input
                                                type="text"
                                                disabled={!editMode}
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 disabled:opacity-50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                                            <input
                                                type="email"
                                                disabled
                                                value={profile?.email}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-secondary)] cursor-not-allowed shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Number</label>
                                            <input
                                                type="tel"
                                                disabled={!editMode}
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 disabled:opacity-50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    {editMode && (
                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                className="px-10 py-4 bg-[#10b981] hover:bg-[#10b981]/80 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(16, 185, 129,0.2)] flex items-center gap-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Verification
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Security */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                                <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white/[0.02]">
                                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Password Management</h3>
                                </div>
                                <div className="p-8">
                                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    required
                                                    value={passwordData.current}
                                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 pr-12 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-text-primary)] transition-colors"
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    required
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 pr-12 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-text-primary)] transition-colors"
                                                >
                                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    required
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-3 px-4 pr-12 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-text-primary)] transition-colors"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all"
                                        >
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-surface border border-[#10b981]/20 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-lg bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
                                        <Smartphone className="h-8 w-8 text-[#10b981]" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">Two-Factor Auth (2FA)</h4>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Add an extra layer of structural security to your institutional account.</p>
                                    </div>
                                </div>
                                <button className="px-10 py-4 bg-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#10b981]/10">
                                    Configure 2FA
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Notifications/Preferences */}
                    {activeTab === "notifications" && (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white/[0.02]">
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Platform Preferences</h3>
                            </div>
                            <div className="p-8 space-y-8">
                                <div>
                                    <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase mb-4 tracking-widest border-b border-[var(--color-border)] pb-2">Email Notifications</h4>
                                    {Object.entries(emailPrefs).length > 0 ? (
                                        <div className="space-y-4">
                                            {Object.entries(emailPrefs).map(([category, isEnabled]) => (
                                                <div key={category} className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase mb-0.5">{category.replace(/_/g, " ")}</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Receive {category} related emails</p>
                                                    </div>
                                                    <div 
                                                        onClick={() => handleToggleEmailPref(category)}
                                                        className={clsx(
                                                            "w-10 h-5 rounded-full relative cursor-pointer border transition-colors duration-200",
                                                            isEnabled ? "bg-[#10b981] border-[#10b981]" : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
                                                            isEnabled ? "bg-black right-0.5" : "bg-gray-500 left-0.5"
                                                        )}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No email preferences available or still loading.</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase mb-1">Telegram Integration</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Real-time macro trigger sheets</p>
                                    </div>
                                    <div className="w-12 h-6 bg-[var(--color-surface-2)] rounded-full relative cursor-pointer border border-[var(--color-border)]">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-md"></div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-[#10b981]" />
                                        <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Session Intelligence</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stay Duration</label>
                                            <select
                                                value={formData.sessionDuration}
                                                onChange={(e) => setFormData({ ...formData, sessionDuration: parseInt(e.target.value) })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all cursor-pointer"
                                            >
                                                <option value={30}>30 Minutes (Default)</option>
                                                <option value={120}>2 Hours (Standard)</option>
                                                <option value={480}>8 Hours (Shift)</option>
                                                <option value={1440}>24 Hours (Full Cycle)</option>
                                                <option value={10080}>7 Days (Deep Dive)</option>
                                            </select>
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-medium italic self-end pb-3">
                                            Auto-expansion of tokens based on institutional stays.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Membership Card */}
                    <div className="bg-gradient-to-br from-[#111] to-[#0D0D0D] border border-[var(--color-border)] p-8 rounded-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
                            <Key className="h-16 w-16 text-[var(--color-text-primary)]" />
                        </div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-[var(--color-border)] pb-4">Membership Level</h4>
                        <div className="text-2xl font-black text-[var(--color-text-primary)] mb-2">{profile?.subscription?.plan || "Free Tier"}</div>
                        <div className="text-[10px] font-bold text-[#10b981] uppercase tracking-tighter mb-8">
                            {profile?.subscription?.expiresAt ? `Expires: ${new Date(profile.subscription.expiresAt).toLocaleDateString()}` : "Lifetime Access"}
                        </div>
                        <button className="w-full py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all">
                            Upgrade Vault
                        </button>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <div className={clsx(
                            "p-5 rounded-lg border flex items-center gap-4 animate-in zoom-in-95 duration-300 shadow-xl",
                            message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                            {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <p className="text-[10px] font-black uppercase tracking-tight tracking-widest">{message.text}</p>
                        </div>
                    )}

                    <div className="bg-surface border border-[var(--color-border)] p-6 rounded-lg flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-[var(--color-surface-2)] rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-[#10b981]" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-1">Login Session</h4>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight">Active since: Today, 08:32 AM</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await extendSession();
                                    setMessage({ text: "Session extended successfully.", type: "success" });
                                } catch {
                                    setMessage({ text: "Failed to extend session.", type: "error" });
                                }
                            }}
                            className="w-full py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[#10b981] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all flex items-center justify-center gap-2"
                        >
                            <Zap className="w-3 h-3 fill-[#10b981]" />
                            Extend Stay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
