"use strict";

// Task: rewrite to `class Iterator` implementing
// Thenable contract with private fields.

class Iterator {
  #data;
  #index;

  constructor(data) {
    this.#data = data;
    this.#index = 0;
  }

  get data() {
    return this.#data;
  }

  get index() {
    return this.#index;
  }

  then(fulfill, reject) {
    if (this.#index < this.#data.length) {
      fulfill(this.#data[this.#index++]);
    } else reject(new Error("out of bound!!!"));
  }
}

const electronics = [
  { name: "Laptop", price: 1500 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
];

(async () => {
  const items = new Iterator(electronics);
  const item1 = await items;
  console.log(item1);
  const item2 = await items;
  console.log(item2);
  const item3 = await items;
  console.log(item3);
  const item4 = await items;
  console.log(item4);
})();
