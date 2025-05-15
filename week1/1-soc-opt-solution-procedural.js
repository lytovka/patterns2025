"use strict";

import { formatToTable } from "./utils/renderer.js";
import { parseCsv, csvToListOfObjects } from "./utils/csv.js";
import { sortListOfObjectsBy, relative } from "./utils/misc.js";

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

// main
const csv = parseCsv(data);
const listOfObj = csvToListOfObjects(csv);
const sortedListOfObj = sortListOfObjectsBy(listOfObj, "density", {
  ordinality: "desc",
});
const relativeDensity = sortedListOfObj.map((obj) => relative(obj.density, sortedListOfObj[0].density))
for (let i = 0; i < sortedListOfObj.length; i++) {
  sortedListOfObj[i]["rel_density"] = relativeDensity[i].toString()
}
console.log(formatToTable(sortedListOfObj, { gap: 5 }));
