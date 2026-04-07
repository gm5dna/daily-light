/**
 * Parses the Daily Light source text into structured JSON.
 *
 * Source: trueChristian/daily-light (GitHub), pipe-delimited format.
 * Each line: DateName|date-key|MorningHTML|MorningRefs|EveningHTML|EveningRefs
 *
 * The morning/evening text uses:
 *   <strong>...</strong>  for the theme verse
 *   +  as a verse/paragraph separator
 *   --  to separate individual Scripture passages within a paragraph
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Verse {
  text: string;
  reference: string;
}

interface Reading {
  date: string;
  period: "morning" | "evening";
  themeVerse: Verse;
  verses: Verse[];
}

/**
 * Strip HTML tags from text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Clean up text: normalise whitespace, trim.
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Normalise the date key: "january-01" → "january-1"
 */
function normaliseDateKey(key: string): string {
  return key.replace(/-0(\d)$/, "-$1");
}

/**
 * Expand abbreviated book names to full names for cleaner display.
 * Handles many variant abbreviations found in the source text.
 */
function expandBookName(abbrev: string): string {
  const map: Record<string, string> = {
    // Old Testament
    "Gen": "Genesis", "Exo": "Exodus", "Ex": "Exodus",
    "Lev": "Leviticus", "Num": "Numbers",
    "Deut": "Deuteronomy", "Josh": "Joshua", "Judg": "Judges", "Ruth": "Ruth",
    "1 Sam": "1 Samuel", "1Sam": "1 Samuel", "2 Sam": "2 Samuel", "2Sam": "2 Samuel",
    "1 Kgs": "1 Kings", "1Kgs": "1 Kings", "2 Kgs": "2 Kings", "2Kgs": "2 Kings",
    "1 Ki": "1 Kings", "2 Ki": "2 Kings",
    "1 Chr": "1 Chronicles", "1Chr": "1 Chronicles", "2 Chr": "2 Chronicles", "2Chr": "2 Chronicles",
    "Ezra": "Ezra", "Neh": "Nehemiah",
    "Est": "Esther", "Esth": "Esther",
    "Job": "Job",
    "Psa": "Psalm", "Ps": "Psalm",
    "Pro": "Proverbs", "Prov": "Proverbs",
    "Ecc": "Ecclesiastes", "Eccl": "Ecclesiastes",
    "Song": "Song of Solomon", "Song of Solomon": "Song of Solomon",
    "Isa": "Isaiah", "Jer": "Jeremiah",
    "Lam": "Lamentations",
    "Eze": "Ezekiel", "Ezek": "Ezekiel",
    "Dan": "Daniel", "Hos": "Hosea",
    "Joel": "Joel", "Amos": "Amos", "Obad": "Obadiah",
    "Jonah": "Jonah", "Jon": "Jonah",
    "Mic": "Micah", "Nah": "Nahum", "Hab": "Habakkuk",
    "Zep": "Zephaniah", "Zeph": "Zephaniah",
    "Hag": "Haggai", "Zec": "Zechariah", "Zech": "Zechariah",
    "Mal": "Malachi",
    // New Testament
    "Mat": "Matthew", "Matt": "Matthew",
    "Mark": "Mark", "Mk": "Mark",
    "Luke": "Luke", "Lu": "Luke", "Lk": "Luke",
    "John": "John", "Joh": "John", "Jn": "John",
    "Acts": "Acts",
    "Rom": "Romans",
    "1 Cor": "1 Corinthians", "1Cor": "1 Corinthians", "2 Cor": "2 Corinthians", "2Cor": "2 Corinthians",
    "Gal": "Galatians",
    "Eph": "Ephesians",
    "Phl": "Philippians", "Phil": "Philippians",
    "Col": "Colossians",
    "1 Thes": "1 Thessalonians", "1Thes": "1 Thessalonians", "1Th": "1 Thessalonians",
    "2 Thes": "2 Thessalonians", "2Thes": "2 Thessalonians", "2Th": "2 Thessalonians",
    "1 Tim": "1 Timothy", "1Tim": "1 Timothy", "2 Tim": "2 Timothy", "2Tim": "2 Timothy",
    "Tit": "Titus",
    "Phm": "Philemon", "Philem": "Philemon",
    "Heb": "Hebrews",
    "Jas": "James",
    "1 Pet": "1 Peter", "1Pet": "1 Peter", "2 Pet": "2 Peter", "2Pet": "2 Peter",
    "1 John": "1 John", "1John": "1 John", "2 John": "2 John", "2John": "2 John", "3 John": "3 John", "3John": "3 John",
    "Jude": "Jude",
    "Rev": "Revelation",
  };
  return map[abbrev] ?? abbrev;
}

/**
 * Parse a single reference like "Psa 23:1,2" into "Psalm 23:1,2".
 * Handles multi-word book prefixes, variant formats, and unicode dashes.
 */
