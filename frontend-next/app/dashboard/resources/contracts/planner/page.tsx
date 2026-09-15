/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import {
    Calculator,
    Zap,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Briefcase,
    Calendar,
    Target,
    ShieldCheck,
    ArrowRight,
    Search,
    Plus,
    Minus,
    TrendingUp,
    Clock,
    XCircle,
    Info,
    Bell
} from "lucide-react";
import { clsx } from "clsx";
import { usePlannerWatchlist, useContractSpecs } from "@/hooks/use-resources";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";

const STATUS_CONFIG = {
    critical: {
        bg: "bg-[#ef4444]/5",
        border: "border-[#ef4444]/20 hover:border-[#ef4444]/40",
        badge: "bg-[#ef4444]/10 text-[#ef4444]",
        icon: AlertTriangle
    },
    warning: {
        bg: "bg-[#10b981]/5",
        border: "border-[#10b981]/20 hover:border-[#10b981]/40",
        badge: "bg-[#10b981]/10 text-[#10b981]",
        icon: Clock
    },
    success: {
        bg: "bg-[#10b981]/5",
        border: "border-[#10b981]/20 hover:border-[#10b981]/40",
        badge: "bg-[#10b981]/10 text-[#10b981]",
        icon: CheckCircle2
    }
};

export default function ContractPlannerPage() {
    const { data: watchlist, isLoading: loadingWatchlist } = usePlannerWatchlist();
    const { data: specs, isLoading: loadingSpecs } = useContractSpecs();
    const { addNotification } = useNotifications();

    // Calculator State
    const [accountSize, setAccountSize] = useState("50000");
    const [riskPercent, setRiskPercent] = useState("2");
    const [selectedContractId, setSelectedContractId] = useState("es");

    const selectedSpec = useMemo(() =>
        specs?.find((s: any) => s.id === selectedContractId) || specs?.[0],
        [specs, selectedContractId]);

    const results = useMemo(() => {
        if (!selectedSpec) return { riskAmount: 0, maxContracts: 0, stopDistance: 0, marginRequired: 0 };

        const riskAmount = (parseFloat(accountSize) * parseFloat(riskPercent)) / 100;
        const maxContracts = Math.floor(riskAmount / (selectedSpec.margin * 0.1)); // Example calculation
        const stopDistance = (riskAmount / (maxContracts || 1)) / (selectedSpec.tickValue / selectedSpec.tickSize);
        const marginRequired = (maxContracts || 1) * selectedSpec.margin;

        return { riskAmount, maxContracts, stopDistance, marginRequired };
    }, [accountSize, riskPercent, selectedSpec]);

    const handleAddContract = () => {
        toast.info("Contract Search Module", {
            description: "Opening institutional contract database for selection..."
        });
    };

    const handleRoll = (symbol: string, target: string) => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: `Executing Rollover for ${symbol}...`,
            success: `Successfully rolled to ${target}. Updating watchlist...`,
            error: "Rollover execution failed. Check connectivity."
        });
    };

    const handleViewDetails = (symbol: string) => {
        toast.info(`Contract Specifications: ${symbol}`, {
            description: "Loading high-fidelity technical specs and margin schedule..."
        });
    };

    const handleRemove = (symbol: string) => {
        toast.error(`Removed from Watchlist`, {
            description: `Symbol ${symbol} has been detached from your planner.`
        });
    };

    const handleNotify = (symbol: string, rollTarget?: string) => {
        addNotification({
            title: "Rollover Alert Set",
            message: `You will be notified to roll ${symbol}${rollTarget ? ` to ${rollTarget}` : ''}.`,
            type: "system"
        });
    };

    const handleCalculate = () => {
        toast.success("Execution Plan Verified", {
            description: `Position sized for $${results.riskAmount.toLocaleString()} total risk.`
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500/20 to-emerald-500/20 border border-[var(--color-border)] flex items-center justify-center">
                        <Briefcase className="text-brand-500 w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[8px] font-black uppercase tracking-widest">Planning</span>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-gray-500 text-[8px] font-black uppercase tracking-widest">Institutional</span>
                        </div>
                        <h1 className="text-2xl font-black text-[var(--color-text-primary)] italic uppercase tracking-tighter">
                            Contract <span className="text-brand-500">Planner</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest tracking-widest">Plan your rollover strategy and track contract transitions</p>
                    </div>
                </div>

                <button
                    onClick={handleAddContract}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-black rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16, 185, 129,0.2)]"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Contract
                </button>
            </div>

            {/* Rollover Strategy Guide */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-brand-500/10">
                        <RefreshCw className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic tracking-widest">Rollover Strategy Guide</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[80%] h-px bg-[var(--color-surface-2)] hidden md:block" />

                    {[
                        { step: 1, label: "Monitor FND", desc: "Track First Notice Day - typically 2-3 weeks before expiration" },
                        { step: 2, label: "Check Volume", desc: "Watch for volume shift to next contract month" },
                        { step: 3, label: "Execute Roll", desc: "Close expiring position and open in new contract" },
                        { step: 4, label: "Verify", desc: "Confirm new position and update tracking" }
                    ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center relative z-10">
                            <div className="w-12 h-12 rounded-full bg-surface border-2 border-brand-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16, 185, 129,0.1)]">
                                <span className="text-brand-500 font-black italic">{step.step}</span>
                            </div>
                            <h4 className="text-[10px] font-black text-[var(--color-text-primary)] uppercase mb-2 tracking-widest">{step.label}</h4>
                            <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed max-w-[120px]">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Contract Watchlist */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-brand-500" />
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic tracking-widest">My Contract Watchlist</h3>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] text-[9px] font-black uppercase tracking-widest">
                        {watchlist?.length || 0} Contracts
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {watchlist?.map((item: any, idx: number) => {
                        const config = (STATUS_CONFIG as any)[item.statusType] || STATUS_CONFIG.success;
                        const StatusIcon = config.icon;
                        return (
                            <div key={idx} className={clsx("p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300", config.bg, "border-l-4", item.statusType === 'critical' ? 'border-l-red-500' : item.statusType === 'warning' ? 'border-l-amber-500' : 'border-l-brand-500')}>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-[var(--color-text-primary)] italic">{item.symbol}</span>
                                        <div className={clsx("px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1", config.badge)}>
                                            <StatusIcon className="w-2.5 h-2.5" />
                                            {item.status}
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                                    {item.rollTarget && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <button
                                                onClick={() => handleRoll(item.symbol, item.rollTarget)}
                                                className="px-3 py-1.5 bg-brand-500 text-black rounded-lg text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-brand-600 transition-all"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                                Roll to {item.rollTarget}
                                            </button>
                                            <button
                                                onClick={() => handleNotify(item.symbol, item.rollTarget)}
                                                className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                            >
                                                <Bell className="w-3 h-3" />
                                                Notify
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(item.symbol)}
                                                className="px-3 py-1.5 bg-[var(--color-surface-2)] text-gray-400 rounded-lg text-[10px] font-black uppercase italic hover:text-[var(--color-text-primary)] transition-all"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    )}
                                    {!item.rollTarget && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <button
                                                onClick={() => handleNotify(item.symbol)}
                                                className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                            >
                                                <Bell className="w-3 h-3" />
                                                Notify
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(item.symbol)}
                                                className="px-3 py-1.5 bg-[var(--color-surface-2)] text-gray-400 rounded-lg text-[10px] font-black uppercase italic hover:text-[var(--color-text-primary)] transition-all"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item.symbol)}
                                                className="px-3 py-1.5 bg-[var(--color-surface-2)] text-red-500/50 rounded-lg text-[10px] font-black uppercase italic hover:bg-red-500/10 hover:text-red-500 transition-all"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-black text-[var(--color-text-primary)] italic leading-none">{item.daysLeft} <span className="text-[10px] not-italic text-gray-500 uppercase tracking-widest">days left</span></div>
                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                        {item.statusType === 'warning' ? 'FND:' : 'Expires:'} {item.expiryDate}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Position Size Calculator */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/[0.02] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-brand-500/10">
                        <Calculator className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic tracking-widest">Position Size Calculator</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Size ($)</label>
                        <input
                            type="number"
                            value={accountSize}
                            onChange={(e) => setAccountSize(e.target.value)}
                            className="w-full bg-surface border border-[var(--color-border)] rounded-lg p-4 text-xs font-black text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Risk Per Trade (%)</label>
                        <input
                            type="number"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(e.target.value)}
                            className="w-full bg-surface border border-[var(--color-border)] rounded-lg p-4 text-xs font-black text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Contract</label>
                        <div className="relative group/select">
                            <select
                                value={selectedContractId}
                                onChange={(e) => setSelectedContractId(e.target.value)}
                                className="w-full appearance-none bg-surface border border-[var(--color-border)] rounded-lg p-4 text-xs font-black text-[var(--color-text-primary)] outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                            >
                                {specs?.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover/select:text-[var(--color-text-primary)] transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg">
                    <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Risk Amount</div>
                        <div className="text-xl font-black text-emerald-500">${results.riskAmount.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Max Contracts</div>
                        <div className="text-xl font-black text-[var(--color-text-primary)] italic">{results.maxContracts}</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Stop Distance</div>
                        <div className="text-xl font-black text-[var(--color-text-primary)] italic">{results.stopDistance.toFixed(1)} <span className="text-[10px] not-italic text-gray-500">pts</span></div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Margin Required</div>
                        <div className="text-xl font-black text-[#10b981] italic">${results.marginRequired.toLocaleString()}</div>
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-brand-500 to-[#10b981] text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(16, 185, 129,0.2)] transform hover:-translate-y-0.5"
                >
                    Calculate Position Size
                </button>
            </div>
        </div>
    );
}

function ChevronDown(props: any) {
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
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
