"use strict";
import { scheduler } from 'node:timers/promises';

// Create Iterator for given dataset with Symbol.asyncIterator
// Use for..of to iterate it and pass data to Basket
// Basket is limited to certain amount
// After iteration ended Basket should return Thenable
// to notify us with final list of items, total and
// escalated errors

const purchase = [
  { name: "Laptop", price: 1500 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
  { name: "Bag", price: 50 },
  { name: "Mouse pad", price: 5 },
];

class PurchaseIterator {
  #purchase;

  constructor(purchase) {
    if (!Array.isArray(purchase))
      throw new Error("Must inherit Array.prototype");
    this.#purchase = purchase;
  }

  static create(purchase) {
    return new PurchaseIterator(purchase);
  }

  [Symbol.asyncIterator]() {
    let i = 0;
    let max = this.#purchase.length;
    const getCurrentPurchase = (i) => this.#purchase[i];
    return {
      async next() {
        const item = {
          value: getCurrentPurchase(i),
          done: i >= max,
        };
        console.log("fetching item ", i)
        i++;
        await scheduler.wait(200)
        return item;
      },
    };
  }
}

const noop = () => { }

class Basket {
  #properties
  #data = [];
  #onfulfill;
  #onreject;
  #isResolved = false

  constructor(properties) {
    this.#properties = properties;
    this.#onreject = noop
    this.#onfulfill = noop
  }

  add(item) {
    this.#data.push(item);
    return this;
  }

  then(onfulfill, onreject) {
    // TODO: do not overwrite callbacks
    if (this.#isResolved) return
    this.#onfulfill = onfulfill
    this.#onreject = onreject
  }

  checkout() {
    let totalPrice = 0;
    let currentPrice = 0;
    let canBuy = [];
    let cannotBuy = [];
    let max = this.#properties.limit

    for (let i = 0; i < this.#data.length; i++) {
      if (currentPrice + this.#data[i].price <= max) {
        canBuy.push(this.#data[i])
        currentPrice += this.#data[i].price
      }
      else cannotBuy.push(this.#data[i])
      totalPrice += this.#data[i].price
    }
    if (canBuy.length === 0) {
      this.#onreject(new Error("Cannot buy any of the items due to insufficient limit " + max))
    }
    else {
      this.#onfulfill({ totalPrice, currentPrice, canBuy, cannotBuy, limit: max })
    }
    this.#isResolved = true
  }
}

const main = async () => {
  const goods = PurchaseIterator.create(purchase);
  const basket = new Basket({ limit: 1000 });
  for await (const item of goods) {
    basket.add(item);
  }
  basket.then(data => console.log(data), console.error)
  // basket.then(data => console.log("overwritten", data), console.error)
  basket.checkout()
};

main();
