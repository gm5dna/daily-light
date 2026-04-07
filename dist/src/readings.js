import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { dateKey, isLeapYear } from "./date-utils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let cachedReadings = null;
/**
 * Load all readings from the bundled JSON file.
 */
export function loadReadings() {
    if (cachedReadings)
        return cachedReadings;
    // In dist/, we're at dist/src/readings.js — data is at ../../data/
    const dataPath = join(__dirname, "..", "..", "data", "readings.json");
    const raw = readFileSync(dataPath, "utf-8");
    cachedReadings = JSON.parse(raw);
    return cachedReadings;
}
/**
 * Get a specific reading by date and period.
 */
export function getReading(query, period) {
    const readings = loadReadings();
    const key = dateKey(query.month, query.day);
    return readings.find(r => r.date === key && r.period === period) ?? null;
}
/**
 * Get a random reading.
 */
export function getRandomReading() {
    const readings = loadReadings();
    const idx = Math.floor(Math.random() * readings.length);
    return readings[idx];
}
/**
 * Search readings by keyword. Matches against verse text, references,
 * and theme verse text. Case-insensitive.
 */
export function searchReadings(term) {
    const readings = loadReadings();
    const lower = term.toLowerCase();
    const results = [];
    for (const reading of readings) {
        const matches = [];
        if (reading.themeVerse.text.toLowerCase().includes(lower)) {
            matches.push(reading.themeVerse.text);
        }
        if (reading.themeVerse.reference.toLowerCase().includes(lower)) {
            matches.push(reading.themeVerse.reference);
        }
        for (const verse of reading.verses) {
            if (verse.text.toLowerCase().includes(lower)) {
                matches.push(verse.text);
            }
            if (verse.reference.toLowerCase().includes(lower)) {
                matches.push(verse.reference);
            }
        }
        if (matches.length > 0) {
            results.push({ reading, matches });
        }
    }
    return results;
}
/**
 * List all readings with their date, period, and theme verse.
 * Optionally filter out 29 Feb on non-leap years.
 */
export function listReadings(includeLeapDay) {
    const readings = loadReadings();
    const showLeapDay = includeLeapDay ?? isLeapYear(new Date().getFullYear());
    return readings
        .filter(r => showLeapDay || r.date !== "february-29")
        .map(r => ({
        date: r.date,
        period: r.period,
        themeRef: r.themeVerse.reference,
        themeText: r.themeVerse.text,
    }));
}
//# sourceMappingURL=readings.js.map