"use client";

import { useEffect, useRef, memo } from "react";
import { createChart, CandlestickSeries, LineSeries, ColorType, LineStyle, createSeriesMarkers } from "lightweight-charts";

export type CandleData = {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
};

export type ProViewPoint = {
    time: string;
    value: number;
};

type Props = {
    candles: CandleData[];
    proviewPattern: ProViewPoint[];
    height?: number;
    className?: string;
};

function ProViewChart({
    candles,
    proviewPattern,
    height = 450,
    className = "",
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

    useEffect(() => {
        if (!containerRef.current || candles.length === 0) return;

        // Clean up previous chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#6b7280",
                fontSize: 11,
            },
            grid: {
                vertLines: { color: "rgba(255,255,255,0.02)" },
                horzLines: { color: "rgba(255,255,255,0.02)" },
            },
            rightPriceScale: {
                borderColor: "rgba(255,255,255,0.05)",
                scaleMargins: { top: 0.1, bottom: 0.2 },
                visible: true,
            },
            timeScale: {
                borderColor: "rgba(255,255,255,0.05)",
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                vertLine: { color: "rgba(255,255,255,0.3)", width: 1, style: 3 },
                horzLine: { color: "rgba(255,255,255,0.3)", width: 1, style: 3 },
            },
            handleScroll: true,
            handleScale: true,
        });

        chartRef.current = chart;

        // 1. Candlestick series (Actual Price)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#0ea5e9", // Blue for actual price as per mockup inspiration
            downColor: "#ef4444",
            borderDownColor: "#ef4444",
            borderUpColor: "#0ea5e9",
            wickDownColor: "#ef4444",
            wickUpColor: "#0ea5e9",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candleSeries.setData(candles as any); // Library specific timestamp type

        // 2. ProView Projection (The Golden Dashed Line)
        const proviewSeries = chart.addSeries(LineSeries, {
            color: "#10b981", // Amber/Gold
            lineWidth: 3,
            lineStyle: LineStyle.Dashed,
            title: "ProView Pattern",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        proviewSeries.setData(proviewPattern as any); // Library specific timestamp type

        // 3. Shading the "Projection" area (Future)
        // Note: Lightweight charts doesn't have a direct "shade area" by date range easily without plugins
        // but we can use a Transparent Line series with top/bottom to simulate or just use markers.
        // For simplicity and matching the mockup's box, we can add a custom HTML overlay or markers.

        // Find the start of projection (last item in candles)
        const lastCandleTime = candles[candles.length - 1].time;

        // Add a vertical line/marker to separate history from projection
        createSeriesMarkers(candleSeries, [
            {
                time: lastCandleTime,
                position: 'aboveBar',
                color: '#10b981',
                shape: 'arrowDown',
                text: 'PROJECTION START',
                size: 0.5
            }
        ]);

        chart.timeScale().fitContent();

        // Responsive resize
        const handleResize = () => {
            if (containerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                });
            }
        };
        const ro = new ResizeObserver(handleResize);
        ro.observe(containerRef.current);

        return () => {
            ro.disconnect();
            chart.remove();
            chartRef.current = null;
        };
    }, [candles, proviewPattern]);

    return (
        <div className="relative group">
            <div
                ref={containerRef}
                className={className}
                style={{ height, width: "100%" }}
            />
            {/* Legend Overlay - Mocking the institutional look */}
            <div className="absolute top-4 left-6 z-10 flex items-center gap-6 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#0ea5e9] rounded-full" />
                    <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Price Action</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-[#10b981]" />
                    <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">ProView Projection</span>
                </div>
            </div>

            {/* Projection Box Overlay (Visual only, on top of RHS) */}
            <div className="absolute top-0 right-0 h-full w-[25%] bg-amber-500/[0.03] border-l border-[var(--color-border)] pointer-events-none flex items-center justify-center">
                <span className="text-[40px] font-black text-white/[0.02] uppercase tracking-[1em] rotate-90 select-none">PROJECTION</span>
            </div>
        </div>
    );
}

export default memo(ProViewChart);
