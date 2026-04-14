# Morning and Evening CLI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI tool that displays daily devotional readings from C.H. Spurgeon's *Morning and Evening* (1866), following the same architectural pattern as the daily-light app.

**Architecture:** A TypeScript CLI app with ES modules. A one-off parsing script fetches the CCEL plain text, parses 732 entries (366 days x 2 periods) into JSON committed to the repo. The runtime loads the JSON, resolves dates/periods, and renders formatted output to the terminal. Shared display and date utilities are copied verbatim from daily-light.

**Tech Stack:** TypeScript 5.4+, Node.js >= 18, ES2022/Node16 modules, Node.js built-in test runner (`node:test`), zero production dependencies.

---

## File Structure

```
/Users/stuart/Documents/working/coding/morning-evening/
  src/
    index.ts            # CLI entry point — argument parsing, routing
    types.ts            # Devotional, DateQuery, Period interfaces
    devotionals.ts      # load, get, search, list, random
    display.ts          # app-specific display formatting
    display-utils.ts    # copied from daily-light (shared ANSI/text utilities)
    date-utils.ts       # copied from daily-light (shared date parsing)
  tests/
    devotionals.test.ts # TDD tests for devotionals module
    display-utils.test.ts # copied from daily-light (shared utility tests)
  scripts/
    parse-ccel.ts       # one-off script: fetch CCEL text, parse, write JSON
  data/
    devotionals.json    # 732 parsed Spurgeon readings (committed artifact)
  package.json
  tsconfig.json
  .gitignore
  .npmignore
```

---

### Task 1: Scaffold Repository

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/package.json`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/tsconfig.json`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/.gitignore`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/.npmignore`

- [ ] **Step 1: Create directory and initialise git**

```bash
mkdir -p /Users/stuart/Documents/working/coding/morning-evening
cd /Users/stuart/Documents/working/coding/morning-evening
git init
```

Expected: `Initialized empty Git repository in /Users/stuart/Documents/working/coding/morning-evening/.git/`

- [ ] **Step 2: Create package.json**

Create `/Users/stuart/Documents/working/coding/morning-evening/package.json`:

