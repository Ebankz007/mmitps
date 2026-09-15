import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes using clsx and tailwind-merge.
 * This prevents style conflicts when merging classes.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
