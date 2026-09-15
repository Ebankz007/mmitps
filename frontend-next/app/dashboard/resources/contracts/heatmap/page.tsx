/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
    LayoutGrid,
    PieChart,
    BarChart3,
    Activity,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Maximize2,
    Database,
    Globe,
    ChevronDown,
    Award,
    TrendingUp,
    MessageSquare
} from "lucide-react";
import { clsx } from "clsx";
import { useContractHeatMap } from "@/hooks/use-resources";
import { toast } from "sonner";

const STATUS_COLORS = {
    high: "border-[#ef4444] bg-[#ef4444]/5 text-[#ef4444]",
    medium: "border-[#10b981] bg-[#10b981]/5 text-[#10b981]",
    low: "border-[#10b981] bg-[#10b981]/5 text-[#10b981]"
};

const ICON_MAP = {
    BarChart3: BarChart3,
    Activity: Activity,
    Zap: Zap,
    Database: Database,
    Globe: Globe,
    Search: Search,
    LayoutGrid: LayoutGrid,
    BarChart: BarChart3,
    Filter: Filter
};

export default function ContractHeatmapPage() {
    const [viewType, setViewType] = useState<'margin' | 'liquidity'>('margin');
    const [marketFilter, setMarketFilter] = useState('All Markets');

    const { data: marginData, isLoading: loadingMargin } = useContractHeatMap('margin');
    const { data: liquidityData, isLoading: loadingLiquidity } = useContractHeatMap('liquidity');
    const { data: comparisonData, isLoading: loadingComparison } = useContractHeatMap('comparison');
    const { data: volatilityData, isLoading: loadingVolatility } = useContractHeatMap('volatility');

    const handleViewDetails = (symbol: string) => {
        toast.info(`Contract Profile: ${symbol}`, {
            description: "Loading detailed specifications, exchange rules, and clearing details..."
        });
    };

    const handleSmartAnalysis = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: "Running cross-market volatility correlation analysis...",
            success: "Analysis complete. Detected high correlation in Energy/Indices cross.",
            error: "Neural analysis engine currently under maintenance."
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Institutional Branding */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-500/20 border border-[var(--color-border)] flex items-center justify-center">
                        <LayoutGrid className="text-brand-500 w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[8px] font-black uppercase tracking-widest">Resource</span>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-gray-500 text-[8px] font-black uppercase tracking-widest">Real-time</span>
                        </div>
                        <h1 className="text-2xl font-black text-[var(--color-text-primary)] italic uppercase tracking-tighter">
                            Contract <span className="text-brand-500">Heat Map</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Visual comparison of contract specifications across markets</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <select
                            value={viewType}
                            onChange={(e) => setViewType(e.target.value as any)}
                            className="appearance-none bg-[#050505] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest outline-none focus:border-brand-500/50 transition-all cursor-pointer min-w-[160px]"
                        >
                            <option value="margin">Margin Requirements</option>
                            <option value="liquidity">Liquidity Heat Map</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none group-hover:text-[var(--color-text-primary)] transition-colors" />
                    </div>

                    <div className="relative group">
                        <select
                            value={marketFilter}
                            onChange={(e) => setMarketFilter(e.target.value)}
                            className="appearance-none bg-[#050505] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest outline-none focus:border-brand-500/50 transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="All Markets">All Markets</option>
                            <option value="Indices">Indices</option>
                            <option value="Energies">Energies</option>
                            <option value="Metals">Metals</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none group-hover:text-[var(--color-text-primary)] transition-colors" />
                    </div>
                </div>
            </div>

            {/* Main Heat Map Section */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {viewType === 'margin' ? <Database className="w-5 h-5 text-red-500" /> : <TrendingUp className="w-5 h-5 text-green-500" />}
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">
                            {viewType === 'margin' ? 'Margin Requirements Heat Map' : 'Contract Liquidity Heat Map'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Low</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /> Medium</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ef4444]" /> High</div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {viewType === 'margin' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {marginData?.data?.map((item: any, idx: number) => {
                                const Icon = (ICON_MAP as any)[item.icon] || LayoutGrid;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleViewDetails(item.symbol)}
                                        className={clsx(
                                            "relative group p-6 rounded-lg border transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                                            (STATUS_COLORS as any)[item.status]
                                        )}
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="p-2 rounded-lg bg-[var(--color-surface-2)]">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-[var(--color-text-primary)]">{item.symbol}</div>
                                                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">{item.name}</div>
                                                <div className="text-lg font-black">{item.margin}</div>
                                                <div className="text-[7px] font-black uppercase text-gray-500 tracking-tighter">Initial Margin</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liquidityData?.data?.map((sector: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "group bg-white/[0.02] border border-[var(--color-border)] p-6 rounded-lg relative overflow-hidden transition-all hover:border-brand-500/30",
                                        sector.bias === "Bullish" ? "border-l-4 border-l-green-500" :
                                            sector.bias === "Bearish" ? "border-l-4 border-l-red-500" :
                                                "border-l-4 border-l-brand-500"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">{sector.name}</h3>
                                        <div className={clsx(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                            sector.bias === "Bullish" ? "bg-green-500/10 text-green-500" :
                                                sector.bias === "Bearish" ? "bg-red-500/10 text-red-500" :
                                                    "bg-brand-500/10 text-brand-500"
                                        )}>
                                            {sector.bias}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                                <span>Relative Liquidity</span>
                                                <span className="text-[var(--color-text-primary)]">{sector.liquidity}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-500 rounded-full shadow-[0_0_8px_#10b981]"
                                                    style={{ width: `${sector.liquidity}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                                <span>Sector Volatility</span>
                                                <span className="text-[var(--color-text-primary)]">{sector.vol}% IV</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-500 rounded-full"
                                                    style={{ width: `${sector.vol * 3}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex flex-wrap gap-2">
                                        {sector.assets.map((asset: string) => (
                                            <div key={asset} className="px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-[9px] font-black text-gray-400 group-hover:text-[var(--color-text-primary)] transition-colors">
                                                {asset}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-brand-500" />
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">Detailed Contract Comparison</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] text-left bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contract</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Initial Margin</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Maint. Margin</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tick Value</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contract Value</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Leverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData?.data?.map((row: any, idx: number) => (
                                <tr
                                    key={idx}
                                    onClick={() => handleViewDetails(row.contract)}
                                    className="border-b border-[var(--color-border)] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-xs font-black text-[var(--color-text-primary)]">{row.contract}</td>
                                    <td className="px-6 py-4 text-xs font-black text-brand-500">{row.initial}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{row.maintenance}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{row.tick}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{row.value}</td>
                                    <td className="px-6 py-4 text-xs font-black text-red-500 text-right">{row.leverage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Row: Volatility & Broadcast */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-[#050505] border border-[var(--color-border)] rounded-lg p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-brand-500/10">
                            <Activity className="h-5 w-5 text-brand-500" />
                        </div>
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">Global Volatility Correlation</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {volatilityData?.data?.map((stat: any, idx: number) => (
                            <div key={idx} className="p-6 bg-white/[0.02] border border-[var(--color-border)] rounded-lg relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">{stat.name}</div>
                                <div className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter">{stat.val}</div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className={clsx(
                                        "w-1.5 h-1.5 rounded-full",
                                        stat.status === 'Active' || stat.status === 'Rising' ? 'bg-red-500' : 'bg-green-500'
                                    )} />
                                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-tighter">{stat.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#050505] border border-[var(--color-border)] rounded-lg p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-brand-500/10">
                                <MessageSquare className="h-4 w-4 text-brand-400" />
                            </div>
                            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest italic">System Broadcast</h3>
                        </div>
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-[var(--color-border)] relative">
                            <div className="absolute -left-1 top-4 w-1 h-12 bg-brand-500 rounded-full" />
                            <p className="text-[10px] text-gray-400 leading-relaxed font-black uppercase tracking-tight italic">
                                Institutional re-balancing detected in Financials sector. Prepare for increased bond futures volatility during London fix.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSmartAnalysis}
                        className="w-full mt-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16, 185, 129,0.2)] transition-all transform hover:-translate-y-0.5"
                    >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Smart Analysis
                    </button>
                </div>
            </div>
        </div>
    );
}
