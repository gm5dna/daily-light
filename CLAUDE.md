# Daily Light CLI

## Project Overview
A CLI tool to display daily devotional readings from "Daily Light on the Daily Path"
by Samuel Bagster (1829). Public domain. KJV text.

## Language and Conventions
- British English throughout (code comments, user-facing strings, documentation).
- TypeScript with strict mode.
- Prefer native Node.js APIs over external dependencies where reasonable.

## Architecture
- `src/readings.ts` is the single source of truth for data access.
- `src/display.ts` owns all terminal output formatting.
- `src/date-utils.ts` handles all date logic including period detection.
- Data lives in `data/readings.json` — never modify this at runtime.

## Testing
- Use Node.js built-in test runner (`node --test`).
- Test date parsing edge cases: leap year (29 Feb), year boundaries,
  flexible date formats.
- Test period detection: boundary at 14:00.
- Test display output for terminal width handling.

## Key Decisions
- Morning/evening boundary: 14:00 local time.
- Date format in output: "7 April" (day month, no ordinal suffix).
- KJV text only — no alternative translations.
- 732 entries (366 days × 2 periods, including 29 February).
- No network calls at runtime. All data is bundled.

## Common Tasks
- `npm run build` — compile TypeScript
- `npm test` — run tests
- `npm run prepare-data` — regenerate readings.json from source
- `npx daily-light` — run locally during development
