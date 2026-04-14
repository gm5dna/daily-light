# Extract Display Utilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract generic display helpers from `display.ts` into `display-utils.ts` so they can be cleanly copied into the Morning and Evening and Valley of Vision repos.

**Architecture:** Split `src/display.ts` into two files — `src/display-utils.ts` (generic terminal formatting utilities) and `src/display.ts` (Daily Light-specific reading display). The app-specific file imports from the utilities file. No behaviour change.

**Tech Stack:** TypeScript, Node.js built-in test runner (`node:test`)

---

### Task 1: Restore test source files

The test sources were deleted but compiled versions remain in `dist/tests/`. Restore them so we can verify the refactoring doesn't break anything.

**Files:**
- Create: `tests/display.test.ts`

- [ ] **Step 1: Create `tests/display.test.ts`**

```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { wrapText } from "../src/display.js";

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
```

- [ ] **Step 2: Build and run the test to verify it passes**

Run: `npx tsc && node --test dist/tests/display.test.js`
Expected: 6 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/display.test.ts
git commit -m "Restore display test source file"
```

---

### Task 2: Create `display-utils.ts` with generic helpers

Extract the pure utility functions that have no Daily Light-specific knowledge.

**Files:**
- Create: `src/display-utils.ts`

- [ ] **Step 1: Write tests for the utility functions**

Create `tests/display-utils.test.ts`:

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

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx tsc && node --test dist/tests/display-utils.test.js`
Expected: FAIL — `display-utils.js` does not exist yet

- [ ] **Step 3: Create `src/display-utils.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx tsc && node --test dist/tests/display-utils.test.js`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/display-utils.ts tests/display-utils.test.ts
git commit -m "Add display-utils with generic terminal formatting helpers"
```

---

### Task 3: Update `display.ts` and its test to import from `display-utils.ts`

Replace the inline definitions with imports. Update the test import at the same time so the build doesn't break. No behaviour change.

**Files:**
- Modify: `src/display.ts:1-81` (replace inline helpers with imports)
- Modify: `tests/display.test.ts:3` (update import path)

- [ ] **Step 1: Replace the top of `src/display.ts`**

Replace everything from line 1 through the end of the `parseDateKey` function (line 81) with:

```typescript
import type { Reading, Period } from "./types.js";
import { formatDateDisplay } from "./date-utils.js";
import {
  BOLD,
  DIM,
  RESET,
  contentWidth,
  formatReference,
  parseDateKey,
  periodLabel,
  rule,
  wrapText,
} from "./display-utils.js";
```

The rest of the file (`displayReading`, `displaySearchResults`, `displayList`) stays exactly as-is — they already use these helpers by name.

- [ ] **Step 2: Update the import in `tests/display.test.ts`**

Change line 3 from:

```typescript
import { wrapText } from "../src/display.js";
```

to:

```typescript
import { wrapText } from "../src/display-utils.js";
```

- [ ] **Step 3: Build and run all tests**

Run: `npx tsc && node --test dist/tests/display-utils.test.js && node --test dist/tests/display.test.js`
Expected: all tests pass

- [ ] **Step 4: Smoke-test the CLI**

Run: `node dist/src/index.js --random`
Expected: a formatted reading displays correctly with ANSI styling (if terminal) or plain text (if piped)

Run: `node dist/src/index.js --random | cat`
Expected: same reading, no ANSI escape codes in output

- [ ] **Step 5: Commit**

```bash
git add src/display.ts tests/display.test.ts
git commit -m "Refactor display.ts to import from display-utils"
```

---

### Task 4: Clean up stale dist/tests and verify

The `dist/tests/` directory contains stale compiled tests from deleted source files. Clean it up and do a final verification.

**Files:**
- Delete: stale files in `dist/`

- [ ] **Step 1: Clean and rebuild**

Run: `rm -rf dist && npx tsc`
Expected: clean build with no errors

- [ ] **Step 2: Run all tests**

Run: `node --test dist/tests/display.test.js dist/tests/display-utils.test.js`
Expected: all tests pass

- [ ] **Step 3: Smoke-test all CLI modes**

```bash
node dist/src/index.js --random
node dist/src/index.js --search "shepherd"
node dist/src/index.js --list | head -20
node dist/src/index.js morning
```

Expected: all commands produce correctly formatted output

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Clean rebuild after display-utils extraction"
```
