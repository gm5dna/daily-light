import type { Reading, Period } from "./types.js";
/**
 * Wrap text at word boundaries to fit within the given width.
 */
export declare function wrapText(text: string, width: number): string[];
/**
 * Display a full reading to stdout.
 */
export declare function displayReading(reading: Reading): void;
/**
 * Display search results.
 */
export declare function displaySearchResults(results: Array<{
    reading: Reading;
    matches: string[];
}>, term: string): void;
/**
 * Display the list of all readings.
 */
export declare function displayList(entries: Array<{
    date: string;
    period: Period;
    themeRef: string;
    themeText: string;
}>): void;
