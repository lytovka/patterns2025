"use strict";

// Task: rewrite `total` function to be async with JavaScript timers
// Use `setInterval` and `clearInterval` to check next item each 1 second
// Calculations will be executed asynchronously because of timers
// Run `total` twice (as in example below) but in parallel
// Print debug output for each calculation step (each second)
//
// Hint: example output:
// { check: { item: { name: 'Laptop', price: 1500 } } }
// { check: { item: { name: 'Laptop', price: 1500 } } }
// { check: { item: { name: 'Keyboard', price: 100 } } }
// { check: { item: { name: 'Keyboard', price: 100 } } }
// { check: { item: { name: 'HDMI cable', price: 10 } } }
// { check: { item: { name: 'HDMI cable', price: 10 } } }
// { money: 1610 }
// { money: 1610 }

const total = async (items) => {
  return new Promise((resolve, reject) => {
    let result = 0;
    let index = 0;
    const interval = setInterval(() => {
      const item = items[index];
      console.log({ check: { item } });
      if (item.price < 0) {
        clearInterval(interval);
        return reject(new Error("Negative price is not allowed"));
      }
      result += item.price;
      index++;
      if (index >= items.length) {
        clearInterval(interval);
        return resolve(result);
      }
    }, 1000);
  });
};

const electronics = [
  { name: "Laptop", price: 1500 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
];

async function main() {
  const promise1 = total(electronics);
  const promise2 = total(electronics);
  const [res1, res2] = await Promise.all([promise1, promise2]);
  console.log({ money: res1 });
  console.log({ money: res2 });
}

main();