```json
{
  "name": "morning-evening",
  "version": "1.0.0",
  "description": "Daily devotional readings from C.H. Spurgeon's Morning and Evening (1866)",
  "type": "module",
  "main": "dist/src/index.js",
  "bin": {
    "morning-evening": "dist/src/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc && node dist/src/index.js",
    "test": "tsc && node --test dist/tests/**/*.test.js",
    "parse": "tsc -p tsconfig.scripts.json && node dist-scripts/scripts/parse-ccel.js"
  },
  "keywords": [
    "spurgeon",
    "morning-evening",
    "devotional",
    "bible",
    "scripture"
  ],
  "license": "MIT",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

Create `/Users/stuart/Documents/working/coding/morning-evening/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist", "dist-scripts", "scripts"]
}
```

- [ ] **Step 4: Create tsconfig.scripts.json for the parsing script**

Create `/Users/stuart/Documents/working/coding/morning-evening/tsconfig.scripts.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist-scripts",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": false,
    "skipLibCheck": true
  },
  "include": ["scripts/**/*.ts", "src/types.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5: Create .gitignore**

Create `/Users/stuart/Documents/working/coding/morning-evening/.gitignore`:

```
node_modules/
dist/
dist-scripts/
*.js.map
*.tgz
```

- [ ] **Step 6: Create .npmignore**

Create `/Users/stuart/Documents/working/coding/morning-evening/.npmignore`:

```
*.tgz
*.js.map
dist/tests/
dist-scripts/
scripts/
docs/
```

- [ ] **Step 7: Create directory structure**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
mkdir -p src tests scripts data
```

- [ ] **Step 8: Install dependencies**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm install
```

Expected: `added 2 packages` (typescript and @types/node)

- [ ] **Step 9: Commit scaffold**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add package.json package-lock.json tsconfig.json tsconfig.scripts.json .gitignore .npmignore
git commit -m "chore: scaffold morning-evening repository"
```

---

### Task 2: Copy Shared Files

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/src/display-utils.ts`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/src/date-utils.ts`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/tests/display-utils.test.ts`

These files are copied verbatim from daily-light. They depend on `types.ts` for the `Period` type import, so we create a minimal types stub first.

- [ ] **Step 1: Create minimal types stub**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/types.ts`:

```typescript
export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
```

This is a temporary stub so the shared files compile (`date-utils.ts` imports both `Period` and `DateQuery`). Task 3 will expand it to add the `Devotional` interface.

- [ ] **Step 2: Copy display-utils.ts from daily-light**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/display-utils.ts`:

```typescript
import type { Period } from "./types.js";

const isTTY = process.stdout.isTTY ?? false;

const esc = (code: string) => (isTTY ? `\x1b[${code}m` : "");
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
```

- [ ] **Step 3: Copy date-utils.ts from daily-light**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/date-utils.ts`:

```typescript
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
 * Build the date key used in devotionals.json, e.g. "january-1".
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
```

- [ ] **Step 4: Copy display-utils.test.ts from daily-light**

Create `/Users/stuart/Documents/working/coding/morning-evening/tests/display-utils.test.ts`:

```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  wrapText,
  rule,
  formatReference,
  contentWidth,
  parseDateKey,
  periodLabel,
} from "../src/display-utils.js";

describe("wrapText", () => {
  it("does not wrap short text", () => {
    const result = wrapText("Hello world", 40);
    assert.deepEqual(result, ["Hello world"]);
  });

  it("wraps at word boundaries", () => {
    const result = wrapText("The Lord is my shepherd I shall not want", 25);
    assert.ok(result.length > 1);
    for (const line of result) {
      assert.ok(line.length <= 25, `Line too long: "${line}"`);
    }
  });

  it("handles single long word", () => {
    const result = wrapText("Supercalifragilisticexpialidocious", 10);
    assert.equal(result.length, 1);
  });

  it("preserves all words", () => {
    const input = "The Lord is my shepherd I shall not want";
    const result = wrapText(input, 20);
    const rejoined = result.join(" ");
    assert.equal(rejoined, input);
  });

  it("handles empty string", () => {
    const result = wrapText("", 40);
    assert.deepEqual(result, []);
  });

  it("respects width exactly", () => {
    const result = wrapText("aa bb cc dd ee ff", 8);
    for (const line of result) {
      assert.ok(line.length <= 8, `Line "${line}" exceeds width`);
    }
  });
});

describe("rule", () => {
  it("returns a string of the given width", () => {
    const result = rule(20);
    // Strip ANSI codes to check content
    const plain = result.replace(/\x1b\[[0-9;]*m/g, "");
    assert.equal(plain.length, 20);
    assert.ok(plain.includes("─"));
  });
});

describe("formatReference", () => {
  it("right-aligns the reference within the given width", () => {
    const result = formatReference("John 3:16", 40);
    const plain = result.replace(/\x1b\[[0-9;]*m/g, "");
    assert.ok(plain.includes("— John 3:16"));
    assert.ok(plain.length <= 40);
  });
});

describe("contentWidth", () => {
  it("returns a number between 40 and 72", () => {
    const width = contentWidth();
    assert.ok(width >= 40);
    assert.ok(width <= 72);
  });
});

describe("parseDateKey", () => {
  it("parses 'january-1' correctly", () => {
    const result = parseDateKey("january-1");
    assert.deepEqual(result, { month: 1, day: 1 });
  });

  it("parses 'december-25' correctly", () => {
    const result = parseDateKey("december-25");
    assert.deepEqual(result, { month: 12, day: 25 });
  });

  it("parses 'february-29' correctly", () => {
    const result = parseDateKey("february-29");
    assert.deepEqual(result, { month: 2, day: 29 });
  });
});

describe("periodLabel", () => {
  it("capitalises 'morning'", () => {
    assert.equal(periodLabel("morning"), "Morning");
  });

  it("capitalises 'evening'", () => {
    assert.equal(periodLabel("evening"), "Evening");
  });
});
```

- [ ] **Step 5: Build and run tests**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build
```

Expected: Compiles with no errors.

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm test
```

Expected: All display-utils tests pass.

- [ ] **Step 6: Commit shared files**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add src/types.ts src/display-utils.ts src/date-utils.ts tests/display-utils.test.ts
git commit -m "feat: copy shared utilities from daily-light"
```

---

### Task 3: Create Types

**Files:**
- Modify: `/Users/stuart/Documents/working/coding/morning-evening/src/types.ts`

- [ ] **Step 1: Expand types.ts to add the Devotional interface**

Replace the contents of `/Users/stuart/Documents/working/coding/morning-evening/src/types.ts` with:

```typescript
export interface Devotional {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  scripture: string;   // key verse reference, e.g. "Joshua 5:12"
  text: string;        // Spurgeon's prose devotional
}

export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
```

- [ ] **Step 2: Build to verify types compile**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build
```

Expected: Compiles with no errors.

- [ ] **Step 3: Run tests to verify nothing broke**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm test
```

Expected: All tests still pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add src/types.ts
git commit -m "feat: define Devotional, Period, and DateQuery types"
```

---

### Task 4: Write Parsing Script and Generate Data

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/scripts/parse-ccel.ts`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/data/devotionals.json` (generated output)

The CCEL plain text file (`https://ccel.org/ccel/s/spurgeon/morneve/cache/morneve.txt`) has this structure per entry:

```
Morning, January 1

[33]Go To Evening Reading

"They did eat of the fruit of the land of Canaan that year."

Joshua 5:12

Israel's weary wanderings were all over...
[prose paragraphs]
__________________________________________________________________

Evening, January 1
...
```

Entries are delimited by headers matching `^(Morning|Evening), (\w+) (\d+)$`. After the header: a cross-reference line `[N]Go To ...`, the scripture quote in curly/straight quotes, the scripture reference, then prose paragraphs. A line of underscores separates entries.

- [ ] **Step 1: Create the parsing script**

Create `/Users/stuart/Documents/working/coding/morning-evening/scripts/parse-ccel.ts`:

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

interface Devotional {
  date: string;
  period: "morning" | "evening";
  scripture: string;
  text: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONTH_NAMES: Record<string, string> = {
  January: "january",
  February: "february",
  March: "march",
  April: "april",
  May: "may",
  June: "june",
  July: "july",
  August: "august",
  September: "september",
  October: "october",
  November: "november",
  December: "december",
};

const DAYS_IN_MONTH: Record<string, number> = {
  january: 31, february: 29, march: 31, april: 30, may: 31, june: 30,
  july: 31, august: 31, september: 30, october: 31, november: 30, december: 31,
};

const SOURCE_URL = "https://ccel.org/ccel/s/spurgeon/morneve/cache/morneve.txt";

// Header pattern: "Morning, January 1" or "Evening, January 1"
const HEADER_RE = /^(Morning|Evening),\s+(\w+)\s+(\d+)$/;

// Cross-reference line: "[33]Go To Evening Reading" or "[34]Go To Morning Reading"
const CROSSREF_RE = /^\[\d+\]Go To (Morning|Evening) Reading$/;

// Underscore separator line
const SEPARATOR_RE = /^_{10,}$/;

async function main(): Promise<void> {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const rawText = await response.text();
  console.log(`Fetched ${rawText.length} characters.`);

  const lines = rawText.split(/\r?\n/);
  const devotionals: Devotional[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const headerMatch = line.match(HEADER_RE);

    if (!headerMatch) {
      i++;
      continue;
    }

    // Found a header
    const periodRaw = headerMatch[1]; // "Morning" or "Evening"
    const monthRaw = headerMatch[2];  // "January"
    const dayRaw = headerMatch[3];    // "1"

    const period = periodRaw.toLowerCase() as "morning" | "evening";
    const monthKey = MONTH_NAMES[monthRaw];
    if (!monthKey) {
      console.warn(`Unknown month "${monthRaw}" at line ${i + 1}, skipping.`);
      i++;
      continue;
    }
    const day = parseInt(dayRaw, 10);
    const dateKey = `${monthKey}-${day}`;

    i++; // Move past header

    // Skip blank lines after header
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Skip cross-reference line
    if (i < lines.length && CROSSREF_RE.test(lines[i].trim())) {
      i++;
    }

    // Skip blank lines after cross-reference
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Next non-blank line should be the scripture quote in quotes
    // It may span multiple lines. Collect until we find the closing quote.
    // The quote is surrounded by typographic or straight quotes.
    let scriptureQuote = "";
    // Skip the scripture quote — we want the reference, not the quote text
    // The quote starts with " or \u201c and ends with " or \u201d
    // It may span multiple lines
    if (i < lines.length) {
      const firstChar = lines[i].trim().charAt(0);
      if (firstChar === '"' || firstChar === '\u201c') {
        // Collect the full quote (may span lines)
        while (i < lines.length) {
          const qLine = lines[i].trim();
          if (qLine === "") break;
          scriptureQuote += (scriptureQuote ? " " : "") + qLine;
          i++;
          // Check if quote is closed
          if (scriptureQuote.endsWith('"') || scriptureQuote.endsWith('\u201d')) {
            break;
          }
        }
      }
    }

    // Skip blank lines after quote
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Next non-blank line(s) should be the scripture reference
    // This is typically one line like "Joshua 5:12" but could span lines
    let scripture = "";
    while (i < lines.length) {
      const refLine = lines[i].trim();
      if (refLine === "") break;
      // Stop if we hit a separator or next header
      if (SEPARATOR_RE.test(refLine) || HEADER_RE.test(refLine)) break;
      scripture += (scripture ? " " : "") + refLine;
      i++;
    }

    // Skip blank lines after reference
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Collect prose text until separator or next header
    const proseLines: string[] = [];
    while (i < lines.length) {
      const pLine = lines[i].trim();
      if (SEPARATOR_RE.test(pLine)) {
        i++; // skip the separator
        break;
      }
      if (HEADER_RE.test(pLine)) {
        break; // don't consume the next header
      }
      proseLines.push(pLine);
      i++;
    }

    // Join prose: collapse blank lines into paragraph breaks, trim
    const text = collapseProseLines(proseLines);

    if (!scripture) {
      console.warn(`No scripture reference found for ${dateKey} ${period} (line ~${i})`);
    }

    devotionals.push({ date: dateKey, period, scripture, text });
  }

  // Sort by date then period (morning before evening)
  devotionals.sort((a, b) => {
    const dateCompare = compareDateKeys(a.date, b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.period === "morning" ? -1 : 1;
  });

  // Validation
  console.log(`\nParsed ${devotionals.length} entries.`);

  // Check expected count: 366 days x 2 periods = 732
  // (Feb 29 may or may not be present — adjust expectation)
  const hasFeb29 = devotionals.some(d => d.date === "february-29");
  const expectedDays = hasFeb29 ? 366 : 365;
  const expectedEntries = expectedDays * 2;
  console.log(`February 29 entries: ${hasFeb29 ? "present" : "absent"}`);
  console.log(`Expected: ${expectedEntries} entries for ${expectedDays} days.`);

  if (devotionals.length !== expectedEntries) {
    console.error(`ERROR: Expected ${expectedEntries} entries, got ${devotionals.length}.`);
    // Show which dates are missing
    const allMonths = Object.values(MONTH_NAMES);
    for (const month of allMonths) {
      const maxDay = DAYS_IN_MONTH[month];
      for (let d = 1; d <= maxDay; d++) {
        if (!hasFeb29 && month === "february" && d === 29) continue;
        const key = `${month}-${d}`;
        for (const p of ["morning", "evening"] as const) {
          const found = devotionals.find(dev => dev.date === key && dev.period === p);
          if (!found) {
            console.error(`  MISSING: ${key} ${p}`);
          }
        }
      }
    }
    process.exit(1);
  }

  // Verify all dates covered
  const allMonths = Object.values(MONTH_NAMES);
  let missingCount = 0;
  for (const month of allMonths) {
    const maxDay = DAYS_IN_MONTH[month];
    for (let d = 1; d <= maxDay; d++) {
      if (!hasFeb29 && month === "february" && d === 29) continue;
      const key = `${month}-${d}`;
      for (const p of ["morning", "evening"] as const) {
        const found = devotionals.find(dev => dev.date === key && dev.period === p);
        if (!found) {
          console.error(`MISSING: ${key} ${p}`);
          missingCount++;
        }
      }
    }
  }

  if (missingCount > 0) {
    console.error(`${missingCount} missing entries.`);
    process.exit(1);
  }

  console.log("All dates and periods verified.");

  // Spot-check a few entries
  const jan1m = devotionals.find(d => d.date === "january-1" && d.period === "morning");
  if (jan1m) {
    console.log(`\nSpot check — January 1 Morning:`);
    console.log(`  Scripture: ${jan1m.scripture}`);
    console.log(`  Text preview: ${jan1m.text.slice(0, 100)}...`);
  }

  const dec31e = devotionals.find(d => d.date === "december-31" && d.period === "evening");
  if (dec31e) {
    console.log(`\nSpot check — December 31 Evening:`);
    console.log(`  Scripture: ${dec31e.scripture}`);
    console.log(`  Text preview: ${dec31e.text.slice(0, 100)}...`);
  }

  // Write output
  // Resolve output path relative to the project root (two levels up from dist-scripts/scripts/)
  const outDir = join(__dirname, "..", "..", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "devotionals.json");
  writeFileSync(outPath, JSON.stringify(devotionals, null, 2), "utf-8");
  console.log(`\nWrote ${devotionals.length} entries to ${outPath}`);
}

/**
 * Collapse an array of prose lines into clean paragraph text.
 * Blank lines become double newlines (paragraph breaks).
 * Consecutive non-blank lines are joined with spaces.
 */
function collapseProseLines(lines: string[]): string {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.join("\n\n").trim();
}

/**
 * Compare two date keys for sorting.
 */
function compareDateKeys(a: string, b: string): number {
  const monthOrder = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const [aMonth, aDay] = a.split("-");
  const [bMonth, bDay] = b.split("-");
  const aMonthIdx = monthOrder.indexOf(aMonth);
  const bMonthIdx = monthOrder.indexOf(bMonth);
  if (aMonthIdx !== bMonthIdx) return aMonthIdx - bMonthIdx;
  return parseInt(aDay, 10) - parseInt(bDay, 10);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Build and run the parsing script**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run parse
```

Expected output (approximately):
```
Fetching https://ccel.org/ccel/s/spurgeon/morneve/cache/morneve.txt ...
Fetched NNNNN characters.

Parsed NNN entries.
February 29 entries: present/absent
Expected: NNN entries for NNN days.
All dates and periods verified.

Spot check — January 1 Morning:
  Scripture: Joshua 5:12
  Text preview: Israel's weary wanderings were all over...

Spot check — December 31 Evening:
  Scripture: ...
  Text preview: ...

Wrote NNN entries to .../data/devotionals.json
```

If the script reports missing entries or the count is wrong, debug the parser by examining the raw text around the failing entries. Common issues:
- Multi-line scripture references
- Unusual quote characters
- Missing separator lines between entries
- Entries with no blank line before prose

- [ ] **Step 3: Inspect the generated JSON**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node -e "const d = JSON.parse(require('fs').readFileSync('data/devotionals.json','utf-8')); console.log('Count:', d.length); console.log('First:', JSON.stringify(d[0]).slice(0,200)); console.log('Last:', JSON.stringify(d[d.length-1]).slice(0,200));"
```

Expected: Count matches the parser output, first entry is January 1 Morning, last entry is December 31 Evening.

- [ ] **Step 4: Verify the main app still builds**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build
npm test
```

Expected: All existing tests pass.

- [ ] **Step 5: Commit the parsing script and generated data**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add scripts/parse-ccel.ts tsconfig.scripts.json data/devotionals.json
git commit -m "feat: add CCEL parsing script and generate devotionals.json"
```

---

### Task 5: Create Devotionals Module with Tests

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/tests/devotionals.test.ts`
- Create: `/Users/stuart/Documents/working/coding/morning-evening/src/devotionals.ts`

This task follows strict TDD: write failing tests first, then implement.

- [ ] **Step 1: Write failing tests for devotionals module**

Create `/Users/stuart/Documents/working/coding/morning-evening/tests/devotionals.test.ts`:

```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadDevotionals,
  getDevotional,
  getRandomDevotional,
  searchDevotionals,
  listDevotionals,
} from "../src/devotionals.js";

describe("loadDevotionals", () => {
  it("loads all devotionals from JSON", () => {
    const devotionals = loadDevotionals();
    assert.ok(devotionals.length > 0, "Should load at least one devotional");
    // Should be 730 (365 days x 2) or 732 (366 days x 2) depending on Feb 29
    assert.ok(
      devotionals.length === 730 || devotionals.length === 732,
      `Expected 730 or 732 entries, got ${devotionals.length}`,
    );
  });

  it("returns cached result on second call", () => {
    const first = loadDevotionals();
    const second = loadDevotionals();
    assert.strictEqual(first, second, "Should return the same cached array");
  });
});

describe("getDevotional", () => {
  it("returns morning devotional for January 1", () => {
    const result = getDevotional({ month: 1, day: 1 }, "morning");
    assert.ok(result, "Should find January 1 morning");
    assert.equal(result.date, "january-1");
    assert.equal(result.period, "morning");
    assert.ok(result.scripture.length > 0, "Should have a scripture reference");
    assert.ok(result.text.length > 0, "Should have devotional text");
  });

  it("returns evening devotional for January 1", () => {
    const result = getDevotional({ month: 1, day: 1 }, "evening");
    assert.ok(result, "Should find January 1 evening");
    assert.equal(result.date, "january-1");
    assert.equal(result.period, "evening");
  });

  it("returns morning devotional for December 31", () => {
    const result = getDevotional({ month: 12, day: 31 }, "morning");
    assert.ok(result, "Should find December 31 morning");
    assert.equal(result.date, "december-31");
    assert.equal(result.period, "morning");
  });

  it("returns null for non-existent date", () => {
    const result = getDevotional({ month: 13, day: 1 }, "morning");
    assert.equal(result, null);
  });
});

describe("getRandomDevotional", () => {
  it("returns a valid devotional", () => {
    const result = getRandomDevotional();
    assert.ok(result, "Should return a devotional");
    assert.ok(result.date, "Should have a date");
    assert.ok(
      result.period === "morning" || result.period === "evening",
      "Should have a valid period",
    );
    assert.ok(result.scripture, "Should have a scripture reference");
    assert.ok(result.text, "Should have text");
  });
});

describe("searchDevotionals", () => {
  it("finds devotionals matching a keyword in text", () => {
    const results = searchDevotionals("shepherd");
    assert.ok(results.length > 0, "Should find at least one match for 'shepherd'");
    for (const { devotional, matches } of results) {
      assert.ok(matches.length > 0, "Each result should have at least one match");
    }
  });

  it("finds devotionals matching a scripture reference", () => {
    const results = searchDevotionals("Joshua");
    assert.ok(results.length > 0, "Should find at least one match for 'Joshua'");
  });

  it("returns empty array for no matches", () => {
    const results = searchDevotionals("xyzzyplugh");
    assert.deepEqual(results, []);
  });

  it("is case-insensitive", () => {
    const upper = searchDevotionals("LORD");
    const lower = searchDevotionals("lord");
    assert.equal(upper.length, lower.length, "Case should not affect results");
  });
});

describe("listDevotionals", () => {
  it("lists all devotionals with date, period, and scripture", () => {
    const list = listDevotionals();
    assert.ok(list.length > 0, "Should list at least one entry");
    const first = list[0];
    assert.ok(first.date, "Should have a date");
    assert.ok(first.period, "Should have a period");
    assert.ok(first.scripture, "Should have a scripture reference");
  });

  it("includes leap day when requested", () => {
    const withLeap = listDevotionals(true);
    const withoutLeap = listDevotionals(false);
    // If Feb 29 exists in data, withLeap should have more entries
    const feb29With = withLeap.filter(e => e.date === "february-29");
    const feb29Without = withoutLeap.filter(e => e.date === "february-29");
    assert.ok(feb29Without.length === 0, "Should exclude Feb 29 when not requested");
    // feb29With may be 0 or 2 depending on whether data has Feb 29
  });
});
```

- [ ] **Step 2: Build and run tests to verify they fail**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build 2>&1 || true
```

Expected: Compilation error because `../src/devotionals.js` does not exist.

- [ ] **Step 3: Implement the devotionals module**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/devotionals.ts`:

```typescript
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Devotional, Period, DateQuery } from "./types.js";
import { dateKey, daysInMonth, getMonthNames, isLeapYear } from "./date-utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedDevotionals: Devotional[] | null = null;

/**
 * Load all devotionals from the bundled JSON file.
 */
export function loadDevotionals(): Devotional[] {
  if (cachedDevotionals) return cachedDevotionals;

  // In dist/, we're at dist/src/devotionals.js — data is at ../../data/
  const dataPath = join(__dirname, "..", "..", "data", "devotionals.json");
  const raw = readFileSync(dataPath, "utf-8");
  cachedDevotionals = JSON.parse(raw) as Devotional[];
  return cachedDevotionals;
}

/**
 * Get a specific devotional by date and period.
 */
export function getDevotional(query: DateQuery, period: Period): Devotional | null {
  const devotionals = loadDevotionals();
  const key = dateKey(query.month, query.day);
  return devotionals.find(d => d.date === key && d.period === period) ?? null;
}

/**
 * Get a random devotional.
 */
export function getRandomDevotional(): Devotional {
  const devotionals = loadDevotionals();
  const idx = Math.floor(Math.random() * devotionals.length);
  return devotionals[idx];
}

/**
 * Search devotionals by keyword. Matches against scripture reference
 * and devotional text. Case-insensitive.
 */
export function searchDevotionals(term: string): Array<{ devotional: Devotional; matches: string[] }> {
  const devotionals = loadDevotionals();
  const lower = term.toLowerCase();
  const results: Array<{ devotional: Devotional; matches: string[] }> = [];

  for (const devotional of devotionals) {
    const matches: string[] = [];

    if (devotional.scripture.toLowerCase().includes(lower)) {
      matches.push(devotional.scripture);
    }

    if (devotional.text.toLowerCase().includes(lower)) {
      // Extract a snippet around the match
      const textLower = devotional.text.toLowerCase();
      const idx = textLower.indexOf(lower);
      const start = Math.max(0, idx - 40);
      const end = Math.min(devotional.text.length, idx + lower.length + 40);
      let snippet = devotional.text.slice(start, end);
      if (start > 0) snippet = "..." + snippet;
      if (end < devotional.text.length) snippet = snippet + "...";
      matches.push(snippet);
    }

    if (matches.length > 0) {
      results.push({ devotional, matches });
    }
  }

  return results;
}

/**
 * List all devotionals with their date, period, and scripture reference.
 * Optionally filter out 29 Feb on non-leap years.
 */
export function listDevotionals(includeLeapDay?: boolean): Array<{ date: string; period: Period; scripture: string }> {
  const devotionals = loadDevotionals();
  const showLeapDay = includeLeapDay ?? isLeapYear(new Date().getFullYear());

  return devotionals
    .filter(d => showLeapDay || d.date !== "february-29")
    .map(d => ({
      date: d.date,
      period: d.period,
      scripture: d.scripture,
    }));
}
```

- [ ] **Step 4: Build and run tests to verify they pass**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build && npm test
```

Expected: All tests pass, including both devotionals.test.ts and display-utils.test.ts.

- [ ] **Step 5: Commit**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add src/devotionals.ts tests/devotionals.test.ts
git commit -m "feat: add devotionals module with tests (TDD)"
```

---

### Task 6: Create Display Module

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/src/display.ts`

This module formats devotionals for terminal output. Unlike daily-light (which displays multiple verses), this app displays a single scripture reference and a prose block.

- [ ] **Step 1: Create display.ts**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/display.ts`:

```typescript
import type { Devotional, Period } from "./types.js";
import { formatDateDisplay } from "./date-utils.js";
import {
  BOLD,
  DIM,
  ITALIC,
  RESET,
  contentWidth,
  formatReference,
  parseDateKey,
  periodLabel,
  rule,
  wrapText,
} from "./display-utils.js";

/**
 * Display a full devotional reading to stdout.
 */
export function displayDevotional(devotional: Devotional): void {
  const width = contentWidth();
  const { month, day } = parseDateKey(devotional.date);
  const dateStr = formatDateDisplay(month, day);
  const period = periodLabel(devotional.period);

  const lines: string[] = [];

  // Header
  lines.push(rule(width));
  const headerText = `MORNING & EVENING — ${period} · ${dateStr}`;
  const headerPad = Math.max(0, Math.floor((width - headerText.length) / 2));
  lines.push(`${DIM}${" ".repeat(headerPad)}${headerText}${RESET}`);
  lines.push(rule(width));
  lines.push("");

  // Scripture reference — bold, prominent
  lines.push(`  ${BOLD}${devotional.scripture}${RESET}`);
  lines.push("");

  // Prose text — wrapped, with paragraph breaks preserved
  const paragraphs = devotional.text.split(/\n\n+/);
  for (const paragraph of paragraphs) {
    const wrapped = wrapText(paragraph, width - 4);
    for (const line of wrapped) {
      lines.push(`  ${line}`);
    }
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
  results: Array<{ devotional: Devotional; matches: string[] }>,
  term: string,
): void {
  if (results.length === 0) {
    console.log(`No readings found matching "${term}".`);
    return;
  }

  const width = contentWidth();
  console.log(`${BOLD}Found ${results.length} reading${results.length === 1 ? "" : "s"} matching "${term}":${RESET}\n`);

  for (const { devotional, matches } of results) {
    const { month, day } = parseDateKey(devotional.date);
    const dateStr = formatDateDisplay(month, day);
    const period = periodLabel(devotional.period);

    console.log(`  ${BOLD}${period} · ${dateStr}${RESET}`);
    console.log(`  ${DIM}${devotional.scripture}${RESET}`);

    // Show first match snippet
    const snippet = matches[0];
    if (snippet !== devotional.scripture) {
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
 * Display the list of all devotionals.
 */
export function displayList(
  entries: Array<{ date: string; period: Period; scripture: string }>,
): void {
  const width = contentWidth();

  console.log(`${BOLD}Morning & Evening — All Readings${RESET}\n`);

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
    const scriptureSnippet = entry.scripture.length > width - 30
      ? entry.scripture.slice(0, width - 33) + "..."
      : entry.scripture;
    console.log(`  ${dateStr} ${DIM}${period}${RESET}  ${scriptureSnippet}`);
  }
  console.log("");
}
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build && npm test
```

Expected: Compiles with no errors. All tests pass.

- [ ] **Step 3: Smoke-test display manually**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node -e "
import { loadDevotionals } from './dist/src/devotionals.js';
import { displayDevotional } from './dist/src/display.js';
const devos = loadDevotionals();
displayDevotional(devos[0]);
"
```

Expected: Formatted output showing January 1 Morning with header, scripture reference, prose text, and footer rule.

- [ ] **Step 4: Commit**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add src/display.ts
git commit -m "feat: add display module for formatted terminal output"
```

---

### Task 7: Create CLI Entry Point

**Files:**
- Create: `/Users/stuart/Documents/working/coding/morning-evening/src/index.ts`

- [ ] **Step 1: Create index.ts**

Create `/Users/stuart/Documents/working/coding/morning-evening/src/index.ts`:

```typescript
#!/usr/bin/env node

import { parseArgs } from "node:util";
import { detectPeriod, parseDate, parsePeriod, today, tomorrow, yesterday } from "./date-utils.js";
import { getDevotional, getRandomDevotional, searchDevotionals, listDevotionals } from "./devotionals.js";
import { displayDevotional, displaySearchResults, displayList } from "./display.js";
import type { DateQuery, Period } from "./types.js";

const VERSION = "1.0.0";

const HELP = `
morning-evening — Daily devotional readings from C.H. Spurgeon's Morning and Evening

Usage:
  morning-evening                     Show today's reading (morning or evening)
  morning-evening morning             Today's morning reading
  morning-evening evening             Today's evening reading
  morning-evening jan 1               Reading for 1 January
  morning-evening jan 1 morning       Morning reading for 1 January
  morning-evening 15 mar evening      Evening reading for 15 March
  morning-evening tomorrow            Reading for tomorrow
  morning-evening yesterday           Reading for yesterday

Options:
  --help, -h                          Show this help message
  --version, -v                       Show version
  --random, -r                        Show a random reading
  --list, -l                          List all readings
  --search, -s <term>                 Search readings by keyword or reference
`.trim();

function main(): void {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
      random: { type: "boolean", short: "r", default: false },
      list: { type: "boolean", short: "l", default: false },
      search: { type: "string", short: "s" },
    },
  });

  // --help
  if (values.help) {
    console.log(HELP);
    return;
  }

  // --version
  if (values.version) {
    console.log(`morning-evening v${VERSION}`);
    return;
  }

  // --random
  if (values.random) {
    displayDevotional(getRandomDevotional());
    return;
  }

  // --list
  if (values.list) {
    displayList(listDevotionals());
    return;
  }

  // --search
  if (values.search !== undefined) {
    const term = values.search;
    if (!term) {
      console.error("Please provide a search term: morning-evening --search <term>");
      process.exit(1);
    }
    const results = searchDevotionals(term);
    displaySearchResults(results, term);
    return;
  }

  // Positional arguments: parse date and/or period
  let dateQuery: DateQuery | null = null;
  let period: Period | null = null;

  if (positionals.length === 0) {
    // Default: today, auto-detect period
    dateQuery = today();
    period = detectPeriod();
  } else {
    // Check for special words
    const firstArg = positionals[0].toLowerCase();

    if (firstArg === "morning" || firstArg === "evening") {
      // Period only: today's date
      dateQuery = today();
      period = firstArg as Period;
    } else if (firstArg === "tomorrow") {
      dateQuery = tomorrow();
      period = positionals.length > 1 ? parsePeriod(positionals[1]) : detectPeriod();
    } else if (firstArg === "yesterday") {
      dateQuery = yesterday();
      period = positionals.length > 1 ? parsePeriod(positionals[1]) : detectPeriod();
    } else {
      // Try to parse a date from positionals
      // Could be: "jan 1", "1 jan", "jan 1 morning", "1 jan evening"
      const possibleDate = positionals.slice(0, 2).join(" ");
      dateQuery = parseDate(possibleDate);

      if (!dateQuery) {
        console.error(`Could not parse date: "${positionals.join(" ")}"`);
        console.error("Try: morning-evening jan 1, morning-evening 15 mar evening");
        process.exit(1);
      }

      // Check for period as third arg
      if (positionals.length > 2) {
        period = parsePeriod(positionals[2]);
      }
      if (!period) {
        period = detectPeriod();
      }
    }
  }

  if (!dateQuery || !period) {
    console.error("Could not determine date or period.");
    console.error("Run morning-evening --help for usage.");
    process.exit(1);
  }

  const devotional = getDevotional(dateQuery, period);
  if (!devotional) {
    console.error(`No reading found for the requested date and period.`);
    process.exit(1);
  }

  displayDevotional(devotional);
}

main();
```

- [ ] **Step 2: Build**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm run build
```

Expected: Compiles with no errors.

- [ ] **Step 3: Run all tests**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add src/index.ts
git commit -m "feat: add CLI entry point with argument parsing"
```

---

### Task 8: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
rm -rf dist
npm run build
```

Expected: Compiles with no errors.

- [ ] **Step 2: Run all tests**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Smoke-test — default (today's reading)**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js
```

Expected: Displays today's reading (morning if before 14:00, evening if after) with formatted header, scripture reference, prose text, and footer.

- [ ] **Step 4: Smoke-test — specific date**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js jan 1 morning
```

Expected: Displays January 1 Morning reading with "Joshua 5:12" as the scripture reference.

- [ ] **Step 5: Smoke-test — evening reading**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js evening
```

Expected: Displays today's evening reading.

- [ ] **Step 6: Smoke-test — tomorrow / yesterday**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js tomorrow
node dist/src/index.js yesterday
```

Expected: Each displays the appropriate date's reading.

- [ ] **Step 7: Smoke-test — random**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js --random
```

Expected: Displays a random devotional reading.

- [ ] **Step 8: Smoke-test — search**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js --search shepherd
```

Expected: Displays search results with matching devotionals.

- [ ] **Step 9: Smoke-test — list**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js --list | head -30
```

Expected: Displays the first 30 lines of the full readings list, grouped by month.

- [ ] **Step 10: Smoke-test — help and version**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js --help
node dist/src/index.js --version
```

Expected:
- `--help` displays the usage text
- `--version` displays `morning-evening v1.0.0`

- [ ] **Step 11: Smoke-test — piped output (no ANSI codes)**

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
node dist/src/index.js jan 1 morning | cat
```

Expected: Output displays without ANSI escape codes (no `\x1b[` sequences visible).

- [ ] **Step 12: Final commit if any adjustments were needed**

If any fixes were made during smoke testing:

```bash
cd /Users/stuart/Documents/working/coding/morning-evening
git add -A
git commit -m "fix: address issues found during smoke testing"
```

If no fixes were needed, skip this step.
