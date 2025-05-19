'use strict';

// Create Iterator for given dataset with Symbol.asyncIterator
// Use for..of to iterate it and pass data to Basket
// Basket is limited to certain amount
// After iteration ended Basket should return Thenable
// to notify us with final list of items, total and
// escalated errors

const purchase = [
  { name: 'Laptop', price: 1500 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
  { name: 'Bag', price: 50 },
  { name: 'Mouse pad', price: 5 },
];

class PurchaseIterator {
  #purchase;

  constructor(purchase) {
    if (!Array.isArray(purchase)) throw new Error("Must inherit Array.prototype")
    this.#purchase = purchase;
  }

  static create(purchase) {
    return new PurchaseIterator(purchase)
  }

  [Symbol.asyncIterator]() {
    let i = 0;
    let max = this.#purchase.length
    const getCurrentPurchase = (i) => this.#purchase[i]
    return {
      async next() {
        const item = {
          value: getCurrentPurchase(i),
          done: i >= max
        }
        i++
        return item
      },
      // optional
      throw(err) {
        console.error(err)
      }
    }
  }
}

class Basket {
  #properties;
  #callback;
  #data = [];
  #shouldReject = false;

  constructor(properties, callback) {
    this.#properties = properties;
    this.#callback = callback
  }

  async add(item) {
    console.log("curr balance", this.getCurrentBalance(), this.#properties.limit, this.getCurrentBalance() + item.price > this.#properties.limit)
    if (this.getCurrentBalance() + item.price > this.#properties.limit) {
      this.#shouldReject = true
      return this.then()
    }
    this.#data.push(item)
    return this
  }

  getCurrentBalance() {
    return this.#data.reduce((prev, curr) => prev + curr.price, 0)
  }

  [Symbol.iterator]() {
    return this.#data[Symbol.iterator]()
  }

  then() {
    console.log("then", this.#shouldReject)
    const curr = this.getCurrentBalance()
    if (this.#shouldReject) {
      this.#callback(new Error('Limit exceeded'), this.#data, curr)
    }
    else this.#callback(null, this.#data, curr)
  }

}

const main = async () => {
  const goods = PurchaseIterator.create(purchase);
  const basket = new Basket({ limit: 1250 }, (error, items, total) => {
    if (error) {
      console.error(error, "\n", items, "\n", total)
    }
    else
      console.log(total);
  });
  for await (const item of goods) {
    basket.add(item);
  }
  await basket
};

main();
