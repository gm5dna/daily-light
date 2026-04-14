import type { Period } from "./types.js";

export const isTTY = process.stdout.isTTY ?? false;

export const esc = (code: string) => (isTTY ? `\x1b[${code}m` : "");
export const RESET = esc("0");
export const BOLD = esc("1");
export const DIM = esc("2");
export const ITALIC = esc("3");

/**
 * Get the usable content width, capped for readability.
 */
export function contentWidth(): number {
  const termWidth = process.stdout.columns ?? 80;
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
export function rule(width: number): string {
  return `${DIM}${"─".repeat(width)}${RESET}`;
}

/**
 * Format a reference, right-aligned beneath the verse text.
 */
export function formatReference(ref: string, width: number): string {
  const formatted = `${DIM}${ITALIC}— ${ref}${RESET}`;
  const plainLen = `— ${ref}`.length;
  const padding = Math.max(0, width - plainLen);
  return " ".repeat(padding) + formatted;
}

/**
 * Parse a date key (e.g. "january-1") into month and day numbers.
 */
export function parseDateKey(dateStr: string): { month: number; day: number } {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  const [monthName, dayStr] = dateStr.split("-");
  return { month: months[monthName], day: parseInt(dayStr, 10) };
}

/**
 * Format the period label for display.
 */
export function periodLabel(period: Period): string {
  return period === "morning" ? "Morning" : "Evening";
}
