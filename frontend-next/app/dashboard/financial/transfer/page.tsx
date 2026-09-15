/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { financialService } from "@/lib/api/financial";
import {
    ArrowRightLeft,
    User,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    AlertCircle,
    Building2,
    Briefcase,
    ChevronRight,
    Bookmark
} from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function TransferPage() {
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"internal" | "user" | "exchange">("internal");
    const [recipientId, setRecipientId] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const tabs = [
        { id: "internal", label: "Internal Transfer", icon: <div className="bg-[var(--color-surface-3)] p-1.5 rounded-md"><ArrowRightLeft className="h-3.5 w-3.5" /></div> },
        { id: "user", label: "To Other User", icon: <div className="bg-[var(--color-surface-3)] p-1.5 rounded-md"><User className="h-3.5 w-3.5" /></div> },
        { id: "exchange", label: "To Exchange", icon: <div className="bg-[var(--color-surface-3)] p-1.5 rounded-md"><CreditCard className="h-3.5 w-3.5" /></div> },
    ];

    const handleTransfer = async () => {
        if (!amount) {
            toast.error("Please enter a transfer amount");
            return;
        }
        if (type === "user" && !recipientId) {
            toast.error("Please enter a recipient ID or email");
            return;
        }

        setLoading(true);
        try {
            await financialService.transfer({
                amount: parseFloat(amount),
                type,
                recipientId: type === "user" ? recipientId : undefined
            });
            setTimeout(() => {
                setSuccess(true);
                setLoading(false);
            }, 1000); // Simulate connection
        } catch (error) {
            console.error("Transfer failed:", error);
            toast.error("Transfer failed to initiate");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="h-12 w-12 text-[#10b981]" />
                </div>
                <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter mb-4">Transfer Successful</h1>
                <p className="text-gray-400 text-lg mb-10">
                    Successfully transferred <span className="text-[var(--color-text-primary)] font-bold">${amount}</span> to <span className="text-[var(--color-text-primary)] font-bold">{type === "user" ? recipientId : "the destination wallet"}</span>.
                </p>
                <button
                    onClick={() => { setSuccess(false); setAmount(""); setRecipientId(""); }}
                    className="bg-[#0B0E14] border border-[var(--color-border)] hover:border-[#10b981]/50 hover:bg-[#10b981]/5 text-[var(--color-text-primary)] px-10 py-4 rounded-lg font-black tracking-widest uppercase transition-all shadow-xl"
                >
                    Make Another Transfer
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

            {/* Header Area */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    <span className="text-[#10b981]">Financial</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-[#10b981]">Transfer</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-[#10b981] flex items-center gap-3">
                    <ArrowRightLeft className="h-8 w-8" />
                    Fund Transfer
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-medium">Transfer funds between wallets or to other MMITPS users</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setType(t.id as "internal" | "user" | "exchange")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all border border-transparent",
                            type === t.id
                                ? "bg-[#10b981] text-[var(--color-text-primary)] shadow-lg"
                                : "bg-[#161B22] text-gray-400 hover:text-[var(--color-text-primary)] border-[var(--color-border)]"
                        )}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Available Balance Banner */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
                <div>
                    <div className="text-gray-500 text-xs font-medium mb-1">Available Balance</div>
                    <div className="text-4xl font-bold tracking-tight text-[#10B981]">$8,542.30 USD</div>
                </div>
                <div className="flex gap-8">
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold text-right mb-1">EUR</div>
                        <div className="text-[#10b981] font-bold">€1,245.00</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold text-right mb-1">BTC</div>
                        <div className="text-[#10b981] font-bold">0.0234</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold text-right mb-1">ETH</div>
                        <div className="text-[#10b981] font-bold">0.4820</div>
                    </div>
                </div>
            </div>

            {/* Transfer Form Box */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-8 shadow-xl relative overflow-hidden">
                {/* Active Tab Header */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-[#10b981] p-1.5 rounded-md text-[var(--color-text-primary)]">
                        {type === "internal" ? <ArrowRightLeft className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <h2 className="text-[var(--color-text-primary)] font-bold text-lg">{tabs.find(t => t.id === type)?.label}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-end relative">
                    {/* From Wallet */}
                    <div>
                        <label className="block text-gray-500 text-xs font-medium mb-2">From Wallet</label>
                        <div className="relative">
                            <select className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-10 pr-10 py-4 text-gray-300 text-sm font-medium appearance-none focus:outline-none focus:border-[#10b981]/50 cursor-pointer">
                                <option>Main Wallet (USD) - $8,542.30</option>
                                <option>Earnings Wallet (USD) - $250.00</option>
                            </select>
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">💵</span>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 rotate-90 pointer-events-none" />
                        </div>
                    </div>

                    {/* Center Arrow */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-2 z-10 w-8 h-8 rounded-full bg-[#161B22] border border-[var(--color-border)] items-center justify-center pointer-events-none shadow-lg">
                        <ArrowRight className="h-4 w-4 text-[#10b981]" />
                    </div>

                    {/* To Wallet / Destination */}
                    <div>
                        <label className="block text-gray-500 text-xs font-medium mb-2">To {type === "user" ? "User Email or ID" : "Wallet"}</label>
                        {type === "user" ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-4 text-[var(--color-text-primary)] text-sm font-medium focus:outline-none focus:border-[#10b981]/50"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="relative">
                                <select className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-10 pr-10 py-4 text-gray-300 text-sm font-medium appearance-none focus:outline-none focus:border-[#10b981]/50 cursor-pointer">
                                    <option>Trading Account</option>
                                    <option>Savings Account</option>
                                </select>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">📊</span>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 rotate-90 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                    <label className="block text-gray-500 text-xs font-medium mb-2">Amount</label>
                    <div className="relative flex items-center">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-[#161B22] border border-[var(--color-border)] rounded-lg pl-4 pr-20 py-4 text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[#10b981]/50"
                        />
                        <button
                            onClick={() => setAmount("8542.30")}
                            className="absolute right-2 px-4 py-2 bg-[#1C2128] hover:bg-[#252A33] border border-[var(--color-border)] text-[#10b981] text-xs font-bold rounded shadow-sm transition-all"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {/* Sub info */}
                <div className="flex justify-between items-center py-4 border-b border-t border-[var(--color-border)] mt-8 mb-8">
                    <div className="space-y-2">
                        <div className="text-gray-500 text-xs font-medium">Transfer Fee</div>
                        <div className="text-gray-500 text-xs font-medium">Processing Time</div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="text-[#10B981] text-xs font-bold">FREE</div>
                        <div className="text-[var(--color-text-primary)] text-xs font-bold">Instant</div>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    disabled={!amount || (type === "user" && !recipientId) || loading}
                    onClick={handleTransfer}
                    className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[var(--color-text-primary)] font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-border-hover)] border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <div className="bg-[var(--color-surface-3)] p-1 rounded-sm"><ArrowRightLeft className="h-3.5 w-3.5" /></div>
                            Transfer Funds
                        </>
                    )}
                </button>
            </div>

            {/* Recent Transfers List */}
            <div className="bg-[#0B0E14] border border-[var(--color-border)] rounded-lg p-6 md:p-8 mt-4 shadow-xl">
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <Bookmark className="h-4 w-4 text-[#10b981]" />
                    <h2 className="text-[var(--color-text-primary)] font-bold text-sm tracking-widest uppercase">Recent Transfers</h2>
                </div>

                <div className="space-y-2">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors border-b border-[var(--color-border)] border-transparent">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1C2128] p-3 rounded-lg border border-[var(--color-border)]">
                                <ArrowRightLeft className="h-4 w-4 text-[#10b981]" />
                            </div>
                            <div>
                                <div className="text-[var(--color-text-primary)] text-sm font-bold flex items-center gap-2">
                                    Main Wallet <ArrowRight className="h-3 w-3 text-gray-500" /> Trading Account
                                </div>
                                <div className="text-gray-500 text-[10px] mt-1 flex items-center gap-1">
                                    Jan 30, 2026 • Internal
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[var(--color-text-primary)] font-bold text-sm">$250.00</div>
                            <div className="text-[#10B981] text-[10px] mt-1">Completed</div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1C2128] p-3 rounded-lg border border-[var(--color-border)] relative">
                                <User className="h-4 w-4 text-gray-400" />
                                <div className="absolute -bottom-1 -right-1 bg-rose-500 rounded-full w-2.5 h-2.5 border border-[#1C2128]"></div>
                            </div>
                            <div>
                                <div className="text-[var(--color-text-primary)] text-sm font-bold">
                                    Sent to john.trader@email.com
                                </div>
                                <div className="text-gray-500 text-[10px] mt-1 flex items-center gap-1">
                                    Jan 25, 2026 • P2P
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-rose-500 font-bold text-sm">-$100.00</div>
                            <div className="text-[#10B981] text-[10px] mt-1">Completed</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
