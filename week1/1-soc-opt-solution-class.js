"use strict";

import data from "./data.js"
import { formatToTable } from "./utils/renderer.js";
import { parseCsv, csvToListOfObjects } from "./utils/csv.js";
import { sortListOfObjectsBy, addRelativeProperty } from "./utils/misc.js";

class Csv {
  #headers;
  #content;

  constructor(headers, content) {
    this.#headers = headers;
    this.#content = content;
  }

  get headers() {
    return this.#headers;
  }

  get content() {
    return this.#content;
  }

  toListOfObjects() {
    return csvToListOfObjects(this);
  }

  static fromString(csvString) {
    const { headers, content } = parseCsv(csvString);
    return new Csv(headers, content);
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
const processor = new DataProcessor(csv.toListOfObjects())
  .sortBy("density", {
    order: "desc",
  })
  .addRelativeProperty("density");
console.log(processor.toString({ gap: 3 }));
