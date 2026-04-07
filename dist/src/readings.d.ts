import type { Reading, Period, DateQuery } from "./types.js";
/**
 * Load all readings from the bundled JSON file.
 */
export declare function loadReadings(): Reading[];
/**
 * Get a specific reading by date and period.
 */
export declare function getReading(query: DateQuery, period: Period): Reading | null;
/**
 * Get a random reading.
 */
export declare function getRandomReading(): Reading;
/**
 * Search readings by keyword. Matches against verse text, references,
 * and theme verse text. Case-insensitive.
 */
export declare function searchReadings(term: string): Array<{
    reading: Reading;
    matches: string[];
}>;
/**
 * List all readings with their date, period, and theme verse.
 * Optionally filter out 29 Feb on non-leap years.
 */
export declare function listReadings(includeLeapDay?: boolean): Array<{
    date: string;
    period: Period;
    themeRef: string;
    themeText: string;
}>;
