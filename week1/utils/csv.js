import { isNonEmptyArray, isObject } from "./misc.js";

const getTrimmedLines = (csv) => csv.split("\n").map((l) => l.trim());
const splitCsvRow = (row) => row.split(',')

export function fromString(data) {
  if (typeof data !== "string" || !data.trim()) {
    throw new Error("`data` must be a non-empty string");
  }
  const lines = getTrimmedLines(data);
  if (lines.length < 2) throw new Error("Invalid CSV format");
  const [rawHeaders, ...rawContent] = lines
  const headers = splitCsvRow(rawHeaders);
  const content = Array.from({ length: headers.length });
  const maxElementsInRow = content.length
  for (let i = 0; i < rawContent.length; i++) {
    const cells = splitCsvRow(rawContent[i]).slice(0, maxElementsInRow);
    content[i] = cells;
  }
  return { headers, content };
}

export function parseCsv(data) {
  return fromString(data);
}

export function csvToListOfObjects(csv) {
  if (!isObject(csv)) {
    throw new Error("CSV must be an object");
  }
  const { headers, content } = csv;
  if (!isNonEmptyArray(headers) || !isNonEmptyArray(content)) {
    throw new Error("Both headers and columns must be arrays");
  }
  const result = [];
  for (let i = 0; i < content.length; i++) {
    const obj = {};
    for (let j = 0; j < content[i].length; j++) {
      obj[headers[j]] = content[i][j] ?? null;
    }
    result.push(obj);
  }
  return result;
}
