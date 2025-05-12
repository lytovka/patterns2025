// misc utils
export function compareNumbers(a, b, ordinality) {
  if (ordinality === "desc") return b - a;
  return a - b;
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
