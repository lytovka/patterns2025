import { isNonEmptyArray, intersectingKeys, maxLengthElement } from "./misc.js";

const DEFAULT_COLUMN_GAP = 5;

function getPaddedRow(row, gaps) {
  if (!isNonEmptyArray(row) || !isNonEmptyArray(gaps)) return "";
  if (row.length !== gaps.length)
    throw new Error("Row and gaps length mismatch");
  return (
    row.map((cell, i) => String(cell).padEnd(gaps[i], " ")).join("") + "\n"
  );
}

export function formatToTable(table, options = { gap: DEFAULT_COLUMN_GAP }) {
  const { gap } = options;

  // find unique columns
  const columns = intersectingKeys(table);

  if (!columns || columns.length === 0) return;

  // find minimum offset width for each column
  const columnMinWidths = Array.from({ length: columns.length });
  for (let i = 0; i < columns.length; i++) {
    const currentColumn = columns[i];
    const columnValues = table.map((entry) =>
      String(entry[currentColumn] || ""),
    );
    columnValues.push(currentColumn);
    columnMinWidths[i] = maxLengthElement(columnValues);
  }

  const paddings = columnMinWidths.map((v) => v + gap);

  // render header
  let renderedTable = getPaddedRow(columns, paddings);

  // render rows
  for (let i = 0; i < table.length; i++) {
    const row = Object.values(table[i]);
    const renderedRow = getPaddedRow(row, paddings);
    renderedTable += renderedRow;
  }
  return renderedTable;
}
