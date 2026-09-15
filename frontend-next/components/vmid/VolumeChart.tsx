"use client";

import React, { useEffect, useRef } from "react";
import { IChartApi, ISeriesApi } from "lightweight-charts";
import { Signal } from "@/lib/api/vmid";

interface OHLCV {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    value: number; // Volume
    color: string;
}

interface VolumeChartProps {
    data: OHLCV[];
    signals?: Signal[];
    height?: number;
    primaryColor?: string;
    downColor?: string;
    upColor?: string;
}

export default function VolumeChart({
    data,
    signals = [],
    height = 500,
    primaryColor = "#10b981", // Amber 500 (VMID theme)
    downColor = "rgb(239, 83, 80)",
    upColor = "rgb(38, 166, 154)",
}: VolumeChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const legendRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        let chart: IChartApi | null = null;
        let resizeObserver: ResizeObserver | null = null;

        const initChart = async () => {
            if (!chartContainerRef.current || !data || data.length === 0) return;

            const { createChart, CandlestickSeries, HistogramSeries, ColorType } = await import("lightweight-charts");

            if (!isMounted) return;

            chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: "rgba(255, 255, 255, 0.4)",
                    fontFamily: 'Inter, sans-serif',
                },
                grid: {
                    vertLines: { color: "rgba(255, 255, 255, 0.02)" },
                    horzLines: { color: "rgba(255, 255, 255, 0.02)" },
                },
                rightPriceScale: {
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    autoScale: true,
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.2,
                    },
                },
                timeScale: {
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    timeVisible: true,
                    secondsVisible: false,
                    barSpacing: 10,
                },
                crosshair: {
                    mode: 1, // Normal
                    vertLine: {
                        color: "rgba(16, 185, 129, 0.4)",
                        width: 1,
                        style: 1 as const, // LineStyle.Dotted
                        labelBackgroundColor: "#10b981",
                    },
                    horzLine: {
                        color: "rgba(16, 185, 129, 0.4)",
                        width: 1,
                        style: 1 as const, // LineStyle.Dotted
                        labelBackgroundColor: "#10b981",
                    },
                },
                handleScroll: true,
                handleScale: true,
                height: height,
            });

            // Candlestick Series
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: upColor,
                downColor: downColor,
                borderVisible: false,
                wickUpColor: upColor,
                wickDownColor: downColor,
            });

            candlestickSeries.setData(data.map(d => ({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                time: d.time as any, // Library specific timestamp type
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            })));

            // Volume Series
            const volumeSeries = chart.addSeries(HistogramSeries, {
                color: '#26a69a',
                priceFormat: { type: 'volume' },
                priceScaleId: '', // Set as an overlay
            });

            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // bottom 20%
                    bottom: 0,
                },
            });

            volumeSeries.setData(data.map(d => ({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                time: d.time as any, // Library specific timestamp type
                value: d.value,
                color: d.color,
            })));

            // Legend Handling
            const updateLegend = (d: OHLCV | { open: number; high: number; low: number; close: number; value: number }) => {
                if (!legendRef.current || !d) return;
                const isUp = d.close >= d.open;
                const change = d.close - d.open;
                const pChange = d.open !== 0 ? (change / d.open) * 100 : 0;

                legendRef.current.innerHTML = `
                    <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md p-2 rounded-lg border border-[var(--color-border)]">
                        <div class="flex items-center gap-1.5">
                            <span class="text-[var(--color-text-muted)]">O</span>
                            <span class="text-[var(--color-text-primary)] font-mono">${d.open.toFixed(5)}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[var(--color-text-muted)]">H</span>
                            <span class="text-emerald-400 font-mono">${d.high.toFixed(5)}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[var(--color-text-muted)]">L</span>
                            <span class="text-rose-400 font-mono">${d.low.toFixed(5)}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[var(--color-text-muted)]">C</span>
                            <span class="text-[var(--color-text-primary)] font-mono">${d.close.toFixed(5)}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[var(--color-text-muted)]">V</span>
                            <span class="text-amber-500 font-mono">${(d.value || 0).toLocaleString()}</span>
                        </div>
                        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
                            <span class="font-mono">${change >= 0 ? '+' : ''}${change.toFixed(5)} (${pChange.toFixed(2)}%)</span>
                        </div>
                    </div>
                `;
            };

            chart.subscribeCrosshairMove((param) => {
                if (!legendRef.current) return;

                if (
                    param.point === undefined ||
                    !param.time ||
                    param.point.x < 0 ||
                    param.point.x > (chartContainerRef.current?.clientWidth || 0) ||
                    param.point.y < 0 ||
                    param.point.y > (chartContainerRef.current?.clientHeight || 0)
                ) {
                    updateLegend(data[data.length - 1]);
                } else {
                    const candleData = param.seriesData.get(candlestickSeries) as OHLCV | undefined;
                    const volData = param.seriesData.get(volumeSeries) as { value: number } | undefined;

                    if (candleData) {
                        updateLegend({
                            ...candleData,
                            value: volData?.value || 0
                        });
                    }
                }
            });

            // Set initial legend
            updateLegend(data[data.length - 1]);

            // Add Markers
            if (signals && signals.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const markers: any[] = signals.map(sig => ({ // Using any[] for complex Marker type
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    time: sig.time as any,
                    position: sig.type === "Accumulation" ? 'belowBar' : 'aboveBar',
                    color: sig.type === "Accumulation" ? upColor : downColor,
                    shape: sig.type === "Accumulation" ? 'arrowUp' : 'arrowDown',
                    text: sig.type === "Accumulation" ? 'ACC' : 'DIST',
                    size: 1.5,
                }));
                const { createSeriesMarkers } = await import("lightweight-charts");
                createSeriesMarkers(candlestickSeries, markers);
            }

            chartRef.current = chart;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            candlestickSeriesRef.current = candlestickSeries as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            volumeSeriesRef.current = volumeSeries as any;

            chart.timeScale().fitContent();

            resizeObserver = new ResizeObserver(() => {
                if (chartContainerRef.current && chart) {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            });
            resizeObserver.observe(chartContainerRef.current);
        };

        initChart();

        return () => {
            isMounted = false;
            if (resizeObserver) resizeObserver.disconnect();
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, signals, height, primaryColor, downColor, upColor]);

    return (
        <div className="w-full relative h-full flex flex-col pt-12 min-h-[500px]">
            <div
                ref={legendRef}
                className="absolute top-4 left-4 z-10 pointer-events-none"
            />
            <div ref={chartContainerRef} className="flex-1 w-full" />
        </div>
    );
}
