"use client";

import { useEffect, useRef, useMemo, useState } from "react";

export interface SignalMarker {
    time: number; // unix timestamp in seconds
    direction: "UP" | "DOWN" | "TRANSITION";
    confidence: number;
    label: string;
    price?: number; // Added for horizontal projection
}

interface Props {
    markers: SignalMarker[];
    ohlcv: any[];
    height?: number;
}

function confidenceColor(c: number, dir: "UP" | "DOWN" | "TRANSITION") {
    // User requested: Green for UP, Red for DOWN
    if (dir === "UP") return "#22c55e"; // Green-500
    if (dir === "DOWN") return "#ef4444"; // Red-500
    return "#10b981"; // Amber for transitions
}

export default function PTDChart({ markers, ohlcv = [], height = 520 }: Props) {
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const warpContainerRef = useRef<HTMLDivElement>(null);
    
    const mainChartRef = useRef<any>(null);
    const warpChartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const warpSeriesRef = useRef<any>(null);
    const lwcRef = useRef<any>(null); // To store library exports
    
    const [isReady, setIsReady] = useState(false);
    const [libError, setLibError] = useState<string | null>(null);

    // 1. Data Parsing
    const convertedCandles = useMemo(() => {
        if (!ohlcv || ohlcv.length === 0) return [];
        
        const converted = ohlcv
            .map((bar) => {
                let t: number;
                if (typeof bar.time === 'number') {
                    t = bar.time;
                } else {
                    const dt = new Date(bar.time).getTime();
                    if (isNaN(dt)) return null;
                    t = Math.floor(dt / 1000);
                }

                const isFuture = !!bar.isFuture;
                // NinjaTrader style: Future bars are faint but recognizable
                const candleColor = isFuture ? "rgba(255,255,255,0.05)" : undefined;

                return {
                    time: t as any,
                    open: Number(bar.open),
                    high: Number(bar.high),
                    low: Number(bar.low),
                    close: Number(bar.close),
                    color: candleColor,
                    wickColor: candleColor,
                    borderColor: candleColor,
                };
            })
            .filter((bar): bar is NonNullable<typeof bar> => bar !== null)
            .sort((a, b) => a.time - b.time);

        const unique: typeof converted = [];
        for (const bar of converted) {
            if (unique.length === 0 || bar.time > unique[unique.length - 1].time) {
                unique.push(bar);
            }
        }
        return unique;
    }, [ohlcv]);

    // 2. Main Lifecycle
    useEffect(() => {
        let isMounted = true;
        let mainChart: any = null;
        let warpChart: any = null;
        let resizeObserver: ResizeObserver | null = null;

        const init = async () => {
            if (!mainContainerRef.current || !warpContainerRef.current) return;

            try {
                // Single dynamic import
                const lwc = await import("lightweight-charts");
                if (!isMounted) return;
                
                lwcRef.current = lwc; // Store for other hooks

                const { createChart, CrosshairMode, CandlestickSeries, HistogramSeries, ColorType } = lwc;
                
                if (!isMounted) return;

                const commonOptions = {
                    layout: {
                        background: { type: ColorType.Solid, color: "#080E1A" },
                        textColor: "rgba(255,255,255,0.3)",
                        fontSize: 10,
                        fontFamily: "'Inter', sans-serif",
                    },
                    grid: {
                        vertLines: { color: "rgba(255,255,255,0.02)" },
                        horzLines: { color: "rgba(255,255,255,0.02)" },
                    },
                    crosshair: {
                        mode: CrosshairMode.Normal,
                        vertLine: { 
                            color: "rgba(255,255,255,0.2)", 
                            width: 1 as any, 
                            style: 2,
                            labelBackgroundColor: "#1e293b" 
                        },
                        horzLine: { 
                            color: "rgba(255,255,255,0.2)", 
                            width: 1 as any, 
                            style: 2,
                            labelBackgroundColor: "#1e293b" 
                        },
                    },
                    handleScroll: true,
                    handleScale: true,
                };

                // --- Main Chart ---
                mainChart = createChart(mainContainerRef.current, {
                    ...commonOptions,
                    width: mainContainerRef.current.clientWidth,
                    height: height * 0.75,
                    rightPriceScale: {
                        borderColor: "rgba(255,255,255,0.05)",
                        scaleMargins: { top: 0.1, bottom: 0.1 },
                    },
                    timeScale: {
                        borderColor: "rgba(255,255,255,0.05)",
                        timeVisible: true,
                        visible: false, // Hide time scale on top chart, sync to bottom
                    },
                });

                const candleSeries = mainChart.addSeries(CandlestickSeries, {
                    upColor: "#10b981", // Emerald
                    downColor: "#ef4444", // Red
                    borderVisible: false,
                    wickUpColor: "#10b981",
                    wickDownColor: "#ef4444",
                });

                // --- Warp Chart (Timeline) ---
                warpChart = createChart(warpContainerRef.current, {
                    ...commonOptions,
                    width: warpContainerRef.current.clientWidth,
                    height: height * 0.2,
                    rightPriceScale: {
                        borderColor: "rgba(255,255,255,0.05)",
                        visible: false,
                    },
                    timeScale: {
                        borderColor: "rgba(255,255,255,0.05)",
                        timeVisible: true,
                    },
                });

                const warpSeries = warpChart.addSeries(HistogramSeries, {
                    color: "rgba(16, 185, 129, 0.5)", // Default to a subtle emerald
                    priceLineVisible: false,
                    lastValueVisible: false,
                });

                // --- Synchronization Logic ---
                mainChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
                    if (range && warpChart && isMounted) {
                        try { warpChart.timeScale().setVisibleRange(range); } catch(e) {}
                    }
                });

                warpChart.timeScale().subscribeVisibleTimeRangeChange((range: any) => {
                    if (range && mainChart && isMounted) {
                        try { mainChart.timeScale().setVisibleRange(range); } catch(e) {}
                    }
                });

                mainChart.subscribeCrosshairMove((param: any) => {
                    if (isMounted && param.time && param.point) {
                        try {
                            const price = warpSeries.coordinateToPrice(param.point.y);
                            warpChart.setCrosshairPosition(price !== null ? price : 0, param.time, warpSeries);
                        } catch (e) {}
                    } else if (isMounted) {
                        try { warpChart.clearCrosshairPosition(); } catch (e) {}
                    }
                });

                warpChart.subscribeCrosshairMove((param: any) => {
                    if (isMounted && param.time && param.point) {
                        try {
                            const price = candleSeries.coordinateToPrice(param.point.y);
                            mainChart.setCrosshairPosition(price !== null ? price : 0, param.time, candleSeries);
                        } catch (e) {}
                    } else if (isMounted) {
                        try { mainChart.clearCrosshairPosition(); } catch (e) {}
                    }
                });

                mainChartRef.current = mainChart;
                warpChartRef.current = warpChart;
                seriesRef.current = candleSeries;
                warpSeriesRef.current = warpSeries;

                if (convertedCandles.length > 0) {
                    candleSeries.setData(convertedCandles);
                    mainChart.timeScale().fitContent();
                    
                    // Align warp chart initially with robustness
                    const mainRange = mainChart.timeScale().getVisibleRange();
                    if (mainRange) {
                        try { warpChart.timeScale().setVisibleRange(mainRange); } catch(e) {}
                    }
                }

                setIsReady(true);

                resizeObserver = new ResizeObserver(() => {
                    if (mainContainerRef.current && mainChart && isMounted) {
                        mainChart.resize(mainContainerRef.current.clientWidth, height * 0.75);
                    }
                    if (warpContainerRef.current && warpChart && isMounted) {
                        warpChart.resize(warpContainerRef.current.clientWidth, height * 0.2);
                    }
                });
                resizeObserver.observe(mainContainerRef.current);

            } catch (err: any) {
                console.error("[PTDChart] Init Error:", err);
                if (isMounted) setLibError(err.message);
            }
        };

        init();

        return () => {
            isMounted = false;
            if (mainChart) mainChart.remove();
            if (warpChart) warpChart.remove();
            if (resizeObserver) resizeObserver.disconnect();
            mainChartRef.current = null;
            warpChartRef.current = null;
        };
    }, []);

    // 3. Update Data & Markers
    useEffect(() => {
        if (!isReady || !seriesRef.current || !warpSeriesRef.current || !lwcRef.current || convertedCandles.length === 0) return;

        try {
            const { createSeriesMarkers } = lwcRef.current;
            
            seriesRef.current.setData(convertedCandles);
            
            // Generate Histogram data for bottom panel based on signals
            const histogramData = convertedCandles.map(c => {
                const sig = markers.find(m => Math.abs(m.time - c.time) < 300); // 5 min window
                if (!sig) return { time: c.time, value: 0 };
                return { 
                    time: c.time, 
                    value: sig.direction === "UP" ? 10 : -10,
                    color: confidenceColor(sig.confidence, sig.direction)
                };
            });
            warpSeriesRef.current.setData(histogramData);

            // Update Markers with NinjaTrader Time Labels
            const chartMarkers = markers
                .map((m) => {
                    const closest = convertedCandles.reduce((prev, curr) => 
                        Math.abs(curr.time - m.time) < Math.abs(prev.time - m.time) ? curr : prev
                    );

                    if (Math.abs(closest.time - m.time) > 86400 * 2) return null;

                    const date = new Date(m.time * 1000);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                    return {
                        time: closest.time,
                        position: (m.direction === "UP" ? "belowBar" : "aboveBar") as any,
                        color: confidenceColor(m.confidence, m.direction),
                        shape: (m.direction === "UP" ? "arrowUp" : "arrowDown") as any,
                        text: timeStr, // Labeled with time just like NinjaTrader
                        size: 2,
                    };
                })
                .filter((m): m is NonNullable<typeof m> => m !== null)
                .sort((a, b) => a.time - b.time);

            if (createSeriesMarkers) {
                createSeriesMarkers(seriesRef.current, chartMarkers);
            }

            // Add Horizontal Projection Lines for future signals
            // Using price lines or temporary line series
            // For simplicity and stability in this version, we use price levels provided in markers
            markers.forEach((m, idx) => {
                if (m.price && m.time > Date.now() / 1000) {
                    seriesRef.current.createPriceLine({
                        price: m.price,
                        color: "rgba(255,255,255,0.1)",
                        lineWidth: 1,
                        lineStyle: 3, // Dotted
                        axisLabelVisible: false,
                        title: `T ${idx+1}`,
                    });
                }
            });

        } catch (err) {
            console.error("[PTDChart] Data Update Error:", err);
        }
    }, [isReady, convertedCandles, markers]);

    return (
        <div className="flex flex-col gap-2 w-full bg-[#080E1A] border border-[var(--color-border)] rounded-lg overflow-hidden p-4 shadow-2xl group relative min-h-[520px]">
            {/* Main Price Chart */}
            <div className="relative">
                <div 
                    ref={mainContainerRef} 
                    className="w-full transition-opacity duration-1000" 
                    style={{ height: height * 0.75, opacity: isReady ? 1 : 0.4 }} 
                />
                <div className="absolute top-2 left-4 pointer-events-none z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Market Projection Matrix</span>
                </div>
            </div>

            {/* Separator / TimeWarp Panel Label */}
            <div className="flex items-center gap-4 px-4 overflow-hidden">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 whitespace-nowrap">MMITPS TIME WRAP PANEL</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* TimeWarp Logic Panel */}
            <div className="relative">
                <div 
                    ref={warpContainerRef} 
                    className="w-full transition-opacity duration-1000" 
                    style={{ height: height * 0.2, opacity: isReady ? 1 : 0.4 }} 
                />
            </div>

            {/* Initialization States */}
            {(libError || (!isReady && ohlcv.length > 0)) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080E1A]/80 backdrop-blur-xl z-50 rounded-lg">
                    <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500 text-center px-10">
                        {libError ? `SYSTEM_HALT: ${libError}` : "Synchronizing Chronos Engine..."}
                    </p>
                </div>
            )}
        </div>
    );
}
