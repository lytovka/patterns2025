import {
  isObject,
  isNonEmptyArray,
  intersectingKeys,
  maxLengthElement,
} from "./misc.js";

const DEFAULT_COLUMN_GAP = 5;

function getPaddedRow(row, gaps) {
  if (!isNonEmptyArray(row) || !isNonEmptyArray(gaps)) return "";
  if (row.length !== gaps.length)
    throw new Error("Row and gaps length mismatch");
  return row.map((cell, i) => cell.padEnd(gaps[i], " ")).join("") + "\n";
}

export function formatToTable(table, options = { gap: DEFAULT_COLUMN_GAP }) {
  const isListOfObjects =
    isNonEmptyArray(table) && table.every((entry) => isObject(entry));
  if (!isListOfObjects) return;

  const { gap } = options;

  // find unique columns
  const columns = intersectingKeys(table);

  // find minimum offset width for each column
  const columnMinWidths = Array.from({ length: columns.length });
  for (let i = 0; i < columns.length; i++) {
    const currentColumn = columns[i];
    columnMinWidths[i] = maxLengthElement([
      ...table.map((entry) => entry[currentColumn]),
      currentColumn,
    ]);
  }
  const paddings = columnMinWidths.map((v) => v + gap);

  // render
  let renderedTable = getPaddedRow(columns, paddings);
  for (let i = 0; i < table.length; i++) {
    const row = Object.values(table[i]);
    const renderedRow = getPaddedRow(row, paddings);
    renderedTable += renderedRow;
  }
  return renderedTable;
}
