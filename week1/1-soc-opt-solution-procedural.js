"use strict";

import data from "./data.js";
import { formatToTable } from "./utils/renderer.js";
import { parseCsv, csvToListOfObjects } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

// main
const csv = parseCsv(data);
const listOfObj = csvToListOfObjects(csv);
const sortedListOfObj = sortListOfObjectsBy(listOfObj, "density", {
  order: "desc",
});
const enrichedData = addRelativeProperty(sortedListOfObj, "density");
console.log(formatToTable(enrichedData, { gap: 2 }));
