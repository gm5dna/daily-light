import type { Period } from "./types.js";
export declare const RESET: string;
export declare const BOLD: string;
export declare const DIM: string;
export declare const ITALIC: string;
/**
 * Get the usable content width, capped for readability.
 */
export declare function contentWidth(): number;
/**
 * Wrap text at word boundaries to fit within the given width.
 */
export declare function wrapText(text: string, width: number): string[];
/**
 * Format a horizontal rule.
 */
export declare function rule(width: number): string;
/**
 * Format a reference, right-aligned beneath the verse text.
 */
export declare function formatReference(ref: string, width: number): string;
/**
 * Parse a date key (e.g. "january-1") into month and day numbers.
 */
export declare function parseDateKey(dateStr: string): {
    month: number;
    day: number;
};
/**
 * Format the period label for display.
 */
export declare function periodLabel(period: Period): string;
