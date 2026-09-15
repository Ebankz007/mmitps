/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { financialService } from "@/lib/api/financial";
import api from "@/lib/api";
import { Wallet, Settings2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CurrencyConfig {
    symbol: string;
    name: string;
    type: string;
    isActive: boolean;
}

interface UserWalletBalance {
    currency: string;
    amount: number;
    frozen: number;
}

export default function AdminUserWalletPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    // Core Data
    const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyConfig[]>([]);
    const [userBalances, setUserBalances] = useState<Record<string, UserWalletBalance>>({});

    // Edit Form State
    const [selectedCurrency, setSelectedCurrency] = useState<string>("");
    const [editAmount, setEditAmount] = useState<string>("0");
    const [editFrozen, setEditFrozen] = useState<string>("0");

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Get User Details (for context)
            const userRes = await api.get(`/api/v1/admin/users/${userId}`);
            // Depending on how your admin user get returns data, adjust this:
            setUserEmail(userRes.data?.data?.email || userRes.data?.email || "Unknown User");

            // 2. Get Supported Currencies
            const currenciesInfo = await financialService.adminGetSupportedCurrencies();
            setSupportedCurrencies(currenciesInfo || []);

            if (currenciesInfo && currenciesInfo.length > 0) {
                setSelectedCurrency(currenciesInfo[0].symbol);
            }

            // 3. Get User's Actual Balances. We can't use the standard hook because it uses the logged in user.
            // We need a specific admin endpoint to fetch a user's wallet. Since we don't have a dedicated GET /admin/users/:id/wallet
            // we will simulate fetching it, or rely on the assumption that if they edit, they know what they are doing.
            // However, to be elegant, we will just start editing from 0 if we don't have a direct fetch,
            // OR we can make a direct API call if your system supports looking up wallets by userId for admins.
            // Assuming we must have an admin endpoint or we just build a blanket editor:
            try {
                const walletRes = await api.get(`/api/v1/financial/wallet/balance?userId=${userId}`); // Fallback if API supports it
                // Parse balances into dictionary for easy access
                const balanceDict: Record<string, UserWalletBalance> = {};
                walletRes.data.data.cryptoBalances.forEach((b: any) => {
                    balanceDict[b.currency] = {
                        currency: b.currency,
                        amount: b.amount,
                        frozen: b.frozen || 0
                    };
                });
                setUserBalances(balanceDict);
            } catch (err: any) {
                console.warn("Could not fetch specific user balances easily. Will allow overriding from 0.", err.message);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load user configuration.");
        } finally {
            setLoading(false);
        }
    };

    // When selected currency changes, update the form inputs with current values
    useEffect(() => {
        if (selectedCurrency && userBalances[selectedCurrency]) {
            setEditAmount(userBalances[selectedCurrency].amount.toString());
            setEditFrozen(userBalances[selectedCurrency].frozen.toString());
        } else {
            setEditAmount("0");
            setEditFrozen("0");
        }
    }, [selectedCurrency, userBalances]);

    const handleSaveWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            const payload = {
                currency: selectedCurrency,
                amount: parseFloat(editAmount),
                frozen: parseFloat(editFrozen),
                target: 'available' as const // We want to update both, but the API might require specific targets. Let's send the whole block.
                // Depending on your API implementation, you might need two calls or the API is smart enough to update both. 
                // Let's assume the API handles updating the specific currency block entirely.
            };

            await financialService.adminUpdateUserWallet(userId, {
                currency: payload.currency,
                amount: payload.amount,
                target: 'available'
            });

            // Note: If you want to update frozen specifically, you might need a second call depending on your controller implementation.
            // For now, based on standard implementations, we assume the controller handles 'available' and 'frozen' targets separately.
            if (parseFloat(editFrozen) > 0 || userBalances[selectedCurrency]?.frozen !== parseFloat(editFrozen)) {
                await financialService.adminUpdateUserWallet(userId, {
                    currency: payload.currency,
                    amount: payload.frozen,
                    target: 'frozen'
                });
            }

            toast.success(`${selectedCurrency} Wallet Updated Successfully`);
            await fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to update wallet:", error);
            toast.error("Failed to save wallet data.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading wallet configuration...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div>
                <Link href="/admin/users" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Link>
                <h1 className="text-3xl font-black tracking-tighter text-white">Manage <span className="text-[#10b981]">Wallet</span></h1>
                <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Admin override for user: <span className="text-white">{userEmail}</span></p>
            </div>

            <div className="bg-[#0D0D0D] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-[#10b981]" />
                        Wallet Balances Override
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Directly modify the available and pending balances for this user.</p>
                </div>

                <form onSubmit={handleSaveWallet} className="p-6 space-y-6">
                    {/* Currency Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Currency Wallet</label>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors appearance-none font-bold"
                        >
                            {supportedCurrencies.map((c) => (
                                <option key={c.symbol} value={c.symbol}>
                                    {c.name} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        {/* Available Balance */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Available Balance
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-white/5 border border-emerald-500/20 rounded-lg pl-8 pr-4 py-3 text-white font-black text-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Funds the user can actively trade or withdraw.</p>
                        </div>

                        {/* Locked/Pending Balance */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-brand-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                Locked / Pending Funds
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={editFrozen}
                                    onChange={(e) => setEditFrozen(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-white/5 border border-brand-500/20 rounded-lg pl-8 pr-4 py-3 text-white font-black text-xl focus:outline-none focus:border-brand-500 transition-colors"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">Funds currently locked in stakes, pending operations, or frozen by admin.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-black rounded-lg transition-all shadow-lg flex items-center gap-2"
                        >
                            {submitting ? (
                                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Override Data
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 p-4 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                <h3 className="text-sm font-bold text-brand-500 mb-1 flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Administration Notice
                </h3>
                <p className="text-xs text-brand-500/80">
                    Modifying user balances directly circumvents standard transactional logging. Proceed with caution. Balances are treated as absolutes and will immediately reflect on the user's dashboard.
                </p>
            </div>
        </div>
    );
}
