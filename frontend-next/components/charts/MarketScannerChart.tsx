"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { 
    createChart, 
    CandlestickSeries, 
    HistogramSeries, 
    ColorType, 
    IChartApi, 
    ISeriesApi,
    LineSeries
} from "lightweight-charts";

export type CandleData = {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
};

export type VolumeData = {
    time: string | number;
    value: number;
    color?: string;
};

type Props = {
    data: CandleData[];
    volume?: VolumeData[];
    overlays?: { type: 'harmonic' | 'structure' | 'pitchfork', points: any[] }[];
    height?: number;
    className?: string;
};

function MarketScannerChart({
    data,
    volume,
    height = 500,
    className = "",
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#6B7280",
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
            },
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.02)" },
                horzLines: { color: "rgba(255, 255, 255, 0.02)" },
            },
            crosshair: {
                vertLine: { color: "#4B5563", width: 1, style: 3 },
                horzLine: { color: "#4B5563", width: 1, style: 3 },
            },
            rightPriceScale: {
                borderColor: "rgba(255, 255, 255, 0.05)",
                autoScale: true,
            },
            timeScale: {
                borderColor: "rgba(255, 255, 255, 0.05)",
                fixLeftEdge: true,
                fixRightEdge: true,
                barSpacing: 12,
            },
            handleScroll: true,
            handleScale: true,
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#10b981",
            downColor: "#ef4444",
            borderDownColor: "#ef4444",
            borderUpColor: "#10b981",
            wickDownColor: "#ef4444",
            wickUpColor: "#10b981",
        });

        chartRef.current = chart;
        seriesRef.current = candleSeries;
        setIsLoaded(true);

        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({ width: containerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);
        
        const ro = new ResizeObserver(() => {
            handleResize();
        });
        ro.observe(containerRef.current);

        return () => {
            window.removeEventListener("resize", handleResize);
            ro.disconnect();
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (isLoaded && seriesRef.current && data.length > 0) {
            seriesRef.current.setData(data as any);
            chartRef.current?.timeScale().fitContent();
        }
    }, [isLoaded, data]);

    return (
        <div className={`relative w-full ${className}`}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            )}
            <div ref={containerRef} className="w-full" style={{ height }} />
        </div>
    );
}

export default memo(MarketScannerChart);
