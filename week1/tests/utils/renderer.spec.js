import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { formatToTable } from "../../utils/renderer.js";

describe("formatToTable", () => {
  it("given invalid input, should return undefined", () => {
    assert.equal(formatToTable([]), undefined);
    assert.equal(formatToTable(null), undefined);
    assert.equal(formatToTable(undefined), undefined);
  });

  it("given valid data, should format it as a table with proper headers and rows", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    const result = formatToTable(data);
    // headers

    assert.ok(result.includes("name"));
    assert.ok(result.includes("age"));
    // data

    assert.ok(result.includes("Alice"));
    assert.ok(result.includes("30"));
    assert.ok(result.includes("Bob"));
    assert.ok(result.includes("25"));
    // lines
    assert.equal(result.split("\n").length, 4);
  });

  it("should handle nullable values in objects", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: null },
    ];
    const result = formatToTable(data);

    assert.ok(result.includes("name"));
    assert.ok(result.includes("age"));
    assert.ok(result.includes("Alice"));
    assert.ok(result.includes("Bob"));
    assert.ok(result.includes("30"));
    assert.ok(result.includes("null"));
  });

  it("should allow custom gap value", () => {
    const data = [{ name: "Alice", age: 30 }];
    const resultDefault = formatToTable(data);
    const resultCustom = formatToTable(data, { gap: 10 });

    // Custom gap should produce a longer output
    assert.ok(resultCustom.length > resultDefault.length);
  });

  it("should align columns properly based on content", () => {
    const data = [
      { name: "Alice", details: "Software Engineer" },
      { name: "Bob", details: "Product Manager" },
    ];
    const result = formatToTable(data);
    const lines = result.split("\n");

    assert.equal(lines[0].length, lines[1].length);
  });
});
