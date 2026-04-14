import type { Reading, Period } from "./types.js";
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
