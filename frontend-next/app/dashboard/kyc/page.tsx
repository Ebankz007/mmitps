/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { kycService, KYCStatus, KYCDocument } from "@/lib/api/kyc";
import {
    ShieldCheck,
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Info,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    Camera,
    ShieldAlert,
    XCircle,
    Eye,
    Globe,
    Zap
} from "lucide-react";
import { clsx } from "clsx";

export default function KYCPage() {
    const [status, setStatus] = useState<KYCStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: "Passport",
        number: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const loadStatus = async () => {
        setLoading(true);
        try {
            const data = await kycService.getStatus();
            setStatus(data);
        } catch (err) {
            console.error("Failed to load KYC status:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage({ text: "Please select a document file.", type: "error" });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const form = new FormData();
        form.append("document", file);
        form.append("type", formData.type);
        form.append("number", formData.number);

        try {
            await kycService.submitDocument(form);
            setMessage({ text: "Document submitted for institutional review.", type: "success" });
            setFile(null);
            setFormData({ ...formData, number: "" });
            loadStatus();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ text: error.response?.data?.message || "Submission failed.", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* KYC Header */}
            <div className="bg-surface border border-[var(--color-border)] p-10 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
                    <ShieldCheck className="h-48 w-48 text-[var(--color-text-primary)]" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-500/10 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-brand-400" />
                        </div>
                        <span className="text-xs font-black text-brand-400 uppercase tracking-widest">Identity Verification</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight mb-4">Institutional KYC Verification</h1>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        To access high-limit institutional features and global liquidity pools, we require proof of identity and residence. All data is encrypted and stored in ultra-secure vaults.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form & History */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Status Overview */}
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden p-1">
                        <div className={clsx(
                            "flex items-center justify-between px-8 py-10 rounded-[1.4rem]",
                            status?.status === "approved" ? "bg-green-500/5 text-green-500" :
                                status?.status === "pending" ? "bg-brand-500/5 text-brand-400" :
                                    status?.status === "rejected" ? "bg-red-500/5 text-red-500" :
                                        "bg-white/[0.02] text-gray-500"
                        )}>
                            <div className="flex items-center gap-6">
                                <div className={clsx(
                                    "w-20 h-20 rounded-[1.8rem] flex items-center justify-center border transition-all",
                                    status?.status === "approved" ? "bg-green-500/10 border-green-500/20" :
                                        status?.status === "pending" ? "bg-brand-500/10 border-brand-500/20" :
                                            status?.status === "rejected" ? "bg-red-500/10 border-red-500/20" :
                                                "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                                )}>
                                    {status?.status === "approved" ? <CheckCircle2 className="h-10 w-10" /> :
                                        status?.status === "pending" ? <Clock className="h-10 w-10" /> :
                                            status?.status === "rejected" ? <XCircle className="h-10 w-10" /> :
                                                <AlertCircle className="h-10 w-10 text-gray-700" />}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Verification Level</div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">
                                        {status?.status === "approved" ? "Fully Verified" :
                                            status?.status === "pending" ? "Awaiting Audit" :
                                                status?.status === "rejected" ? "Verification Failed" :
                                                    "Unverified Account"}
                                    </h3>
                                </div>
                            </div>

                            {status?.status === "rejected" && (
                                <div className="max-w-[200px] text-right">
                                    <div className="text-[9px] font-black uppercase tracking-widest mb-1">Reason</div>
                                    <p className="text-[11px] font-bold leading-normal italic">{status.lastComment}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission Form */}
                    {status?.status !== "approved" && status?.status !== "pending" && (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">New Document Upload</h3>
                                <ShieldAlert className="h-4 w-4 text-[#10b981]" />
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Document Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981]/50 transition-all appearance-none outline-none shadow-inner"
                                            >
                                                <option value="Passport">Passport</option>
                                                <option value="National ID">National ID Card</option>
                                                <option value="Drivers License">Driver&apos;s License</option>
                                                <option value="Utility Bill">Utility Bill (Residency)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Document Number</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. S1234567A"
                                                value={formData.number}
                                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-4 px-6 text-sm font-bold text-[var(--color-text-primary)] placeholder:text-gray-700 focus:outline-none focus:border-[#10b981]/50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Document Image / Scan</label>
                                        <label className={clsx(
                                            "flex flex-col items-center justify-center h-48 w-full bg-[var(--color-surface-2)] border-2 border-dashed border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[#10b981]/30 hover:bg-[#10b981]/5 transition-all group overflow-hidden relative",
                                            file && "border-[#10b981]/50"
                                        )}>
                                            {file ? (
                                                <div className="text-center p-4">
                                                    <FileText className="h-10 w-10 text-[#10b981] mx-auto mb-2" />
                                                    <div className="text-[11px] font-black text-[var(--color-text-primary)]">{file.name}</div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="h-10 w-10 text-gray-700 mx-auto mb-3 group-hover:text-[#10b981] transition-colors" />
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Drag & Drop or <span className="text-[#10b981]">Browse</span></p>
                                                    <p className="text-[9px] text-gray-700 font-bold uppercase mt-1">PDF, JPG, PNG (Max 10MB)</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                        </label>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Info className="h-4 w-4 shrink-0" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight leading-relaxed max-w-sm">Ensure all four corners of the document are visible and text is perfectly legible.</span>
                                        </div>
                                        <button
                                            disabled={submitting}
                                            className="px-12 py-4 bg-[#10b981] disabled:bg-gray-800 disabled:text-gray-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_40px_rgba(16, 185, 129,0.2)] flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center"
                                        >
                                            {submitting ? "Processing..." : "Submit for Audit"}
                                            {!submitting && <ArrowRight className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* History Table */}
                    {status?.documents && status.documents.length > 0 && (
                        <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white/[0.02] flex items-center justify-between">
                                <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Verification History</h3>
                                <Filter className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Doc Number</th>
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Submitted</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {status.documents.map((doc) => (
                                            <tr key={doc._id} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-brand-400" />
                                                        <span className="text-xs font-black text-[var(--color-text-primary)] uppercase">{doc.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-mono font-bold text-gray-400">{doc.number}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                        doc.status === "approved" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                            doc.status === "pending" ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-gray-500 group-hover:text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border)] transition-all">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Guidelines */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-[var(--color-border)] p-8 rounded-lg space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-6">Verification Guidelines</h3>
                            <div className="space-y-6">
                                {[
                                    { title: "Original Documents", desc: "Upload only high-res scans or photos of original documents.", icon: FileText, color: "text-brand-400" },
                                    { title: "Valid & Current", desc: "Ensure your document has at least 6 months validity remaining.", icon: Clock, color: "text-[#10b981]" },
                                    { title: "Residency Proof", desc: "Utility bills or bank statements must be less than 3 months old.", icon: Globe, color: "text-green-500" },
                                ].map((guide, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className={clsx("p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] group-hover:bg-[var(--color-surface-3)] transition-all", guide.color)}>
                                            <guide.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase mb-1 tracking-tight">{guide.title}</h4>
                                            <p className="text-[11px] text-gray-500 leading-normal font-medium">{guide.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg flex items-start gap-4">
                            <Zap className="h-5 w-5 text-[#10b981] shrink-0 mt-1" />
                            <div>
                                <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest mb-1">Fast Track Review</h4>
                                <p className="text-[10px] text-gray-600 leading-relaxed font-bold uppercase">Average audit time: 2-4 Hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <div className={clsx(
                            "p-6 rounded-lg border flex items-center gap-4 animate-in zoom-in-95 duration-300 shadow-xl",
                            message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                            {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                            <p className="text-[10px] font-black uppercase tracking-widest">{message.text}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
