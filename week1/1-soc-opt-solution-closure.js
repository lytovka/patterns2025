"use strict";

import data from "./data.js"
import { formatToTable } from "./utils/renderer.js";
import { parseCsv } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

function createDataProcessor(data) {
  let csv = parseCsv(data);
  const api = {};

  const sortBy = (property, options = { order: "desc" }) => {
    csv = sortListOfObjectsBy(csv, property, options);
    return api;
  };

  const addRelative = (property, options = {}) => {
    csv = addRelativeProperty(csv, property, options);
    return api;
  };

  const render = (options = {}) => formatToTable(csv, options);

  return Object.assign(api, {
    sortBy,
    addRelative,
    render,
  });
}

// main
const cityData = createDataProcessor(data)
  .sortBy("density")
  .addRelative("density");
console.log(cityData.render({ gap: 3 }));
