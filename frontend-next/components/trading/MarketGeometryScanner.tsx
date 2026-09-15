"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, ISeriesApi, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Info, Search, RefreshCw, BarChart3, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface MarketGeometryScannerProps {
    symbol: string;
    timeframe: string;
}

interface GeometryResult {
    symbol: string;
    timeframe: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patterns: Record<string, any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    levels: Record<string, any>;
    confluence_score: number;
}

export default function MarketGeometryScanner({ symbol, timeframe }: MarketGeometryScannerProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chart = useRef<IChartApi | null>(null);
    const candySeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [scanResults, setScanResults] = useState<GeometryResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeAlerts, setActiveAlerts] = useState<Record<string, any>[]>([]);


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const generateMockData = React.useCallback((_sym: string) => {
        const data = [];
        const date = new Date();
        for (let i = 0; i < 100; i++) {
            const open = 50000 + Math.random() * 2000;
            const close = open + (Math.random() - 0.5) * 500;
            data.push({
                // @ts-expect-error - Library specific time type
                time: (date.getTime() / 1000),
                open,
                high: Math.max(open, close) + Math.random() * 200,
                low: Math.min(open, close) - Math.random() * 200,
                close
            });
            date.setDate(date.getDate() - 1);
        }
        return data.reverse();
    }, []);

    const drawPatterns = React.useCallback((patterns: Record<string, unknown>[]) => {
        // Here we would use the 'chart.current.addLineSeries' or 
        // standard drawing tools to overlay XABCD points.
        // For 'lightweight-charts', we often use markers or price lines.
        patterns.forEach(p => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pattern = p as any;
            if (pattern.type === 'harmonic') {
                // Simplified visualization using markers at pivot points
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const markers = pattern.points.map((pt: Record<string, any>, i: number) => ({
                    time: pt.time || Date.now() / 1000 - (100 - i) * 3600,
                    position: pt.price > pattern.points[0].price ? 'aboveBar' : 'belowBar',
                    color: pattern.direction === 'bullish' ? '#1fb981' : '#ef4444',
                    shape: 'circle',
                    text: ['X', 'A', 'B', 'C', 'D'][i]
                }));
                // @ts-expect-error - Library specific marker type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                candySeries.current?.setMarkers(markers as any);
            }
        });
    }, []);

    const performScan = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL ? `${process.env.NEXT_PUBLIC_PYTHON_API_URL}/geometry/scan` : 'https://python.mmitps.com/api/geometry/scan';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, timeframe, period: "5d" })
            });

            if (!response.ok) throw new Error("Scanner server unreachable");

            const data = await response.json();
            setScanResults(data);

            // Mocking historical data for visualization
            // In a real app, we'd fetch actual candles from the API
            const historicalCandles = generateMockData(symbol);
            // @ts-expect-error - Library specific data type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            candySeries.current?.setData(historicalCandles as any);

            // Draw Patterns
            if (data.patterns) {
                drawPatterns(data.patterns);
            }

            if (data.patterns.length > 0) {
                setActiveAlerts(data.patterns);
                toast.success(`Geometric Pattern Detected: ${data.patterns[0].name}`);
            }

        } catch (error) {
            console.error("Scan Error:", error);
            toast.error("Failed to fetch geometric analysis");
        } finally {
            setIsLoading(false);
        }
    }, [symbol, timeframe, drawPatterns, generateMockData]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: 10,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            crosshair: {
                mode: 0,
                vertLine: { labelBackgroundColor: '#1fb981' },
                horzLine: { labelBackgroundColor: '#1fb981' },
            },
        };

        const newChart = createChart(chartContainerRef.current, chartOptions);
        chart.current = newChart;
        
        candySeries.current = newChart.addSeries(CandlestickSeries, {
            upColor: '#1fb981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#1fb981',
            wickDownColor: '#ef4444',
        });

        const handleResize = () => {
            if (chartContainerRef.current && chart.current) {
                chart.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        performScan();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart.current) {
                chart.current.remove();
            }
        };
    }, [performScan]);


    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0b] overflow-hidden">
            {/* Scanner Controls Sidebar + Main Chart Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Display */}
                <div className="flex-1 relative border-r border-[var(--color-border)]">
                    <div ref={chartContainerRef} className="w-full h-full" />

                    {/* Floating HUD */}
                    <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                        <div className="flex items-center gap-3 bg-[var(--color-surface-2)] backdrop-blur-md px-4 py-2 rounded-lg border border-[var(--color-border)]">
                            <BarChart3 className="w-4 h-4 text-brand-500" />
                            <span className="text-sm font-black italic uppercase tracking-widest text-[var(--color-text-primary)]">{symbol}</span>
                            <div className="h-4 w-[1px] bg-[var(--color-surface-3)]" />
                            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter">{timeframe} CHART</span>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-t-2 border-brand-500 animate-spin" />
                                        <Layers className="absolute inset-0 m-auto w-6 h-6 text-brand-500 animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Projecting Geometry</span>
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.4em] mt-2">Computing Harmonic Relationships...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Trade Seeker Alert Panel */}
                <div className="w-[400px] bg-[#0d0d0f] flex flex-col p-6 overflow-y-auto gap-6 border-l border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-brand-500" />
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-[var(--color-text-primary)]">Trade Seeker Alert</h3>
                        </div>
                        <div className="bg-brand-500/10 px-2 py-1 rounded text-[10px] font-bold text-brand-500 uppercase">Real-time</div>
                    </div>

                    {activeAlerts.length > 0 ? (
                        activeAlerts.map((alert, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-5 flex flex-col gap-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-black uppercase tracking-widest ${alert.direction === 'bullish' ? 'text-brand-500' : 'text-red-500'}`}>
                                            {alert.direction.toUpperCase()} {alert.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mt-1">Foundational Geometry detected</span>
                                    </div>
                                    <div className="text-2xl font-black italic text-[var(--color-text-primary)]">{(alert.confidence * 100).toFixed(0)}%</div>
                                </div>

                                <div className="h-[1px] w-full bg-[var(--color-surface-2)]" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Setup Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                                            <span className="text-xs font-bold text-[var(--color-text-primary)]">ENTRY ZONE ACTIVE</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Decision</span>
                                        <span className={`text-xs font-bold ${alert.direction === 'bullish' ? 'text-brand-500' : 'text-red-500'}`}>STRONG {alert.direction.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex-1 bg-brand-500 py-3 rounded-lg text-xs font-black italic uppercase tracking-widest text-black hover:bg-surface transition-colors">
                                        Execute Setup
                                    </button>
                                    <button className="w-12 h-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all">
                                        <Target className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--color-text-muted)]">
                            <Search className="w-12 h-12 stroke-[1]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">Scanning Market Geometry...<br />No Class S Patterns Detected</span>
                        </div>
                    )}

                    {/* Confluence Breakdown */}
                    <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
                        <h4 className="text-[10px] font-black italic uppercase tracking-widest text-[var(--color-text-muted)] mb-4">Confluence Scorecard</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { name: "Harmonic Precision", score: scanResults?.confluence_score || 0 },
                                { name: "Structural Integrity", score: 85 },
                                { name: "Fibonacci Weighted", score: 92 },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                                        <span className="text-[var(--color-text-secondary)]">{item.name}</span>
                                        <span className="text-brand-500">{item.score}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.score}%` }}
                                            className="h-full bg-brand-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Selector Footer */}
            <div className="h-16 bg-[#080809] border-t border-[var(--color-border)] px-8 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    {['Crypto', 'Forex', 'Commodities', 'Indices'].map(asset => (
                        <button key={asset} className="flex items-center gap-2 group">
                            <div className="w-2 h-2 rounded-full border border-[var(--color-border-hover)] group-hover:border-brand-500 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{asset}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter italic">Total Geometry Engine v2.4</span>
                    <RefreshCw className="w-3 h-3 text-brand-500 animate-spin-slow" />
                </div>
            </div>
        </div>
    );
}

