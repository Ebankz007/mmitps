"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Globe, ArrowLeft, Send, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 1500);
    };

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
                <div className="max-w-[1240px] mx-auto">
                    {/* Hero Section */}
                    <div className="mb-20 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                            <Mail size={14} className="text-brand-500" />
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Connect with MMITPS</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter mb-6 italic font-instrument">
                            Contact Our Team
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            Institutional support, partnership inquiries, and technical guidance. Our global desk is ready to assist.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="p-8 rounded-lg bg-white/[0.02] border border-[var(--color-border)]">
                                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-brand-500 mb-8">Direct Channels</h3>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Email Inquiry</div>
                                            <div className="text-[var(--color-text-secondary)] font-manrope">mmitpsinc@gmail.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Platform Status</div>
                                            <div className="text-green-500/80 text-sm font-black uppercase tracking-widest">Systems Functional</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6 group">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-all">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-[var(--color-text-primary)] mb-1">HQ Distribution</div>
                                            <div className="text-[var(--color-text-secondary)] font-manrope">MMITPS INC Global Infrastructure</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-lg bg-brand-500/5 border border-brand-500/10">
                                <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 italic font-instrument text-xl">Partnership Opportunities</h4>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-6">
                                    Interested in integrating our institutional data feeds or forming a strategic alliance? Our corporate development team handles all API licensing and IB partnerships.
                                </p>
                                <button className="text-brand-500 font-bold text-sm hover:gap-3 transition-all flex items-center gap-2">
                                    Learn More <Send size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <form onSubmit={handleSubmit} className="p-8 md:p-12 rounded-lg bg-white/[0.03] border border-[var(--color-border)] backdrop-blur-xl space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="John Doe"
                                            className="w-full px-6 py-4 rounded-lg bg-black/20 border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-white/10 focus:outline-none focus:border-brand-500/50 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="john@institutional.com"
                                            className="w-full px-6 py-4 rounded-lg bg-black/20 border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-white/10 focus:outline-none focus:border-brand-500/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        placeholder="Partnership, Support, Inquiry..."
                                        className="w-full px-6 py-4 rounded-lg bg-black/20 border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-white/10 focus:outline-none focus:border-brand-500/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-2">Message</label>
                                    <textarea 
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows={6}
                                        placeholder="How can we assist you?"
                                        className="w-full px-6 py-4 rounded-lg bg-black/20 border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-white/10 focus:outline-none focus:border-brand-500/50 transition-all font-bold resize-none"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full py-5 bg-brand-500 rounded-lg text-[var(--color-text-primary)] font-black uppercase tracking-[2px] text-sm hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {status === "loading" ? "Transmitting..." : status === "success" ? "Message Received" : <>Transmit Message <Send size={18} /></>}
                                </button>
                                
                                {status === "success" && (
                                    <p className="text-center text-brand-500 font-bold text-xs animate-pulse">
                                        Your institutional inquiry has been successfully transmitted to our team.
                                    </p>
                                )}
                            </form>
                        </div>
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
