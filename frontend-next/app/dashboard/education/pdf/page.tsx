/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
    FileText,
    Download,
    FileDown,
    BookOpen,
    Layout,
    Layers,
    Calculator,
    CheckSquare,
    ChevronRight,
    Search,
    Eye,
    Star,
    ArrowDownToLine,
    BookMarked,
    FileSignature,
    TrendingUp
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CATEGORIES = [
    { name: "All", count: 45 },
    { name: "eBooks", count: 5 },
    { name: "Cheat Sheets", count: 8 },
    { name: "Templates", count: 12 },
    { name: "Guides", count: 15 },
    { name: "Calculators", count: 5 }
];

export default function PDFLibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const stats = [
        { label: "Total PDFs", value: 45, color: "text-brand-500" },
        { label: "Downloaded", value: 12, color: "text-emerald-500" },
        { label: "Cheat Sheets", value: 8, color: "text-brand-500" },
        { label: "eBooks", value: 5, color: "text-rose-500" }
    ];

    const featuredEbooks = [
        {
            title: "The Complete Forex Trading Guide",
            description: "From basics to advanced strategies.",
            pages: 125,
            icon: BookOpen,
            color: "bg-brand-600"
        },
        {
            title: "Risk Management Mastery",
            description: "Protect your capital like a pro.",
            pages: 35,
            icon: ShieldCheck,
            color: "bg-emerald-600"
        }
    ];

    const cheatSheets = [
        { title: "Candlestick Patterns", pages: 4, icon: TrendingUp, color: "bg-brand-600" },
        { title: "Chart Patterns", pages: 6, icon: Layers, color: "bg-brand-600" },
        { title: "Fibonacci Levels", pages: 2, icon: Layout, color: "bg-emerald-600" },
        { title: "Indicator Settings", pages: 8, icon: FileSignature, color: "bg-brand-600" },
        { title: "Trading Sessions", pages: 1, icon: BookMarked, color: "bg-amber-600" },
        { title: "Currency Correlations", pages: 5, icon: Layers, color: "bg-sky-600" }
    ];

    const templates = [
        { title: "Trade Journal Template", type: "Excel + PDF", pages: 3, color: "bg-[#0A1224] border-brand-500/20", btnColor: "bg-brand-500/10 text-brand-400" },
        { title: "Trading Plan Template", type: "Word + PDF", pages: 8, color: "bg-[#0A1224] border-emerald-500/20", btnColor: "bg-emerald-500/10 text-emerald-400" },
        { title: "Position Size Calculator", type: "Excel", pages: "Auto", color: "bg-[#0A1224] border-orange-500/20", btnColor: "bg-brand-500/10 text-brand-400" },
        { title: "Pre-Trade Checklist", type: "PDF", pages: 1, color: "bg-[#0A1224] border-brand-500/20", btnColor: "bg-brand-500/10 text-brand-400" }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-brand-500">
                    <FileDown size={28} />
                    <h2 className="text-2xl font-black tracking-tight uppercase">PDF Library</h2>
                </div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-10">
                    Download trading guides, cheat sheets, and ebooks
                </p>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-[#0A1224] border border-[var(--color-border)] p-8 rounded-lg text-center space-y-2 shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-[var(--color-surface-2)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className={cn("text-3xl font-black relative z-10", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest relative z-10">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={cn(
                            "px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
                            selectedCategory === cat.name
                                ? "bg-[var(--color-surface-3)] border-[var(--color-border-hover)] text-[var(--color-text-primary)]"
                                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-gray-500 hover:text-[var(--color-text-primary)]"
                        )}
                    >
                        {cat.name} ({cat.count})
                    </button>
                ))}
            </div>

            {/* Featured eBooks */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Featured eBooks</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {featuredEbooks.map((book) => (
                        <div key={book.title} className="bg-[#0A1224] border border-[var(--color-border)] rounded-lg p-8 flex items-center gap-8 group hover:border-[var(--color-border)] transition-all">
                            <div className={cn("w-20 h-24 rounded-lg flex items-center justify-center shadow-2xl shrink-0 group-hover:scale-105 transition-transform", book.color)}>
                                <book.icon size={32} className="text-[var(--color-text-primary)]" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black text-brand-400 uppercase tracking-widest">EBOOK — {book.pages} PAGES</div>
                                    <h4 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic">{book.title}</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{book.description}</p>
                                </div>
                                <button className="bg-brand-500 text-[var(--color-text-primary)] px-6 py-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                                    <ArrowDownToLine size={12} strokeWidth={3} /> Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cheat Sheets */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Cheat Sheets</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {cheatSheets.map((sheet) => (
                        <div key={sheet.title} className="bg-[#0A1224] border border-[var(--color-border)] p-6 rounded-lg min-w-[240px] flex items-center justify-between group hover:border-[var(--color-border)] transition-all">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shadow-lg", sheet.color)}>
                                    <sheet.icon size={20} className="text-[var(--color-text-primary)]" />
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-tight italic">{sheet.title}</h5>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{sheet.pages} Pages</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-black transition-all">
                                <ArrowDownToLine size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trading Templates */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Trading Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map((temp) => (
                        <div key={temp.title} className={cn("border rounded-lg p-8 space-y-6 flex flex-col group", temp.color)}>
                            <div className="space-y-2 flex-1">
                                <h4 className="text-lg font-black text-[var(--color-text-primary)] uppercase tracking-tighter italic leading-tight group-hover:text-brand-400 transition-colors">{temp.title}</h4>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    {temp.type} • {temp.pages} {temp.pages === 'Auto' ? '' : 'pages'}
                                </div>
                            </div>
                            <button className={cn("w-full py-4 rounded-lg font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95", temp.btnColor)}>
                                <Download size={14} strokeWidth={3} /> Download Template
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
