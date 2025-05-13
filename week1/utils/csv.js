import { isNonEmptyArray, isObject } from "./misc.js";

const getTrimmedLines = (csv) => csv.split("\n").map((l) => l.trim());

export function fromString(data) {
  if (typeof data !== "string" || !data.trim()) {
    throw new Error("The agument must be a non-empty string");
  }
  const lines = getTrimmedLines(data);
  if (lines.length < 2) throw new Error("Invalid CSV format");
  const columns = lines[0].split(",");
  const table = [];
  const maxElementsInRow = columns.length;
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").slice(0, maxElementsInRow);
    table.push(cells);
  }
  return { columns, table };
}

export function parseCsv(data) {
  return fromString(data);
}

export function csvToListOfObjects(csv) {
  if (!isObject(csv)) {
    throw new Error("CSV must be an object");
  }
  const { columns, table } = csv;
  if (!isNonEmptyArray(columns) || !isNonEmptyArray(table)) {
    throw new Error("Both columns and table must be arrays");
  }
  const result = [];
  for (let i = 0; i < table.length; i++) {
    const obj = {};
    for (let j = 0; j < table[i].length; j++) {
      obj[columns[j]] = table[i][j] ?? null;
    }
    result.push(obj);
  }
  return result;
}
