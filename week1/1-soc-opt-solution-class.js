"use strict";

import data from "./data.js"
import { formatToTable } from "./utils/renderer.js";
import { parseCsv } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

class Csv {
  #objects;

  constructor(objects) {
    this.#objects = objects
  }

  get objects() {
    return this.#objects;
  }

  static fromString(csvString) {
    return new Csv(parseCsv(csvString));
  }
}

class DataProcessor {
  #objects;

  constructor(objects) {
    this.#objects = objects;
  }

  get objects() {
    return this.#objects;
  }

  sortBy(property, options) {
    this.#objects = sortListOfObjectsBy(this.#objects, property, options);
    return this;
  }

  addRelativeProperty(property, options) {
    this.#objects = addRelativeProperty(this.#objects, property, options);
    return this;
  }

  toString(options = {}) {
    return formatToTable(this.#objects, options);
  }
}

// main
const csv = Csv.fromString(data);
const processor = new DataProcessor(csv.objects)
  .sortBy("density", {
    order: "desc",
  })
  .addRelativeProperty("density");
console.log(processor.toString({ gap: 3 }));
