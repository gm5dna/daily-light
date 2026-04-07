import type { DateQuery, Period } from "./types.js";
/**
 * Determine whether to show morning or evening reading.
 * Before 14:00 local time → morning; 14:00 and after → evening.
 */
export declare function detectPeriod(now?: Date): Period;
/**
 * Build the date key used in readings.json, e.g. "january-1".
 */
export declare function dateKey(month: number, day: number): string;
/**
 * Format a date for display: "7 April".
 */
export declare function formatDateDisplay(month: number, day: number): string;
/**
 * Get today's date query.
 */
export declare function today(): DateQuery;
/**
 * Get tomorrow's date query.
 */
export declare function tomorrow(): DateQuery;
/**
 * Get yesterday's date query.
 */
export declare function yesterday(): DateQuery;
/**
 * Parse a flexible date string into a DateQuery.
 * Supports: "jan 1", "1 jan", "january 1", "1 january", "jan 01", etc.
 */
export declare function parseDate(input: string): DateQuery | null;
/**
 * Parse period from argument string.
 */
export declare function parsePeriod(input: string): Period | null;
/**
 * Returns true if the given year is a leap year.
 */
export declare function isLeapYear(year: number): boolean;
/**
 * Get all month names.
 */
export declare function getMonthNames(): readonly string[];
/**
 * Days in each month (index 0 unused, Feb = 29 to include leap day).
 */
export declare function daysInMonth(month: number): number;
