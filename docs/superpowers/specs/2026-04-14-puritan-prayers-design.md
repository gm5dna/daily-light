# Puritan Prayers — Design Spec

## Overview

A CLI tool that displays prayers and devotions from public domain Puritan authors (17th-18th century). Random prayer by default, searchable by keyword, title, or author. No date-based readings.

Originally conceived as "Valley of Vision" but renamed because Arthur Bennett's 1975 compilation is under copyright. This app sources directly from original public domain Puritan texts.

## Data Sources

Multiple CCEL and Internet Archive texts, including:
- Matthew Henry, *A Method for Prayer* (1710)
- Lewis Bayly, *The Practice of Piety* (1611)
- Richard Baxter, *The Saints' Everlasting Rest* (1650)
- John Bunyan, devotional writings
- Isaac Watts, prayers and hymns
- Thomas Watson, devotional works
- John Owen, devotional works

Each source has a different format, so the collection script needs per-source parsing logic.

## Data Pipeline

A script (`scripts/collect-prayers.ts`) that:
1. Fetches texts from CCEL (HTML or XML formats)
2. Extracts discrete prayers/devotional passages with per-source parsing
3. Records author and source metadata for each prayer
4. Writes `data/prayers.json`

This will require editorial curation — some texts are full books, not collections of discrete prayers. The script handles fetching and initial extraction; the final JSON may need manual review to ensure quality and appropriate segmentation.

Runs during development. The JSON is committed to the repo. The script is not shipped to end users.

## Data Model

```typescript
interface Prayer {
  title: string;       // e.g. "For Spiritual Renewal"
  text: string;        // the full prayer text
  author: string;      // e.g. "Richard Baxter"
  source?: string;     // e.g. "The Saints' Everlasting Rest, 1650"
  section?: string;    // optional grouping, e.g. "Confession", "Praise"
}
```

## CLI

```
puritan-prayers                                  Random prayer (default)
puritan-prayers --random                         Random prayer
puritan-prayers --title "For Spiritual Renewal"  Show specific prayer by title
puritan-prayers --author "Richard Baxter"        Random prayer by this author
puritan-prayers --search <term>                  Search by keyword, title, or author
puritan-prayers --list                           List all prayers by title
puritan-prayers --help                           Show help
puritan-prayers --version                        Show version
```

Default behaviour with no arguments: display a random prayer.

## Display

- Title displayed prominently in bold
- Author and source shown dimly below the title (e.g. "Richard Baxter — The Saints' Everlasting Rest, 1650")
- Section name shown dimly if present
- Prayer text wrapped as a prose block
- Horizontal rules above and below
- ANSI formatting when TTY, plain text when piped

## File Structure

```
puritan-prayers/
  src/
    index.ts            # CLI entry point
    types.ts            # Prayer
    prayers.ts          # load, get by title, get by author, search, list, random
    display.ts          # prayer-specific layout
    display-utils.ts    # copied from daily-light
  tests/
    prayers.test.ts
    display-utils.test.ts  # copied from daily-light
  scripts/
    collect-prayers.ts  # data extraction script
  data/
    prayers.json        # collected prayers
  package.json
  tsconfig.json
```

## Shared Files Copied From Daily Light

- `src/display-utils.ts` — as-is
- `tests/display-utils.test.ts` — as-is

No `date-utils.ts` needed (no date-based readings).

## Tech Stack

- TypeScript, ES2022, Node16 modules
- Node.js >= 18
- Node.js built-in test runner (`node:test`)
- Zero production dependencies
- Dev dependencies: `typescript`, `@types/node`

## Repository

New repository at `/Users/stuart/Documents/working/coding/puritan-prayers`
