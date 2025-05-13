// misc utils
const DEFAULT_COLUMN_GAP = 5;

export function compareNumbers(a, b, ordinality) {
  if (ordinality === "desc") return b - a;
  return a - b;
}

export function intersectingKeys(objs) {
  const setsOfKeys = objs.map(obj => new Set(Object.keys(obj)))
  const intersectedSet = setsOfKeys.reduce((a, b) => a.intersection(b), setsOfKeys[0])
  return Array.from(intersectedSet)
}

export function maxLengthElement(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((max, str) => Math.max(max, str.length), 0);
}

function isObject(any) {
  return typeof any === 'object' && !Array.isArray(any) && any !== null
}

// CSV utils
const getTrimmedLines = (csv) => csv.split("\n").map((l) => l.trim());

export function parseCsv(data) {
  const lines = getTrimmedLines(data);
  const columns = lines[0].split(",");
  const table = [];
  const maxElementsInRow = columns.length;
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").slice(0, maxElementsInRow);
    table.push(cells);
  }
  return { columns, table }
}

export function csvToListOfObjects(csv) {
  const { columns, table } = csv;
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

export function sortCsvTableBy(csv, options) {
  const { property = "density", ordinality = "desc" } = options;
  const isPropertyExist = csv.some((entry) => Object.hasOwn(entry, property));
  if (!isPropertyExist) throw new Error(`Unknown property '${property}'`);
  return csv.sort((r1, r2) =>
    compareNumbers(r1[property], r2[property], ordinality),
  );
}

function getPaddedRow(row, gaps) {
  if (!Array.isArray(row) || row.length === 0 || !Array.isArray(gaps) || row.length === 0) return "";
  if (row.length !== gaps.length) throw new Error("Row and gaps length mismatch");
  return row.map((cell, i) => cell.padEnd(gaps[i], " ")).join("") + "\n"
}

export function renderTable(table, options) {
  const isListOfObjects = Array.isArray(table) && table.length !== 0 && table.every((entry) => isObject(entry));
  if (!isListOfObjects) return;

  const { gap = DEFAULT_COLUMN_GAP } = options

  // find unique columns
  const columns = intersectingKeys(table);

  // find minimum offset width for each column
  const columnMinWidths = Array.from({ length: columns.length })
  for (let i = 0; i < columns.length; i++) {
    const currentColumn = columns[i]
    columnMinWidths[i] = maxLengthElement([...table.map((entry) => entry[currentColumn]), currentColumn]);
  }
  const gaps = columnMinWidths.map((v) => v + gap);

  // render
  const strHeaders = getPaddedRow(columns, gaps)
  let renderedTable = strHeaders
  for (let i = 0; i < table.length; i++) {
    const row = Object.values(table[i])
    const renderedRow = getPaddedRow(row, gaps)
    renderedTable += renderedRow
  }
  return renderedTable
}
