# Devotional CLI Family — Design Spec

## Overview

Restructure the Daily Light codebase to cleanly separate generic CLI utilities from app-specific code, enabling two new devotional CLI apps (Morning and Evening, Valley of Vision) as separate repositories that share copied utility files.

## Decision Log

- **Separate repos**, not a monorepo
- **Copy shared code** into each repo (no shared npm package)
- **Approach A**: refactor Daily Light in place, then copy shared files into new repos

## Shared Utilities

Extracted from Daily Light's `display.ts` into a new `display-utils.ts`:

- `isTTY` — TTY detection flag
- `esc()` — ANSI escape helper (returns empty string when not TTY)
- `RESET`, `BOLD`, `DIM`, `ITALIC` — ANSI constants
- `contentWidth()` — terminal width capped at 72 for readability
- `wrapText(text, width)` — word-boundary text wrapping
- `rule(width)` — horizontal rule
- `formatReference(ref, width)` — right-aligned, dimmed reference line
- `parseDateKey(dateStr)` — parse a date key like `"january-1"` into `{ month, day }`
- `periodLabel(period)` — format `"morning"` as `"Morning"`

These are pure utility functions with no app-specific knowledge. Copied as-is into each new repo.

`date-utils.ts` is already fully generic and copies as-is into Morning and Evening (not needed by Valley of Vision).

`DateQuery` and `Period` types are shared between the two date-based apps.

## App 1: Daily Light (refactor only)

### Changes

1. **New file `src/display-utils.ts`** — extract the generic helpers listed above from `display.ts`
2. **Update `src/display.ts`** — import from `display-utils.ts` instead of defining helpers inline

### No other changes

Types, date-utils, readings, and index files remain untouched. No behaviour change.

## App 2: Morning and Evening

Separate repository: `morning-evening`

### Data Model

```typescript
interface Devotional {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  scripture: string;   // key verse reference, e.g. "John 3:16"
  text: string;        // Spurgeon's prose devotional
}
```

### Data

`data/devotionals.json` — 732 entries (366 days x 2 periods). Same date key format as Daily Light (`"january-1"`, `"february-29"`, etc.).

### CLI

```
morning-evening                     Today's reading
morning-evening morning             Today's morning reading
morning-evening evening             Today's evening reading
morning-evening jan 1               Reading for 1 January
morning-evening jan 1 morning       Morning reading for 1 January
morning-evening tomorrow            Reading for tomorrow
morning-evening yesterday           Reading for yesterday
morning-evening --random            Random reading
morning-evening --search <term>     Search by keyword or reference
morning-evening --list              List all readings
morning-evening --help              Show help
morning-evening --version           Show version
```

### Display

- Header: app name, period, and date (same pattern as Daily Light, different title)
- Scripture reference displayed prominently
- Prose text wrapped as a single block
- No interspersed verse references (unlike Daily Light)

### File Structure

```
morning-evening/
  src/
    index.ts            # CLI entry point (written fresh)
    types.ts            # Devotional, DateQuery, Period (written fresh)
    devotionals.ts      # load, get, search, list (written fresh)
    display.ts          # app-specific layout (written fresh)
    display-utils.ts    # copied from daily-light
    date-utils.ts       # copied from daily-light
  data/
    devotionals.json    # 732 Spurgeon readings
  package.json
  tsconfig.json
```

### Shared Files Copied From Daily Light

- `display-utils.ts` — as-is
- `date-utils.ts` — as-is

## App 3: Valley of Vision

Separate repository: `valley-of-vision`

### Data Model

```typescript
interface Prayer {
  title: string;       // e.g. "The Valley of Vision", "Penitence"
  text: string;        // full prayer text
  section?: string;    // optional grouping, e.g. "Approach to God"
}
```

No date, no period. A titled collection of prayers.

### Data

`data/prayers.json` — approximately 200 entries.

### CLI

```
valley-of-vision                              Random prayer (default)
valley-of-vision --random                     Random prayer
valley-of-vision --title "The Valley of Vision"  Show specific prayer by title
valley-of-vision --search <term>              Search by keyword or title
valley-of-vision --list                       List all prayers by title
valley-of-vision --help                       Show help
valley-of-vision --version                    Show version
```

Default behaviour (no arguments) shows a random prayer, since there is no concept of "today's reading".

### Display

- Title displayed prominently in bold
- Section name shown dimly if present
- Prayer text wrapped as a prose block
- No date/period header, no scripture references

### File Structure

```
valley-of-vision/
  src/
    index.ts            # CLI entry point (written fresh)
    types.ts            # Prayer (written fresh)
    prayers.ts          # load, get by title, search, list (written fresh)
    display.ts          # prayer-specific layout (written fresh)
    display-utils.ts    # copied from daily-light
  data/
    prayers.json        # ~200 prayers
  package.json
  tsconfig.json
```

### Shared Files Copied From Daily Light

- `display-utils.ts` — as-is only

## Summary

| | Daily Light | Morning and Evening | Valley of Vision |
|---|---|---|---|
| Data shape | themeVerse + verses[] | prose + scripture ref | title + prayer text |
| Date-indexed | Yes (morning/evening) | Yes (morning/evening) | No |
| Default behaviour | Today's reading | Today's reading | Random prayer |
| Shared from DL | n/a | display-utils, date-utils | display-utils only |
| Repo | daily-light (existing) | morning-evening (new) | valley-of-vision (new) |

## Scope

This spec covers only the refactoring of Daily Light. The new repositories will each get their own spec and implementation plan when the time comes.
