"use strict";

import { formatToTable } from "./utils/renderer.js";
import { parseCsv, csvToListOfObjects } from "./utils/csv.js";
import { sortListOfObjectsBy } from "./utils/misc.js";

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

class Csv {
  constructor(columns, table) {
    this.columns = columns;
    this.table = table;
  }

  toListOfObjects() {
    return csvToListOfObjects(this);
  }

  static fromString(csvString) {
    const { columns, table } = parseCsv(csvString);
    return new Csv(columns, table);
  }
}

class Objects {
  constructor(objects) {
    this.objects = objects;
  }

  sortBy(property, options) {
    this.objects = sortListOfObjectsBy(this.objects, property, options);
    return this;
  }

  toString(options = {}) {
    return formatToTable(this.objects, options);
  }
}

// main
const csv = Csv.fromString(data);
const csvObjs = new Objects(csv.toListOfObjects());
const sortedObjs = csvObjs.sortBy("density", {
  ordinality: "desc",
});
console.log(sortedObjs.toString({ gap: 6 }));
