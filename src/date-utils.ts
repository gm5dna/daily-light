import type { DateQuery, Period } from "./types.js";

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

const MONTH_ABBREVS: Record<string, number> = {};
for (let i = 0; i < MONTH_NAMES.length; i++) {
  const name = MONTH_NAMES[i];
  MONTH_ABBREVS[name] = i + 1;
  MONTH_ABBREVS[name.slice(0, 3)] = i + 1;
}

/**
 * Determine whether to show morning or evening reading.
 * Before 14:00 local time → morning; 14:00 and after → evening.
 */
export function detectPeriod(now: Date = new Date()): Period {
  return now.getHours() < 14 ? "morning" : "evening";
}

/**
 * Build the date key used in readings.json, e.g. "january-1".
 */
export function dateKey(month: number, day: number): string {
  return `${MONTH_NAMES[month - 1]}-${day}`;
}

/**
 * Format a date for display: "7 April".
 */
export function formatDateDisplay(month: number, day: number): string {
  const monthName = MONTH_NAMES[month - 1];
  return `${day} ${monthName[0].toUpperCase()}${monthName.slice(1)}`;
}

/**
 * Get today's date query.
 */
export function today(): DateQuery {
  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
}

/**
 * Get tomorrow's date query.
 */
export function tomorrow(): DateQuery {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return { month: d.getMonth() + 1, day: d.getDate() };
}

/**
 * Get yesterday's date query.
 */
export function yesterday(): DateQuery {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return { month: d.getMonth() + 1, day: d.getDate() };
}

/**
 * Parse a flexible date string into a DateQuery.
 * Supports: "jan 1", "1 jan", "january 1", "1 january", "jan 01", etc.
 */
export function parseDate(input: string): DateQuery | null {
  const parts = input.trim().toLowerCase().split(/\s+/);
  if (parts.length !== 2) return null;

  let month: number | undefined;
  let day: number | undefined;

  // Try both orderings: "jan 1" and "1 jan"
  for (const ordering of [[0, 1], [1, 0]] as const) {
    const [monthIdx, dayIdx] = ordering;
    const m = MONTH_ABBREVS[parts[monthIdx]];
    const d = parseInt(parts[dayIdx], 10);
    if (m && !isNaN(d) && d >= 1 && d <= 31) {
      month = m;
      day = d;
      break;
    }
  }

  if (!month || !day) return null;

  // Basic validation of day for month
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month]) return null;

  return { month, day };
}

/**
 * Parse period from argument string.
 */
export function parsePeriod(input: string): Period | null {
  const lower = input.trim().toLowerCase();
  if (lower === "morning") return "morning";
  if (lower === "evening") return "evening";
  return null;
}

/**
 * Returns true if the given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get all month names.
 */
export function getMonthNames(): readonly string[] {
  return MONTH_NAMES;
}

/**
 * Days in each month (index 0 unused, Feb = 29 to include leap day).
 */
export function daysInMonth(month: number): number {
  const days = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month];
}
