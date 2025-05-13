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
          message: "The agument must be a non-empty string",
        },
      );
    });
  });

  it("given columns without rows, should throw an error", () => {
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

  it("should parse CSV data into columns and table", () => {
    const result = parseCsv(regularCsv);
    assert.deepEqual(result.columns, ["car", "model", "year"]);
    assert.deepEqual(result.table, [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "C-Class", "2021"],
      ["toyota", "Camry", "2019"],
    ]);
  });

  it("should handle sparse CSV data", () => {
    const result = parseCsv(sparseCsv);
    assert.deepEqual(result.columns, ["car", "model", "year"]);
    assert.deepEqual(result.table, [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "", "2021"],
      ["toyota", "Camry", ""],
    ]);
  });
});

describe("csvToListOfObjects", () => {
  const regularCsv = {
    columns: ["car", "model", "year"],
    table: [
      ["bmw", "3 Series", "2020"],
      ["mercedes", "C-Class", "2021"],
      ["toyota", "Camry", "2019"],
    ],
  };
  const sparseCsv = {
    columns: ["car", "model", "year"],
    table: [
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

  it("given csv with invalid columns or table, should throw an error", () => {
    const invalidCsv = { columns: "", table: [] };
    assert.throws(
      () => {
        csvToListOfObjects(invalidCsv);
      },
      {
        name: "Error",
        message: "Both columns and table must be arrays",
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
