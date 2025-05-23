'use strict';

// Task: rewrite `total` from callbacks contract to promises
// Hint: do not use `async () =>` syntax

const total = (items) => {
  return new Promise((resolve, reject) => {
    let result = 0;
    for (const item of items) {
      if (item.price < 0) {
        reject(new Error('Negative price is not allowed'));
      }
      result += item.price;
    }
    setTimeout(() => resolve(result), 2000)
  })
};

const electronics = [
  { name: 'Laptop', price: 1500 },
  { name: 'Keyboard', price: 100 },
  { name: 'HDMI cable', price: 10 },
];

(async () => {
  await total(electronics).then(money => {
    console.log({ money });
  }).catch(error => {
    console.error({ error });
  })
})()
