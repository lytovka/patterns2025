import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  isNonEmptyArray,
  isObject,
  intersectingKeys,
  maxLengthElement,
} from "../../utils/misc.js";

describe("isNonEmptyArray", () => {
  it("given empty array, should return false", () => {
    const result = isNonEmptyArray([]);
    assert.equal(result, false);
  });
  it("given non-array, should return false", () => {
    const result = isNonEmptyArray({});
    assert.equal(result, false);
  });
  it("given non-empty array, should return true", () => {
    const result = isNonEmptyArray([1]);
    assert.equal(result, true);
  });
});

describe("isObject", () => {
  it("given an empty object, should return true", () => {
    const result = isObject({});
    assert.equal(result, true);
  });
  it("given an object, should return true", () => {
    const result = isObject({ a: 1 });
    assert.equal(result, true);
  });
  it("given non-object, should return false", () => {
    const result = isObject([]);
    assert.equal(result, false);
  });
  it("given null, should return false", () => {
    const result = isObject(null);
    assert.equal(result, false);
  });
  it("given string, should return false", () => {
    const result = isObject("string");
    assert.equal(result, false);
  });
});

describe("maxLengthElement", () => {
  it("given empty array, should return 0", () => {
    const result = maxLengthElement([]);
    assert.equal(result, 0);
  });
  it("given non-array, should return 0", () => {
    const result = maxLengthElement({});
    assert.equal(result, 0);
  });
  it("given array with one string, should return length of that string", () => {
    const result = maxLengthElement(["a"]);
    assert.equal(result, 1);
  });
  it("given array with multiple strings, should return length of longest string", () => {
    const result = maxLengthElement(["a", "ab", "abc"]);
    assert.equal(result, 3);
  });
  it("given array with non-string elements, should throw error", () => {
    assert.throws(() => maxLengthElement([1, 2]), {
      message: "Array must contain only strings",
    });
  });
});

describe("intersectingKeys", () => {
  it("given empty array, should return empty array", () => {
    const result = intersectingKeys([]);
    assert.deepEqual(result, []);
  });

  it("given a non-iterable argument, should return empty array", () => {
    const result = intersectingKeys({});
    assert.deepEqual(result, []);
  });

  it("given array with one object, should return keys of that object", () => {
    const result = intersectingKeys([{ a: 1, b: 2 }]);
    assert.deepEqual(result, ["a", "b"]);
  });

  it("given array with multiple objects, should return intersecting keys", () => {
    const result = intersectingKeys([
      { a: 1, b: 2 },
      { a: 3, c: 4 },
    ]);
    assert.deepEqual(result, ["a"]);
  });
});
