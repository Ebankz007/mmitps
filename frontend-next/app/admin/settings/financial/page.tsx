/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { financialService } from "@/lib/api/financial";
import { useLanguage } from "@/lib/language-context";
import { Plus, Settings2, ShieldCheck, Banknote, Edit2 } from "lucide-react";
import { clsx } from "clsx";

interface CurrencyConfig {
    symbol: string;
    name: string;
    type: 'fiat' | 'crypto' | 'credits';
    isActive: boolean;
}

export default function AdminFinancialSettingsPage() {
    const { t } = useLanguage();
    const [currencies, setCurrencies] = useState<CurrencyConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Currency Form State
    const [symbol, setSymbol] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState<'fiat' | 'crypto' | 'credits'>("crypto");
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            setLoading(true);
            const data = await financialService.adminGetSupportedCurrencies();
            setCurrencies(data || []);
        } catch (error) {
            console.error("Failed to fetch currencies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await financialService.adminAddSupportedCurrency({
                symbol,
                name,
                type,
                isActive
            });
            await fetchCurrencies();

            // Reset form if it was a new creation
            setSymbol("");
            setName("");
            setType("crypto");
            setIsActive(true);
        } catch (error) {
            console.error("Failed to save currency:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (curr: CurrencyConfig) => {
        setSymbol(curr.symbol);
        setName(curr.name);
        setType(curr.type);
        setIsActive(curr.isActive);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text-primary)]">Financial <span className="text-[#10b981]">Configuration</span></h1>
                <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage platform supported currencies and wallets</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form */}
                <div className="lg:col-span-1">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden sticky top-8 shadow-2xl">
                        <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.02]">
                            <h2 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-[#10b981]" />
                                {symbol ? "Edit Currency" : "Add Currency"}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Configure a wallet currency to be accessible by users.</p>
                        </div>

                        <form onSubmit={handleSaveCurrency} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Symbol</label>
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    placeholder="e.g. SOL"
                                    required
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Solana"
                                    required
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full bg-surface-2 border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[#10b981] transition-colors appearance-none"
                                >
                                    <option value="fiat">Fiat (e.g. USD, EUR)</option>
                                    <option value="crypto">Crypto (e.g. BTC, ETH)</option>
                                    <option value="credits">Credits (e.g. Bonus)</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-[var(--color-border-hover)] transition-all">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-[#10b981] focus:ring-[#10b981] bg-surface-2"
                                />
                                <div>
                                    <div className="text-sm font-bold text-[var(--color-text-primary)]">Active Wallet</div>
                                    <div className="text-[10px] text-gray-400">Enable this currency for all users</div>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-black rounded-lg transition-all shadow-lg shadow-[#10b981]/20 flex justify-center items-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5" />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Supported Currencies List */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--color-border)] bg-white/[0.02]">
                            <h2 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-emerald-500" />
                                Supported Currencies
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500 animate-pulse">Loading currencies...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[var(--color-surface-2)] text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-[var(--color-border)]">
                                            <th className="px-6 py-4">Symbol</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {currencies.map((curr) => (
                                            <tr key={curr.symbol} className="hover:bg-[var(--color-surface-2)] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-[var(--color-text-primary)]">{curr.symbol}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-300 font-medium">{curr.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded">
                                                        {curr.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {curr.isActive ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Disabled
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleEditClick(curr)}
                                                        className="text-gray-400 hover:text-[var(--color-text-primary)] transition-colors p-2 hover:bg-[var(--color-surface-3)] rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {currencies.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No currencies configured yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
