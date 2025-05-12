// misc utils
export function compareNumbers(a, b, ordinality) {
  if (ordinality === "desc") return b - a;
  return a - b;
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

export function renderTable(table, options) {
  const isListOfObjects = Array.isArray(table) && table.length !== 0 && table.every((entry) => isObject(entry));
  if (!isListOfObjects) return;

  const { gap = 5 } = options

  // find unique columns
  const setOfColumns = new Set();
  for (let i = 0; i < table.length; i++) {
    const columnKeys = Object.keys(table[i]);
    for (let j = 0; j < columnKeys.length; j++) {
      setOfColumns.add(columnKeys[j]);
    }
  }

  // find minimum offset width for each column
  const columnWidths = new Map();
  for (const column of setOfColumns) {
    const maxWidth = Math.max(...table.map((entry) => String(entry[column]).length), column.length);
    columnWidths.set(column, maxWidth);
  }

  // render
  const cols = [...setOfColumns.values()]
  const strHeaders = cols.map(column => column.padEnd(columnWidths.get(column) + gap, " ")).join("") + "\n"
  let renderedTable = strHeaders
  for (let i = 0; i < table.length; i++) {
    let rowStr = []
    const row = table[i]
    for (const col of cols) {
      const cell = row[col]
      const diff = columnWidths.get(col) + gap
      rowStr.push(cell.padEnd(diff, " "))
    }
    rowStr.push("\n")
    renderedTable += rowStr.join("")
  }
  return renderedTable
}
