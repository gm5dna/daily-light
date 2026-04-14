import { formatDateDisplay } from "./date-utils.js";
import { BOLD, DIM, RESET, contentWidth, formatReference, parseDateKey, periodLabel, rule, wrapText, } from "./display-utils.js";
/**
 * Display a full reading to stdout.
 */
export function displayReading(reading) {
    const width = contentWidth();
    const { month, day } = parseDateKey(reading.date);
    const dateStr = formatDateDisplay(month, day);
    const period = periodLabel(reading.period);
    const lines = [];
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
export function displaySearchResults(results, term) {
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
export function displayList(entries) {
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
//# sourceMappingURL=display.js.map