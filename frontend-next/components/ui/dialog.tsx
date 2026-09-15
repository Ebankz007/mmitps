"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const DialogContext = React.createContext<{
    onOpenChange: (open: boolean) => void;
} | null>(null);

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    return (
        <DialogContext.Provider value={{ onOpenChange }}>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => onOpenChange(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-2xl"
                        />
                        {children}
                    </div>
                )}
            </AnimatePresence>
        </DialogContext.Provider>
    );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const context = React.useContext(DialogContext);

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
                "relative z-50 w-full max-w-lg bg-surface border border-[var(--color-border)] rounded-lg shadow-2xl overflow-hidden",
                className
            )}
        >
            <button
                onClick={() => context?.onOpenChange(false)}
                className="absolute right-6 top-6 rounded-lg p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all z-[60]"
            >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </button>
            {children}
        </motion.div>
    );
};

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left pt-6 px-8", className)}>
            {children}
        </div>
    );
};

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <h2 className={cn("text-lg font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]", className)}>
            {children}
        </h2>
    );
};

export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <p className={cn("text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] italic", className)}>
            {children}
        </p>
    );
};
