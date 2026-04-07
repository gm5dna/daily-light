import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectPeriod,
  dateKey,
  formatDateDisplay,
  parseDate,
  parsePeriod,
  today,
  tomorrow,
  yesterday,
  isLeapYear,
  daysInMonth,
} from "../src/date-utils.js";

describe("detectPeriod", () => {
  it("returns morning before 14:00", () => {
    const morning = new Date(2026, 3, 7, 8, 0);
    assert.equal(detectPeriod(morning), "morning");
  });

  it("returns morning at 13:59", () => {
    const morning = new Date(2026, 3, 7, 13, 59);
    assert.equal(detectPeriod(morning), "morning");
  });

  it("returns evening at 14:00", () => {
    const evening = new Date(2026, 3, 7, 14, 0);
    assert.equal(detectPeriod(evening), "evening");
  });

  it("returns evening at 23:59", () => {
    const evening = new Date(2026, 3, 7, 23, 59);
    assert.equal(detectPeriod(evening), "evening");
  });

  it("returns morning at midnight", () => {
    const midnight = new Date(2026, 3, 7, 0, 0);
    assert.equal(detectPeriod(midnight), "morning");
  });
});

describe("dateKey", () => {
  it("formats january-1 correctly", () => {
    assert.equal(dateKey(1, 1), "january-1");
  });

  it("formats december-31 correctly", () => {
    assert.equal(dateKey(12, 31), "december-31");
  });

  it("formats february-29 correctly", () => {
    assert.equal(dateKey(2, 29), "february-29");
  });
});

describe("formatDateDisplay", () => {
  it("formats 7 April", () => {
    assert.equal(formatDateDisplay(4, 7), "7 April");
  });

  it("formats 1 January", () => {
    assert.equal(formatDateDisplay(1, 1), "1 January");
  });

  it("formats 25 December", () => {
    assert.equal(formatDateDisplay(12, 25), "25 December");
  });

  it("formats 29 February", () => {
    assert.equal(formatDateDisplay(2, 29), "29 February");
  });
});

describe("parseDate", () => {
  it("parses 'jan 1'", () => {
    const result = parseDate("jan 1");
    assert.deepEqual(result, { month: 1, day: 1 });
  });

  it("parses '1 jan'", () => {
    const result = parseDate("1 jan");
    assert.deepEqual(result, { month: 1, day: 1 });
  });

  it("parses 'january 15'", () => {
    const result = parseDate("january 15");
    assert.deepEqual(result, { month: 1, day: 15 });
  });

  it("parses '15 march'", () => {
    const result = parseDate("15 march");
    assert.deepEqual(result, { month: 3, day: 15 });
  });

  it("parses 'dec 25'", () => {
    const result = parseDate("dec 25");
    assert.deepEqual(result, { month: 12, day: 25 });
  });

  it("parses '29 feb'", () => {
    const result = parseDate("29 feb");
    assert.deepEqual(result, { month: 2, day: 29 });
  });

  it("is case-insensitive", () => {
    const result = parseDate("JAN 1");
    assert.deepEqual(result, { month: 1, day: 1 });
  });

  it("returns null for invalid input", () => {
    assert.equal(parseDate("not a date"), null);
  });

  it("returns null for invalid day", () => {
    assert.equal(parseDate("feb 30"), null);
  });

  it("returns null for single word", () => {
    assert.equal(parseDate("january"), null);
  });
});

describe("parsePeriod", () => {
  it("parses 'morning'", () => {
    assert.equal(parsePeriod("morning"), "morning");
  });

  it("parses 'evening'", () => {
    assert.equal(parsePeriod("evening"), "evening");
  });

  it("is case-insensitive", () => {
    assert.equal(parsePeriod("Morning"), "morning");
  });

  it("returns null for invalid input", () => {
    assert.equal(parsePeriod("afternoon"), null);
  });
});

describe("today/tomorrow/yesterday", () => {
  it("today returns valid month and day", () => {
    const t = today();
    assert.ok(t.month >= 1 && t.month <= 12);
    assert.ok(t.day >= 1 && t.day <= 31);
  });

  it("tomorrow returns a different day or wraps to next month", () => {
    const tom = tomorrow();
    assert.ok(tom.month >= 1 && tom.month <= 12);
    assert.ok(tom.day >= 1 && tom.day <= 31);
  });

  it("yesterday returns valid date", () => {
    const yes = yesterday();
    assert.ok(yes.month >= 1 && yes.month <= 12);
    assert.ok(yes.day >= 1 && yes.day <= 31);
  });
});

describe("isLeapYear", () => {
  it("2024 is a leap year", () => {
    assert.equal(isLeapYear(2024), true);
  });

  it("2023 is not a leap year", () => {
    assert.equal(isLeapYear(2023), false);
  });

  it("2000 is a leap year", () => {
    assert.equal(isLeapYear(2000), true);
  });

  it("1900 is not a leap year", () => {
    assert.equal(isLeapYear(1900), false);
  });
});

describe("daysInMonth", () => {
  it("January has 31 days", () => {
    assert.equal(daysInMonth(1), 31);
  });

  it("February has 29 days (max)", () => {
    assert.equal(daysInMonth(2), 29);
  });

  it("April has 30 days", () => {
    assert.equal(daysInMonth(4), 30);
  });
});
