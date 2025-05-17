"use strict";

import data from "./data.js"
import { formatToTable } from "./utils/renderer.js";
import { csvToListOfObjects, parseCsv } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

function createDataProcessor(data) {
  let csv = parseCsv(data);
  let objects = csvToListOfObjects(csv);
  const api = {};

  const sortBy = (property, options = { order: "desc" }) => {
    objects = sortListOfObjectsBy(objects, property, options);
    return api;
  };

  const addRelative = (property, options = {}) => {
    objects = addRelativeProperty(objects, property, options);
    return api;
  };

  const render = (options = {}) => formatToTable(objects, options);

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
