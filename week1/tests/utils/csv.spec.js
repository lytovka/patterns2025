import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseCsv } from "../../utils/csv.js";

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

  it("given valid CSV data, should convert it to a list of objects", () => {
    const result = parseCsv(regularCsv);
    assert.deepEqual(result, [
      { car: "bmw", model: "3 Series", year: "2020" },
      { car: "mercedes", model: "C-Class", year: "2021" },
      { car: "toyota", model: "Camry", year: "2019" },
    ]);
  });

  it("should handle sparse CSV data", () => {
    const result = parseCsv(sparseCsv);
    assert.deepEqual(result, [
      { car: "bmw", model: "3 Series", year: "2020" },
      { car: "mercedes", model: null, year: "2021" },
      { car: "toyota", model: "Camry", year: null },
    ]);
  });
});
