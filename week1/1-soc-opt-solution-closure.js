"use strict";

import { formatToTable } from "./utils/renderer.js";
import { csvToListOfObjects, parseCsv } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

const data = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`;

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
