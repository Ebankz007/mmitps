"use client";

import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, FileText, Globe, AlertTriangle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-surface text-[var(--color-text-primary)] font-manrope selection:bg-brand-500/30">
            {/* Header / Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-[90px] px-6 md:px-[120px] flex items-center justify-between backdrop-blur-md border-b border-[var(--color-border)] bg-black/20">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <Logo size="sm" />
                </Link>
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </nav>

            <main className="pt-[180px] pb-[120px] px-6">
                <div className="max-w-[800px] mx-auto">
                    {/* Hero Section */}
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                            <Scale size={14} className="text-brand-500" />
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Master Agreement</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-6 italic font-instrument">
                            Terms of Service
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            Last Updated: March 23, 2026. Please read these terms carefully before engaging with the MMITPS platform.
                        </p>
                    </div>

                    {/* Content Glass Cards */}
                    <div className="space-y-8">
                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <Globe size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Acceptance of Terms</h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                By accessing or using the MMITPS INC platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-red-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-red-400">Institutional Risk Disclosure</h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope font-bold">
                                TRADING IN FINANCIAL MARKETS INVOLVES SUBSTANTIAL RISK of loss and is not suitable for every investor. The institutional data, AI signals, and analytics provided by MMITPS INC are for informational purposes only. Past performance is not indicative of future results.
                            </p>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Access & Eligibility</h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                Use of the MMITPS platform requires successful registration and, where applicable, completion of KYC/AML protocols. Access is restricted to individuals who are at least 18 years of age and reside in jurisdictions where such services are not prohibited.
                            </p>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-brand-500/5 border border-brand-500/10 transition-all">
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Legal Inquiries</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                                For any legal questions regarding our Master Agreement or commercial partnerships, please reach out to our legal department.
                            </p>
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center gap-2 text-brand-500 font-bold hover:gap-3 transition-all"
                            >
                                Contact Legal <FileText size={18} />
                            </Link>
                        </section>
                    </div>

                    <div className="mt-20 pt-12 border-t border-[var(--color-border)] text-center">
                        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[4px] font-black">
                            MMITPS Institutional Trading Platform System INC.
                        </p>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .font-instrument { font-family: 'Instrument Serif', serif; }
                .font-manrope { font-family: 'Manrope', sans-serif; }
            `}</style>
        </div>
    );
}
