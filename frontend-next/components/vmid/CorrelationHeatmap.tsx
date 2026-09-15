"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface CorrelationPoint {
    row: string;
    col: string;
    value: number;
}

interface CorrelationHeatmapProps {
    data: Record<string, string | number>[]; // Expecting the backend matrix array
}

export default function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
    const [hoveredCell, setHoveredCell] = useState<CorrelationPoint | null>(null);

    if (!data || data.length === 0) return null;

    // Extract asset names (headers)
    const assets = data.map(d => d.name as string);

    const getColor = (val: number) => {
        // val is -1 to 1
        const abs = Math.abs(val);
        if (val > 0) {
            // Emerald / Blue for positive
            return `rgba(16, 185, 129, ${abs * 0.8 + 0.1})`;
        } else {
            // Rose / Red for negative
            return `rgba(244, 63, 94, ${abs * 0.8 + 0.1})`;
        }
    };

    return (
        <div className="relative w-full overflow-hidden bg-[#0A0F1D] border border-[var(--color-border)] rounded-lg p-6 lg:p-8">
            {/* Legend */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight uppercase">Cross-Asset Correlation Matrix</h3>
                    <p className="text-[var(--color-text-secondary)] text-xs font-medium">Real-time pearson correlation coefficients</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Negative</span>
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto">
                <div
                    className="grid gap-1 min-w-[800px]"
                    style={{
                        gridTemplateColumns: `100px repeat(${assets.length}, 1fr)`,
                    }}
                >
                    {/* Header Row */}
                    <div className="h-12 flex items-center justify-center" />
                    {assets.map((asset) => (
                        <div key={asset} className="h-12 flex items-center justify-center">
                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-tighter rotate-[-45deg] origin-center">
                                {asset}
                            </span>
                        </div>
                    ))}

                    {/* Data Rows */}
                    {data.map((row) => (
                        <React.Fragment key={row.name as string}>
                            {/* Row Header */}
                            <div className="h-16 flex items-center pr-4">
                                <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest truncate">
                                    {row.name as string}
                                </span>
                            </div>

                            {/* Data Cells */}
                            {assets.map((colName) => {
                                const value = (row[colName] as number) ?? 0;
                                const isDiagonal = row.name === colName;

                                return (
                                    <motion.div
                                        key={`${row.name}-${colName}`}
                                        onHoverStart={() => setHoveredCell({ row: row.name as string, col: colName, value: value as number })}
                                        onHoverEnd={() => setHoveredCell(null)}
                                        className={clsx(
                                            "h-16 rounded-lg relative flex items-center justify-center cursor-crosshair transition-all duration-300",
                                            isDiagonal ? "bg-[var(--color-surface-2)] border border-[var(--color-border)]" : "border border-transparent"
                                        )}
                                        style={{
                                            backgroundColor: isDiagonal ? undefined : getColor(value as number),
                                        }}
                                    >
                                        {!isDiagonal && (
                                            <span className={clsx(
                                                "text-xs font-black",
                                                Math.abs(value) > 0.6 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                                            )}>
                                                {(value as number).toFixed(2)}
                                            </span>
                                        )}
                                        {isDiagonal && <div className="w-1 h-1 rounded-full bg-[var(--color-surface-3)]" />}

                                        {/* Hover Glow */}
                                        {hoveredCell?.row === row.name && hoveredCell?.col === colName && (
                                            <motion.div
                                                layoutId="cell-glow"
                                                className="absolute inset-0 rounded-lg ring-2 ring-amber-500/50 z-20"
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Detail Overlay / Tooltip */}
            <AnimatePresence>
                {hoveredCell && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-8 right-8 z-50 bg-[#141C2F] border border-[var(--color-border)] rounded-lg shadow-2xl p-4 w-64 pointer-events-none"
                    >
                        <div className="flex items-center gap-3 mb-3 pb-3 border-border border-b border-[var(--color-border)]">
                            <div className={clsx(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                hoveredCell.value > 0 ? "bg-emerald-500/20" : "bg-rose-500/20"
                            )}>
                                {hoveredCell.value > 0.3 ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                ) : hoveredCell.value < -0.3 ? (
                                    <TrendingDown className="w-5 h-5 text-rose-400" />
                                ) : (
                                    <Minus className="w-5 h-5 text-[var(--color-text-secondary)]" />
                                )}
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Relationship</div>
                                <div className="text-[var(--color-text-primary)] font-bold">{hoveredCell.row} / {hoveredCell.col}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase">Coefficient</span>
                                <span className={clsx(
                                    "text-2xl font-black",
                                    hoveredCell.value > 0 ? "text-emerald-400" : "text-rose-400"
                                )}>
                                    {hoveredCell.value.toFixed(4)}
                                </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[var(--color-surface-2)] text-[9px] text-[var(--color-text-secondary)] leading-relaxed italic">
                                {hoveredCell.value > 0.7 ? "Strong positive correlation. Assets generally move in tandem." :
                                    hoveredCell.value > 0.3 ? "Moderate positive correlation. Tendency to follow similar trends." :
                                        hoveredCell.value > -0.3 ? "Weak or no correlation. Assets move independently." :
                                            hoveredCell.value > -0.7 ? "Moderate negative correlation. Inverse movement tendency." :
                                                "Strong inverse correlation. High divergence probability."}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