function expandReference(ref: string): string {
  ref = ref.trim();
  // Normalise unicode dashes to ASCII hyphens
  ref = ref.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-");
  // Fix common OCR errors: lowercase L → 1 in verse numbers
  ref = ref.replace(/(\d+:)l/g, "$11");

  // Handle compound references separated by comma-space then a new book
  // e.g. "Nah 1:7, -rev 7:3" or "Psa 138:3 -dan 9:21"
  // Strip stray leading hyphens from book names
  ref = ref.replace(/\s*-\s*([a-zA-Z])/g, ", $1");

  // Try matching: optional number prefix + book + space + chapter:verse
  // Book names can be multi-word (1 Cor, Song of Solomon, etc.)
  const match = ref.match(/^(\d?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+([\d:,\s\-L]+.*)$/);
  if (match) {
    const book = match[1].trim();
    const cv = match[2].trim();
    return `${expandBookName(book)} ${cv}`;
  }
  return ref;
}

/**
 * Parse the references string. References are separated by semicolons,
 * and each reference corresponds to a verse block (theme + subsequent verses).
 *
 * The format uses semicolons to separate references from different books,
 * and commas/hyphens within a single reference for verse ranges.
 * Multiple references for separate verses are separated by semicolons.
 */
function parseReferences(refsStr: string): string[] {
  if (!refsStr.trim()) return [];

  // Normalise unicode dashes
  refsStr = refsStr.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-");
  // Remove stray quotes
  refsStr = refsStr.replace(/"/g, "");

  // Fix source errors where a semicolon splits a book from its chapter:
  // e.g. "Isa; 52:14" → "Isa 52:14"
  refsStr = refsStr.replace(/([A-Za-z])\s*;\s*(\d+:\d)/g, "$1 $2");

  // Split by semicolons — each entry is one reference
  const rawRefs = refsStr.split(";").map(r => r.trim()).filter(Boolean);
  return rawRefs.map(expandReference);
}

/**
 * Parse the text content (HTML) into theme verse + body verses.
 *
 * Structure:
 *   <strong>Theme verse text</strong>+ +First verse block -- second passage.+ +Third verse block.
 *
 * The `+` characters separate major verse blocks.
 * The `--` separates individual Scripture passages within a block.
 */
function parseTextAndRefs(
  html: string,
  refsStr: string,
): { themeVerse: Verse; verses: Verse[] } {
  const references = parseReferences(refsStr);

  // Extract theme verse from <strong> tags
  const themeMatch = html.match(/<strong>(.*?)<\/strong>/s);
  const themeText = themeMatch ? cleanText(stripHtml(themeMatch[1])) : "";

  // Remove the theme verse part and split by + separators
  let bodyHtml = html.replace(/<strong>.*?<\/strong>/s, "").trim();

  // Split by the + separator pattern (handles + +, +, and leading +)
  const blocks = bodyHtml
    .split(/\+\s*\+|\+/)
    .map(b => cleanText(stripHtml(b)))
    .filter(Boolean);

  // Within each block, split by -- to get individual passages
  const passages: string[] = [];
  for (const block of blocks) {
    const parts = block.split(/\s*--\s*/).filter(Boolean);
    for (const part of parts) {
      const cleaned = cleanText(part);
      if (cleaned) {
        passages.push(cleaned);
      }
    }
  }

  // The first reference is for the theme verse, rest map to passages
  const themeRef = references.length > 0 ? references[0] : "";
  const passageRefs = references.slice(1);

  const themeVerse: Verse = { text: themeText, reference: themeRef };

  const verses: Verse[] = passages.map((text, i) => ({
    text,
    reference: i < passageRefs.length ? passageRefs[i] : "",
  }));

  return { themeVerse, verses };
}

function main(): void {
  const sourcePath = join(__dirname, "Daily_Light_source.txt");
  const outputPath = join(__dirname, "..", "data", "readings.json");

  console.log("Reading source file...");
  const source = readFileSync(sourcePath, "utf-8");
  const lines = source.trim().split("\n");

  console.log(`Found ${lines.length} lines (days).`);

  const readings: Reading[] = [];
  let errorCount = 0;

  for (const line of lines) {
    const fields = line.split("|");
    if (fields.length < 6) {
      console.error(`Skipping malformed line: ${line.slice(0, 60)}...`);
      errorCount++;
      continue;
    }

    const [_dateName, rawDateKey, morningHtml, morningRefs, eveningHtml, eveningRefs] = fields;
    const dateKey = normaliseDateKey(rawDateKey.trim());

    // Parse morning reading
    try {
      const morning = parseTextAndRefs(morningHtml, morningRefs);
      readings.push({
        date: dateKey,
        period: "morning",
        themeVerse: morning.themeVerse,
        verses: morning.verses,
      });
    } catch (err) {
      console.error(`Error parsing morning for ${dateKey}:`, err);
      errorCount++;
    }

    // Parse evening reading
    try {
      const evening = parseTextAndRefs(eveningHtml, eveningRefs);
      readings.push({
        date: dateKey,
        period: "evening",
        themeVerse: evening.themeVerse,
        verses: evening.verses,
      });
    } catch (err) {
      console.error(`Error parsing evening for ${dateKey}:`, err);
      errorCount++;
    }
  }

  console.log(`Parsed ${readings.length} readings (expected 732).`);
  if (errorCount > 0) {
    console.error(`Encountered ${errorCount} errors.`);
  }

  // Validate
  const morningCount = readings.filter(r => r.period === "morning").length;
  const eveningCount = readings.filter(r => r.period === "evening").length;
  console.log(`  Morning: ${morningCount}, Evening: ${eveningCount}`);

  // Check for entries with missing theme verses
  const missingTheme = readings.filter(r => !r.themeVerse.text);
  if (missingTheme.length > 0) {
    console.warn(`Warning: ${missingTheme.length} readings with empty theme verse.`);
    for (const r of missingTheme.slice(0, 5)) {
      console.warn(`  ${r.date} ${r.period}`);
    }
  }

  // Check for entries with no verses
  const noVerses = readings.filter(r => r.verses.length === 0);
  if (noVerses.length > 0) {
    console.warn(`Warning: ${noVerses.length} readings with no body verses.`);
  }

  // Write output
  writeFileSync(outputPath, JSON.stringify(readings, null, 2), "utf-8");
  console.log(`Written to ${outputPath}`);
}

main();
