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
    assert.equal(result.length, 1); // Single word stays on one line
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
