import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadReadings, getReading, getRandomReading, searchReadings, listReadings, } from "../src/readings.js";
describe("loadReadings", () => {
    it("loads exactly 732 readings", () => {
        const readings = loadReadings();
        assert.equal(readings.length, 732);
    });
    it("has 366 morning and 366 evening readings", () => {
        const readings = loadReadings();
        const morning = readings.filter(r => r.period === "morning");
        const evening = readings.filter(r => r.period === "evening");
        assert.equal(morning.length, 366);
        assert.equal(evening.length, 366);
    });
    it("includes february-29 readings", () => {
        const readings = loadReadings();
        const feb29 = readings.filter(r => r.date === "february-29");
        assert.equal(feb29.length, 2);
    });
    it("every reading has a theme verse with text and reference", () => {
        const readings = loadReadings();
        for (const r of readings) {
            assert.ok(r.themeVerse.text.length > 0, `${r.date} ${r.period} missing theme text`);
            assert.ok(r.themeVerse.reference.length > 0, `${r.date} ${r.period} missing theme ref`);
        }
    });
    it("every reading has at least one body verse", () => {
        const readings = loadReadings();
        for (const r of readings) {
            assert.ok(r.verses.length > 0, `${r.date} ${r.period} has no body verses`);
        }
    });
});
describe("getReading", () => {
    it("returns january-1 morning reading", () => {
        const reading = getReading({ month: 1, day: 1 }, "morning");
        assert.ok(reading);
        assert.equal(reading.date, "january-1");
        assert.equal(reading.period, "morning");
    });
    it("returns december-31 evening reading", () => {
        const reading = getReading({ month: 12, day: 31 }, "evening");
        assert.ok(reading);
        assert.equal(reading.date, "december-31");
        assert.equal(reading.period, "evening");
    });
    it("returns february-29 reading", () => {
        const reading = getReading({ month: 2, day: 29 }, "morning");
        assert.ok(reading);
        assert.equal(reading.date, "february-29");
    });
    it("returns null for non-existent date", () => {
        const reading = getReading({ month: 13, day: 1 }, "morning");
        assert.equal(reading, null);
    });
});
describe("getRandomReading", () => {
    it("returns a valid reading", () => {
        const reading = getRandomReading();
        assert.ok(reading);
        assert.ok(reading.date);
        assert.ok(reading.period === "morning" || reading.period === "evening");
        assert.ok(reading.themeVerse.text.length > 0);
    });
});
describe("searchReadings", () => {
    it("finds readings matching 'shepherd'", () => {
        const results = searchReadings("shepherd");
        assert.ok(results.length > 0);
    });
    it("is case-insensitive", () => {
        const lower = searchReadings("shepherd");
        const upper = searchReadings("SHEPHERD");
        assert.equal(lower.length, upper.length);
    });
    it("finds readings matching a reference", () => {
        const results = searchReadings("Psalm 23");
        assert.ok(results.length > 0);
    });
    it("returns empty for nonsense query", () => {
        const results = searchReadings("xyzzyplugh");
        assert.equal(results.length, 0);
    });
});
describe("listReadings", () => {
    it("returns entries for all readings", () => {
        const list = listReadings(true);
        assert.equal(list.length, 732);
    });
    it("excludes feb 29 on non-leap years", () => {
        const list = listReadings(false);
        assert.equal(list.length, 730);
        const feb29 = list.filter(e => e.date === "february-29");
        assert.equal(feb29.length, 0);
    });
    it("includes feb 29 on leap years", () => {
        const list = listReadings(true);
        const feb29 = list.filter(e => e.date === "february-29");
        assert.equal(feb29.length, 2);
    });
});
//# sourceMappingURL=readings.test.js.map