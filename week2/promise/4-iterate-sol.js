"use strict";

// Task: change `iterate` contract from chainable callbacks
// to Promise (chainable or you can call it with await syntax)

const iterate = (items) => {
  let index = 0;
  const chain = {
    next: async () => {
      return new Promise((resolve) => {
        if (index < items.length) {
          resolve(items[index++]);
        }
        return chain;
      });
    },
  };
  return chain;
};

const electronics = [
  { name: "Laptop", price: 1500 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
];

// Use await syntax to get items
async function main() {
  const iterator = iterate(electronics);
  const item1 = await iterator.next();
  console.log(item1);
  const item2 = await iterator.next();
  console.log(item2);
  const item3 = await iterator.next();
  console.log(item3);
}

main();
