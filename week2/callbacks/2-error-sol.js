"use strict";

// Task: return an error for items with negative price
// Hint: use callback-last-error-first contract

const total = (items, callback) => {
  let result = 0;
  for (const item of items) {
    if (item.price < 0)
      return void callback(
        new Error(`Item ${item.name} has negative price`),
        null,
      );
    result += item.price;
  }
  callback(null, result);
};

const electronics = [
  { name: "Laptop", price: -1500 },
  { name: "Keyboard", price: 100 },
  { name: "HDMI cable", price: 10 },
];

total(electronics, (error, money) => {
  if (error) return void console.error(error);
  console.log({ money });
});
