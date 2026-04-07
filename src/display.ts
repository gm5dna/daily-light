import type { Reading, Period } from "./types.js";
import { formatDateDisplay } from "./date-utils.js";

const isTTY = process.stdout.isTTY ?? false;

// ANSI escape helpers — return empty strings when not a TTY
const esc = (code: string) => (isTTY ? `\x1b[${code}m` : "");
const RESET = esc("0");
const BOLD = esc("1");
const DIM = esc("2");
const ITALIC = esc("3");

/**
 * Get the usable content width, capped for readability.
 */
function contentWidth(): number {
  const termWidth = process.stdout.columns ?? 80;
  // Cap at 72 for readability, minimum 40
  return Math.max(40, Math.min(72, termWidth - 4));
}

/**
 * Wrap text at word boundaries to fit within the given width.
 */
export function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/**
 * Format a horizontal rule.
 */
function rule(width: number): string {
  return `${DIM}${"─".repeat(width)}${RESET}`;
}

/**
 * Format a reference, right-aligned beneath the verse text.
 */
function formatReference(ref: string, width: number): string {
  const formatted = `${DIM}${ITALIC}— ${ref}${RESET}`;
  const plainLen = `— ${ref}`.length;
  const padding = Math.max(0, width - plainLen);
  return " ".repeat(padding) + formatted;
}

/**
 * Format the period label for display.
 */
function periodLabel(period: Period): string {
  return period === "morning" ? "Morning" : "Evening";
}

/**
 * Parse the date key (e.g. "january-1") into month and day numbers.
 */
function parseDateKey(dateStr: string): { month: number; day: number } {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  const [monthName, dayStr] = dateStr.split("-");
  return { month: months[monthName], day: parseInt(dayStr, 10) };
}

/**
 * Display a full reading to stdout.
 */
export function displayReading(reading: Reading): void {
  const width = contentWidth();
  const { month, day } = parseDateKey(reading.date);
  const dateStr = formatDateDisplay(month, day);
  const period = periodLabel(reading.period);

  const lines: string[] = [];

  // Header
  lines.push(rule(width));
  const headerText = `DAILY LIGHT \u2014 ${period} \u00b7 ${dateStr}`;
  const headerPad = Math.max(0, Math.floor((width - headerText.length) / 2));
  lines.push(`${DIM}${" ".repeat(headerPad)}${headerText}${RESET}`);
  lines.push(rule(width));
  lines.push("");

  // Theme verse — bold, with quotation marks
  const themeText = `\u201c${reading.themeVerse.text}\u201d`;
  const themeLines = wrapText(themeText, width - 2);
  for (const line of themeLines) {
    lines.push(`  ${BOLD}${line}${RESET}`);
  }
  lines.push(`  ${formatReference(reading.themeVerse.reference, width - 2)}`);
  lines.push("");

  // Subsequent verses
  for (const verse of reading.verses) {
    const verseLines = wrapText(verse.text, width - 2);
    for (const line of verseLines) {
      lines.push(`  ${line}`);
    }
    lines.push(`  ${formatReference(verse.reference, width - 2)}`);
    lines.push("");
  }

  // Footer rule
  lines.push(rule(width));

  process.stdout.write(lines.join("\n") + "\n");
}

/**
 * Display search results.
 */
export function displaySearchResults(
  results: Array<{ reading: Reading; matches: string[] }>,
  term: string,
): void {
  if (results.length === 0) {
    console.log(`No readings found matching "${term}".`);
    return;
  }

  const width = contentWidth();
  console.log(`${BOLD}Found ${results.length} reading${results.length === 1 ? "" : "s"} matching "${term}":${RESET}\n`);

  for (const { reading, matches } of results) {
    const { month, day } = parseDateKey(reading.date);
    const dateStr = formatDateDisplay(month, day);
    const period = periodLabel(reading.period);

    console.log(`  ${BOLD}${period} \u00b7 ${dateStr}${RESET}`);
    console.log(`  ${DIM}Theme: ${reading.themeVerse.text}${RESET}`);
    console.log(`  ${DIM}       — ${reading.themeVerse.reference}${RESET}`);

    // Show first match snippet (if not the theme verse itself)
    const snippet = matches[0];
    if (snippet !== reading.themeVerse.text) {
      const truncated = snippet.length > width - 6
        ? snippet.slice(0, width - 9) + "..."
        : snippet;
      console.log(`  ${DIM}Match: ${truncated}${RESET}`);
    }
    console.log("");
  }

  console.log(`${DIM}${rule(width)}${RESET}`);
}

/**
 * Display the list of all readings.
 */
export function displayList(
  entries: Array<{ date: string; period: Period; themeRef: string; themeText: string }>,
): void {
  const width = contentWidth();

  console.log(`${BOLD}Daily Light — All Readings${RESET}\n`);

  let currentMonth = "";
  for (const entry of entries) {
    const { month, day } = parseDateKey(entry.date);
    const dateStr = formatDateDisplay(month, day);
    const monthName = entry.date.split("-")[0];

    if (monthName !== currentMonth) {
      currentMonth = monthName;
      const heading = currentMonth[0].toUpperCase() + currentMonth.slice(1);
      console.log(`\n${BOLD}${heading}${RESET}`);
      console.log(`${DIM}${"─".repeat(heading.length)}${RESET}`);
    }

    const period = periodLabel(entry.period);
    const themeSnippet = entry.themeText.length > width - 30
      ? entry.themeText.slice(0, width - 33) + "..."
      : entry.themeText;
    console.log(`  ${dateStr} ${DIM}${period}${RESET}  ${themeSnippet}`);
  }
  console.log("");
}
