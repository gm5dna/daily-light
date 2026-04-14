import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { wrapText, rule, formatReference, contentWidth, parseDateKey, periodLabel, } from "../src/display-utils.js";
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
//# sourceMappingURL=display-utils.test.js.map