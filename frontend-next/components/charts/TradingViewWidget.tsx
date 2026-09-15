"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({
    symbol = "FX:EURUSD",
    interval = "D",
    containerId = "tradingview_widget",
    height = 600
}: {
    symbol?: string;
    interval?: string;
    containerId?: string;
    height?: number;
}) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "autosize": false,
                "width": "100%",
                "height": height,
                "symbol": symbol,
                "interval": interval,
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "calendar": false,
                "support_host": "https://www.tradingview.com",
                "hide_side_toolbar": false,
                "details": true,
                "hotlist": true,
                "calendar_new": true,
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "container_id": containerId,
                "backgroundColor": "rgba(13, 13, 13, 1)",
                "gridColor": "rgba(26, 26, 26, 1)",
                "overrides": {
                    "mainSeriesProperties.candleStyle.upColor": "#10b981",
                    "mainSeriesProperties.candleStyle.downColor": "#ef4444",
                    "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
                    "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444"
                }
            });

            if (container.current) {
                container.current.innerHTML = "";
                container.current.appendChild(script);
            }
        },
        [symbol, interval, containerId, height]
    );

    return (
        <div
            className="tradingview-widget-container rounded-lg overflow-hidden border border-[#1A1A1A] w-full"
            style={{ height: `${height}px` }}
            ref={container}
        >
            <div className="tradingview-widget-container__widget h-full w-full"></div>
        </div>
    );
}

export default memo(TradingViewWidget);
