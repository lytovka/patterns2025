import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  isNonEmptyArray,
  isObject,
  intersectingKeys,
  maxLengthElement,
  sortListOfObjectsBy,
  relative,
  addRelativeProperty,
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

describe("sortListOfObjectsBy", () => {
  it("given empty array, should return empty array", () => {
    const result = sortListOfObjectsBy([]);
    assert.deepEqual(result, []);
  });

  it("given non-array, should return empty array", () => {
    const result = sortListOfObjectsBy({});
    assert.deepEqual(result, []);
  });

  it("given valid array of objects, if property does not exist, should throw an error", () => {
    assert.throws(() =>
      sortListOfObjectsBy(
        [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
          { name: "Charlie", age: 35 },
        ],
        "height",
      ),
    );
  });

  it("given valid array of objects, should sort by property in descending order", () => {
    const result = sortListOfObjectsBy(
      [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ],
      "age",
    );
    assert.deepEqual(result, [
      { name: "Charlie", age: 35 },
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
  });

  it("given valid array of objects, should sort by property in ascending order", () => {
    const result = sortListOfObjectsBy(
      [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ],
      "age",
      { order: "asc" },
    );
    assert.deepEqual(result, [
      { name: "Bob", age: 25 },
      { name: "Alice", age: 30 },
      { name: "Charlie", age: 35 },
    ]);
  });
});

describe("relative", () => {
  it("given invalid numbers, should return 0", () => {
    const result = relative(NaN, null);
    assert.equal(result, 0);
  });

  it("given 0 for whole, should throw exception", () => {
    assert.throws(() => relative(100, 0));
  });

  it("given valid numbers, should calculate relative % of the first number", () => {
    const result = relative(20, 200);
    assert.equal(result, 10);
  });
});

describe("addRelativeProperty", () => {
  it("given empty input, should return empty list", () => {
    assert.deepEqual(addRelativeProperty([], "density"), []);
    assert.deepEqual(addRelativeProperty(null, "density"), []);
    assert.deepEqual(addRelativeProperty(undefined, "density"), []);
  });

  it("given missing property, should return empty list", () => {
    const cities = [{ city: "Lagos", density: 100 }];
    assert.deepEqual(addRelativeProperty(cities, ""), []);
    assert.deepEqual(addRelativeProperty(cities, null), []);
    assert.deepEqual(addRelativeProperty(cities, undefined), []);
  });

  it("given object and default arguments, expect new column to be added", () => {
    const cities = [
      { city: "Lagos", density: 13712 },
      { city: "Delhi", density: 11313 },
      { city: "Tokyo", density: 6168 },
    ];

    const result = addRelativeProperty(cities, "density");

    assert.equal(result[0].rel_density, "100");
    assert.equal(result[1].rel_density, "83");
    assert.equal(result[2].rel_density, "45");
    assert.equal(result.length, 3);
    // Should not mutate original objects
    assert.notStrictEqual(result, cities);
  });

  it("given custom target property name, expect new column to be added", () => {
    const cities = [
      { city: "Lagos", density: 100 },
      { city: "Delhi", density: 50 },
    ];

    const result = addRelativeProperty(cities, "density", {
      targetProperty: "densityPercent",
    });

    assert.equal(result[0].densityPercent, "100");
    assert.equal(result[1].densityPercent, "50");
    assert.equal(result[0].rel_density, undefined);
  });

  it("given missing property, should fallback to 0", () => {
    const cities = [
      { city: "Lagos", density: 100 },
      { city: "Delhi" },
      { city: "Tokyo", density: 50 },
    ];

    const result = addRelativeProperty(cities, "density");

    assert.equal(result[0].rel_density, "100");
    assert.equal(result[1].rel_density, "0");
    assert.equal(result[2].rel_density, "50");
  });
});
