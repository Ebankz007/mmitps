"use client";

import { useEffect, useRef, memo } from "react";
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, ColorType } from "lightweight-charts";

export type CandleData = {
    time: string; // "YYYY-MM-DD"
    open: number;
    high: number;
    low: number;
    close: number;
};

export type OverlayData = {
    time: string;
    value: number;
};

type Props = {
    candles: CandleData[];
    overlayData?: OverlayData[];
    overlayLabel?: string;
    overlayColor?: string;
    volumeData?: OverlayData[];
    height?: number;
    className?: string;
};

function TradingViewChart({
    candles,
    overlayData,
    overlayLabel = "COT Index",
    overlayColor = "#10b981",
    volumeData,
    height = 350,
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
                fontSize: 10,
            },
            grid: {
                vertLines: { color: "rgba(255,255,255,0.02)" },
                horzLines: { color: "rgba(255,255,255,0.02)" },
            },
            rightPriceScale: {
                borderColor: "rgba(255,255,255,0.05)",
                scaleMargins: { top: 0.1, bottom: 0.2 },
            },
            timeScale: {
                borderColor: "rgba(255,255,255,0.05)",
                timeVisible: false,
            },
            crosshair: {
                vertLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 3 },
                horzLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 3 },
            },
            handleScroll: true,
            handleScale: true,
        });

        chartRef.current = chart;

        // Candlestick series
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderDownColor: "#ef4444",
            borderUpColor: "#22c55e",
            wickDownColor: "#ef444480",
            wickUpColor: "#22c55e80",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candleSeries.setData(candles as any); // Library specific timestamp type

        // Overlay line (e.g. COT Index)
        if (overlayData && overlayData.length > 0) {
            const overlaySeries = chart.addSeries(LineSeries, {
                color: overlayColor,
                lineWidth: 2,
                priceScaleId: "overlay",
                title: overlayLabel,
            });
            chart.priceScale("overlay").applyOptions({
                scaleMargins: { top: 0.7, bottom: 0.05 },
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            overlaySeries.setData(overlayData as any); // Library specific timestamp type
        }

        // Volume histogram
        if (volumeData && volumeData.length > 0) {
            const volSeries = chart.addSeries(HistogramSeries, {
                priceScaleId: "volume",
                color: "rgba(100,181,246,0.15)",
            });
            chart.priceScale("volume").applyOptions({
                scaleMargins: { top: 0.85, bottom: 0 },
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            volSeries.setData(volumeData as any); // Library specific timestamp type
        }

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
    }, [candles, overlayData, overlayColor, overlayLabel, volumeData]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ height, width: "100%" }}
        />
    );
}

export default memo(TradingViewChart);
