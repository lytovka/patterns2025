import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseCsv, csvToListOfObjects } from "../../utils/csv.js";

describe("parseCsv", () => {
  const regularCsv = `car,model,year\nbmw,3 Series,2020\nmercedes,C-Class,2021\ntoyota,Camry,2019`;
  const sparseCsv = `car,model,year\nbmw,3 Series,2020\nmercedes,,2021\ntoyota,Camry,`;
  const invalidCsv = `car,model,year`;

  it("given invalid arguments, should throw an error", () => {
    const invalidArgs = ["", " ", null, undefined, 123, {}, []];
    invalidArgs.forEach((arg) => {
      assert.throws(
        () => {
          parseCsv(arg);
        },
        {
          name: "Error",
        },
      );
    });
  });

  it("given headers without rows, should throw an error", () => {
    assert.throws(
      () => {
        parseCsv(invalidCsv);
      },
      {
        name: "Error",
        message: "Invalid CSV format",
      },
    );
  });

  it("should parse CSV data into headers and content", () => {
    const result = parseCsv(regularCsv);
    assert.deepEqual(result.headers, ["car", "model", "year"]);
    assert.deepEqual(result.content, [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "C-Class", "2021"],
      ["toyota", "Camry", "2019"],
    ]);
  });

  it("should handle sparse CSV data", () => {
    const result = parseCsv(sparseCsv);
    assert.deepEqual(result.headers, ["car", "model", "year"]);
    assert.deepEqual(result.content, [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "", "2021"],
      ["toyota", "Camry", ""],
    ]);
  });
});

describe("csvToListOfObjects", () => {
  const regularCsv = {
    headers: ["car", "model", "year"],
    content: [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "C-Class", "2021"],
      ["toyota", "Camry", "2019"],
    ],
  };
  const sparseCsv = {
    headers: ["car", "model", "year"],
    content: [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "", "2021"],
      ["toyota", "Camry", ""],
    ],
  };

  it("given invalid arguments, should throw an error", () => {
    const invalidArgs = ["", " ", null, undefined, 123, []];
    invalidArgs.forEach((arg) => {
      assert.throws(
        () => {
          csvToListOfObjects(arg);
        },
        {
          name: "Error",
          message: "CSV must be an object",
        },
      );
    });
  });

  it("given csv with invalid headers or content, should throw an error", () => {
    const invalidCsv = { headers: "", content: [] };
    assert.throws(
      () => {
        csvToListOfObjects(invalidCsv);
      },
      {
        name: "Error",
      },
    );
  });

  it("given valid CSV data, should convert it to a list of objects", () => {
    const result = csvToListOfObjects(regularCsv);
    assert.deepEqual(result, [
      { car: "bmw", model: "3 Series", year: "2020" },
      { car: "mercedes", model: "C-Class", year: "2021" },
      { car: "toyota", model: "Camry", year: "2019" },
    ]);
  });

  it("should handle sparse CSV data", () => {
    const result = csvToListOfObjects(sparseCsv);
    assert.deepEqual(result, [
      { car: "bmw", model: "3 Series", year: "2020" },
      { car: "mercedes", model: "", year: "2021" },
      { car: "toyota", model: "Camry", year: "" },
    ]);
  });
});
