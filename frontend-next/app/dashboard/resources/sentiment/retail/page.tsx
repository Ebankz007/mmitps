"use client";

import { useState } from "react";
import { useSentimentBySymbol } from "@/hooks/use-sentiment";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import {
    Users,
    TrendingUp,
    TrendingDown,
    Zap,
    Info,
    ArrowRightCircle,
    Gauge,
    Activity
} from "lucide-react";
import { clsx } from "clsx";

const MAJOR_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "XAUUSD", "BTCUSD", "US30", "XAGUSD", "XALUSD", "XAUAUD", "XAUEUR", "XCUUSD", "XNIUSD", "XPBUSD", "XPDUSD", "XPTUSD", "XZNUSD", "EURCZK", "EURHUF", "EURPLN", "EURTRY", "EURZAR", "GBPPLN", "GBPZAR", "USDCNH", "USDCZK", "USDHUF", "USDILS", "USDMXN", "USDPLN", "USDTRY", "USDZAR", "AUDCAD", "AUDCHF", "AUDJPY", "AUDNZD", "CADCHF", "CADJPY", "CHFJPY", "EURAUD", "EURCAD", "EURCHF", "EURDKK", "EURGBP", "EURHKD", "EURJPY", "EURMXN", "EURNOK", "EURNZD", "EURSEK", "EURRON", "EURSGD", "GBPAUD", "GBPCAD", "GBPCHF", "GBPDKK", "GBPHKD", "GBPJPY", "GBPNZD", "GBPSEK", "GBPSGD", "NOKSEK", "NZDCAD", "NZDCHF", "NZDJPY", "NZDSGD", "NZDUSD", "USDCAD", "USDCHF", "USDDKK", "USDHKD", "USDNOK", "USDRON", "USDSEK", "USDSGD"];

export default function RetailSentimentPage() {
    const [symbol, setSymbol] = useState("EURUSD");
    const { data, isLoading: loading } = useSentimentBySymbol(symbol);


    const pieData = data ? [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: "Bullish", value: (data as any).bullish, color: "#10b981" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: "Bearish", value: (data as any).bearish, color: "#ef4444" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: "Neutral", value: (data as any).neutral, color: "#94a3b8" }
    ] : [];

    const isContrarianBullish = data && data.bearish > 70;
    const isContrarianBearish = data && data.bullish > 70;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-[var(--color-border)] p-6 rounded-lg">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                        <Users className="text-[#10b981]" />
                        Retail Sentiment Analysis
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time crowd positioning and contrarian indicators</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {MAJOR_PAIRS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSymbol(s)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                symbol === s
                                    ? "bg-[#10b981] text-black shadow-[0_0_15px_rgba(16, 185, 129,0.3)]"
                                    : "bg-[var(--color-surface-2)] text-gray-400 hover:text-[var(--color-text-primary)]"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment Gauge/Chart */}
                <div className="lg:col-span-2 bg-surface border border-[var(--color-border)] p-8 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-6 left-6">
                        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Sentiment Distribution</h3>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Live Crowdsourced Positioning</p>
                    </div>

                    <div className="w-full h-[400px]">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981]"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={140}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                            <Cell key={`cell-${index}`} fill={(entry as any).color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {/* Center Display */}
                        {!loading && data && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40px] text-center">
                                <div className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                                    {Math.max(data.bullish, data.bearish)}%
                                </div>
                                <div className={clsx(
                                    "text-xs font-black uppercase tracking-widest",
                                    data.bullish > data.bearish ? "text-green-500" : "text-red-500"
                                )}>
                                    {data.bullish > data.bearish ? "Bullish" : "Bearish"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis & Signals */}
                <div className="space-y-4">
                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="h-4 w-4 text-[#10b981]" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Contrarian Signal</h3>
                        </div>

                        {isContrarianBullish ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-green-500 mb-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase">Strong Buy Alert</span>
                                </div>
                                <p className="text-[11px] text-green-300 leading-relaxed font-medium">
                                    Retail sentiment is extremely bearish (70%+). In professional institutional trading, extreme retail pessimism is often used as a reverse liquidity indicator for massive buy orders.
                                </p>
                            </div>
                        ) : isContrarianBearish ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-red-500 mb-2">
                                    <TrendingDown className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase">Strong Sell Alert</span>
                                </div>
                                <p className="text-[11px] text-red-300 leading-relaxed font-medium">
                                    Retail sentiment is extremely bullish (70%+). This indicates a potential &quot;crowded trade&quot; where a sharp reversal is likely as institutional players seek liquidity.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-center">
                                <Gauge className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Neutral Zone</div>
                                <p className="text-[10px] text-gray-500 mt-2">Positioning is balanced. No high-probability contrarian signals at this time.</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-gray-500">
                                <span>Volatility Context</span>
                                <span className="text-[var(--color-text-primary)]">Moderate</span>
                            </div>
                            <div className="w-full h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                <div className="bg-[#10b981] h-full w-[45%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-4 w-4 text-brand-400" />
                            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Trading Advisory</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            Retail sentiment should never be used as a standalone signal. Combine this with the COT Institutional reports to identify where the &quot;Dumb Money&quot; is fighting against the &quot;Smart Money&quot;.
                        </p>
                        <button className="w-full mt-4 py-3 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[var(--color-border)] transition-all flex items-center justify-center gap-2">
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            Compare with Institutions
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadboard View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["XAUUSD", "BTCUSD", "GBPUSD", "USDJPY"].map((s) => (
                    <div key={s} className="bg-surface border border-[var(--color-border)] p-4 rounded-lg hover:border-[#10b981]/30 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-[var(--color-text-primary)] uppercase">{s}</span>
                            <Activity className="h-3.5 w-3.5 text-gray-600 group-hover:text-[#10b981] transition-colors" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-red-500/20 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-[62%]"></div>
                            </div>
                            <span className="text-[10px] font-black text-green-500">62%</span>
                        </div>
                        <div className="text-[9px] text-gray-600 mt-2 font-bold uppercase tracking-widest">Bullish Sentiment</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
