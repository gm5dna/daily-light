# Morning and Evening — Design Spec

## Overview

A CLI tool that displays daily devotional readings from C.H. Spurgeon's *Morning and Evening* (1866). One reading per morning and evening, 732 entries total. Same architectural pattern as Daily Light, different data model.

## Data Source

CCEL XML file: `https://ccel.org/ccel/s/spurgeon/morneve.xml`

Structured ThML with all 732 entries. Each entry is a `<div2>` with:
- ID like `d0101am` / `d0101pm` (date + period)
- Heading like "Morning, January 1"
- `<scripRef passage="...">` for the scripture reference
- `<p>` elements for the devotional prose

Public domain (1866). No copyright concerns.

## Data Pipeline

A one-off script (`scripts/parse-ccel.ts`) that:
1. Fetches the XML from CCEL
2. Parses each `<div2>` entry
3. Extracts date, period, scripture reference, and prose text (stripping inline markup like nested `<scripRef>` tags and `<verse>` blocks)
4. Validates: 732 entries, all dates covered, all periods present
5. Writes `data/devotionals.json`

Runs once during development. The JSON is committed to the repo. The script is not shipped to end users.

## Data Model

```typescript
interface Devotional {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  scripture: string;   // key verse reference, e.g. "Joshua 5:12"
  text: string;        // Spurgeon's prose devotional
}

type Period = "morning" | "evening";

interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
```

## CLI

```
morning-evening                     Today's reading (morning or evening)
morning-evening morning             Today's morning reading
morning-evening evening             Today's evening reading
morning-evening jan 1               Reading for 1 January
morning-evening jan 1 morning       Morning reading for 1 January
morning-evening 15 mar evening      Evening reading for 15 March
morning-evening tomorrow            Reading for tomorrow
morning-evening yesterday           Reading for yesterday
morning-evening --random            Random reading
morning-evening --search <term>     Search by keyword or reference
morning-evening --list              List all readings
morning-evening --help              Show help
morning-evening --version           Show version
```

Default behaviour with no arguments: today's reading, morning before 14:00, evening from 14:00.

## Display

- Header with horizontal rule, app name, period, and date (centred)
- Scripture reference displayed prominently in bold
- Prose text wrapped as a single block (no interspersed references)
- Footer horizontal rule
- ANSI formatting when TTY, plain text when piped

## File Structure

```
morning-evening/
  src/
    index.ts            # CLI entry point
    types.ts            # Devotional, DateQuery, Period
    devotionals.ts      # load, get, search, list, random
    display.ts          # app-specific layout
    display-utils.ts    # copied from daily-light
    date-utils.ts       # copied from daily-light
  tests/
    devotionals.test.ts
    display-utils.test.ts  # copied from daily-light
  scripts/
    parse-ccel.ts       # one-off data extraction script
  data/
    devotionals.json    # 732 Spurgeon readings
  package.json
  tsconfig.json
```

## Shared Files Copied From Daily Light

- `src/display-utils.ts` — as-is
- `src/date-utils.ts` — as-is
- `tests/display-utils.test.ts` — as-is

## Tech Stack

- TypeScript, ES2022, Node16 modules
- Node.js >= 18
- Node.js built-in test runner (`node:test`)
- Zero production dependencies
- Dev dependencies: `typescript`, `@types/node`

## Repository

New repository at `/Users/stuart/Documents/working/coding/morning-evening`
