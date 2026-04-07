#!/usr/bin/env node

import { parseArgs } from "node:util";
import { detectPeriod, parseDate, parsePeriod, today, tomorrow, yesterday } from "./date-utils.js";
import { getReading, getRandomReading, searchReadings, listReadings } from "./readings.js";
import { displayReading, displaySearchResults, displayList } from "./display.js";
import type { DateQuery, Period } from "./types.js";

const VERSION = "1.0.0";

const HELP = `
daily-light — Daily devotional readings from Daily Light on the Daily Path

Usage:
  daily-light                     Show today's reading (morning or evening)
  daily-light morning             Today's morning reading
  daily-light evening             Today's evening reading
  daily-light jan 1               Reading for 1 January
  daily-light jan 1 morning       Morning reading for 1 January
  daily-light 15 mar evening      Evening reading for 15 March
  daily-light tomorrow            Reading for tomorrow
  daily-light yesterday           Reading for yesterday

Options:
  --help, -h                      Show this help message
  --version, -v                   Show version
  --random, -r                    Show a random reading
  --list, -l                      List all readings
  --search, -s <term>             Search readings by keyword or reference
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
    console.log(`daily-light v${VERSION}`);
    return;
  }

  // --random
  if (values.random) {
    displayReading(getRandomReading());
    return;
  }

  // --list
  if (values.list) {
    displayList(listReadings());
    return;
  }

  // --search
  if (values.search !== undefined) {
    const term = values.search;
    if (!term) {
      console.error("Please provide a search term: daily-light --search <term>");
      process.exit(1);
    }
    const results = searchReadings(term);
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
        console.error("Try: daily-light jan 1, daily-light 15 mar evening");
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
    console.error("Run daily-light --help for usage.");
    process.exit(1);
  }

  const reading = getReading(dateQuery, period);
  if (!reading) {
    console.error(`No reading found for the requested date and period.`);
    process.exit(1);
  }

  displayReading(reading);
}

main();
