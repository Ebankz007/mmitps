/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { financialService, PayoutRequest } from "@/lib/api/financial";
import {
    Download,
    CheckCircle2,
    Banknote,
    Bitcoin,
    CreditCard,
    Smartphone,
    Wallet,
    Landmark,
    ChevronDown,
    Building2,
    Check,
    ArrowRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const OVERALL_BALANCE = 8542.30;
const MINIMUM_WITHDRAWAL = 50.00;

export default function PayoutPage() {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<string>("bank");
    const [currency, setCurrency] = useState("USD");
    const [destination, setDestination] = useState("Chase Bank ****4521 (Primary)");

    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadPayouts = async () => {
            setLoading(true);
            try {
                const data = await financialService.getMyPayouts();
                setPayouts(data);
            } catch (error) {
                console.error("Failed to load payouts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPayouts();
    }, []);

    const withdrawalMethods = [
        {
            id: "bank",
            name: "Bank Transfer",
            icon: <Building2 className="h-5 w-5 text-current" />,
            desc: "Wire, ACH, SEPA",
            time: "1-3 Days",
            fee: "$0 Fee",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            id: "crypto",
            name: "Cryptocurrency",
            icon: <Bitcoin className="h-5 w-5 text-current" />,
            desc: "BTC, ETH, USDT",
            time: "1-24 Hours",
            fee: "Network Fee",
            color: "text-brand-500",
            bg: "bg-brand-500/10"
        },
        {
            id: "paypal",
            name: "PayPal",
            icon: <span className="font-bold text-lg leading-none">P</span>,
            desc: "Instant to PayPal",
            time: "Instant",
            fee: "2% Fee",
            color: "text-brand-500",
            bg: "bg-brand-500/10"
        },
        {
            id: "mobile",
            name: "Mobile Money",
            icon: <Smartphone className="h-5 w-5 text-current" />,
            desc: "M-Pesa, MTN, Airtel",
            time: "Instant",
            fee: "1% Fee",
            color: "text-teal-500",
            bg: "bg-teal-500/10"
        }
    ];

    const getFee = () => {
        if (!amount) return 0;
        const val = parseFloat(amount);
        if (method === "paypal") return val * 0.02;
        if (method === "mobile") return val * 0.01;
        // Crypto network fees can vary, normally calculated server-side, returning $0 here for UI
        return 0;
    };

    const parsedAmount = parseFloat(amount) || 0;
    const feeAmount = getFee();
    const receiveAmount = Math.max(0, parsedAmount - feeAmount);

    const handlePayoutRequest = async () => {
        if (!amount || parsedAmount < MINIMUM_WITHDRAWAL) {
            toast.error(`Minimum withdrawal is $${MINIMUM_WITHDRAWAL.toFixed(2)}`);
            return;
        }
        if (parsedAmount > OVERALL_BALANCE) {
            toast.error("Insufficient funds");
            return;
        }

        setActionLoading(true);
        try {
            const newPayout = await financialService.requestPayout({
                amount: parsedAmount,
                method,
                details: { currency, destination }
            });
            setTimeout(() => {
                setPayouts(prev => [newPayout, ...prev]);
                setSuccess(true);
                setActionLoading(false);
            }, 1000); // Simulate network delay
        } catch (error) {
            console.error("Payout request failed:", error);
            toast.error("Withdrawal request failed");
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
            case "completed":
                return <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded">Completed</span>;
            case "pending":
            case "processing":
                return <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-1 rounded">Processing</span>;
            case "rejected":
            case "cancelled":
                return <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">Failed</span>;
            default:
                return <span className="text-[10px] font-bold text-gray-400 bg-gray-500/10 border border-gray-500/20 px-2 py-1 rounded">{status}</span>;
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="h-12 w-12 text-[#10B981]" />
                </div>
                <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter mb-4">Request Received</h1>
                <p className="text-gray-400 text-lg mb-10">
                    Your withdrawal request for <span className="text-[var(--color-text-primary)] font-bold">${parsedAmount.toFixed(2)}</span> is being processed.
                    <br />Destination: <span className="text-[var(--color-text-primary)] font-bold">{destination}</span>.
                </p>
                <button
                    onClick={() => { setSuccess(false); setAmount(""); }}
                    className="bg-[#0B0E14] border border-[var(--color-border)] hover:border-[#10B981]/50 hover:bg-[#10B981]/5 text-[var(--color-text-primary)] px-10 py-4 rounded-lg font-black tracking-widest uppercase transition-all shadow-xl"
                >
                    Make Another Withdrawal
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header Area */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    <span className="text-[#10B981]">Financial</span>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                    <span className="text-gray-400">Payout</span>
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)] flex items-center gap-3">
                    <Banknote className="h-6 w-6 text-[#10B981]" />
                    Request Payout
                </h1>
                <p className="text-gray-500 text-xs mt-1">Withdraw your earnings to your bank account or crypto wallet</p>
            </div>

            {/* Top Banner */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]"></div>
                <div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Available for Withdrawal</div>
                    <div className="text-4xl font-black tracking-tight text-[#10B981] mb-1">${OVERALL_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className="text-gray-600 text-[10px] font-medium">Minimum withdrawal: ${MINIMUM_WITHDRAWAL.toFixed(2)}</div>
                </div>
                <div className="md:text-right">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Pending Payouts</div>
                    <div className="text-[#10b981] text-xl font-bold">$500.00</div>
                </div>
            </div>

            {/* Select Withdrawal Method Section */}
            <div>
                <h2 className="text-[var(--color-text-primary)] font-bold text-sm flex items-center gap-2 mb-4">
                    <Wallet className="h-4 w-4" /> Select Withdrawal Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {withdrawalMethods.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMethod(m.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border transition-all text-left relative",
                                method === m.id
                                    ? "bg-[#0B0E14] border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                    : "bg-[#0B0E14] border-[var(--color-border)] hover:border-[var(--color-border)] opacity-70 hover:opacity-100"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", m.bg, m.color)}>
                                {m.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[var(--color-text-primary)] text-xs font-bold truncate pr-6">{m.name}</div>
                                <div className="text-gray-500 text-[10px] truncate mb-2">{m.desc}</div>
                                <div className="flex items-center gap-1.5 font-medium text-[9px] uppercase tracking-wide">
                                    <span className="text-[#10b981]">{m.time}</span>
                                    <span className="text-[#10B981]">{m.fee}</span>
                                </div>
                            </div>
                            {method === m.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-[#0B0E14]" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Withdrawal Details Form Box */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <Landmark className="h-4 w-4 text-[#10b981]" />
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Withdrawal Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-gray-500 text-xs font-medium">Amount to Withdraw</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-4 pr-12 py-3.5 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Currency */}
                    <div className="space-y-2">
                        <label className="text-gray-500 text-xs font-medium">Currency</label>
                        <div className="relative">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg px-4 py-3.5 text-[var(--color-text-primary)] text-sm appearance-none focus:outline-none focus:border-[#10B981]/50 cursor-pointer"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Destination Config */}
                <div className="mb-8 space-y-2">
                    <label className="text-gray-500 text-xs font-medium">
                        {method === "crypto" ? "Saved Crypto Wallet" :
                            method === "paypal" ? "Saved PayPal Account" :
                                method === "mobile" ? "Saved Mobile Number" :
                                    "Saved Bank Account"}
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            {method === "crypto" ? <Bitcoin className="h-4 w-4 text-[#10B981]" /> :
                                method === "paypal" ? <div className="text-brand-500 font-bold">P</div> :
                                    method === "mobile" ? <Smartphone className="h-4 w-4 text-teal-500" /> :
                                        <Building2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-10 pr-10 py-3.5 text-[var(--color-text-primary)] text-sm appearance-none focus:outline-none focus:border-[#10B981]/50 cursor-pointer"
                        >
                            {method === "bank" && (
                                <>
                                    <option>Chase Bank ****4521 (Primary)</option>
                                    <option>Bank of America ****7832</option>
                                </>
                            )}
                            {method === "crypto" && (
                                <>
                                    <option>USDT Base Address (0x7a8b...3c2d)</option>
                                    <option>BTC Segwit Address (bc1q...x9yz)</option>
                                </>
                            )}
                            {method === "paypal" && (
                                <option>user@example.com (Primary)</option>
                            )}
                            {method === "mobile" && (
                                <option>+254 712 345 678 (M-Pesa)</option>
                            )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Summary Table */}
                <div className="bg-[#161B22] border border-[var(--color-border)] rounded-lg block overflow-hidden mb-6">
                    <div className="px-4 py-3 flex justify-between items-center border-b border-[var(--color-border)]">
                        <span className="text-gray-400 text-xs font-medium">Withdrawal Amount</span>
                        <span className="text-[var(--color-text-primary)] text-xs font-bold">${parsedAmount.toFixed(2)}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center border-b border-[var(--color-border)]">
                        <span className="text-gray-400 text-xs font-medium">Processing Fee</span>
                        <span className="text-[#10B981] text-xs font-bold">${feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="px-4 py-4 flex justify-between items-center bg-white/[0.02]">
                        <span className="text-[var(--color-text-primary)] text-sm font-bold">You&apos;ll Receive</span>
                        <span className="text-[#10B981] text-sm font-bold">${receiveAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    disabled={!amount || parsedAmount < MINIMUM_WITHDRAWAL || parsedAmount > OVERALL_BALANCE || actionLoading}
                    onClick={handlePayoutRequest}
                    className="w-full bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[var(--color-text-primary)] font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                    {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-border-hover)] border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <ArrowRight className="h-4 w-4" />
                            Request Withdrawal
                        </>
                    )}
                </button>
            </div>

            {/* Recent Payouts Table */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 mt-4 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-4 bg-[#10b981] rounded-full"></div>
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Recent Payouts</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Method</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest whitespace-nowrap">Destination</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Amount</th>
                                <th className="py-4 font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap pr-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Mock Data mimicking the image, but we fall back to API data if populated */}
                            {payouts.length === 0 && !loading && (
                                <>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">Feb 01, 2026</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 whitespace-nowrap">
                                            <Building2 className="h-3 w-3 text-emerald-500" /> Bank Transfer
                                        </td>
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">Chase ****4521</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] text-right whitespace-nowrap">$500.00</td>
                                        <td className="py-4 text-right whitespace-nowrap pr-4">{getStatusBadge("pending")}</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">Jan 15, 2026</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 whitespace-nowrap">
                                            <Bitcoin className="h-3 w-3 text-brand-500" /> Crypto
                                        </td>
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">0x7a8b...3c2d</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] text-right whitespace-nowrap">$1,200.00</td>
                                        <td className="py-4 text-right whitespace-nowrap pr-4">{getStatusBadge("completed")}</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">Jan 02, 2026</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2 whitespace-nowrap">
                                            <Building2 className="h-3 w-3 text-emerald-500" /> Bank Transfer
                                        </td>
                                        <td className="py-4 text-xs text-gray-400 whitespace-nowrap">BoA ****7832</td>
                                        <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] text-right whitespace-nowrap">$750.00</td>
                                        <td className="py-4 text-right whitespace-nowrap pr-4">{getStatusBadge("completed")}</td>
                                    </tr>
                                </>
                            )}

                            {/* Real Data mapped */}
                            {payouts.map(p => (
                                <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] whitespace-nowrap capitalize">
                                        {p.method}
                                    </td>
                                    <td className="py-4 text-xs text-gray-400 whitespace-nowrap">...</td>
                                    <td className="py-4 text-xs font-bold text-[var(--color-text-primary)] text-right whitespace-nowrap">${p.amount.toFixed(2)}</td>
                                    <td className="py-4 text-right whitespace-nowrap pr-4">{getStatusBadge(p.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
