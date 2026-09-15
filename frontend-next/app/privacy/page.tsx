"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Eye, FileText, Scale } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function PrivacyPage() {
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
                            <Shield size={14} className="text-brand-500" />
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Transparency Protocol</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-medium tracking-tighter mb-6 italic font-instrument">
                            Privacy Policy
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            Last Updated: March 23, 2026. Your data security is our institutional priority.
                        </p>
                    </div>

                    {/* Content Glass Cards */}
                    <div className="space-y-8">
                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Data Collection</h2>
                            </div>
                            <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                <p>
                                    At MMITPS INC, we collect information necessary to provide institutional-grade trading analytics and account security. This includes:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 marker:text-brand-500">
                                    <li>Personal identifiers (Name, Email, Phone number)</li>
                                    <li>KYC Documentation for regulatory compliance</li>
                                    <li>Trading preferences and portfolio metadata</li>
                                    <li>Log data and device information for security auditing</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <Eye size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">How We Use Data</h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                Your data is exclusively used to optimize your trading experience, deliver personalized AI signals, and ensure the integrity of our network. We do not sell your personal data to third parties. Our institutional framework ensures that data processing is restricted to service delivery and platform security.
                            </p>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-white/[0.02] border border-[var(--color-border)] hover:border-brand-500/20 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Security Standards</h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed font-manrope">
                                We employ multi-layer encryption and bank-grade security protocols (AES-256) to protect your information. Our servers are distributed across secure, audited data centers with 24/7 monitoring and threat detection systems.
                            </p>
                        </section>

                        <section className="p-8 md:p-10 rounded-lg bg-brand-500/5 border border-brand-500/10 transition-all">
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Contact Data Protection Officer</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                                If you have questions regarding your data rights or wish to request data deletion, please contact our compliance team.
                            </p>
                            <Link 
                                href="/contact" 
                                className="inline-flex items-center gap-2 text-brand-500 font-bold hover:gap-3 transition-all"
                            >
                                Contact Compliance <FileText size={18} />
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
