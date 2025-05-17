import { isNonEmptyArray, isObject } from "./misc.js";

const getTrimmedLines = (csv) => csv.split("\n").map((l) => l.trim());
const splitCsvRow = (row) => row.split(",");

export function parseCsv(data) {
  if (typeof data !== "string" || !data.trim()) {
    throw new Error("`data` must be a non-empty string");
  }
  const lines = getTrimmedLines(data);
  if (lines.length < 2) throw new Error("Invalid CSV format");

  const headers = splitCsvRow(lines[0])
  const content = Array.from({ length: headers.length });

  for (let i = 1; i < lines.length; i++) {
    const rowValues = splitCsvRow(lines[i])
    const maxElInRow = Math.min(headers.length, rowValues.length)
    const obj = {}
    // Iterate up to the header's length and disregard leftover elements
    for (let j = 0; j < maxElInRow; j++) {
      obj[headers[j]] = rowValues[j] || null
    }
    content[i - 1] = obj
  }
  return content;
}
